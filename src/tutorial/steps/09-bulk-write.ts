import { RangeId, SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../runner";

export default async function ({ db, t, check, log, resetTable, WHOLE }: Tutorial) {
  await resetTable(t("many"));
  await db.createTable(t("many"), "int", 25);
  const table = db.table(t("many"));

  // 1. ID を配列で渡すと、1 回の呼び出しで同じ値をまとめて書ける（10 × 10 = 100 ボクセル）
  const ids: SingleId[] = [];
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      ids.push(SingleId.create(25, 0, 29804448 + x, 13212800 + y));
    }
  }
  await table.insert(1, ids);

  // 2. 隣り合うボクセルは RangeId 1 つで書ける（隣の 10 × 10 = 100 ボクセル）
  await table.insert(2, RangeId.create(25, 0, [29804458, 29804467], [13212800, 13212809]));

  // 3. 値ごとにまとめて読み出す
  const byValue = await table.search(WHOLE, { format: "singleId" }).toDictionaryMap();
  for (const [value, list] of byValue) log(`値 ${value}: ${list.length} ボクセル`);
  check("値 1 のボクセルが 100 個", byValue.get(1n)?.length === 100);
  check("値 2 のボクセルが 100 個", byValue.get(2n)?.length === 100);

  // 4. 同じ 200 ボクセルでも、Kasane の内部ではまとめて保存される
  log("TableInfo.count =", (await table.info()).count);
}
