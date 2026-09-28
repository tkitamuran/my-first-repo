# 実装計画: シンプル ToDo アプリ

**ブランチ**: `001-todo-app` | **日付**: 2026-09-28 | **仕様書**: [spec.md](./spec.md)

**入力**: `specs/001-todo-app/spec.md` の機能仕様と、Vite・React・CSS・localStorage・
責務分離に関する技術指定

**言語要件**: 本文、判断理由、レビュー用説明、利用者向け文言は日本語で記述する。
コード識別子、コマンド、Web API 名は正確性のため英語表記を維持する。

## 概要

既存の Vite + React アプリを、個人向けのシンプルな ToDo アプリとして再構成する。
タスクの登録、一覧確認、完了・完了解除、確認後の削除を提供し、バージョン付き JSON を
ブラウザーの localStorage に保存する。状態遷移、永続化、React 連携、UI 表示を分離し、
純粋関数と注入可能な依存を中心に自動テストできる設計とする。製品UIには外部UIライブラリを
使用せず、React コンポーネントとシンプルな CSS だけで構成する。

## 技術コンテキスト

**言語／バージョン**: JavaScript（ES Modules）、Node.js 24.17.0
**主要依存関係**: React 19.3.0、React DOM 19.3.0、Vite 8.3.0、
`@vitejs/plugin-react` 6.1.1（package-lock.json の現行解決値）
**ストレージ**: ブラウザー localStorage、キー `todo-app.tasks.v1`、バージョン付き JSON
**テスト**: Vitest + jsdom + React Testing Library + user-event + jest-dom
**対象プラットフォーム**: localStorage、`crypto.randomUUID()`、`<dialog>` を利用できる
最新安定版の主要デスクトップ／モバイルブラウザー
**プロジェクト種別**: 単一ページのクライアントサイド Web アプリ
**性能目標**: 100件のタスク保持時に、登録・完了切替・削除の表示反映が p95 で1秒未満
**制約**: 外部UI・状態管理ライブラリを追加しない。認証、サーバー、端末間同期は対象外
**規模／スコープ**: 1人・1ブラウザー、最大200文字のタスクを通常100件程度、単一画面

## 憲章チェック

*ゲート: Phase 0 の調査前に合格し、Phase 1 の設計後に再確認する。*

- [x] 全成果物を日本語で作成し、「タスク」「未完了」「完了済み」の用語を統一した
- [x] 純粋な状態遷移、ストレージ境界、ビルド検証、明示的なエラー処理を定義した
- [x] 状態遷移・永続化の単体テストと主要利用者フローの統合テストを定義した
- [x] 空・成功・入力エラー・保存／読込障害・削除確認とアクセシビリティを定義した
- [x] 100件、20試行以上、p95、1秒未満という性能条件と測定手順を定義した
- [x] 追加依存は開発時のテスト用に限定し、複雑性の例外はない

**設計後再確認**: `research.md`、`data-model.md`、`contracts/ui-state-contract.md`、
`quickstart.md` の作成後も全項目に適合している。憲章違反はない。

## プロジェクト構成

### この機能の文書

```text
specs/001-todo-app/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-state-contract.md
└── checklists/
    └── requirements.md
```

### ソースコード

```text
package.json
vite.config.js

src/
├── components/
│   ├── DeleteTaskDialog.jsx
│   ├── StatusMessage.jsx
│   ├── TaskForm.jsx
│   ├── TaskItem.jsx
│   └── TaskList.jsx
├── domain/
│   └── taskReducer.js
├── hooks/
│   └── useTasks.js
├── storage/
│   └── taskRepository.js
├── test/
│   └── setup.js
├── App.jsx
├── main.jsx
└── styles.css

tests/
├── components/
│   └── App.test.jsx
├── integration/
│   └── taskPersistence.test.jsx
└── unit/
    ├── taskReducer.test.js
    └── taskRepository.test.js
```

**構成の決定理由**: `taskReducer` は副作用のない状態遷移、`taskRepository` は
localStorage と保存形式、`useTasks` は両者を結合するアプリケーション状態、
`components` は表示と利用者イベントだけを担当する。現在 `App.jsx` に混在している責務を
分離しつつ、単一画面に不要な Context、Redux、Zustand などは導入しない。

