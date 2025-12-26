# Tutorial 3: 応用編 - マイクロサービス連携

## 目標
spec-kitを使って、複雑なマイクロサービスアーキテクチャを設計・実装します。複数のサービス間の連携、イベント駆動アーキテクチャ、段階的な実装とリファクタリングなど、実践的なエンタープライズ開発を学びます。

## 所要時間
約90分

## 学習内容
- 複雑なシステムアーキテクチャの仕様化
- サービス間の連携設計
- `/speckit.checklist` - 要件完全性の検証
- 段階的な実装とリファクタリング
- ブラウンフィールド開発への適用
- イベント駆動アーキテクチャ
- API Gateway パターン

## プロジェクト概要
ユーザー認証とデータサービスが連携するマイクロサービスシステムを構築します。

### システム構成
```
┌─────────────────┐
│   API Gateway   │  ← クライアントの統一窓口
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼────┐ ┌─▼──────────┐
│  Auth  │ │   Posts    │  ← マイクロサービス
│Service │ │  Service   │
└───┬────┘ └─┬──────────┘
    │        │
    └────┬───┘
         │
  ┌──────▼───────┐
  │ Message Bus  │  ← サービス間通信
  │   (Events)   │
  └──────────────┘
```

### サービス一覧
1. **API Gateway**: リクエストルーティング、認証検証
2. **Auth Service**: ユーザー認証・認可
3. **Posts Service**: ブログ記事管理
4. **Message Bus**: サービス間イベント通信

## Step 1: プロジェクト初期化

```bash
cd tutorial-3-microservices
specify init microservices-blog --ai copilot
```

## Step 2: Constitution (憲法)の作成

マイクロサービスアーキテクチャの原則を定義します。

```
/speckit.constitution
```

**指示例**:
```
マイクロサービスベースのブログシステムの開発原則を定義してください:

アーキテクチャ原則:
- 各サービスは独立してデプロイ可能
- サービス間の疎結合
- イベント駆動アーキテクチャ
- データベースはサービスごとに分離
- API Gateway経由のクライアントアクセス

技術スタック:
- Node.js + Express.js (各サービス)
- RabbitMQ (メッセージバス)
- PostgreSQL (各サービス用DB)
- Redis (キャッシュ・セッション)
- Docker + Docker Compose

非機能要件:
- 高可用性 (99.9% uptime)
- 水平スケーラビリティ
- サービス単位での障害隔離
- 分散トレーシング (Jaeger)
- 集中ログ管理
- ヘルスチェック必須
```

生成されるファイル: `.speckit/constitution.md`

### 確認ポイント
- [ ] マイクロサービスの原則が明確
- [ ] サービス分割の基準が定義されている
- [ ] 通信パターンが明記されている
- [ ] 非機能要件が含まれている

## Step 3: システムアーキテクチャの仕様作成

### 3.1 システム全体のアーキテクチャ

```
/speckit.specify
```

**指示例**:
```
マイクロサービスシステムの全体アーキテクチャを定義してください:

サービス構成:
1. API Gateway (ポート: 3000)
   - リクエストルーティング
   - 認証トークン検証
   - レート制限
   - CORS設定

2. Auth Service (ポート: 3001)
   - ユーザー登録・ログイン
   - トークン発行・検証
   - パスワードリセット
   - データベース: auth_db

3. Posts Service (ポート: 3002)
   - 記事CRUD
   - カテゴリー管理
   - データベース: posts_db

4. Message Bus (RabbitMQ)
   - イベント: user.created, user.updated
   - イベント: post.created, post.published

サービス間通信:
- 同期: REST API (Gateway経由)
- 非同期: RabbitMQ (イベント駆動)
```

生成されるファイル: `.speckit/specifications/system-architecture.md`

### 3.2 API Gateway の仕様

```
/speckit.specify
```

**指示例**:
```
API Gatewayの詳細仕様を作成してください:

ルーティング:
- POST /api/auth/* → Auth Service
- GET/POST/PUT/DELETE /api/posts/* → Posts Service

ミドルウェア:
- リクエストロギング
- CORS処理
- レート制限 (100 req/min/IP)
- JWT検証 (保護されたエンドポイント)
- エラーハンドリング

非機能要件:
- レスポンスタイム: < 50ms (オーバーヘッド)
- サービス検出: 環境変数ベース
- ヘルスチェック: /health
- サーキットブレーカー: サービスダウン時の処理
```

