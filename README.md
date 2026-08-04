# タイトル：my-first-repo

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

1. Epic（エピック）: 大きな機能単位

  - ラベル例: Epic
  - 例：「ログイン・認証機能」

2. Story（ストーリー）: ユーザー視点の価値

  - ラベル例: Story
  - 例：「ユーザーはメールアドレスでログインできる」

3. Task（タスク）: 具体的な実装作業（数時間〜1日）

  - ラベル例: Task
  - 例：「□□APIのフィルターを実装」「DBスキーマの変更」「◯◯画面の△△ボタンを実装」

