// @hide-start
import { SingleId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ client }: Tutorial) {
  const buildings = query.source("tutorial", "buildings");
// @hide-end
  // 手順 1 のクエリに、東西（X）方向の falloff を足す（4 ボクセルかけて減らしながら広げる）
  const spreadX = buildings.falloffX(20, 4, { pattern: "linear", policy: "max" });

  // ビルA の東の端から、東へ 1 ボクセルずつ離れた場所を見る
  for (let dx = 0; dx <= 3; dx++) {
    const place = SingleId.create(20, 0, 931386 + dx, 412900);
    const [result] = await client.query(spreadX, place).toArray();
    console.log(`ビルA から ${dx} ボクセル =>`, result ? `${result.value}` : "値なし");
  }
// @hide-start
}
// @hide-end
