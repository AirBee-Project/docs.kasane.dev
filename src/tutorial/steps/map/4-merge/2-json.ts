// @hide-start
import { RangeId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ client }: Tutorial) {
  const buildingRisk = query
    .source("tutorial", "buildings")
    .falloffX(20, 8, { pattern: "linear", policy: "max" })
    .falloffY(20, 8, { pattern: "linear", policy: "max" });
  const h = Math.floor(Date.UTC(2025, 0, 1, 0) / 1000 / 3600);
  const danger = buildingRisk.merge(query.source("tutorial", "rain"), { policy: "max", defaultValue: 0 });
// @hide-end
  // 町全体を、0 時台から 1 時台まで検索する
  const town = RangeId.create(20, [0, 5], [931375, 931402], [412890, 412913]);
  const results = await client.query(danger, town.withTime(3600, [h, h + 1])).toArray();

  // 結果を、Senri が読み込める JSON に変換する
  const values = [...new Set(results.map((r) => Number(r.value)))];
  const json = {
    meta: { version: "1.0", description: "町の危険度マップ" },
    data: [
      {
        name: "risk",
        value: values,
        ids: results.map((r) => {
          const id = r.id as RangeId; // 結果の形式は既定の RangeId
          return {
            z: id.z, f: id.f, x: id.x, y: id.y,
            i: id.interval.seconds(), t: id.t,
            ref: values.indexOf(Number(r.value)),
          };
        }),
      },
    ],
  };
  console.log(JSON.stringify(json));
// @hide-start
}
// @hide-end
