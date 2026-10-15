// @hide-start
import { RangeId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function (_: Tutorial) {
// @hide-end
  // 2 つのビルを、直方体の RangeId で表す
  const buildingA = RangeId.create(20, [0, 3], [931384, 931386], [412899, 412901]);
  const buildingB = RangeId.create(20, [0, 5], [931392, 931393], [412903, 412904]);

  console.log("ビルA:", buildingA.toString());
  console.log("ビルB:", buildingB.toString());
// @hide-start
}
// @hide-end
