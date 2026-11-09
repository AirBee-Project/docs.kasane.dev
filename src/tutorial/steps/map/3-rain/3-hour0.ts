// @hide-start
import { RangeId, SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ db, show }: Tutorial) {
  const rain = db.table("rain");
  const h = Math.floor(new Date("2025-01-01T00:00:00+09:00").getTime() / 1000 / 3600);
  const town = RangeId.create(20, [0, 5], [931375, 931402], [412890, 412913]);
// @hide-end
  // 0 時台：町全体を曇り（10）にする
  await rain.insert(10, town.withTime(3600, h));

  // 町の 1 点を検索して、雨の値を出力する
  const place = SingleId.create(20, 0, 931382, 412900);
  const [result] = await rain.search(place.withTime(3600, h)).toArray();
  console.log("0 時台の雨:", result?.value);
// @hide-start
  // 町全体の雨を、右の Madori にだけ渡す
  show(await rain.search(town.withTime(3600, h)).toArray());
}
// @hide-end
