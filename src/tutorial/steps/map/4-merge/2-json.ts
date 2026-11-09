// @hide-start
import { RangeId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";
import { toJson } from "../../../to-json";

export default async function ({ client }: Tutorial) {
  const buildingRisk = query
    .source("tutorial", "buildings")
    .falloffX(20, 8, { pattern: "linear", policy: "max" })
    .falloffY(20, 8, { pattern: "linear", policy: "max" });
  const h = Math.floor(new Date("2025-01-01T00:00:00+09:00").getTime() / 1000 / 3600);
  const danger = buildingRisk.merge(query.source("tutorial", "weather"), { policy: "max", defaultValue: 0 });
// @hide-end
  // 町全体を、0 時台から 1 時台まで検索する
  const town = RangeId.create(20, [0, 5], [931375, 931402], [412890, 412913]);
  const results = await client.query(danger, town.withTime(3600, [h, h + 1])).toArray();

  // 結果を、Madori が読み込める JSON に変換して出力する
  console.log(toJson(results, "町のリスクマップ"));
// @hide-start
}
// @hide-end
