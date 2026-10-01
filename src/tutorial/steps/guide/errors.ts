import { SingleId, SpatialIdError, isKasaneError, isNotFoundError, isPermissionDeniedError } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ client, db }: Tutorial) {
  // サーバーから返るエラー（ConnectError）
  try {
    await db.table("no_such_table").info();
  } catch (e) {
    if (isKasaneError(e)) console.log("無いテーブル:", e.message, " isNotFoundError:", isNotFoundError(e));
  }

  try {
    await client.database("other").createTable("test", "int", 20);
  } catch (e) {
    if (isKasaneError(e)) console.log("権限が無い:", e.message, " isPermissionDeniedError:", isPermissionDeniedError(e));
  }

  // 空間ID の値が不正なときは、通信する前にクライアントがエラーを投げる（SpatialIdError）
  try {
    SingleId.create(20, 0, 2 ** 20, 0);
  } catch (e) {
    if (e instanceof SpatialIdError) console.log("範囲外の x:", e.message, " kind:", e.info.kind);
  }

  try {
    SingleId.parse("20/0/931389");
  } catch (e) {
    if (e instanceof SpatialIdError) console.log("書式の誤り:", e.message, " kind:", e.info.kind);
  }
}
