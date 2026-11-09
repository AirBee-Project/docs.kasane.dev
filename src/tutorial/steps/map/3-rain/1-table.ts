// @hide-start
import type { Tutorial } from "../../../runner";

export default async function ({ db }: Tutorial) {
// @hide-end
  // 時間を扱うテーブルを作る（値は天気のリスク）
  await db.createTable("weather", "int", 20, { isTemporal: true });

  // データベースにあるテーブルの一覧を出力する
  console.log((await db.listTables()).map((t) => t.name));
// @hide-start
}
// @hide-end
