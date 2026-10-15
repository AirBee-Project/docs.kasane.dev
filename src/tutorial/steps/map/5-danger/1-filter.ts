// @hide-start
import { SingleId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ client }: Tutorial) {
  const buildingRisk = query
    .source("tutorial", "buildings")
    .falloffX(20, 4, { pattern: "linear", policy: "max" })
    .falloffY(20, 4, { pattern: "linear", policy: "max" });
  const h = Math.floor(Date.UTC(2025, 0, 1, 0) / 1000 / 3600);
  const westPoint = SingleId.create(20, 0, 931382, 412900);
  const eastPoint = SingleId.create(20, 0, 931388, 412900);
  const danger = buildingRisk.merge(query.source("tutorial", "rain"), { policy: "sum", defaultValue: 0 });
// @hide-end
  // 危険度が 80 以上の場所だけを残す
  const dangerous = danger.filter({ min: 80 });

  // 0 時台の西と東を見る
  for (const [label, place] of [["西", westPoint], ["東", eastPoint]] as const) {
    const [result] = await client.query(dangerous, place.withTime(3600, h)).toArray();
    console.log(`${label} =>`, result ? `${result.value}` : "値なし");
  }
// @hide-start
}
// @hide-end
