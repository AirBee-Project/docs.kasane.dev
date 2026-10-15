// @hide-start
import { RangeId, SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ db }: Tutorial) {
  const shoppingMall = RangeId.create(20, [0, 5], [931384, 931386], [412899, 412901]);
  const warehouse = RangeId.create(20, [0, 5], [931392, 931393], [412903, 412904]);
// @hide-end
  // ショッピングモールに 100、倉庫に 70 を書き込む
  const buildings = db.table("buildings");
  await buildings.insert(100, shoppingMall);
  await buildings.insert(70, warehouse);

  // ショッピングモールの中・倉庫の中・建物の外の 1 ボクセルずつを検索する
  const insideMall = SingleId.create(20, 0, 931385, 412900);
  const insideWarehouse = SingleId.create(20, 0, 931392, 412903);
  const outside = SingleId.create(20, 0, 931389, 412900);
  for (const id of [insideMall, insideWarehouse, outside]) {
    const [result] = await buildings.search(id).toArray();
    console.log(`${id} =>`, result ? `${result.value}` : "値なし");
  }
// @hide-start
}
// @hide-end
