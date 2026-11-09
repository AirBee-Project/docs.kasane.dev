// @hide-start
import { RangeId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ db, show }: Tutorial) {
  const shoppingMall = RangeId.create(20, [0, 5], [931384, 931386], [412899, 412901]);
  const warehouse = RangeId.create(20, [0, 5], [931392, 931393], [412903, 412904]);
// @hide-end
  // ショッピングモールに 100、倉庫に 70 を書き込む
  const buildings = db.table("buildings");
  await buildings.insert(100, shoppingMall);
  await buildings.insert(70, warehouse);
// @hide-start
  show(await buildings.search([shoppingMall, warehouse]).toArray());
}
// @hide-end
