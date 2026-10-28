import { RangeId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ client, db }: Tutorial) {
  await db.createTable("original", "int", 25);
  const table = db.table("original");
  await table.insert(5, RangeId.create(25, 0, [29804448, 29804457], [13212800, 13212809]));

  // 改名（クライアントに専用メソッドが無いので、tableClient.update を使う）
  await client.tableClient.update({ dbName: "tutorial", tableName: "original", newName: "archive" });
  console.log("改名後:", (await db.listTables()).map((t) => t.name));

  // 削除
  await db.table("archive").delete();
  console.log("削除後:", (await db.listTables()).map((t) => t.name));
}
