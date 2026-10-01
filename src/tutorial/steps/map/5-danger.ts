import { RangeId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ client }: Tutorial) {
  const buildingRisk = query
    .source("tutorial", "buildings")
    .falloffX(20, 4, { pattern: "linear", policy: "max" })
    .falloffY(20, 4, { pattern: "linear", policy: "max" });
  const danger = buildingRisk.merge(query.source("tutorial", "rain"), { policy: "sum", defaultValue: 0 });

  // 危険度が 80 以上の場所だけを残す
  const dangerous = danger.filter({ min: 80 });

  // 町全体を、時間ごとに検索する
  const h = Math.floor(Date.UTC(2025, 0, 1, 0) / 1000 / 3600);
  const town = RangeId.create(20, [0, 7], [931375, 931402], [412890, 412913]);
  for (const [label, t] of [["0 時台", h], ["1 時台", h + 1]] as const) {
    const results = await client.query(dangerous, town.withTime(3600, t)).toArray();
    console.log(`${label}（${results.length} 件）:`);
    console.log(results.map((r) => r.id.toString()).join(","));
  }
}
