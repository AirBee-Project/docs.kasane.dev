import { SingleId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ client }: Tutorial) {
  // Step 2 の建物の危険度
  const buildingRisk = query
    .source("tutorial", "buildings")
    .falloffX(20, 4, { pattern: "linear", policy: "max" })
    .falloffY(20, 4, { pattern: "linear", policy: "max" });

  // 雨の強さを足し合わせる（雨が無い場所は 0 として計算する）
  const danger = buildingRisk.merge(query.source("tutorial", "rain"), { policy: "sum", defaultValue: 0 });

  // Step 3 と同じ 2 点で、時間ごとの危険度を見る
  const h = Math.floor(Date.UTC(2025, 0, 1, 0) / 1000 / 3600);
  const west = SingleId.create(20, 0, 931382, 412900);
  const east = SingleId.create(20, 0, 931388, 412900);
  for (const [label, t] of [["0 時台", h], ["1 時台", h + 1]] as const) {
    const w = await client.query(danger, west.withTime(3600, t)).toArray();
    const e = await client.query(danger, east.withTime(3600, t)).toArray();
    console.log(`${label}  西:`, w.map((r) => r.value), " 東:", e.map((r) => r.value));
  }
}
