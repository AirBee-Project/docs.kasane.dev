import { SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../runner";

export default async function ({ db, t, check, log }: Tutorial) {
  const table = db.table(t("hello")); // Step 2 で作ったテーブル
  const id = SingleId.create(20, 0, 931389, 412900);

  // 値 42 が入っている場所に、別の値 7 を Insert する
  await table.insert(7, id);

  const results = await table.search(id).toArray();
  log(results.map((r) => `${r.id} => ${r.value}`));
  check("エラーにならず、値が 7 に上書きされる", results.length === 1 && results[0]?.value === 7n);
}
