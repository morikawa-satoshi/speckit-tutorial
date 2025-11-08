# Spec-Kit チュートリアル集

spec-kitを段階的に学べる3つのチュートリアルプロジェクトです。

## 概要

spec-kitは、仕様駆動開発(Spec-Driven Development)を実現するためのツールキットです。
従来の「コードを書いてから仕様を確認する」アプローチではなく、「仕様を実行可能にして、そこからコードを生成する」アプローチを採用しています。

## 前提条件

```bash
# spec-kitのインストール
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

## チュートリアル構成

### Tutorial 1: 基礎編 - ToDoアプリ
**所要時間**: 30分
**学習内容**:
- spec-kitの基本的なワークフロー
- `/speckit.constitution` - プロジェクトの原則設定
- `/speckit.specify` - 要件定義
- `/speckit.plan` - 技術計画
- `/speckit.tasks` - タスク分解
- `/speckit.implement` - 実装

**プロジェクト**: シンプルなToDoリスト管理アプリ

### Tutorial 2: 中級編 - RESTful APIサービス
**所要時間**: 60分
**学習内容**:
- 複数の仕様ファイルの管理
- `/speckit.clarify` - 仕様の明確化
- `/speckit.analyze` - 一貫性チェック
- イテレーティブな仕様改善

**プロジェクト**: ブログ記事管理のRESTful API

### Tutorial 3: 応用編 - マイクロサービス連携
**所要時間**: 90分
**学習内容**:
- 複雑なシステムアーキテクチャの仕様化
- `/speckit.checklist` - 要件完全性の検証
- 段階的な実装とリファクタリング
- ブラウンフィールド開発への適用

**プロジェクト**: ユーザー認証とデータサービスの連携システム

## ディレクトリ構造

```
speckit-tutorial/
├── README.md (このファイル)
├── tutorial-1-todo-app/
│   ├── README.md
│   ├── .speckit/
│   └── (生成されるコード)
├── tutorial-2-api-service/
│   ├── README.md
│   ├── .speckit/
│   └── (生成されるコード)
└── tutorial-3-microservices/
    ├── README.md
    ├── .speckit/
    └── (生成されるコード)
```

## 推奨学習順序

1. Tutorial 1から順番に進めることを推奨します
2. 各チュートリアルは独立していますが、前のチュートリアルの知識を前提とします
3. 各ステップで生成された成果物を確認し、理解を深めてください

## サポート

各チュートリアルディレクトリに詳細なREADME.mdがあります。
ステップバイステップで進められるように設計されています。

## spec-kitの基本ワークフロー

```
1. Constitution (憲法) → プロジェクトの原則・制約を定義
2. Specification (仕様) → 何を作るかを定義
3. Plan (計画) → どう作るかを定義
4. Tasks (タスク) → 実装可能な単位に分解
5. Implement (実装) → コードを生成・実装
```

このサイクルを繰り返すことで、高品質なソフトウェアを効率的に開発できます。

## 各チュートリアルの特徴

### Tutorial 1: 基礎を固める
- spec-kitの全体的なワークフローを体験
- シンプルなプロジェクトで各コマンドの役割を理解
- 仕様からコードまでの流れを実感
- **成果物**: ブラウザで動作するToDoアプリ

### Tutorial 2: 実践的なスキルを習得
- より複雑なバックエンドAPIの設計
- 複数の仕様ファイルの管理方法を学習
- 仕様の明確化と一貫性チェックの重要性を理解
- **成果物**: RESTful APIサーバー (テスト付き)

### Tutorial 3: エンタープライズレベルの開発
- マイクロサービスアーキテクチャの仕様化
- 大規模システムの要件管理
- 段階的な実装とリファクタリング
- イベント駆動アーキテクチャの設計
- **成果物**: Docker Compose で動作するマイクロサービスシステム

## 学習の進め方

### 初めての方
1. **Tutorial 1** で基本を学ぶ (必須)
2. **Tutorial 2** で実践的なスキルを習得
3. 実際の小規模プロジェクトで spec-kit を試す
4. **Tutorial 3** でエンタープライズレベルの設計を学ぶ

### API開発経験者
- Tutorial 1 は流し読みでOK
- **Tutorial 2** から本格的に取り組む
- Tutorial 3 でマイクロサービス設計を学ぶ

### アーキテクト・上級者
- Tutorial 1, 2 は参考程度に確認
- **Tutorial 3** でspec-kitを使った大規模システム設計を学ぶ
- 既存プロジェクトへのspec-kit導入を検討

## よくある質問

### Q: spec-kitは日本語で使えますか？
A: はい、AIエージェント (Claude Code, Cursorなど) で日本語の指示を出すことができます。仕様も日本語で記述可能です。

### Q: 既存のプロジェクトにspec-kitを導入できますか？
A: はい、可能です。Tutorial 3 でブラウンフィールド開発への適用方法を学べます。既存コードの仕様化から始めることをお勧めします。

### Q: チーム開発でspec-kitを使えますか？
A: はい、spec-kitは特にチーム開発で効果を発揮します。仕様が明確になることで、メンバー間の認識のズレを減らせます。

### Q: どのAIエージェントがお勧めですか？
A: Claude Code, Cursor, GitHub Copilot などが推奨されています。このチュートリアルではClaude Codeを前提としていますが、他のエージェントでも同様に動作します。

### Q: spec-kitの学習時間はどのくらいですか？
A:
- 基本習得: Tutorial 1 (30分)
- 実践レベル: Tutorial 1-2 (90分)
- 上級レベル: Tutorial 1-3 (3時間)

### Q: 実装せずに仕様だけ作ることもできますか？
A: はい、できます。spec-kitは仕様作成から実装まで柔軟に使えます。仕様レビューだけ行い、実装は別の方法で行うことも可能です。

## リソース

- **公式リポジトリ**: https://github.com/github/spec-kit
- **ドキュメント**: リポジトリのREADME.md
- **コミュニティ**: GitHub Discussions

## トラブルシューティング

### spec-kitコマンドが見つからない
```bash
# インストールの確認
uv tool list

# 再インストール
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

### スラッシュコマンドが動作しない
- Claude CodeやCursorなどのAIエージェント内で実行してください
- プロジェクトディレクトリに `.speckit/` フォルダがあることを確認してください
- AIエージェントを再起動してみてください

### 生成されたコードが期待と異なる
1. `constitution.md` を見直して、より詳細な原則を追加
2. `specification/*.md` を見直して、要件を明確化
3. `/speckit.clarify` を使って不明点を明確化
4. AIエージェントに具体的な例を示す

## フィードバック

このチュートリアルに関するフィードバックや改善提案は歓迎します。
GitHubのIssueやPull Requestでお知らせください。

## ライセンス

このチュートリアル集はMITライセンスの下で公開されています。
spec-kit本体のライセンスは公式リポジトリを参照してください。

## 次のステップ

さあ、Tutorial 1から始めましょう！

```bash
cd tutorial-1-todo-app
cat README.md
```
