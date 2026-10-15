// @hide-start
import type { Tutorial } from "../../../runner";

export default async function ({ db }: Tutorial) {
// @hide-end
  // 時間を扱うテーブルを作る（値は雨の強さ）
  await db.createTable("rain", "int", 20, { isTemporal: true });

  console.log("時間を扱うか:", (await db.table("rain").info()).isTemporal);
// @hide-start
}
// @hide-end
