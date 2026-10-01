import { RangeId, SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ db }: Tutorial) {
  await db.createTable("many", "int", 25);
  const table = db.table("many");

  // ID を配列で渡すと、1 回で同じ値をまとめて書ける（10 × 10 = 100 ボクセル）
  const ids: SingleId[] = [];
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      ids.push(SingleId.create(25, 0, 29804448 + x, 13212800 + y));
    }
  }
  await table.insert(1, ids);

  // 隣り合うボクセルは RangeId 1 つで書ける（隣の 10 × 10 = 100 ボクセル）
  await table.insert(2, RangeId.create(25, 0, [29804458, 29804467], [13212800, 13212809]));

  // 値ごとにまとめて読み出す
  const everything = RangeId.create(25, 0, [29804448, 29804467], [13212800, 13212809]);
  const byValue = await table.search(everything, { format: "singleId" }).toDictionaryMap();
  for (const [value, list] of byValue) console.log(`値 ${value}: ${list.length} ボクセル`);

  console.log("count:", (await table.info()).count);
}
