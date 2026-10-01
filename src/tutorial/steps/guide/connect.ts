import type { Tutorial } from "../../runner";

export default async function ({ client }: Tutorial) {
  // ログインしたユーザーが見えるデータベースの一覧
  const databases = await client.listDatabases();
  console.log("データベース:", databases.map((d) => d.name));

  // データベースのハンドルを取る（この時点では通信しない）
  const db = client.database("tutorial");
  console.log("ハンドルの名前:", db.name);

  // ハンドルからデータベースの情報を取る（ここで通信する）
  console.log("情報:", await db.info());
}
