// @hide-start
import { SingleId, query } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ client }: Tutorial) {
// @hide-end
  // 建物のテーブルをもとに、クエリを作る（まだ計算はしない）
  const buildings = query.source("tutorial", "buildings");

  // ショッピングモールの東の端から、東へ 1 ボクセルずつ離れた場所を見る
  for (let dx = 0; dx <= 2; dx++) {
    const place = SingleId.create(20, 0, 931386 + dx, 412900);
    const [result] = await client.query(buildings, place).toArray();
    console.log(`ショッピングモールから ${dx} ボクセル =>`, result ? `${result.value}` : "値なし");
  }
// @hide-start
}
// @hide-end
