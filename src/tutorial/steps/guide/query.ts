import { RangeId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ client, db }: Tutorial) {
  // risk: 左の 4×2 に 80、右の 2×2 に 30 / wind: 下の行の 6 ボクセルに 5
  const X = 3725392;
  const Y = 1651564;
  await db.createTable("risk", "int", 22);
  await db.createTable("wind", "int", 22);
  await db.table("risk").insert(80, RangeId.create(22, 0, [X, X + 3], [Y, Y + 1]));
  await db.table("risk").insert(30, RangeId.create(22, 0, [X + 4, X + 5], [Y, Y + 1]));
  await db.table("wind").insert(5, RangeId.create(22, 0, [X + 2, X + 7], Y));

  const risk = query.source("tutorial", "risk");
  const wind = query.source("tutorial", "wind");
  const area = RangeId.create(22, 0, [X - 5, X + 20], [Y - 5, Y + 5]);

  // 結果を「値: ボクセル数」の形で表示する
  async function show(label: string, q: typeof risk) {
    const byValue = await client.query(q, area, { format: "singleId" }).toDictionaryMap();
    console.log(label, [...byValue].map(([value, ids]) => `${value}: ${ids.length}`).join("、"));
  }

  await show("filter（50 以上）:", risk.filter({ min: 50 }));
  await show("intersection:", risk.intersection(wind));
  await show("difference:", risk.difference(wind));
  await show("merge（合計）:", risk.merge(wind, { policy: "sum", defaultValue: 0 }));
  await show("add（+1）:", risk.add(1));
  await show("shiftX（10 右へ）:", wind.shiftX(22, 10));
}
