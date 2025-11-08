# Tutorial 2: 中級編 - RESTful APIサービス

## 目標
spec-kitを使って、より複雑なバックエンドAPIサービスを設計・実装します。複数の仕様ファイル管理、仕様の明確化、一貫性チェックなど、実践的な開発フローを学びます。

## 所要時間
約60分

## 学習内容
- 複数の仕様ファイルの管理
- `/speckit.clarify` - 仕様の明確化
- `/speckit.analyze` - 一貫性チェック
- イテレーティブな仕様改善
- RESTful API設計のベストプラクティス

## プロジェクト概要
ブログ記事を管理するRESTful APIを構築します。
- 記事のCRUD操作
- カテゴリー管理
- タグ付け機能
- ページネーション
- 検索機能

## Step 1: プロジェクト初期化

```bash
cd tutorial-2-api-service
specify init blog-api --ai claude
```

## Step 2: Constitution (憲法)の作成

```
/speckit.constitution
```

**指示例**:
```
ブログAPIの開発原則を定義してください:

技術スタック:
- Node.js + Express.js
- SQLite (開発用、本番はPostgreSQL想定)
- JWT認証
- RESTful設計原則に準拠

開発原則:
- セキュリティファースト
- 明確なエラーハンドリング
- APIバージョニング (v1)
- 適切なHTTPステータスコード使用
- OpenAPI (Swagger) ドキュメント生成
- テストカバレッジ 80%以上
```

生成されるファイル: `.speckit/constitution.md`

### 確認ポイント
- [ ] 技術スタックが明確に定義されている
- [ ] セキュリティ要件が含まれている
- [ ] API設計原則が記載されている

## Step 3: 複数の仕様を作成

ここが Tutorial 1 との大きな違いです。複雑なシステムでは、機能ごとに仕様を分けて管理します。

### 3.1 記事管理機能の仕様

```
/speckit.specify
```

**指示例**:
```
ブログ記事管理APIの仕様を作成してください:

エンドポイント:
- GET /api/v1/posts - 記事一覧取得
- GET /api/v1/posts/:id - 記事詳細取得
- POST /api/v1/posts - 記事作成
- PUT /api/v1/posts/:id - 記事更新
- DELETE /api/v1/posts/:id - 記事削除

記事モデル:
- id (UUID)
- title (文字列, 必須, 1-200文字)
- content (文字列, 必須)
- author (文字列, 必須)
- status (draft/published)
- createdAt, updatedAt

クエリパラメータ:
- page, limit (ページネーション)
- status (フィルタリング)
- sort (ソート)
```

生成されるファイル: `.speckit/specifications/posts-api.md`

### 3.2 認証機能の仕様

次に認証機能を追加します。

```
/speckit.specify
```

**指示例**:
```
JWT認証機能の仕様を作成してください:

エンドポイント:
- POST /api/v1/auth/login - ログイン
- POST /api/v1/auth/register - 新規登録
- POST /api/v1/auth/refresh - トークン更新
- POST /api/v1/auth/logout - ログアウト

セキュリティ要件:
- パスワードはbcryptでハッシュ化
- JWTトークンは1時間有効
- Refresh tokenは7日間有効
- レート制限: 1分あたり5リクエスト
```

生成されるファイル: `.speckit/specifications/auth-api.md`

### 確認ポイント
- [ ] 複数の仕様ファイルが作成されている
- [ ] それぞれの仕様が詳細に記述されている
- [ ] エンドポイント、データモデル、バリデーションが明確

## Step 4: 仕様の明確化

仕様を書いていると、不明確な部分や矛盾が出てきます。`/speckit.clarify` を使って明確化しましょう。

```
/speckit.clarify
```

**指示例**:
```
以下の点を明確化してください:

1. 記事の下書き(draft)は誰でも閲覧できるか、作成者のみか?
2. 認証が必要なエンドポイントと不要なエンドポイントの区別は?
3. エラーレスポンスのフォーマットは統一されているか?
4. ページネーションのデフォルト値は?
5. 記事の作成時にauthorは自動設定か、リクエストから取得か?
```

この段階で、仕様ファイルが更新され、不明確だった点が明確になります。

### 確認ポイント
- [ ] 不明確だった点が明確化されている
- [ ] 仕様に追記・修正が入っている
- [ ] 決定事項がドキュメント化されている

## Step 5: 一貫性の分析

複数の仕様ファイルがある場合、矛盾や不整合が発生しやすくなります。

```
/speckit.analyze
```

**期待される分析内容**:
- 認証エンドポイントと記事エンドポイントのエラーフォーマットが統一されているか
- HTTPステータスコードの使用が一貫しているか
- データモデル間の関連性が適切に定義されているか
- APIバージョニングが全エンドポイントで統一されているか

### 確認ポイント
- [ ] 仕様間の矛盾が検出されている
- [ ] 修正提案が提示されている
- [ ] 一貫性が改善されている

## Step 6: 技術計画の作成

```
/speckit.plan
```

