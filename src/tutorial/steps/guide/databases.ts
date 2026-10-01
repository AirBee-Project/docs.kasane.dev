import { isKasaneError } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ client, db }: Tutorial) {
  // 自分が見えるデータベースの一覧
  const databases = await client.listDatabases();
  console.log("データベース:", databases.map((d) => d.name));

  // テーブルを作って、一覧と情報を見る
  await db.createTable("shops", "text", 25);
  console.log("テーブル:", (await db.listTables()).map((t) => t.name));
  const info = await db.table("shops").info();
  console.log("最大ズームレベル:", info.maxZoomLevel, " 時間を扱うか:", info.isTemporal);

  // 権限の無い操作は断られる
  try {
    await client.createDatabase("my_database");
  } catch (e) {
    if (isKasaneError(e)) console.log("データベースの作成:", e.message);
  }
}
