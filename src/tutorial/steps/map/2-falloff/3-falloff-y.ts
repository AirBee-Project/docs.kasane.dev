// @hide-start
import { RangeId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ client, show }: Tutorial) {
  const buildings = query.source("tutorial", "buildings");
  const spreadX = buildings.falloffX(20, 8, { pattern: "linear", policy: "max" });
// @hide-end
  // 手順 2 のクエリに、南北（Y）方向の falloff を足す
  const buildingRisk = spreadX.falloffY(20, 8, { pattern: "linear", policy: "max" });
// @hide-start
  show(await client.query(buildingRisk, RangeId.create(20, [0, 5], [931375, 931402], [412890, 412913])).toArray());
}
// @hide-end
