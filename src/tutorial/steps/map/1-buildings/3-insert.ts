// @hide-start
import { RangeId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ db }: Tutorial) {
  const shoppingMall = RangeId.create(20, [0, 5], [931384, 931386], [412899, 412901]);
  const warehouse = RangeId.create(20, [0, 5], [931392, 931393], [412903, 412904]);
// @hide-end
  // ショッピングモールに 100、倉庫に 70 を書き込む
  const buildings = db.table("buildings");
  await buildings.insert(100, shoppingMall);
  await buildings.insert(70, warehouse);

  // 建物ごとに検索して、建物と値を出力する
  for (const building of [shoppingMall, warehouse]) {
    const [result] = await buildings.search(building).toArray();
    console.log(`${building} => ${result?.value}`);
  }
// @hide-start
}
// @hide-end
