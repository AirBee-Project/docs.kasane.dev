import { SingleId, isKasaneError } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ db }: Tutorial) {
  // 最大ズームレベル 20 のテーブルに、ズームレベル 22（より細かい）の ID を書く
  await db.createTable("zoom", "int", 20);
  const table = db.table("zoom");
  const fine = SingleId.create(22, 0, 3725557, 1651601);
  const parent = SingleId.create(20, 0, 931389, 412900);

  // "error"（省略時）: エラーになる
  try {
    await table.insert(1, fine);
  } catch (e) {
    if (isKasaneError(e)) console.log("error:", e.message);
  }

  // "ignore": エラーにならず、何も書かれない
  await table.insert(1, fine, "ignore");
  console.log("ignore:", await table.search(parent).toArray());

  // "normalize": ズームレベル 20 の親のボクセルに丸めて書かれる
  await table.insert(1, fine, "normalize");
  console.log("normalize:", (await table.search(parent).toArray()).map((r) => `${r.id} => ${r.value}`));
}
