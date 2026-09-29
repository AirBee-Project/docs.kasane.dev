import { SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../runner";

export default async function ({ db, t, check, log, resetTable }: Tutorial) {
  // 1. テーブルを作る（値は整数、最大ズームレベル 25）
  await resetTable(t("hello"));
  await db.createTable(t("hello"), "int", 25);
  const table = db.table(t("hello"));

  // 2. 東京駅付近の地表の空間ID に、値 42 を書き込む
  const id = SingleId.create(20, 0, 931389, 412900);
  await table.insert(42, id);

  // 3. 同じ空間ID を検索して読み戻す
  const results = await table.search(id).toArray();
  for (const r of results) log(`${r.id} => ${r.value}`);

  check("1 件だけ返る", results.length === 1);
  check("書いた値 42 が返る", results[0]?.value === 42n);
}
