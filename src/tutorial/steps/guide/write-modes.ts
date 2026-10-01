import { RangeId, SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ db }: Tutorial) {
  await db.createTable("modes", "int", 25);
  const table = db.table("modes");
  const a = SingleId.create(20, 0, 931389, 412900);
  const ab = RangeId.create(20, 0, [931389, 931390], 412900); // a と、その東隣の b をまとめた範囲

  async function show(label: string) {
    const results = await table.search(ab, { format: "singleId" }).toArray();
    console.log(label, results.map((r) => `${r.id} => ${r.value}`));
  }

  // Insert: 値が入っている場所に書くと上書きする
  await table.insert(42, a);
  await table.insert(7, a);
  await show("Insert 後:");

  // Upsert: 空いている部分にだけ書く
  await table.upsert(100, ab);
  await show("Upsert 後:");

  // Remove: 指定した部分を消す
  await table.remove(a);
  await show("Remove 後:");
}
