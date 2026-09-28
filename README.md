# シンプル ToDo アプリ

ViteとReactで作成した、日本語で使えるブラウザー内ToDoアプリです。タスクの追加、一覧確認、
完了・未完了の切替、確認付き削除に対応しています。データはブラウザーのlocalStorageに保存され、
ページを再読み込みしても保持されます。

## 必要環境

- Node.js 24系
- npm 11系
- localStorageと`<dialog>`を利用できる最新のブラウザー

## セットアップと起動

```powershell
npm install
npm run dev
```

ターミナルに表示されたローカルURLをブラウザーで開いてください。

## 使い方

1. 「タスク名」へ1〜200文字で内容を入力し、「追加」を押します。Enterキーでも追加できます。
2. 一覧のチェックボックスで完了・未完了を切り替えます。
3. 「削除」を押すと確認画面が開きます。対象名を確認し、「削除する」または
   「キャンセル」を選びます。

空白だけの入力や201文字以上の入力は登録されず、入力欄の近くに日本語で理由が表示されます。

## テストとビルド

```powershell
npm run test:run
npm run build
```

開発中にテストを監視実行する場合は`npm test`、本番ビルドをローカル確認する場合は
`npm run preview`を使用します。

## データ保存

タスクは現在のブラウザー・オリジンのlocalStorageに、キー`todo-app.tasks.v1`で保存されます。
サーバーや別端末、別ブラウザーとの同期は行いません。ブラウザーのサイトデータを削除すると
タスクも削除されます。

保存対象はタスクID、タイトル、完了状態です。入力途中の文字や削除確認の表示状態は保存しません。

## 設計資料

- 仕様: `specs/001-todo-app/spec.md`
- 実装計画: `specs/001-todo-app/plan.md`
- タスク: `specs/001-todo-app/tasks.md`
- 実行・受入確認: `specs/001-todo-app/quickstart.md`

---

## リポジトリの学習履歴

GitHub練習用のリポジトリです

## 概要

さまざまな操作を練習します

## 環境構築手順

開発マシンにClone、gitコマンドとエディターを準備します

## 使い方

GitやGitHubの様々な操作を試すために自由に使う

## 学習履歴

1. Clone

 - リポジトリを作成してcloneを実施
 - commitを実施

2. Branch

 - feature/loginブランチ作成
 - ブランチ更新

3. Branch2回目

 - feature/login2ブランチ作成
 - コンフリクト

4. Issue

### 機能開発（Feature）テンプレート

実装する機能のゴールを明確にするためのテンプレートです。
ファイル名: .github/ISSUE_TEMPLATE/feature_request.md

### バグ報告（Bug）テンプレート

不具合報告に必要な情報を網羅し、手戻りを防ぎます。
ファイル名: .github/ISSUE_TEMPLATE/bug_report.md

### 調査・質問（Investigation）テンプレート

実装可否の調査や、技術選定など、コードを書く前のタスク用です。
ファイル名: .github/ISSUE_TEMPLATE/investigation.md

### 「Epic > Story > Task」でタスク分解する

大きな機能を開発する場合、いきなりコードを書き始めるのではなく、「タスク分解」を行うことが成功の鍵です。
GitHubの Sub-issues（サブイシュー） 機能や Labels（ラベル） を活用し、以下の3階層で整理することをお勧めします。

① Epic（エピック）: 大きな機能単位

  - ラベル例: Epic
  - 例：「ログイン・認証機能」

② Story（ストーリー）: ユーザー視点の価値

  - ラベル例: Story
  - 例：「ユーザーはメールアドレスでログインできる」

③ Task（タスク）: 具体的な実装作業（数時間〜1日）

  - ラベル例: Task
  - 例：「□□APIのフィルターを実装」「DBスキーマの変更」「◯◯画面の△△ボタンを実装」

5. Pull Request

### PRの内容を書く（テンプレート活用）

レビュアーに「何を見てほしいか」を伝えるために、以下の機能を活用しましょう。

#### 魔法の言葉「Closes #Issue番号」
PRの本文に Closes #1 や Fixes #5 と書くと、このPRがマージされた瞬間に、リンクされたIssueが自動的に完了（Close） します。

#### PRテンプレートの導入
Issueと同様、PRにもテンプレートを設定できます。
.github/pull_request_template.md というファイルを作成すると、PR作成時に自動で読み込まれます。

#### ラベル（Prefix）で温度感を伝える
コメントの冒頭に「ラベル」をつけることで、修正の強制力を明確にします。

- must: 「必須」修正しないとマージできません。バグや重大な規約違反
  - 例：「must: パスワードがログに出力されています。削除してください。」
- imo: 「私の意見 (In My Opinion)」修正するかは任せます。提案や別案
  - 例：「imo: この変数名は user_list の方が分かりやすいかも？」
- nits: 「些細な点 (Nitpick)」修正不要ですが、気になった点。
  - 例：「nits: ここの空行は不要かも。」
- ask: 「質問」意図を確認したいとき。
  - 例：「ask: なぜこのライブラリを選定したのですか？」

6. Branch保護

### 安全装置「ブランチ保護ルール」
人間は必ずミスをします。「誤ってmainブランチを削除してしまった」「レビューなしでマージしてバグらせてしまった」…
こうした事故を精神論ではなくシステム的に0%にするのが、GitHubの Branch protection rules（ブランチ保護ルール） です。

#### 設定方法

1. リポジトリの Settings > Branches > Add branch protection rule をクリック
1. Branch name pattern にmainと入力
1. 以下の項目にチェックを入れるのが推奨設定です

  - Require a pull request before merging:
    - PRを通さないとマージできなくします
    - Require approvals: 必須レビュー人数（例: 1人）を設定
  - Require status checks to pass before merging:
    - テスト（CI）が通らないとマージボタンを押せなくします
  - Block force pushes:
    - force pushを禁止します


