// @hide-start
import { RangeId, SingleId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ client, show }: Tutorial) {
  const buildings = query.source("tutorial", "buildings");
// @hide-end
  // 手順 1 のクエリに、東西（X）方向の falloff を足す（8 ボクセルかけて減らしながら広げる）
  const spreadX = buildings.falloffX(20, 8, { pattern: "linear", policy: "max" });

  // ショッピングモールの東の端から、東へ 1 ボクセルずつ離れた場所を見る
  for (let dx = 0; dx <= 3; dx++) {
    const place = SingleId.create(20, 0, 931386 + dx, 412900);
    const [result] = await client.query(spreadX, place).toArray();
    console.log(`ショッピングモールから ${dx} ボクセル =>`, result ? `${result.value}` : "値なし");
  }
// @hide-start
  // 建物のまわりの結果を、右の Madori にだけ渡す
  show(await client.query(spreadX, RangeId.create(20, [0, 5], [931376, 931401], [412891, 412912])).toArray());
}
// @hide-end
