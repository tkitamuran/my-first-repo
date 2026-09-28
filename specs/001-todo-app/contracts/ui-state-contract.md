# UI・状態管理契約: シンプル ToDo アプリ

**日付**: 2026-09-28

## レイヤー境界

### `taskReducer`

ブラウザーAPIとReactに依存しない純粋関数。現在のTask配列とactionから次のTask配列を返す。

```text
reduceTasks(tasks, action) -> nextTasks

action:
  { type: "task/add", task }
  { type: "task/toggle", id }
  { type: "task/delete", id }
```

- 入力の配列とTaskを変更しない。
- 一致するIDだけを変更する。
- 未知のactionまたは未知のIDでは同値の状態を返す。
- ID生成、時刻取得、localStorage、DOM操作を行わない。

### `taskRepository`

Storage互換オブジェクトを受け取り、localStorageの詳細を隠蔽する同期リポジトリ。

```text
createTaskRepository(storage, key = "todo-app.tasks.v1")
  .load() -> { ok: true, tasks } | { ok: false, tasks: [], error }
  .save(tasks) -> { ok: true } | { ok: false, error }
```

- `load` はデータなしを成功した空配列として返す。
- JSON、スキーマ、またはIDの一意性が不正な場合は、保存値を変更せず読込エラーを返す。
- `save` はversion 1のTaskStoreを1回の `setItem` で保存する。
- 例外の詳細を画面へ漏らさず、日本語化できるアプリ用エラーコードへ変換する。

### `useTasks`

初期読込結果、repository、ID生成器を受け取り、UIへ状態とコマンドを公開する。

```text
useTasks({ initialLoad, repository, idFactory }) -> {
  tasks,
  inputError,
  storageError,
  pendingDeleteTask,
  addTask(rawTitle) -> { ok: true } | { ok: false, kind: "validation" | "storage" },
  toggleTask(id),
  requestDelete(id),
  cancelDelete(),
  confirmDelete()
}
```

- 登録時に入力を正規化・検証し、正常な場合だけIDを生成する。
- 変更操作では次状態を計算し、保存成功後だけReact状態を確定する。
- 保存失敗時は既存タスクを維持し、再試行可能な日本語エラーを公開する。
- `addTask` は同期的な結果を返し、TaskFormは成功時だけ入力欄を空にする。入力エラーまたは
  保存失敗時は入力値を維持する。
- 削除要求と取消ではTaskStoreを変更しない。

## 表示コンポーネント契約

| コンポーネント | 入力 | 通知するイベント | 責務 |
|---|---|---|---|
| `TaskForm` | `error` | `onSubmit(title) -> result` | 入力、送信、成功時だけの入力クリア、入力エラーの関連付け |
| `TaskList` | `tasks` | なし | 空状態または同一一覧の描画 |
| `TaskItem` | `task` | `onToggle(id)`, `onDeleteRequest(id, trigger)` | 完了状態と個別操作の表示 |
| `DeleteTaskDialog` | `task` | `onConfirm()`, `onCancel()` | 対象名付き確認、Escape、フォーカス復帰 |
| `StatusMessage` | `storageError` | なし | 読込・保存障害の通知 |

表示コンポーネントはlocalStorageを直接参照せず、Task配列を直接変更しない。

## 操作契約

| 操作 | 成功時 | 入力／保存失敗時 |
|---|---|---|
| 登録 | 未完了タスクを末尾表示し、入力欄を空にする | 入力値と既存一覧を維持し、入力エラーは欄近く、保存失敗は共通領域で通知 |
| 完了切替 | 対象1件だけを反転し、文字とチェック状態で表示 | 対象がなければ変更なし。保存失敗は既存一覧を維持 |
| 削除要求 | 対象名と不可逆性を示す確認ダイアログを開く | データ変更なし |
| 削除確定 | 対象1件だけを完全削除し、操作元へフォーカスを戻す | 対象を残し、ダイアログまたは共通領域で通知 |
| 削除取消 | データを変更せず閉じ、操作元へフォーカスを戻す | 該当なし |

## アクセシビリティ契約

- タスク一覧は `ul/li`、登録は `form` と明示的な `label` を使う。
- 完了切替はチェックボックスを使い、完了済みを文字でも伝える。
- 入力エラーは `aria-invalid` と `aria-describedby` で入力欄へ結び付ける。
- 保存・読込障害は `role="alert"` を使う。
- `<dialog>` は見出しと説明を関連付け、初期フォーカスをキャンセルへ置く。
- Escape、Tab、Enter、Spaceで主要操作が完結し、ダイアログ終了時にフォーカスを戻す。
- フォーカス復帰先はAppまたはダイアログ調整コンポーネントの `useRef` にだけ保持し、
  Task状態や永続化データへ含めない。
- すべての操作要素に視認可能なフォーカスを設け、完了状態を色だけで表現しない。

## テスト境界

- domain: 入出力だけを比較し、副作用がないことを検証する。
- repository: 実localStorageではなくStorage互換の偽物を注入し、重複IDを拒否することも検証する。
- hook: repositoryとID生成器を偽物へ差し替え、成功・失敗を決定的に検証する。
- UI: propsとコールバックを中心に、role、label、name、表示文言で検証する。
- 統合: 追加、完了、完了解除、削除の各操作後に新しい初期読込を行い、内容・状態・順序・
  削除結果を復元する。各操作の保存失敗時は以前の保存値が変わらないことを検証する。
