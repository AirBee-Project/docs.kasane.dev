import { KasaneClient, isKasaneError, type DatabaseHandle } from "@airbee-project/kasane-client";

export interface Tutorial {
  client: KasaneClient;
  db: DatabaseHandle;
  /** 結果を画面には出さず、右の Madori にだけ渡す（コードの隠し部分で使う） */
  show: (results: Iterable<{ id: unknown; value: unknown }>) => void;
}

export type Step = (tutorial: Tutorial) => Promise<void>;
/** map は画面に出さず、Madori にだけ渡す行 */
export type Line = { kind: "log" | "error" | "map"; text: string };
export type StepLoaders = Record<string, () => Promise<{ default: Step }>>;

/** チュートリアルで使うデータベースの名前。 */
const DB = "tutorial";

// ブラウザの中で動く Kasane（Wasm）。データはこのページの中だけにあり、ページを移動すると消える
async function newClient(): Promise<KasaneClient> {
  const client = await KasaneClient.inMemory();
  await client.createDatabase(DB);
  return client;
}

// 地図のチュートリアルは前の Step のテーブルを使うので、ページの中で同じ Kasane を使い続ける。
// ほかのステップは互いに独立しているので、毎回新しい Kasane で動かす
let mapClient: Promise<KasaneClient> | undefined;
function getClient(name: string): Promise<KasaneClient> {
  if (!name.startsWith("map/")) return newClient();
  mapClient ??= newClient();
  return mapClient;
}

function format(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return `[ ${value.map((v) => (typeof v === "string" ? `'${v}'` : format(v))).join(", ")} ]`;
  if (value !== null && typeof value === "object") {
    if (value.toString !== Object.prototype.toString) return String(value);
    return JSON.stringify(value, (k, v) => (k === "$typeName" ? undefined : v));
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
function tutorial(client: KasaneClient, show: Tutorial["show"]): Tutorial {
  const realDb = client.database(DB);
  const db = bind(realDb, {
    createTable: async (name: string, ...rest: unknown[]) => {
      await realDb.table(name).delete().catch(() => {});
      return (realDb.createTable as (...a: unknown[]) => Promise<unknown>)(name, ...rest);
    },
  });
  return { client, db, show };
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

// 実行中に別の Step を始めると console.log の差し替えが重なり、ログが別の出力に混ざるので、1 つずつ実行する
let queue: Promise<void> = Promise.resolve();
export function runStep(name: string, loaders: StepLoaders, write: (line: Line) => void): Promise<void> {
  const run = queue.then(() => runOne(name, loaders, write));
  queue = run.catch(() => {});
  return run;
}

async function runOne(name: string, loaders: StepLoaders, write: (line: Line) => void): Promise<void> {
  const original = console.log;
  let silent = false;
  console.log = (...values: unknown[]) => {
    if (!silent) write({ kind: "log", text: values.map(format).join(" ") });
    original(...values);
  };
  const show: Tutorial["show"] = (results) => {
    if (silent) return;
    for (const r of results) write({ kind: "map", text: `${r.id} => ${r.value}` });
  };
  try {
    const client = await getClient(name);
    silent = true;
    for (const other of prerequisites(name, loaders)) {
      await (await loaders[stepPath(other)]!()).default(tutorial(client, show));
      done.add(other);
    }
    silent = false;
    const loader = loaders[stepPath(name)];
    if (!loader) throw new Error(`ステップ ${name} が見つかりません。`);
    await (await loader()).default(tutorial(client, show));
    done.add(name);
  } catch (e) {
    silent = false;
    write({ kind: "error", text: `エラー: ${isKasaneError(e) ? e.message : String(e)}` });
  } finally {
    console.log = original;
  }
}
