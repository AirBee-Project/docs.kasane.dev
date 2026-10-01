import { RangeId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ db }: Tutorial) {
  await db.createTable("formats", "int", 25);
  const table = db.table("formats");

  // 2 × 2 の 4 ボクセルを RangeId 1 つで書き込む
  const area = RangeId.create(20, 0, [931389, 931390], [412900, 412901]);
  await table.insert(1, area);

  // 同じ範囲を、3 つの形で検索する
  for (const format of ["singleId", "rangeId", "flexId"] as const) {
    const results = await table.search(area, { format }).toArray();
    console.log(format, results.map((r) => r.id.toString()));
  }
}
