import { KasaneClient, QueryBuilder, isKasaneError, type DatabaseHandle, type TableHandle } from "@airbee-project/kasane-client";

export interface Tutorial {
  client: KasaneClient;
  db: DatabaseHandle;
}

export type Step = (tutorial: Tutorial) => Promise<void>;
export type Line = { kind: "log" | "error"; text: string };

const config = {
  url: import.meta.env.PUBLIC_KASANE_TUTORIAL_URL as string | undefined,
  user: import.meta.env.PUBLIC_KASANE_TUTORIAL_USER as string | undefined,
  password: import.meta.env.PUBLIC_KASANE_TUTORIAL_PASSWORD as string | undefined,
  db: import.meta.env.PUBLIC_KASANE_TUTORIAL_DB as string | undefined,
};

export function isConfigured(): boolean {
  return Boolean(config.url && config.user && config.password && config.db);
}

let clientPromise: Promise<KasaneClient> | undefined;
function getClient(): Promise<KasaneClient> {
  clientPromise ??= KasaneClient.connect(config.url!, config.user!, config.password!);
  return clientPromise;
}

function sessionSuffix(): string {
  const key = "kasane-tutorial-suffix";
  try {
    const saved = sessionStorage.getItem(key);
    if (saved) return saved;
    const created = Math.random().toString(36).slice(2, 6);
    sessionStorage.setItem(key, created);
    return created;
  } catch {
    return "tmp";
  }
}

function format(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "bigint") return `${value}n`;
  if (Array.isArray(value)) return `[ ${value.map((v) => (typeof v === "string" ? `'${v}'` : format(v))).join(", ")} ]`;
  if (value instanceof Error) return value.message;
  if (value !== null && typeof value === "object") {
    if (value.toString !== Object.prototype.toString) return String(value);
    return JSON.stringify(value, (k, v) => (k === "$typeName" ? undefined : typeof v === "bigint" ? `${v}n` : v));
  }
  return String(value);
}

function bind<T extends object>(target: T, overrides: Partial<Record<keyof T, unknown>>): T {
  return new Proxy(target, {
    get(t, prop) {
      if (prop in overrides) return overrides[prop as keyof T];
      const value = Reflect.get(t, prop, t);
      return typeof value === "function" ? value.bind(t) : value;
    },
  });
}

function sandbox(client: KasaneClient, suffix: string): Tutorial {
  const own = (name: string) => `${name}_${suffix}`;
  const bare = (name: string) => (name.endsWith(`_${suffix}`) ? name.slice(0, -suffix.length - 1) : name);
  const isOwnDb = (name?: string) => name === undefined || name === config.db;

  const wrapTable = (table: TableHandle): TableHandle =>
    bind(table, {
      info: async () => {
        const info = await table.info();
        return { ...info, name: bare(info.name) };
      },
      copy: (name: string, dbName?: string) => table.copy(isOwnDb(dbName) ? own(name) : name, dbName),
    });

  const realDb = client.database(config.db!);
  const db = bind(realDb, {
    table: (name: string) => wrapTable(realDb.table(own(name))),
    createTable: async (name: string, ...rest: unknown[]) => {
      await realDb.table(own(name)).delete().catch(() => {});
      const info = await (realDb.createTable as (...a: unknown[]) => Promise<{ name: string }>)(own(name), ...rest);
      return { ...info, name: bare(info.name) };
    },
    listTables: async () =>
      (await realDb.listTables()).filter((t) => t.name.endsWith(`_${suffix}`)).map((t) => ({ ...t, name: bare(t.name) })),
  });

  const renameSources = (node: unknown): void => {
    if (node === null || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    if (record.$typeName === "kasane.QueryNode.Source" && isOwnDb(record.database as string)) {
      record.table = own(record.table as string);
    }
    for (const value of Object.values(record)) renameSources(value);
  };

  const tableClient = bind(client.tableClient, {
    update: (req: { dbName: string; tableName: string; newName?: string }) =>
      client.tableClient.update(
        isOwnDb(req.dbName)
          ? { ...req, tableName: own(req.tableName), ...(req.newName ? { newName: own(req.newName) } : {}) }
          : req,
      ),
  });

  const wrapped = bind(client, {
    database: (name: string) => (isOwnDb(name) ? db : client.database(name)),
    tableClient,
    query: (q: Parameters<KasaneClient["query"]>[0], ...rest: unknown[]) => {
      const node = structuredClone(q instanceof QueryBuilder ? q.toProto() : q);
      renameSources(node);
      return (client.query as (...a: unknown[]) => unknown)(node, ...rest);
    },
  });

  return { client: wrapped, db };
}

export async function runStep(step: Step, write: (line: Line) => void): Promise<void> {
  const suffix = sessionSuffix();
  const out = (line: Line) => write({ ...line, text: line.text.replaceAll(`_${suffix}`, "") });
  const original = console.log;
  console.log = (...values: unknown[]) => {
    out({ kind: "log", text: values.map(format).join(" ") });
    original(...values);
  };
  try {
    const client = await getClient();
    await step(sandbox(client, suffix));
  } catch (e) {
    const message = isKasaneError(e) ? e.message : String(e);
    out({ kind: "error", text: `エラー: ${message}` });
    if (message.includes("not_found")) out({ kind: "error", text: "前の Step を先に実行してください。" });
  } finally {
    console.log = original;
  }
}
