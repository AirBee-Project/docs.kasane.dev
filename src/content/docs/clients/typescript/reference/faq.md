---
title: よくある質問
sidebar:
  order: 6
---

Kasane 全般の質問は[よくある質問](/faq/)にあります。

## `has no exported member` と出る

`tsconfig.json` の `moduleResolution` を `"Bundler"` にしてください。

## 値が `42n` のように表示される

INT の値は `bigint` で返ります。`Number(value)` で普通の数値にできます。

## `connect` が終わらない

ユーザー名やパスワードが間違っていると、`connect` がエラーにならずにログインを繰り返し続けます。ユーザー名とパスワードを確かめてください（[接続と認証](/clients/typescript/guide/connect/)）。

