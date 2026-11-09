// @hide-start
import { RangeId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ client, show }: Tutorial) {
// @hide-end
  // 建物のテーブルをもとに、クエリを作る（まだ計算はしない）
  const buildings = query.source("tutorial", "buildings");
// @hide-start
  show(await client.query(buildings, RangeId.create(20, [0, 5], [931375, 931402], [412890, 412913])).toArray());
}
// @hide-end
