---
description: "シンプル ToDo アプリの実装タスク"
---

# タスク: シンプル ToDo アプリ

**入力**: `specs/001-todo-app/` の仕様・計画・設計文書
**前提文書**: `plan.md`、`spec.md`、`research.md`、`data-model.md`、
`contracts/ui-state-contract.md`、`quickstart.md`
**言語要件**: タスク名、実装内の利用者向け文言、レビュー結果、説明文は日本語で記述する。
**テスト**: 各ユーザーストーリーのテストを対象実装より先に作成し、失敗を確認してから実装する。

## 書式: `[ID] [P?] [Story] 説明`

- **[P]**: 別ファイルを変更し、未完了タスクに依存せず並行実行できる。
- **[Story]**: 対応するユーザーストーリー（US1、US2、US3）。
- すべてのタスクに対象ファイルと、該当する場合は要件IDを記載する。

## Phase 1: セットアップ

**目的**: Vite + React の現行構成へ、再現可能なテスト基盤を追加する。

- [x] T001 Vitest、jsdom、React Testing Library、user-event、jest-domをdevDependenciesへ追加し、`test` と `test:run` スクリプトを `package.json` と `package-lock.json` に反映する
- [x] T002 [P] Reactプラグイン、jsdom、setupFiles、clearMocksを `vite.config.js` に設定する
- [x] T003 [P] jest-dom読込、テストごとのlocalStorage初期化、必要な場合だけdialog APIの最小補助を `src/test/setup.js` に実装する

**チェックポイント**: `npm run test:run` がテスト未作成または空の状態でも設定エラーなく起動できる。

---

## Phase 2: 共通基盤

**目的**: すべてのユーザーストーリーが利用する保存形式、初期読込、障害通知を完成させる。

**⚠️ CRITICAL**: このPhaseが完了するまで、ユーザーストーリーの実装を開始しない。

- [x] T004 [P] データなし、正常JSON、不正JSON、不正スキーマ、重複ID、未知version、getItem/setItem例外の失敗テストを `tests/unit/taskRepository.test.js` に作成する
- [x] T005 T004を通すバージョン1の読込・スキーマ検証・保存・エラー変換を `src/storage/taskRepository.js` に実装する
- [x] T006 [P] 正常な初期復元と読込失敗時の空一覧・日本語エラーの統合テストを `tests/integration/taskPersistence.test.jsx` に作成する
- [x] T007 読込・保存障害を `role="alert"` で表示する `src/components/StatusMessage.jsx` を実装する
- [x] T008 `src/main.jsx` でtaskRepositoryを一度だけ読み込み、初期結果とrepositoryを受け取る最小の `src/App.jsx` を実装してT006を通す

**チェックポイント**: 正常データは復元され、不正データまたはStorage例外でも空一覧と日本語エラーで安全に起動できる。

---

## Phase 3: ユーザーストーリー 1 - タスクを登録して確認する (優先度: P1) 🎯 MVP

**目標**: 1〜200文字のタスクを登録し、同名を含むタスクを登録順の一覧で確認し、再読込後も復元できる。

**独立したテスト**: 空の状態から「牛乳を買う」を登録し、未完了として一覧末尾へ表示された後、
新しいアプリインスタンスでも内容と順序が復元されることを確認する。

### テストと検証

- [x] T009 [P] [US1] FR-001、FR-002、FR-004、FR-010の空白除去、0・1・200・201文字、同名別ID、非破壊更新の失敗テストを `tests/unit/taskReducer.test.js` に作成する
- [x] T010 [P] [US1] FR-001〜FR-004、FR-010、FR-011の登録、空状態、入力エラー、同名表示、保存失敗時の入力保持を `tests/components/App.test.jsx` に作成して失敗を確認する
- [x] T011 [P] [US1] FR-009の登録後再初期化、登録順復元、保存失敗時の直前保存値維持を `tests/integration/taskPersistence.test.jsx` に追加して失敗を確認する

### 実装

- [x] T012 [US1] タイトルのtrim、Unicodeコードポイント数検証、task/addの純粋な状態遷移を `src/domain/taskReducer.js` に実装してT009を通す
- [x] T013 [P] [US1] 成功時だけ入力を消し、入力エラーまたは保存失敗時は値を保持する登録フォームを `src/components/TaskForm.jsx` に実装する
- [x] T014 [P] [US1] 空状態と登録順の `ul/li` 一覧を表示する `src/components/TaskList.jsx` に実装する
- [x] T015 [US1] ID生成、次状態計算、保存成功後の状態確定、入力・保存エラーを `src/hooks/useTasks.js` のaddTaskへ実装する
- [x] T016 [US1] TaskForm、TaskList、StatusMessage、useTasksを `src/App.jsx` へ統合してT010とT011を通す
- [x] T017 [US1] 320px以上のレスポンシブ表示、44px程度の操作領域、入力エラー、空状態、フォーカス表示を `src/styles.css` に実装する

