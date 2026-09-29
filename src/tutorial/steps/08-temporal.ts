import { Interval, RangeId, SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../runner";

export default async function ({ db, t, check, log, describeError, resetTable, WHOLE }: Tutorial) {
  // 時間を扱うテーブルを作る
  await resetTable(t("weather"));
  await db.createTable(t("weather"), "text", 25, { isTemporal: true });
  const table = db.table(t("weather"));

  // 2025-11-15 00:00 UTC の UNIX 時間から、1 時間単位の時間インデックスを求める
  const unix = Date.UTC(2025, 10, 15, 0, 0, 0) / 1000;
  const hour = Math.floor(unix / 3600);
  const place = SingleId.create(20, 0, 931389, 412900);

  await table.insert("晴れ", place.withTime(3600, hour)); // 00:00〜01:00
  await table.insert("雨", place.withTime(3600, hour + 1)); // 01:00〜02:00
  log("書き込んだ ID:", `${place.withTime(3600, hour)}`, `${place.withTime(3600, hour + 1)}`);

  // 00:00〜01:00 だけを検索
  const first = await table.search(place.withTime(3600, hour)).toArray();
  check("00:00〜01:00 は 晴れ だけ", first.length === 1 && first[0]?.value === "晴れ");

  // 00:00〜02:00 を範囲で検索
  const both = await table.search(RangeId.create(20, 0, 931389, 412900).withTime(3600, [hour, hour + 1])).toArray();
  check("00:00〜02:00 は 2 件", both.length === 2);

  // 1 日単位（Interval.DAY）で検索しても、その日に含まれるデータが返る
  const day = Math.floor(unix / 86400);
  const wholeDay = await table.search(place.withTime(Interval.DAY, day)).toArray();
  check("その日全体で検索すると 2 件", wholeDay.length === 2);

  // 時間を付けずに書くと「全時間」の値になる
  const always = SingleId.create(20, 0, 931390, 412900);
  await table.insert("常に存在", always);
  const anyTime = await table.search(always.withTime(3600, hour + 100)).toArray();
  check("全時間の値は、どの時刻で検索しても返る", anyTime.length === 1 && anyTime[0]?.value === "常に存在");

  // 使える時間間隔は 1 / 60 / 3600 / 86400 秒だけ
  try {
    await table.search(place.withTime(1800, hour * 2)).toArray();
    check("1800 秒の時間間隔はエラー", false);
  } catch (e) {
    check("1800 秒の時間間隔はエラー", true);
    log("   ", describeError(e));
  }

  // 時間を扱わないテーブルに、時間つきの ID は書けない
  await resetTable(t("no_time"));
  await db.createTable(t("no_time"), "text", 25);
  try {
    await db.table(t("no_time")).insert("x", place.withTime(3600, hour));
    check("時間を扱わないテーブルに時間つき ID を書くとエラー", false);
  } catch (e) {
    check("時間を扱わないテーブルに時間つき ID を書くとエラー", true);
    log("   ", describeError(e));
  }
  log("weather の全データ:", (await table.search(WHOLE).toArray()).map((r) => `${r.id} => ${r.value}`));
}
