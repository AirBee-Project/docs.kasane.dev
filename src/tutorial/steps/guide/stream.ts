import { RangeId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ db }: Tutorial) {
  await db.createTable("stream", "int", 25);
  const table = db.table("stream");
  await table.insert(1, RangeId.create(20, 0, [931389, 931391], 412900));
  await table.insert(2, RangeId.create(20, 0, [931392, 931393], 412900));
  const area = RangeId.create(20, 0, [931389, 931393], 412900);

  // for await: 届いた順に 1 件ずつ処理する
  for await (const { id, value } of table.search(area)) {
    console.log("for await:", `${id} => ${value}`);
  }

  // toArray: すべて集めて配列にする
  const all = await table.search(area, { format: "singleId" }).toArray();
  console.log("toArray:", all.length, "件");

  // toDictionaryMap: 値ごとに ID をまとめる
  const byValue = await table.search(area, { format: "singleId" }).toDictionaryMap();
  for (const [value, ids] of byValue) {
    console.log(`toDictionaryMap: ${value} =>`, ids.map(String));
  }

  // 検索結果は 1 回しか読めない
  const results = table.search(area);
  console.log("1 回目:", (await results.toArray()).length, "件");
  console.log("2 回目:", (await results.toArray()).length, "件");
}
