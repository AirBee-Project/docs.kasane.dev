import { SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../runner";

export default async function ({ db }: Tutorial) {
  // テーブルを作る（値の型は整数、最大ズームレベル 25）
  await db.createTable("hello", "int", 25);
  const table = db.table("hello");

  // 東京駅付近のボクセルに、値 42 を書き込む
  const tokyo = SingleId.parse("20/0/931389/412900");
  await table.insert(42, tokyo);

  // 同じボクセルを検索する
  const results = await table.search(tokyo).toArray();
  for (const r of results) {
    console.log(`${r.id} => ${r.value}`);
  }
}