### 3.3 Auth Service の仕様

```
/speckit.specify
```

**指示例**:
```
Auth Serviceの詳細仕様を作成してください:

内部API (Gateway経由):
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- GET /auth/me (要認証)
- PUT /auth/profile (要認証)

内部API (サービス間):
- POST /internal/verify-token
- GET /internal/users/:id

イベント発行:
- user.created (ユーザー登録時)
- user.updated (プロフィール更新時)
- user.deleted (ユーザー削除時)

データモデル:
- User: id, email, password (hashed), name, createdAt, updatedAt
- RefreshToken: id, userId, token (hashed), expiresAt
```

### 3.4 Posts Service の仕様

```
/speckit.specify
```

**指示例**:
```
Posts Serviceの詳細仕様を作成してください:

API:
- GET /posts
- GET /posts/:id
- POST /posts (要認証)
- PUT /posts/:id (要認証)
- DELETE /posts/:id (要認証)

イベント購読:
- user.created → キャッシュ作成
- user.updated → キャッシュ更新
- user.deleted → 記事の作成者情報を更新

イベント発行:
- post.created
- post.published
- post.deleted

データモデル:
- Post: id, title, content, authorId (外部参照), status, createdAt, updatedAt
- AuthorCache: userId, name, email (Auth Serviceからの同期データ)
```

### 確認ポイント
- [ ] 各サービスの責務が明確
- [ ] API仕様が詳細に定義されている
- [ ] イベントフローが明確
- [ ] データモデルが定義されている

## Step 4: 仕様の明確化

複雑なシステムでは不明点が多く出るため、明確化が重要です。

```
/speckit.clarify
```

**指示例**:
```
以下のマイクロサービスアーキテクチャの不明点を明確化してください:

1. API Gatewayでトークン検証する場合、Auth Serviceへの呼び出しはどう処理するか?
   - 毎回Auth Serviceに問い合わせるのか?
   - JWT自己検証で済ませるのか?
   - Redisにキャッシュするのか?

2. Posts Serviceが作成者情報を表示する際、どうやって取得するか?
   - その都度Auth Serviceに問い合わせる?
   - ローカルキャッシュを持つ?
   - イベント駆動で同期する?

3. サービスダウン時の処理は?
   - リトライ戦略は?
   - サーキットブレーカーのしきい値は?
   - フォールバック処理は?

4. データ整合性はどう担保する?
   - Eventual Consistency で良いか?
   - Sagaパターンを使うか?

5. トランザクション境界は?
   - 各サービス内で完結するか?
   - 分散トランザクションが必要なケースは?
```

### 期待される明確化内容
- 各質問に対する決定事項
- トレードオフの説明
- 実装ガイドライン

### 確認ポイント
- [ ] アーキテクチャの決定事項が文書化されている
- [ ] トレードオフが説明されている
- [ ] 実装方針が明確になっている

## Step 5: 一貫性の分析

```
/speckit.analyze
```

**期待される分析内容**:
- API Gateway、Auth Service、Posts Serviceのエラーレスポンス形式が統一されているか
- イベントスキーマが一貫しているか
- ヘルスチェックエンドポイントが全サービスで統一されているか
- ロギング形式が統一されているか
- 環境変数の命名規則が一貫しているか
- Dockerコンテナのベースイメージが統一されているか

### 確認ポイント
- [ ] サービス間の不整合が検出されている
- [ ] 共通パターンが提案されている
- [ ] ベストプラクティスが適用されている

## Step 6: Checklist による完全性チェック

```
/speckit.checklist
```

**チェック項目例**:

### 機能要件
- [ ] すべてのユーザーストーリーが仕様化されている
- [ ] 各サービスのAPIが定義されている
- [ ] イベントフローが文書化されている

### 非機能要件
- [ ] スケーラビリティ戦略が定義されている
- [ ] 障害時の動作が明確
- [ ] パフォーマンス要件が定義されている

### セキュリティ
- [ ] 認証・認可が全エンドポイントで考慮されている
- [ ] サービス間通信のセキュリティが定義されている
- [ ] シークレット管理方法が明確

