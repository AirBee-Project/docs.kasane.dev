// docs のページ上でチュートリアルの各ステップを実行するための仕組み。
// ブラウザから Kasane に直接つなぐ（gRPC-Web）。接続先はチュートリアル専用の共用アカウント。
import { KasaneClient, RangeId, isKasaneError, type DatabaseHandle } from "@airbee-project/kasane-client";

export interface Tutorial {
  client: KasaneClient;
  db: DatabaseHandle;
  DB: string;
  t: (name: string) => string;
  check: (label: string, ok: boolean, detail?: unknown) => void;
  log: (...values: unknown[]) => void;
  describeError: (e: unknown) => string;
  resetTable: (name: string) => Promise<void>;
  WHOLE: RangeId;
}

export type Step = (tutorial: Tutorial) => Promise<void>;
export type Line = { kind: "ok" | "ng" | "log" | "error"; text: string };

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

/** この画面（タブ）だけの固有の文字。ステップをまたいで同じ値を使う */
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
  if (value !== null && typeof value === "object") {
    if (value.toString !== Object.prototype.toString) return String(value);
    return JSON.stringify(value, (k, v) => (k === "$typeName" ? undefined : typeof v === "bigint" ? `${v}n` : v));
  }
  return String(value);
}

function describeError(e: unknown): string {
  return isKasaneError(e) ? e.message : String(e);
}

/** ステップを実行し、表示する行を 1 行ずつ out に渡す */
export async function runStep(step: Step, out: (line: Line) => void): Promise<void> {
  const client = await getClient();
  const suffix = sessionSuffix();
  const db = client.database(config.db!);
  const tutorial: Tutorial = {
    client,
    db,
    DB: config.db!,
    t: (name) => `${name}_${suffix}`,
    check: (label, ok, detail) => {
      out({ kind: ok ? "ok" : "ng", text: `${ok ? "OK" : "NG"}  ${label}` });
      if (!ok && detail !== undefined) out({ kind: "ng", text: `   詳細: ${format(detail)}` });
    },
    log: (...values) => out({ kind: "log", text: values.map(format).join(" ") }),
    describeError,
    resetTable: async (name) => {
      try {
        await db.table(name).delete();
      } catch {
        // 無ければ何もしない
      }
    },
    WHOLE: RangeId.create(0, [-1, 0], 0, 0),
  };
  try {
    await step(tutorial);
  } catch (e) {
    out({ kind: "error", text: `エラー: ${describeError(e)}` });
  }
}
