import type { Tutorial } from "../runner";

export default async function ({ client, db, DB, check, log, describeError }: Tutorial) {
  // 見えるデータベースの一覧
  const names = (await client.listDatabases()).map((d) => d.name);
  log("見えるデータベース:", names);
  check("チュートリアル用のデータベースが見える", names.includes(DB));

  // データベースの情報
  log("データベースの情報:", await db.info());

  // 権限の無い操作は拒否される
  try {
    await client.createDatabase("should_fail");
    check("データベースの作成は拒否される", false, "作成できてしまいました");
  } catch (e) {
    check("データベースの作成は拒否される", describeError(e).includes("permission_denied"), describeError(e));
  }
}