### 運用
- [ ] ヘルスチェックが実装されている
- [ ] ロギング戦略が定義されている
- [ ] モニタリング方法が明確

### デプロイメント
- [ ] Docker構成が定義されている
- [ ] 環境変数が文書化されている
- [ ] デプロイ手順が明確

### 確認ポイント
- [ ] 抜け漏れがチェックリストで明らかになっている
- [ ] 追加すべき仕様が特定されている

## Step 7: 技術計画の作成

```
/speckit.plan
```

**指示例**:
```
マイクロサービスシステムの技術実装計画を作成してください:

考慮事項:
- モノレポ vs マルチレポ
- 共通ライブラリの管理
- Docker Compose構成
- データベースマイグレーション戦略
- イベント駆動の実装 (RabbitMQ)
- サービス間通信の実装
- テスト戦略 (単体・統合・E2E)
- CI/CD パイプライン
```

生成されるファイル: `.speckit/plans/microservices-implementation.md`

### 確認ポイント
- [ ] プロジェクト構造が定義されている
- [ ] 依存関係管理方法が明確
- [ ] テスト戦略が計画されている
- [ ] デプロイ戦略が含まれている

## Step 8: タスク分解

```
/speckit.tasks
```

生成されるファイル: `.speckit/tasks/microservices-tasks.md`

### 期待されるタスク例

**Phase 1: インフラ構築**
1. Docker Compose設定
2. RabbitMQ設定
3. PostgreSQL設定 (auth_db, posts_db)
4. Redis設定

**Phase 2: 共通ライブラリ**
5. 共通エラーハンドリング
6. ロガー設定
7. イベントバスクライアント
8. JWT ユーティリティ

**Phase 3: Auth Service**
9. Auth Service プロジェクト構造
10. User モデル
11. 認証エンドポイント実装
12. イベント発行実装
13. テスト作成

**Phase 4: Posts Service**
14. Posts Service プロジェクト構造
15. Post モデル
16. CRUD エンドポイント実装
17. イベント購読実装
18. テスト作成

**Phase 5: API Gateway**
19. Gateway プロジェクト構造
20. ルーティング実装
21. 認証ミドルウェア
22. サーキットブレーカー実装
23. テスト作成

**Phase 6: 統合**
24. サービス間通信テスト
25. E2Eテスト
26. パフォーマンステスト
27. ドキュメント作成

### 確認ポイント
- [ ] タスクが段階的に分割されている
- [ ] 依存関係が明確
- [ ] テストタスクが含まれている

## Step 9: 段階的実装

マイクロサービスは段階的に実装します。

### 9.1 Phase 1: インフラ構築

```
/speckit.implement
```

**指示例**:
```
Phase 1のタスク(インフラ構築)を実装してください:
- docker-compose.yml
- 各サービスのDockerfile
- 環境変数テンプレート
```

### 9.2 Phase 2: 共通ライブラリ

```
/speckit.implement
```

**指示例**:
```
Phase 2のタスク(共通ライブラリ)を実装してください:
- packages/common/ 配下に共通コード
```

### 9.3 Phase 3: Auth Service

```
/speckit.implement
```

**指示例**:
```
Phase 3のタスク(Auth Service)を実装してください
```

以降、同様にPhaseごとに実装を進めます。

## Step 10: 動作確認

### 10.1 インフラ起動

```bash
# すべてのサービスを起動
docker-compose up -d

# ログ確認
docker-compose logs -f
```

### 10.2 ヘルスチェック

```bash
# Gateway
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/health

# Posts Service
curl http://localhost:3002/health

# RabbitMQ Management
# http://localhost:15672 (guest/guest)
```

### 10.3 統合テスト

```bash
# ユーザー登録 (Gateway経由)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# ログイン
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.data.token')

# 記事作成 (Gateway経由、Auth Service経由で認証)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"My First Post","content":"Hello Microservices!","status":"published"}'

# 記事一覧取得
curl http://localhost:3000/api/posts
```

### 10.4 イベントフロー確認

RabbitMQ管理画面で、イベントが正しく流れていることを確認します。

```bash
# RabbitMQ Management UI
open http://localhost:15672
```

