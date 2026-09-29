import { RangeId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../runner";

export default async function ({ client, db, DB, t, check, describeError, resetTable }: Tutorial) {
  // コピー元のテーブルを用意する
  await resetTable(t("original"));
  await db.createTable(t("original"), "int", 25);
  const table = db.table(t("original"));
  await table.insert(5, RangeId.create(25, 0, [29804448, 29804457], [13212800, 13212809]));

  // --- 1. テーブルのコピー ---
  await resetTable(t("original_copy"));
  await table.copy(t("original_copy"));
  const original = (await table.info()).count;
  const copied = (await db.table(t("original_copy")).info()).count;
  check("コピー先の count がコピー元と一致", original === copied, { original, copied });

  // --- 2. テーブルの改名（Client-ts に専用メソッドが無いため、低レベル API を使う） ---
  await resetTable(t("renamed"));
  await client.tableClient.update({ dbName: DB, tableName: t("original_copy"), newName: t("renamed") });
  const names = (await db.listTables()).map((x) => x.name);
  check("改名後の名前で一覧に出る", names.includes(t("renamed")) && !names.includes(t("original_copy")));

  // --- 3. テーブルの削除 ---
  await db.table(t("renamed")).delete();
  try {
    await db.table(t("renamed")).info();
    check("削除したテーブルは読めない", false);
  } catch (e) {
    check("削除したテーブルは読めない（not_found）", describeError(e).includes("not_found"), describeError(e));
  }

  // --- 4. 権限の無い操作 ---
  try {
    await client.database("shared").createTable("should_fail", "int", 20);
    check("ほかのデータベースにはテーブルを作れない", false);
  } catch (e) {
    check("ほかのデータベースにはテーブルを作れない（permission_denied）", describeError(e).includes("permission_denied"), describeError(e));
  }
}
