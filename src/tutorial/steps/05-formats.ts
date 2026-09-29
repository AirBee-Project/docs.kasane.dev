import { FlexId, RangeId, SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../runner";

export default async function ({ db, t, check, log, resetTable }: Tutorial) {
  await resetTable(t("formats"));
  await db.createTable(t("formats"), "int", 25);
  const table = db.table(t("formats"));

  // 2×2 の範囲を RangeId で 1 回で書き込む
  const area = RangeId.create(20, 0, [931389, 931390], [412900, 412901]);
  await table.insert(1, area);

  // 同じ範囲を、3 つの出力形式で検索する
  for (const format of ["singleId", "rangeId", "flexId"] as const) {
    const results = await table.search(area, { format }).toArray();
    log(format, results.map((r) => r.id.toString()));
  }

  // 3 つの形式で表した同じ 1 点が、どれも同じ場所を指すか
  const single = SingleId.create(20, 0, 931389, 412900);
  const range = RangeId.create(20, 0, 931389, 412900);
  const flex = FlexId.create(20, 0, 20, 931389, 20, 412900);
  for (const [label, id] of [["SingleId", single], ["RangeId", range], ["FlexId", flex]] as const) {
    const hits = await table.search(id, { format: "singleId" }).toArray();
    check(`${label} ${id} で検索すると ${single} が 1 件返る`, hits.length === 1 && `${hits[0]?.id}` === `${single}`);
  }

  // singleId 形式で数えると、書き込んだ 4 個がそろっている
  const singles = await table.search(area, { format: "singleId" }).toArray();
  check("singleId 形式で 4 件", singles.length === 4);
}
