import { SingleId, isKasaneError } from "@airbee-project/kasane-client";
import type { Tutorial } from "../../runner";

export default async function ({ db }: Tutorial) {
  const id = SingleId.create(20, 0, 931389, 412900);

  async function tryInsert(label: string, write: () => Promise<unknown>) {
    try {
      await write();
      console.log(label, "書き込めた");
    } catch (e) {
      if (isKasaneError(e)) console.log(label, e.message);
    }
  }

  // TEXT
  await db.createTable("names", "text", 25);
  await db.table("names").insert("東京駅", id);
  console.log("TEXT:", (await db.table("names").search(id).toArray())[0]?.value);
  await tryInsert("TEXT に数値:", () => db.table("names").insert(1, id));

  // BOOLEAN
  await db.createTable("open", "boolean", 25);
  await db.table("open").insert(true, id);
  console.log("BOOLEAN:", (await db.table("open").search(id).toArray())[0]?.value);

  // PRESENCE（「ある」ことだけを記録する。値は null）
  await db.createTable("exists", "presence", 25);
  await db.table("exists").insert(null, id);
  console.log("PRESENCE:", (await db.table("exists").search(id).toArray())[0]?.value);

  // INT と制約（0〜100）
  await db.createTable("score", "int", 25, {
    constraints: { kind: { case: "int", value: { min: 0n, max: 100n } } } as never,
  });
  await db.table("score").insert(80, id);
  console.log("INT:", (await db.table("score").search(id).toArray())[0]?.value);
  await tryInsert("INT に 150:", () => db.table("score").insert(150, id));

  // ENUM（選択肢を決めておく）
  await db.createTable("weather", "enum", 25, {
    constraints: { kind: { case: "enumConstraint", value: { choices: ["晴れ", "曇り", "雨"] } } } as never,
  });
  await db.table("weather").insert("晴れ", id);
  console.log("ENUM:", (await db.table("weather").search(id).toArray())[0]?.value);
  await tryInsert("ENUM に 雪:", () => db.table("weather").insert("雪", id));
}
