import { SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../runner";

export default async function ({ db, t, check, log, describeError, resetTable, WHOLE }: Tutorial) {
  // 最大ズームレベル 20 のテーブルに、ズームレベル 22（より細かい）の ID を書く
  await resetTable(t("zoom"));
  await db.createTable(t("zoom"), "int", 20);
  const table = db.table(t("zoom"));
  const fine = SingleId.create(22, 0, 3725557, 1651601);

  // error（既定）: エラーになる
  try {
    await table.insert(1, fine);
    check("error: エラーになる", false);
  } catch (e) {
    check("error: エラーになる", describeError(e).includes("invalid_argument"), describeError(e));
  }

  // ignore: エラーにならず、何も書かれない
  await table.insert(1, fine, "ignore");
  check("ignore: 何も書かれない", (await table.search(WHOLE).toArray()).length === 0);

  // normalize: ズームレベル 20 の親 ID に丸めて書かれる
  await table.insert(1, fine, "normalize");
  const stored = (await table.search(WHOLE).toArray()).map((r) => r.id.toString());
  log("normalize で書かれた ID:", stored);
  check("normalize: 親の 20/0/931389/412900 に書かれる", stored.length === 1 && stored[0] === "20/0/931389/412900");
}
