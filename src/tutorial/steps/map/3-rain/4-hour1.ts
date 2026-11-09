// @hide-start
import { RangeId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../../runner";

export default async function ({ db, show }: Tutorial) {
  const weather = db.table("weather");
  const h = Math.floor(new Date("2025-01-01T00:00:00+09:00").getTime() / 1000 / 3600);
  const town = RangeId.create(20, [0, 5], [931375, 931402], [412890, 412913]);
// @hide-end
  // 1 時台：町全体に強い雨（60）を書き込む
  await weather.insert(60, town.withTime(3600, h + 1));
// @hide-start
  show(await weather.search(town.withTime(3600, h + 1)).toArray());
}
// @hide-end
