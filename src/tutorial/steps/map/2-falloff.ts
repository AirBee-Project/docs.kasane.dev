import { SingleId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ client }: Tutorial) {
  // 建物の危険度を、東西（X）と南北（Y）に 4 ボクセルかけて減らしながら広げる
  const buildingRisk = query
    .source("tutorial", "buildings")
    .falloffX(20, 4, { pattern: "linear", policy: "max" })
    .falloffY(20, 4, { pattern: "linear", policy: "max" });

  // ビルA の東の端から、東へ 1 ボクセルずつ離れた場所の危険度を見る
  for (let dx = 0; dx <= 4; dx++) {
    const place = SingleId.create(20, 0, 931386 + dx, 412900);
    const results = await client.query(buildingRisk, place).toArray();
    console.log(`ビルA から ${dx} ボクセル:`, results.map((r) => r.value));
  }
}
