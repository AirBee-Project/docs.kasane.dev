import { SingleId } from "@airbee-project/kasane-client";
import type { Tutorial } from "../runner";

export default async function ({ db, t, check, log, describeError, resetTable }: Tutorial) {
  const id = SingleId.create(20, 0, 931389, 412900);

  async function expectError(label: string, fn: () => Promise<unknown>) {
    try {
      await fn();
      check(label, false, "エラーになりませんでした");
    } catch (e) {
      check(label, true);
      log("   ", describeError(e));
    }
  }

  // TEXT
  await resetTable(t("t_text"));
  await db.createTable(t("t_text"), "text", 25);
  await db.table(t("t_text")).insert("東京駅", id);
  check("TEXT: 文字列が返る", (await db.table(t("t_text")).search(id).toArray())[0]?.value === "東京駅");
  await expectError("TEXT に数値を書くとエラー", () => db.table(t("t_text")).insert(1, id));

  // BOOLEAN
  await resetTable(t("t_bool"));
  await db.createTable(t("t_bool"), "boolean", 25);
  await db.table(t("t_bool")).insert(true, id);
  check("BOOLEAN: true が返る", (await db.table(t("t_bool")).search(id).toArray())[0]?.value === true);

  // PRESENCE（「ある」ことだけを記録する。値は null）
  await resetTable(t("t_presence"));
  await db.createTable(t("t_presence"), "presence", 25);
  await db.table(t("t_presence")).insert(null, id);
  const presence = await db.table(t("t_presence")).search(id).toArray();
  check("PRESENCE: 1 件あり、値は null", presence.length === 1 && presence[0]?.value === null);

  // INT と制約（0〜100）
  await resetTable(t("t_int"));
  await db.createTable(t("t_int"), "int", 25, {
    constraints: { kind: { case: "int", value: { min: 0n, max: 100n } } } as never,
  });
  await db.table(t("t_int")).insert(80, id);
  check("INT: 80n が返る", (await db.table(t("t_int")).search(id).toArray())[0]?.value === 80n);
  await expectError("INT の制約（最大 100）を超えるとエラー", () => db.table(t("t_int")).insert(150, id));

  // ENUM（選択肢を決めておく）
  await resetTable(t("t_enum"));
  await db.createTable(t("t_enum"), "enum", 25, {
    constraints: { kind: { case: "enumConstraint", value: { choices: ["晴れ", "曇り", "雨"] } } } as never,
  });
  await db.table(t("t_enum")).insert("晴れ", id);
  check("ENUM: 晴れ が返る", (await db.table(t("t_enum")).search(id).toArray())[0]?.value === "晴れ");
  await expectError("ENUM の選択肢に無い値はエラー", () => db.table(t("t_enum")).insert("雪", id));
}
