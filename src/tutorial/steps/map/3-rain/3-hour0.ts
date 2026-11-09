// @hide-start
import { RangeId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ db, show }: Tutorial) {
  const weather = db.table("weather");
  const h = Math.floor(new Date("2025-01-01T00:00:00+09:00").getTime() / 1000 / 3600);
  const town = RangeId.create(20, [0, 5], [931375, 931402], [412890, 412913]);
// @hide-end
  // 0 時台：町全体を曇り（10）にする
  await weather.insert(10, town.withTime(3600, h));
// @hide-start
  show(await weather.search(town.withTime(3600, h)).toArray());
}
// @hide-end
