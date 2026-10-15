// @hide-start
import { query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function (_: Tutorial) {
  const buildingRisk = query
    .source("tutorial", "buildings")
    .falloffX(20, 8, { pattern: "linear", policy: "max" })
    .falloffY(20, 8, { pattern: "linear", policy: "max" });
// @hide-end
  // 建物の危険度と雨の強さを重ね合わせ、同じ場所では大きい方を取る
  // （建物の危険度が無い場所は 0 として扱う）
  const danger = buildingRisk.merge(query.source("tutorial", "rain"), { policy: "max", defaultValue: 0 });
// @hide-start
  void danger;
}
// @hide-end
