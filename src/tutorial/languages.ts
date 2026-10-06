// 共通ページ（クイックスタート・チュートリアル）の言語タブに並ぶ言語。
// 言語を足すときは、ここに 1 項目足し、src/components/LangStep.astro にその言語のコードの置き場所を登録する。
export const languages = {
  typescript: { label: "TypeScript", icon: "seti:typescript", codeLang: "ts", ext: ".ts" },
} as const;

export type LanguageId = keyof typeof languages;
