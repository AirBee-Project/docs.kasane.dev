// @hide-start
import { SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function (_: Tutorial) {
// @hide-end
  // 2025-01-01 0 時（UTC）の、1 時間単位の時間インデックス
  const h = Math.floor(Date.UTC(2025, 0, 1, 0) / 1000 / 3600);

  // 空間ID に時間を付けて、時空間ID にする
  const place = SingleId.create(20, 0, 931382, 412900);
  console.log("0 時台:", place.withTime(3600, h).toString());
  console.log("1 時台:", place.withTime(3600, h + 1).toString());
// @hide-start
}
// @hide-end
