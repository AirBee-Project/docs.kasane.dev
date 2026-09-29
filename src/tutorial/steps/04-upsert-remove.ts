import { RangeId, SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../runner";

export default async function ({ db, t, check, log }: Tutorial) {
  const table = db.table(t("hello"));
  const a = SingleId.create(20, 0, 931389, 412900); // 値 7 が入っている
  const b = SingleId.create(20, 0, 931390, 412900); // まだ空いている（a の東隣）
  const ab = RangeId.create(20, 0, [931389, 931390], 412900); // a と b をまとめた範囲

  // Upsert: 空いている部分にだけ書き込む
  await table.upsert(100, ab);
  const afterUpsert = await table.search(ab, { format: "singleId" }).toArray();
  log("Upsert 後:", afterUpsert.map((r) => `${r.id} => ${r.value}`));
  check("a は元の値 7 のまま", afterUpsert.find((r) => `${r.id}` === `${a}`)?.value === 7n);
  check("b には 100 が入る", afterUpsert.find((r) => `${r.id}` === `${b}`)?.value === 100n);

  // Remove: a だけを削除する
  await table.remove(a);
  const afterRemove = await table.search(ab, { format: "singleId" }).toArray();
  log("Remove 後:", afterRemove.map((r) => `${r.id} => ${r.value}`));
  check("a が消え、b だけが残る", afterRemove.length === 1 && `${afterRemove[0]?.id}` === `${b}`);
}
