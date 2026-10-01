import { RangeId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ db }: Tutorial) {
  // 建物のテーブルを作る（値は危険度、最大ズームレベル 20）
  await db.createTable("buildings", "int", 20);
  const buildings = db.table("buildings");

  // 2 つのビルを、直方体の RangeId で表す
  const buildingA = RangeId.create(20, [0, 3], [931384, 931386], [412899, 412901]);
  const buildingB = RangeId.create(20, [0, 5], [931392, 931393], [412903, 412904]);

  // ビルのボクセルに、危険度 100 を書き込む
  await buildings.insert(100, [buildingA, buildingB]);

  console.log("ビルA:", buildingA.toString());
  console.log("ビルB:", buildingB.toString());
  console.log("count:", (await buildings.info()).count);
}
