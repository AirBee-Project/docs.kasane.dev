// @hide-start
import { RangeId, SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ db }: Tutorial) {
  const buildingA = RangeId.create(20, [0, 3], [931384, 931386], [412899, 412901]);
  const buildingB = RangeId.create(20, [0, 5], [931392, 931393], [412903, 412904]);
// @hide-end
  // 2 つのビルに、危険度 100 をまとめて書き込む
  const buildings = db.table("buildings");
  await buildings.insert(100, [buildingA, buildingB]);

  // ビルA の中・ビルB の中・ビルの外の 1 ボクセルずつを検索する
  const insideA = SingleId.create(20, 0, 931385, 412900);
  const insideB = SingleId.create(20, 0, 931392, 412903);
  const outside = SingleId.create(20, 0, 931389, 412900);
  for (const id of [insideA, insideB, outside]) {
    const [result] = await buildings.search(id).toArray();
    console.log(`${id} =>`, result ? `${result.value}` : "値なし");
  }
// @hide-start
}
// @hide-end
