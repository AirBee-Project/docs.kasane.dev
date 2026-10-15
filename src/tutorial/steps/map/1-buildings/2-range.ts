// @hide-start
import { RangeId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function (_: Tutorial) {
// @hide-end
  // ショッピングモールと倉庫を、直方体の RangeId で表す
  const shoppingMall = RangeId.create(20, [0, 5], [931384, 931386], [412899, 412901]);
  const warehouse = RangeId.create(20, [0, 5], [931392, 931393], [412903, 412904]);

  console.log("ショッピングモール:", shoppingMall.toString());
  console.log("倉庫:", warehouse.toString());
// @hide-start
}
// @hide-end
