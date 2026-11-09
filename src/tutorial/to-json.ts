import type { RangeId } from "@airbee-project/kasane-client";

/**
 * 検索・クエリの結果を、Madori が読み込める JSON の文字列に変換する。
 * いずれクライアント（@airbee-project/kasane-client）に入れる予定の関数で、それまでチュートリアルの隠し部分から使う。
 * 結果の形式は既定の RangeId を前提にする
 */
export function toJson(results: { id: unknown; value: unknown }[], description = ""): string {
  // 値は重複なく value に並べ、各 ID の ref でそのどれかを指す
  const values = [...new Set(results.map((r) => Number(r.value)))];
  return JSON.stringify({
    meta: { version: "1.0", description },
    data: [
      {
        name: "risk",
        value: values,
        ids: results.map((r) => {
          const id = r.id as RangeId;
          return {
            z: id.z, f: id.f, x: id.x, y: id.y,
            i: id.interval.seconds(), t: id.t,
            ref: values.indexOf(Number(r.value)),
          };
        }),
      },
    ],
  });
}