**チェックポイント**: US1単独でタスクの登録・確認・再読込復元ができ、入力と保存の失敗時に既存データを失わない。

---

## Phase 4: ユーザーストーリー 2 - タスクを完了する (優先度: P2)

**目標**: 個々のタスクを完了・未完了へ切り替え、同じ一覧で色以外の情報から状態を確認し、再読込後も復元できる。

**独立したテスト**: 未完了タスクを完了にして「完了済み」とチェック状態を確認し、未完了へ戻した後も、
それぞれの状態が保存・復元されることを確認する。

### テストと検証

- [x] T018 [P] [US2] FR-005、FR-006の対象IDだけの完了・完了解除、未知ID、非破壊更新の失敗テストを `tests/unit/taskReducer.test.js` に追加する
- [x] T019 [P] [US2] FR-003、FR-005、FR-006とNFR-003のチェックボックス操作、文字による完了表示、同一一覧、キーボード操作の失敗テストを `tests/components/App.test.jsx` に追加する
- [x] T020 [P] [US2] FR-009の完了・完了解除後の再初期化と保存失敗時の状態・保存値維持を `tests/integration/taskPersistence.test.jsx` に追加する

### 実装

- [x] T021 [US2] task/toggleで対象IDだけのcompletedを反転する純粋な状態遷移を `src/domain/taskReducer.js` に実装してT018を通す
- [x] T022 [P] [US2] ネイティブcheckbox、完了済み文字、操作名を備えるタスク行を `src/components/TaskItem.jsx` に実装する
- [x] T023 [US2] 保存成功後だけ状態を確定するtoggleTaskを `src/hooks/useTasks.js` に実装し、TaskItemを `src/components/TaskList.jsx` へ接続する
- [x] T024 [US2] 完了済みを色だけに依存せず区別し、モーション抑制を尊重する表示を `src/App.jsx` と `src/styles.css` に統合してT019とT020を通す

**チェックポイント**: US1を壊さず、各タスクを完了・未完了へ切り替えて保存・復元できる。

---

## Phase 5: ユーザーストーリー 3 - 不要なタスクを削除する (優先度: P3)

**目標**: 対象名を示す確認画面で削除または取消を選び、承認した対象だけを完全削除して再読込後も復元しない。

**独立したテスト**: 複数タスクから1件を選び、取消では全件が残り、承認では対象だけが消え、
再読込後も削除結果が維持されることを確認する。

### テストと検証

- [x] T025 [P] [US3] FR-007の対象IDだけの削除、未知ID、同名別ID、非破壊更新の失敗テストを `tests/unit/taskReducer.test.js` に追加する
- [x] T026 [P] [US3] FR-008とNFR-003の対象名・不可逆性表示、初期フォーカス、Escape、取消、承認、フォーカス復帰の失敗テストを `tests/components/App.test.jsx` に追加する
- [x] T027 [P] [US3] FR-009の削除後再初期化と削除保存失敗時の一覧・直前保存値維持を `tests/integration/taskPersistence.test.jsx` に追加する

### 実装

- [x] T028 [US3] task/deleteで対象IDだけを除外する純粋な状態遷移を `src/domain/taskReducer.js` に実装してT025を通す
- [x] T029 [P] [US3] 対象名、不可逆性、キャンセル初期フォーカス、Escape対応を持つネイティブdialogを `src/components/DeleteTaskDialog.jsx` に実装する
- [x] T030 [US3] requestDelete、cancelDelete、保存成功後だけ確定するconfirmDeleteを `src/hooks/useTasks.js` に実装する
- [x] T031 [US3] 明示的な削除ボタンを `src/components/TaskItem.jsx` に追加し、UI専用useRefによるフォーカス復帰とdialogを `src/App.jsx` へ統合してT026とT027を通す
- [x] T032 [US3] dialog、背景、削除・キャンセルボタン、狭い画面、フォーカスの表示を `src/styles.css` に実装する

**チェックポイント**: US1とUS2を壊さず、取消可能な確認を経て対象だけを削除し、結果を永続化できる。

---

## Phase 6: 横断的な仕上げ

**目的**: 品質ゲート、受入条件、性能、利用文書を完成させる。