## 品質・検証戦略

### コード品質

- タスク配列とタスクオブジェクトを破壊的に変更せず、`map`、`filter`、スプレッド構文で
  新しい状態を返す。
- ID は action 作成時に注入し、状態遷移を決定的にする。登録順は配列順で表し、未使用の
  日時フィールドは持たない。
- localStorage へのアクセス、JSON 変換、版・スキーマ検証、例外変換をリポジトリへ閉じ込める。
- 登録・完了切替・削除は「次状態を計算 → 保存 → 成功時だけ状態確定」の順に実行し、
  保存失敗時は既存一覧を変更しない。
- `npm run test:run` と `npm run build` を必須ゲートとする。テスト用依存は devDependencies に
  固定し、package-lock.json で再現性を確保する。
- `package.json` に `test`（監視実行）と `test:run`（一回実行）を追加する。
  `vite.config.js` にReactプラグイン、Vitestのjsdom環境、`src/test/setup.js` を設定する。
  setupではjest-domの読込、テストごとのlocalStorage初期化、jsdomに不足する場合だけ
  `<dialog>` の最小限のテスト用補助を行う。
- 現在の時刻、カテゴリ、カレンダー、設定ナビゲーション、サンプル初期タスクは仕様対象外のため削除する。

### テスト戦略

- **単体**: 空白除去、0・1・200・201文字、同名別ID、追加、完了、完了解除、対象だけの削除、
  未知ID、元状態の非破壊を `taskReducer.test.js` で検証する。
- **永続化単体**: データなし、正常保存・復元、不正JSON、不正スキーマ、重複ID、未知version、
  `getItem`／`setItem` 例外を、注入した Storage 代替で検証する。
- **フック／統合**: 追加、完了、完了解除、削除の各操作後に新しいアプリインスタンスを作り、
  内容・状態・順序・削除結果を復元できることを検証する。各変更操作の保存失敗では、直前の
  React状態とlocalStorage値を維持することを検証する。
- **UI統合**: role、label、表示文言を使い、登録、入力エラー、完了・解除、同一一覧表示、
  削除確認・取消・確定、フォーカス復帰、キーボード操作、読込／保存障害を検証する。
  登録の保存成功時だけ入力欄を空にし、入力エラーまたは保存失敗時は入力値を維持する。
- 製品UIの外部ライブラリ禁止は維持し、テスト支援ライブラリだけを devDependencies に追加する。

### ユーザー体験

- `form`、関連付けた `label`、`ul/li`、`input type="checkbox"`、ネイティブ `<dialog>` など
  意味を持つ要素を優先する。
- 完了状態は取り消し線や色だけでなく、「完了済み」の文字とチェック状態で伝える。
- 削除確認には対象名と取り消せない旨を表示し、初期フォーカスを「キャンセル」に置く。
  Escape とボタンで閉じ、閉じた後は元の削除ボタンへフォーカスを戻す。
- 入力エラーは `aria-invalid` と `aria-describedby`、障害通知は `role="alert"` で関連付ける。
- 320px 以上で操作可能にし、主要操作はおおむね44pxの操作領域、視認可能なフォーカス、
  `prefers-reduced-motion` 対応を維持する。

### パフォーマンス

- 本番ビルドを最新安定版 Chromium で開き、100件を事前保存する。
- デスクトップ相当環境で開発者ツールの4倍CPUスロットリングを有効にし、登録、代表タスクの
  完了切替、削除を各20回以上測定する。
- 操作開始直前から、保存完了後に対象DOMが更新された次の描画フレームまでを測定し、
  各操作の p95 が1,000ms未満であることを記録する。
- 機能テストに不安定な実時間アサーションは入れず、再現可能な手動性能手順を
  `quickstart.md` に分離する。100件では仮想化せず、測定で未達の場合のみ再描画最適化を行う。

## 複雑性の追跡

憲章違反または正当化が必要な追加複雑性はない。
