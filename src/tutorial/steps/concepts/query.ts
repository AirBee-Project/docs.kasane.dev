import { RangeId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ client, db }: Tutorial) {
  // 入力：テーブル risk の 2 つのボクセルに 80 と 30 を書く
  await db.createTable("risk", "int", 20);
  await db.table("risk").insert(80, RangeId.create(20, 0, 931389, 412900));
  await db.table("risk").insert(30, RangeId.create(20, 0, 931390, 412900));

  // クエリ：値が 50 以上のボクセルだけを選ぶ
  const q = query.source("tutorial", "risk").filter({ min: 50 });
  const area = RangeId.create(20, 0, [931389, 931390], 412900);
  for (const { id, value } of await client.query(q, area).toArray()) console.log(`${id} => ${value}`);
}