- [x] T033 `npm run test:run` と `npm run build` を実行し、実装検証チェックリストと結果を `specs/001-todo-app/checklists/implementation.md` に作成する
- [x] T034 [P] `specs/001-todo-app/quickstart.md` の主要な受入確認をキーボード操作と320px幅を含めて実行し、UX・日本語文言・アクセシビリティの結果を同ファイルへ記録する
- [ ] T035 100件・4倍CPUスロットリング・各20試行で登録、完了切替、削除のp95を測定し、結果を `specs/001-todo-app/quickstart.md` に記録する
- [x] T036 [P] セットアップ、起動、テスト、主要操作、localStorage保存範囲を日本語で `README.md` に更新する

**チェックポイント**: すべての自動テスト、ビルド、受入確認、性能目標が成功し、残存リスクが記録されている。

---

## 依存関係と実行順序

### Phase依存関係

- **Phase 1（セットアップ）**: 依存なし。T002とT003はT001と並行可能。
- **Phase 2（共通基盤）**: Phase 1完了後。T004とT006のテスト作成は並行可能で、T005、T007、T008の順に統合する。
- **Phase 3（US1）**: Phase 2完了後。登録・確認・復元を提供するMVP。
- **Phase 4（US2）**: Phase 3完了後。既存の一覧へ完了切替を追加する。
- **Phase 5（US3）**: Phase 3完了後に開始できるが、`TaskItem.jsx` と `App.jsx` の競合を避けるため、通常はPhase 4完了後に実行する。
- **Phase 6（仕上げ）**: 採用する全ユーザーストーリー完了後。

### ユーザーストーリー依存関係

```text
セットアップ → 共通基盤 → US1（MVP）
                           ├── US2（完了切替）
                           └── US3（削除）
US2 + US3 → 横断的な仕上げ
```

- **US1**: 共通基盤だけに依存し、単独で価値を提供する。
- **US2**: US1のTask一覧を利用するが、完了切替は単独でテストできる。
- **US3**: US1のTask一覧を利用するが、削除確認と削除永続化は単独でテストできる。
- US2とUS3は論理的には並行可能だが、同じ `TaskItem.jsx`、`App.jsx`、テストファイルを変更するため、
  同時実装する場合は担当ファイルまたは統合順を調整する。

### ユーザーストーリー内の順序

1. 対象テストを作成し、期待理由で失敗することを確認する。
2. 純粋な状態遷移を実装する。
3. 表示コンポーネントとuseTasksの操作を実装する。
4. Appへ統合し、ストーリー単位のテストを成功させる。
5. チェックポイントで既存ストーリーの回帰がないことを確認する。

## 並行実行例

### セットアップ

```text
T002: vite.config.js のテスト設定
T003: src/test/setup.js の共通セットアップ
```

### ユーザーストーリー 1

```text
T009: tests/unit/taskReducer.test.js の登録テスト
T010: tests/components/App.test.jsx の登録UIテスト
T011: tests/integration/taskPersistence.test.jsx の登録永続化テスト

T013: src/components/TaskForm.jsx
T014: src/components/TaskList.jsx
```

### ユーザーストーリー 2

```text
T018: tests/unit/taskReducer.test.js の完了切替テスト
T019: tests/components/App.test.jsx の完了UIテスト
T020: tests/integration/taskPersistence.test.jsx の完了永続化テスト
```

### ユーザーストーリー 3

```text
T025: tests/unit/taskReducer.test.js の削除テスト
T026: tests/components/App.test.jsx の削除確認UIテスト
T027: tests/integration/taskPersistence.test.jsx の削除永続化テスト
```

## 実装戦略

### MVP優先

1. Phase 1とPhase 2を完了する。
2. Phase 3のUS1だけを実装する。
3. 登録・確認・再読込復元を独立検証し、MVPとして成立させる。
4. US2、US3を優先順に追加する。

### 段階的な提供

1. **US1**: タスクを登録・確認・復元できる。
2. **US2**: 完了・未完了を切り替えて復元できる。
3. **US3**: 確認後に対象タスクだけを削除できる。
4. **仕上げ**: 全体の品質、UX、性能、文書を確認する。

## 完了条件

- 全36タスクが完了し、FR-001〜FR-011、NFR-001〜NFR-004へ追跡できる。
- `npm run test:run` と `npm run build` が成功する。
- `quickstart.md` の受入確認と性能確認が成功する。
- UI文言、レビュー結果、説明文が日本語で統一される。
- 例外または残存リスクがある場合は、対象、理由、影響、対応方針が記録される。
