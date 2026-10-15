// @hide-start
import type { Tutorial } from "../../../runner";

export default async function ({ db }: Tutorial) {
// @hide-end
  // 建物のテーブルを作る（値は危険度の整数、最大ズームレベル 20）
  await db.createTable("buildings", "int", 20);

  console.log((await db.listTables()).map((t) => t.name));
// @hide-start
}
// @hide-end
