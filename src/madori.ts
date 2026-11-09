/** 埋め込む Madori。ローカルで試すときは PUBLIC_MADORI_URL で差し替える */
const MADORI_URL: string = import.meta.env.PUBLIC_MADORI_URL ?? "https://madori.airbee.jp/";

export type MadoriData = {
  /** 1 要素が 1 グループ（カンマ区切りの空間ID）。グループごとに色が変わる */
  ids?: string[];
  /** Madori の JSON。URL に入らないので postMessage で渡す */
  json?: string;
  /** ボクセルの枠線を表示する。指定しないときは表示しない */
  border?: boolean;
  /** JSON の不透明度（0〜1） */
  opacity?: number;
  /** 再生の速さの初期値（1 秒に進む秒数）。1hr/s なら 3600 */
  speed?: number;
  /** JSON の色の範囲 [最小, 最大]。地図どうしで同じ値を同じ色にしたいときに使う */
  scale?: [number, number];
  /** 図を見せるだけの埋め込み。Madori のボタン類を隠す */
  view?: boolean;
  /**
   * 最初の視点。longitude・latitude は中心、bearing は方位、pitch は傾き（どちらも度）、zoom はズームレベル。
   * 指定しないときは、中心とズームは表示する ID から、方位・傾きは 0
   */
  camera?: { longitude?: number; latitude?: number; bearing?: number; pitch?: number; zoom?: number };
};

/**
 * ID などを入力済みの Madori を作る。
 * fill にすると、縦横比を固定せず、親の高さいっぱいに広げる
 */
export function createMadoriFrame({ ids = [], json, border = false, opacity, speed, scale, view, camera }: MadoriData, { fill = false } = {}): HTMLElement {
  const params = new URLSearchParams();
  for (const group of ids) params.append("ids", group);
  if (border) params.append("border", "");
  if (view) params.append("view", "");
  if (speed !== undefined) params.append("speed", String(speed));
  for (const [key, value] of Object.entries(camera ?? {})) params.append(key, String(value));
  // docs では、カーソルを乗せたボクセルの ID と値を最初から表示する
  params.append("hover", "");
  if (json && scale) json = withScale(json, scale);
  const iframe = document.createElement("iframe");
  iframe.src = `${MADORI_URL}?${params}`;
  iframe.title = "Madori で空間ID を表示";
  iframe.loading = "lazy";
  iframe.style.cssText = `display:block;width:100%;${fill ? "flex:1;min-height:0;" : "aspect-ratio:16/10;border-radius:4px;"}border:0;`;

  // JSON・枠線を消す指定・不透明度は URL で渡せないので、読み込み後に postMessage で渡す
  // （view の Madori は枠線を表示して始まるので、枠線を消すときも送る）
  if (json || !border || opacity !== undefined) {
    window.addEventListener("message", (e) => {
      if (e.source === iframe.contentWindow && e.data?.type === "madori:ready") {
        // show は表示中のものを置き換えるので、ID も一緒に渡す
        iframe.contentWindow?.postMessage({ type: "madori:show", json, ids, border, opacity, camera }, "*");
      }
    });
  }

  const root = document.createElement("div");
  root.className = "madori-frame not-content";
  root.style.cssText = fill ? "display:flex;flex-direction:column;height:100%;" : "margin-top:1rem;";
  root.append(iframe);
  return root;
}

/**
 * Madori は value の最小を青、最大を赤にする（どの ID からも指されない値も含む）。
 * 範囲の両端を value に足して、色の範囲をそろえる
 */
function withScale(json: string, [min, max]: [number, number]): string {
  const data = JSON.parse(json);
  const values: unknown[] = data.data[0].value;
  for (const v of [min, max]) if (!values.includes(v)) values.push(v);
  return JSON.stringify(data);
}

const ID = String.raw`\d{1,2}\/-?\d+(?::-?\d+)?\/\d+(?::\d+)?\/\d+(?::\d+)?(?:_\d+\/\d+(?::\d+)?)?`;
const SPATIAL_ID = new RegExp(String.raw`\b${ID}`, "g");
/** `20/0/931385/412900 => 100` のような、ID と値の行 */
const ID_VALUE = new RegExp(String.raw`^(${ID}) => (.+)$`);
const NO_VALUE = "値なし";

type JsonValue = number | string | boolean;

/** `3` → [3]、`3:5` → [3, 5] */
function toIndex(text: string): number[] {
  return text.split(":").map(Number);
}

/** 空間ID の文字列を、Madori の JSON の ID に直す */
function toJsonId(id: string, ref: number) {
  const [space, time] = id.split("_");
  const [z, f, x, y] = space!.split("/");
  const jsonId: Record<string, unknown> = { z: Number(z), f: toIndex(f!), x: toIndex(x!), y: toIndex(y!), ref };
  if (time) {
    const [i, t] = time.split("/");
    jsonId.i = Number(i);
    jsonId.t = toIndex(t!);
  }
  return jsonId;
}

function toValue(text: string): JsonValue {
  if (text === "true" || text === "false") return text === "true";
  const n = Number(text);
  return text !== "" && Number.isFinite(n) ? n : text;
}

/**
 * `ID => 値` の行を、値で色分けする Madori の JSON に直す。
 * 「値なし」の ID は JSON に入れられないので、ID のグループとして返す
 */
function idValuesToMadori(lines: string[]): MadoriData | undefined {
  const values: JsonValue[] = [];
  const jsonIds: Record<string, unknown>[] = [];
  const noValue: string[] = [];
  for (const line of lines) {
    const m = line.match(ID_VALUE);
    if (!m) continue;
    const [, id, raw] = m as [string, string, string];
    if (raw === NO_VALUE) {
      noValue.push(id);
      continue;
    }
    const value = toValue(raw);
    let ref = values.indexOf(value);
    if (ref === -1) ref = values.push(value) - 1;
    jsonIds.push(toJsonId(id, ref));
  }
  if (jsonIds.length === 0 && noValue.length === 0) return undefined;
  const json =
    jsonIds.length > 0
      ? JSON.stringify({ meta: { version: "1.0" }, data: [{ name: "value", value: values, ids: jsonIds }] })
      : undefined;
  return { json, ids: noValue.length > 0 ? [noValue.join(",")] : [], view: true, camera: RESULT_CAMERA };
}

/** 実行結果を表示するときの視点（南西から北東を見下ろす） */
const RESULT_CAMERA = { bearing: 45, pitch: 55 };

/** 実行結果の文字列から、Madori で表示できる空間ID と JSON を取り出す */
export function findMadoriData(text: string): MadoriData | undefined {
  const lines = text.split("\n");
  const json = lines.find((line) => line.startsWith('{"meta"'));
  if (json) return { json, view: true, camera: RESULT_CAMERA };
  const withValues = idValuesToMadori(lines);
  if (withValues) return withValues;
  const ids = [...new Set(text.match(SPATIAL_ID))];
  return ids.length > 0 ? { ids: [ids.join(",")], view: true, camera: RESULT_CAMERA } : undefined;
}
