# 技術調査: シンプル ToDo アプリ

**日付**: 2026-09-28

## 1. 状態管理とUIの責務分離

**決定**: タスク更新を純粋な `taskReducer`、永続化を `taskRepository`、両者の調整を
`useTasks`、DOMと利用者イベントを表示コンポーネントへ分離する。外部状態管理ライブラリは使わない。

**理由**: 登録、完了切替、削除を action と純粋な状態遷移として扱えば、ブラウザーAPIやDOMなしで
境界値と対象IDを検証できる。単一画面・単一データ集合には標準Reactで十分である。
[React: Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)

**検討した代替案**:

- `App.jsx` に状態と永続化を集約: 保存失敗と状態遷移のテストがUIへ密結合するため不採用。
- Context、Redux、Zustand、Immer: 現在の規模では依存と抽象化が過剰なため不採用。

## 2. localStorageへの保存順序

**決定**: 現在状態から次状態を純粋に計算し、リポジトリへ保存し、成功した場合だけReact状態を
確定する。失敗時は既存一覧を変更せず、日本語のエラーと再試行方法を表示する。
登録フォームは保存結果を同期的に受け取り、成功時だけ入力を消し、失敗時は入力値を保持する。

**理由**: reducer とレンダーを純粋に保ち、仕様の「保存失敗時に既存タスクを失わない」を
直接満たす。入力中には保存せず、登録・完了切替・削除確定の各操作で1回だけ保存する。
[React: Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)

**検討した代替案**:

- `useEffect([tasks])` による事後保存: 失敗前に画面だけ更新され、保存内容と不一致になるため不採用。
- 楽観更新後のロールバック: 連続操作時の競合処理が現在の規模には過剰なため不採用。

## 3. 保存形式と障害処理

**決定**: キー `todo-app.tasks.v1` に `{ version: 1, tasks: [...] }` のJSONを保存する。
Taskは `id`、`title`、`completed` だけを持ち、登録順は配列順で表す。読込時はversion、全フィールド、
IDの一意性を検証し、未保存は正常な空一覧、不正値やアクセス例外は空一覧と読込エラーを返す。
不正値を起動直後に自動上書きしない。

**理由**: localStorage は同一オリジンでブラウザーセッションを越えて保持される一方、
アクセス拒否、容量超過、不正JSONが起こり得る。版とスキーマの検証により安全に失敗できる。
[MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)、
[MDN: Storage quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)、
[MDN: JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)

**検討した代替案**:

- タスク配列だけを保存: 将来の形式変更を判定できないため不採用。
- 表示に使わない登録日時: 配列順で要件を満たせるため、初期版には保持しない。
- IndexedDB: 100件規模と明示されたlocalStorage要件には過剰なため不採用。
- 複数タブ同期: 競合解決規則が必要で現仕様の対象外となるため不採用。

## 4. 初期読込

**決定**: `main.jsx` の初期化時にリポジトリから一度読み、結果とリポジトリを `App` へ注入する。
表示コンポーネント、reducer、レンダー処理からlocalStorageを直接読まない。

**理由**: 初回の空一覧表示から復元されるちらつきと、StrictMode開発時の重複副作用を避ける。
テストでは初期結果と偽リポジトリを差し替えられる。
[React: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)、
[React: StrictMode](https://react.dev/reference/react/StrictMode)

**検討した代替案**:

- 初回 `useEffect`: 一時的な空表示と制御用状態が必要になるため不採用。
- `useState` initializerでlocalStorageを読む: initializerの純粋性と依存注入を損なうため不採用。

## 5. テスト基盤

**決定**: Vitest、jsdom、React Testing Library、user-event、jest-domをdevDependenciesへ追加する。
`vite.config.js` でjsdomと `src/test/setup.js` を指定し、`package.json` に `test` と `test:run` を
追加する。`npm run test:run` と `npm run build` を品質ゲートにする。

**理由**: Vitest はVite設定と変換処理を共有できる。Testing LibraryはDOM構造ではなく、利用者が
認識するrole、label、nameを使った検証を促す。現行のNode.jsとViteはVitestの動作要件を満たす。
[Vitest Guide](https://vitest.dev/guide/)、
[Vitest Environment](https://vitest.dev/guide/environment)、
[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)、
[user-event](https://testing-library.com/docs/user-event/intro/)

**検討した代替案**:

- happy-dom: 高速だがブラウザーAPIの再現範囲を優先してjsdomを採用する。
- Playwright中心のE2E: 小規模MVPには導入・実行コストが大きいため初期版では不採用。

## 6. 削除確認とアクセシビリティ

**決定**: ネイティブ `<dialog>` と明示的な「削除」ボタンを使用する。対象名と不可逆性を示し、
キャンセルを初期フォーカスにして、閉じた後は操作元へフォーカスを戻す。

**理由**: ネイティブ要素はモーダル性、背景操作の抑止、Escape操作を提供し、独自実装より誤りを
減らせる。入力はlabel、完了切替はcheckbox、一覧はul/liを使い、完了状態を色だけに依存させない。
[MDN: dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)

**検討した代替案**:

- `window.confirm`: 表示、対象説明、フォーカス、コンポーネントテストの制御が弱いため不採用。
- `div role="dialog"`: フォーカストラップと背景抑止を自前実装する必要があるため不採用。

## 7. パフォーマンス測定

**決定**: 100件を保存した本番ビルドをChromiumで開き、4倍CPUスロットリング下で登録、
完了切替、削除を各20回以上測定する。操作直前からDOM更新後の描画フレームまでを測り、p95が
1,000ms未満であることを確認する。

**理由**: jsdomの実行時間はブラウザー描画を含まず、利用者が見る結果の性能根拠にならない。
100件では仮想化を導入せず、実測で問題がある場合のみ最適化する方が単純である。

**検討した代替案**:

- jsdomテストの所要時間を性能判定に使う: 実ブラウザー描画を反映しないため不採用。
- 最初から仮想リストを導入: 100件には複雑性とアクセシビリティ負担が過剰なため不採用。
