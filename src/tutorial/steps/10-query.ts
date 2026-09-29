import { RangeId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../runner";

export default async function ({ client, db, DB, t, check, resetTable }: Tutorial) {
  // ズームレベル 22 の小さなテーブルを 2 つ用意する
  //   risk: 左の 4×2 に 80、右の 2×2 に 30（合計 12 ボクセル）
  //   wind: 下の行の 6 ボクセルに 5（risk と 4 ボクセル重なる）
  const X = 3725392;
  const Y = 1651564;
  for (const name of [t("risk"), t("wind")]) {
    await resetTable(name);
    await db.createTable(name, "int", 22);
  }
  await db.table(t("risk")).insert(80, RangeId.create(22, 0, [X, X + 3], [Y, Y + 1]));
  await db.table(t("risk")).insert(30, RangeId.create(22, 0, [X + 4, X + 5], [Y, Y + 1]));
  await db.table(t("wind")).insert(5, RangeId.create(22, 0, [X + 2, X + 7], Y));

  const area = RangeId.create(22, 0, [X - 10, X + 20], [Y - 10, Y + 10]); // 結果を取り出す範囲
  const risk = () => query.source(DB, t("risk"));
  const wind = () => query.source(DB, t("wind"));

  /** クエリを実行して、singleId 形式の { ID 文字列: 値 } を返す */
  async function run(q: ReturnType<typeof risk>, valueType?: "text") {
    const items = await client.query(q, area, { format: "singleId", ...(valueType ? { valueType } : {}) }).toArray();
    return new Map(items.map((i) => [i.id.toString(), i.value]));
  }
  const at = (dx: number, dy: number, z = 22) => `${z}/0/${X + dx}/${Y + dy}`;

  // 1. filter: 値が 50 以上のボクセルだけ
  const filtered = await run(risk().filter({ min: 50 }));
  check("filter: 80 のボクセル 8 個だけが残る", filtered.size === 8 && [...filtered.values()].every((v) => v === 80n));

  // 2. intersection: 両方にあるボクセル（値は左側 risk のもの）
  const inter = await run(risk().intersection(wind()));
  check("intersection: 重なる 4 ボクセル", inter.size === 4 && inter.get(at(2, 0)) === 80n && inter.get(at(4, 0)) === 30n);

  // 3. difference: risk から wind を引いたボクセル
  const diff = await run(risk().difference(wind()));
  check("difference: 12 - 4 = 8 ボクセル", diff.size === 8 && !diff.has(at(2, 0)));

  // 4. merge: 重ね合わせて合計（無い側は defaultValue の 0 として扱う）
  const merged = await run(risk().merge(wind(), { policy: "sum", defaultValue: 0 }));
  check("merge: 和集合 14 ボクセル、重なりは 85 と 35", merged.size === 14 && merged.get(at(2, 0)) === 85n && merged.get(at(4, 0)) === 35n && merged.get(at(7, 0)) === 5n);

  // 5. zoomOut: ズームレベル 20 に粗くし、最大値で集約
  const zoomed = await run(risk().zoomOut(20, "max"));
  check("zoomOut: 2 ボクセル（80 と 30）", zoomed.size === 2 && zoomed.get(`20/0/${X / 4}/${Y / 4}`) === 80n && zoomed.get(`20/0/${X / 4 + 1}/${Y / 4}`) === 30n);

  // 6. 四則演算（整数の割り算は切り捨て）
  const added = await run(risk().add(1));
  check("add: 80 → 81、30 → 31", added.get(at(0, 0)) === 81n && added.get(at(4, 0)) === 31n);
  const divided = await run(risk().divide(3));
  check("divide: 80 → 26、30 → 10", divided.get(at(0, 0)) === 26n && divided.get(at(4, 0)) === 10n);

  // 7. mapValues: 値を文字列に変換
  const mapped = await run(risk().mapValues({ outputType: "text", mapping: [{ from: 80, to: "高" }], defaultValue: "低" }), "text");
  check("mapValues: 80 → 高、それ以外 → 低", mapped.get(at(0, 0)) === "高" && mapped.get(at(4, 0)) === "低");

  // 8. shift: X 方向に 10 ボクセル移動
  const shifted = await run(wind().shiftX(22, 10));
  check("shiftX: 6 ボクセルが 10 ボクセル右に移動", shifted.size === 6 && shifted.has(at(12, 0)) && !shifted.has(at(2, 0)));

  // 9. extrude: 高さ方向（F）の 0〜3 に引き延ばす
  const extruded = await run(wind().extrudeF(22, 0, 3, "max"));
  check("extrudeF: 6 ボクセル × 高さ 4 = 24 ボクセル", extruded.size === 24 && extruded.has(`22/3/${X + 2}/${Y}`));

  // 10. falloff: 80 のボクセルから X 方向に 2 ボクセルで 0 になるよう減衰
  const fell = await run(risk().filter({ min: 50 }).falloffX(22, 2, { pattern: "linear", policy: "max" }));
  check("falloffX: 1 ボクセル隣は 40、2 ボクセル隣は 0", fell.get(at(-1, 0)) === 40n && fell.get(at(-2, 0)) === 0n && fell.get(at(0, 0)) === 80n);
}