### 10.5 テスト実行

```bash
# 各サービスの単体テスト
cd services/auth-service && npm test
cd services/posts-service && npm test
cd services/api-gateway && npm test

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e
```

### 動作確認チェックリスト
- [ ] すべてのサービスが起動する
- [ ] ヘルスチェックが成功する
- [ ] Gateway経由でユーザー登録できる
- [ ] Gateway経由でログインできる
- [ ] Gateway経由で記事を作成できる
- [ ] イベントが正しく発行・購読される
- [ ] サービスダウン時にサーキットブレーカーが動作する
- [ ] すべてのテストがパスする

## Step 11: リファクタリングと改善

実装後、仕様を見直して改善します。

```
/speckit.analyze
```

**指示例**:
```
実装したマイクロサービスシステムを分析し、改善点を提案してください:
- コードの重複
- パフォーマンスボトルネック
- セキュリティの懸念
- スケーラビリティの問題
```

必要に応じて、仕様を更新し、再実装します。

## 学んだこと

Tutorial 3では以下を学びました:

1. **マイクロサービスアーキテクチャ**: サービス分割、通信パターン
2. **複雑な仕様管理**: 複数サービスの仕様を一貫性を持って管理
3. **Clarify**: 複雑なアーキテクチャの決定事項を明確化
4. **Analyze**: サービス間の一貫性チェック
5. **Checklist**: 大規模システムの要件完全性検証
6. **段階的実装**: Phase分けによる計画的な開発
7. **イベント駆動**: 非同期通信の設計と実装
8. **Infrastructure as Code**: Docker Composeによる環境構築

## ベストプラクティス

### マイクロサービス設計
- **単一責任の原則**: 各サービスは1つの責務に集中
- **疎結合**: サービス間の依存を最小化
- **データの独立性**: 各サービスが自分のデータベースを持つ
- **障害の隔離**: 1つのサービスダウンが全体に影響しない

### spec-kitの活用
- **段階的な仕様化**: 最初から完璧を目指さず、繰り返し改善
- **明確化の徹底**: 不明点は放置せず、早めに明確化
- **一貫性チェック**: 定期的にanalyzeを実行
- **チェックリスト**: 実装前に完全性を検証

### 開発フロー
1. システム全体のアーキテクチャを仕様化
2. 各サービスの仕様を詳細化
3. 不明点を明確化
4. 一貫性をチェック
5. 完全性を検証
6. 段階的に実装
7. テストと検証
8. 分析して改善

## トラブルシューティング

### サービスが起動しない
```bash
# ログ確認
docker-compose logs [service-name]

# コンテナ再起動
docker-compose restart [service-name]

# 完全リビルド
docker-compose down
docker-compose up --build
```

### サービス間通信エラー
```bash
# ネットワーク確認
docker network ls
docker network inspect microservices-blog_default

# サービス名でpingできるか確認
docker-compose exec api-gateway ping auth-service
```

### RabbitMQイベントが流れない
```bash
# RabbitMQ管理画面で確認
open http://localhost:15672

# Exchangeとキューの接続を確認
# メッセージがキューに溜まっているか確認
```

### データベース接続エラー
```bash
# データベースコンテナ確認
docker-compose ps postgres-auth postgres-posts

# 接続テスト
docker-compose exec postgres-auth psql -U postgres -d auth_db
```

## 次のステップ

おめでとうございます！3つのチュートリアルを完了しました。

さらに学習を進めるには:
- 実際のプロジェクトにspec-kitを適用してみる
- チームでspec-kitを使った仕様駆動開発を試す
- より複雑な機能(検索、通知、ファイルアップロードなど)を追加
- Kubernetes へのデプロイを試す
- 監視・ロギング(Prometheus, Grafana, ELK)を追加

## まとめ

spec-kitを使うことで:
- **明確な仕様**: 実装前に「何を作るか」が明確になる
- **一貫性**: 複数の仕様やサービス間の一貫性を保てる
- **完全性**: チェックリストで抜け漏れを防げる
- **段階的開発**: 計画的に実装を進められる
- **品質向上**: 仕様駆動でテストしやすいコードになる

spec-kitは、個人プロジェクトから大規模システムまで、あらゆる開発に適用できる強力なツールです。
