import { KasaneClient, isKasaneError, type DatabaseHandle } from "@airbee-project/kasane-client";

export interface Tutorial {
  client: KasaneClient;
  db: DatabaseHandle;
}

export type Step = (tutorial: Tutorial) => Promise<void>;
export type Line = { kind: "log" | "error"; text: string };
export type StepLoaders = Record<string, () => Promise<{ default: Step }>>;

/** チュートリアルで使うデータベースの名前。 */
const DB = "tutorial";

// ブラウザの中で動く Kasane（Wasm）。データはこのページの中だけにあり、ページを移動すると消える
let clientPromise: Promise<KasaneClient> | undefined;
function getClient(): Promise<KasaneClient> {
  clientPromise ??= (async () => {
    const client = await KasaneClient.inMemory();
    await client.createDatabase(DB);
    return client;
  })();
  return clientPromise;
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

/** 「もう一度実行する」で同じテーブルを作り直せるよう、createTable の前に同名のテーブルを消す。 */
function tutorial(client: KasaneClient): Tutorial {
  const realDb = client.database(DB);
  const db = bind(realDb, {
    createTable: async (name: string, ...rest: unknown[]) => {
      await realDb.table(name).delete().catch(() => {});
      return (realDb.createTable as (...a: unknown[]) => Promise<unknown>)(name, ...rest);
    },
  });
  const wrapped = bind(client, {
    database: (name: string) => (name === DB ? db : client.database(name)),
  });
  return { client: wrapped, db };
}

/**
 * 地図のチュートリアル（`map/`）は、前の Step で作ったテーブルを使う。
 * データはページを移動すると消えるので、まだ実行していない前の Step を、出力を出さずに先に実行する。
 */
const done = new Set<string>();
function prerequisites(name: string, loaders: StepLoaders): string[] {
  if (!name.startsWith("map/")) return [];
  return Object.keys(loaders)
    .map((path) => path.replace(/^.*\/steps\//, "").replace(/\.ts$/, ""))
    .filter((other) => other.startsWith("map/") && other < name && !done.has(other))
    .sort();
}

const stepPath = (name: string) => `../tutorial/steps/${name}.ts`;

export async function runStep(name: string, loaders: StepLoaders, write: (line: Line) => void): Promise<void> {
  const original = console.log;
  let silent = false;
  console.log = (...values: unknown[]) => {
    if (!silent) write({ kind: "log", text: values.map(format).join(" ") });
    original(...values);
  };
  try {
    const client = await getClient();
    const before = prerequisites(name, loaders);
    if (before.length > 0) {
      write({ kind: "log", text: `（前の Step を実行しています：${before.join("、")}）` });
      silent = true;
      for (const other of before) {
        await (await loaders[stepPath(other)]!()).default(tutorial(client));
        done.add(other);
      }
      silent = false;
    }
    const loader = loaders[stepPath(name)];
    if (!loader) throw new Error(`ステップ ${name} が見つかりません。`);
    await (await loader()).default(tutorial(client));
    done.add(name);
  } catch (e) {
    silent = false;
    write({ kind: "error", text: `エラー: ${isKasaneError(e) ? e.message : String(e)}` });
  } finally {
    console.log = original;
  }
}
