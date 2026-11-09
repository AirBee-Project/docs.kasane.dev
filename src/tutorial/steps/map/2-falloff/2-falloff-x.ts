// @hide-start
import { RangeId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ client, show }: Tutorial) {
  const buildings = query.source("tutorial", "buildings");
// @hide-end
  // 手順 1 のクエリに、東西（X）方向の falloff を足す（8 ボクセルかけて減らしながら広げる）
  const spreadX = buildings.falloffX(20, 8, { pattern: "linear", policy: "max" });
// @hide-start
  show(await client.query(spreadX, RangeId.create(20, [0, 5], [931375, 931402], [412890, 412913])).toArray());
}
// @hide-end
