import { FlexId, Interval, RangeId, SingleId } from "@airbee-project/kasane-client";

export default async function () {
  // SingleId: 1 ボクセル（ズームレベル, f, x, y）
  const tokyo = SingleId.create(20, 0, 931389, 412900);
  console.log("SingleId:", tokyo.toString());

  // 文字列から作る
  console.log("parse:", SingleId.parse("20/0/931389/412900").toString());

  // RangeId: 軸ごとに [最小, 最大]（両端を含む）を指定する。1 つの値ならその位置だけ
  const block = RangeId.create(20, 0, [931389, 931390], [412900, 412901]);
  console.log("RangeId:", block.toString());
  console.log("中のボクセル:", [...block.toSingleIds()].map(String));

  // FlexId: 軸ごとにズームレベルを変えられる形
  const flex = FlexId.create(20, 0, 20, 931389, 19, 206450);
  console.log("FlexId:", flex.toString());

  // 時間を付ける（1 時間単位、2025-01-01 0 時台）
  const hour = Math.floor(Date.UTC(2025, 0, 1) / 1000 / 3600);
  const withTime = tokyo.withTime(Interval.HOUR, hour);
  console.log("時間つき:", withTime.toString(), " 全時間か:", withTime.isWholeTime());
}
