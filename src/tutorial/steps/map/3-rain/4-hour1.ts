// @hide-start
import { RangeId, SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ db, show }: Tutorial) {
  const rain = db.table("rain");
  const h = Math.floor(new Date("2025-01-01T00:00:00+09:00").getTime() / 1000 / 3600);
  const town = RangeId.create(20, [0, 5], [931375, 931402], [412890, 412913]);
  const place = SingleId.create(20, 0, 931382, 412900);
// @hide-end
  // 1 時台：町全体に強い雨（60）を書き込む
  await rain.insert(60, town.withTime(3600, h + 1));

  // 同じ 1 点を 1 時台で検索して、雨の値を出力する
  const [result] = await rain.search(place.withTime(3600, h + 1)).toArray();
  console.log("1 時台の雨:", result?.value);
// @hide-start
  // 1 時台の町全体の雨を、右の Madori にだけ渡す
  show(await rain.search(town.withTime(3600, h + 1)).toArray());
}
// @hide-end