**指示例**:
```
ブログAPIの技術実装計画を作成してください:

考慮事項:
- プロジェクト構造 (MVCパターン)
- データベーススキーマ設計
- ミドルウェア構成
- エラーハンドリング戦略
- テスト戦略
- デプロイメント方法
```

生成されるファイル: `.speckit/plans/blog-api-implementation.md`

### 確認ポイント
- [ ] アーキテクチャが明確に定義されている
- [ ] データベース設計が含まれている
- [ ] セキュリティ対策が計画されている

## Step 7: タスク分解

```
/speckit.tasks
```

生成されるファイル: `.speckit/tasks/blog-api-tasks.md`

### 期待されるタスク例
1. プロジェクト初期設定 (Express, 依存関係)
2. データベース設定とマイグレーション
3. 認証ミドルウェアの実装
4. 記事モデルとコントローラーの実装
5. ルーティングの設定
6. バリデーションの実装
7. エラーハンドリングの実装
8. テストの作成
9. OpenAPIドキュメントの生成

### 確認ポイント
- [ ] タスクが論理的な順序で並んでいる
- [ ] 依存関係が明確
- [ ] 実装可能な粒度になっている

## Step 8: 実装

```
/speckit.implement
```

**指示例**:
```
blog-api-tasks.mdのタスクを順番に実装してください。
まずはプロジェクト構造とデータベース設定から始めてください。
```

生成されるファイル:
```
src/
├── config/
│   ├── database.js
│   └── auth.js
├── models/
│   ├── Post.js
│   └── User.js
├── controllers/
│   ├── postController.js
│   └── authController.js
├── routes/
│   ├── posts.js
│   └── auth.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── tests/
│   ├── posts.test.js
│   └── auth.test.js
├── app.js
└── server.js
package.json
.env.example
```

### 確認ポイント
- [ ] プロジェクト構造が計画通り
- [ ] すべてのエンドポイントが実装されている
- [ ] テストが含まれている
- [ ] エラーハンドリングが実装されている

## Step 9: 動作確認

### 9.1 依存関係のインストール

```bash
npm install
```

### 9.2 環境変数の設定

```bash
cp .env.example .env
# .envファイルを編集
```

### 9.3 データベースのセットアップ

```bash
npm run db:migrate
npm run db:seed  # テストデータ投入
```

### 9.4 サーバー起動

```bash
npm run dev
```

### 9.5 APIテスト

```bash
# 新規ユーザー登録
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# ログイン
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 記事作成 (要認証)
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"My First Post","content":"Hello World","status":"published"}'

# 記事一覧取得
curl http://localhost:3000/api/v1/posts?page=1&limit=10
```

### 9.6 テストの実行

```bash
npm test
```

### 動作確認チェックリスト
- [ ] サーバーが起動する
- [ ] ユーザー登録ができる
- [ ] ログインしてトークンを取得できる
- [ ] 認証付きで記事を作成できる
- [ ] 記事一覧を取得できる
- [ ] ページネーションが動作する
- [ ] 認証なしでアクセスすると401エラーになる
- [ ] すべてのテストがパスする

## Step 10: Checklist による完全性チェック

```
/speckit.checklist
```

これにより、以下がチェックされます:
- [ ] すべての要件が実装されているか
- [ ] すべてのエンドポイントがテストされているか
- [ ] エラーケースが処理されているか
- [ ] セキュリティ要件が満たされているか
- [ ] ドキュメントが完備されているか

## 学んだこと

Tutorial 2では以下を学びました:

1. **複数の仕様管理**: 機能ごとに仕様を分割して管理
2. **Clarify**: 不明確な点を明確化するプロセス
3. **Analyze**: 仕様間の一貫性チェック
4. **Checklist**: 要件完全性の検証
5. **実践的なAPI設計**: RESTful原則に基づいた設計
6. **セキュリティ**: 認証・認可の実装
7. **テスト駆動**: 仕様からテストまで一貫した開発

## 次のステップ

Tutorial 3に進んで、マイクロサービス連携など、さらに高度なシステムアーキテクチャの仕様化を学びましょう。

## トラブルシューティング

### ポート3000が既に使用されている
```bash
# .envファイルでポート番号を変更
PORT=3001
```

### データベース接続エラー
```bash
# データベースファイルの権限を確認
chmod 644 database.sqlite
```

### JWTトークンエラー
```bash
# .envファイルでJWT_SECRETが設定されているか確認
JWT_SECRET=your-secret-key-here
```

### テストが失敗する
```bash
# テスト用データベースを再作成
npm run db:reset:test
npm test
```

## ベストプラクティス

### 仕様を書くとき
- 具体的な例を含める
- エッジケースを明記する
- セキュリティ要件を忘れない
- パフォーマンス要件を定義する

### 明確化のタイミング
- 仕様が曖昧だと感じたとき
- 実装に迷いが生じたとき
- チーム内で解釈が分かれたとき

### 分析の活用
- 定期的に実行して一貫性を保つ
- リファクタリングの指針として使う
- コードレビューの材料にする
