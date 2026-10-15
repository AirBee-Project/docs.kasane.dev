// @hide-start
import { SingleId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ client }: Tutorial) {
  const buildings = query.source("tutorial", "buildings");
  const spreadX = buildings.falloffX(20, 4, { pattern: "linear", policy: "max" });
// @hide-end
  // 手順 2 のクエリに、南北（Y）方向の falloff を足す
  const buildingRisk = spreadX.falloffY(20, 4, { pattern: "linear", policy: "max" });

  // ビルA の東の端から、東へ 1 ボクセルずつ離れた場所を見る
  for (let dx = 0; dx <= 4; dx++) {
    const place = SingleId.create(20, 0, 931386 + dx, 412900);
    const [result] = await client.query(buildingRisk, place).toArray();
    console.log(`ビルA から ${dx} ボクセル =>`, result ? `${result.value}` : "値なし");
  }
// @hide-start
}
// @hide-end
