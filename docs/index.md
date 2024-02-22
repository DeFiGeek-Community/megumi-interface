# Megumi interface

### ER Diagram

```mermaid
erDiagram
    airdrops {
        UUID id PK "default uuid_generate_v4()"
        bytea contract_address "UNIQUE"
        bytea template_name "NOT NULL"
        bytea owner "NOT NULL"
        bytea token_address "NOT NULL"
        VARCHAR token_name "NOT NULL"
        VARCHAR token_symbol "NOT NULL"
        INT token_decimals "NOT NULL"
        VARCHAR token_logo
        TIMESTAMP created_at "CURRENT_TIMESTAMP"
        TIMESTAMP updated_at "CURRENT_TIMESTAMP"
    }

    claimers {
        UUID id PK "default uuid_generate_v4()"
        bytea address "NOT NULL UNIQUE"
    }

    airdrop_claimer_maps {
        UUID id PK "default uuid_generate_v4()"
        UUID airdrop_id FK "NOT NULL"
        UUID claimer_id FK "NOT NULL"
        BOOLEAN is_claimed "NOT NULL DEFAULT FALSE"
        bytea[] proofs "NOT NULL"
        INT index "NOT NULL"
        BIGINT amount "NOT NULL"
    }

    airdrops ||--o{ airdrop_claimer_maps : "has many"
    claimers ||--o{ airdrop_claimer_maps : "has many"

```

### Airdrop creation flow

```mermaid
sequenceDiagram
    participant User
    participant NextJS
    participant CovalentAPI
    participant Lambda
    participant DB
    participant S3
    participant Ethereum

    User->>NextJS: エアドロップ基本情報登録
    activate NextJS
    NextJS->>DB: Create airdrop
    activate DB
    DB-->>NextJS: Response
    deactivate DB
    NextJS-->>User: Response
    deactivate NextJS

    User->>NextJS: Merkle Tree作成(スナップショット)
    activate NextJS
    loop 指定ブロックの指定トークンホルダー取得完了するまで
        NextJS->>CovalentAPI: 1000件ずつ対象アドレス取得
        activate CovalentAPI
        CovalentAPI-->>NextJS: Response
        deactivate CovalentAPI
    end
    NextJS->>NextJS: Merkle treeファイル作成
    NextJS->>S3: Merkle treeファイルアップロード
    activate S3
    S3-->>NextJS: Response
    deactivate S3
    NextJS-->>User: Response
    deactivate NextJS

    User->>Ethereum: コントラクトデプロイ
    Ethereum-->>User: Response
    User-->>NextJS: バックグラウンドジョブ開始（自動、手動）
    NextJS-->>Lambda: バックグラウンドジョブ開始
    activate Lambda
    loop デプロイ完了まで
        Lambda-->>Ethereum: 確認
        Ethereum-->>Lambda: Response
    end
    Lambda->>DB: ステータス更新
    activate DB
    DB-->>Lambda: Response
    deactivate DB
    Lambda->>S3: Merkle Treeファイル取得
    activate S3
    S3-->>Lambda: レスポンス
    deactivate S3
    Lambda->>DB: merkle tree情報をBulk insert
    activate DB
    DB-->>Lambda: Response
    deactivate DB
    deactivate Lambda
```

### 機能一覧

● 一般ユーザ

- エアドロ一覧の閲覧

  - タイトル
  - トークンアドレス
  - トークン名
  - トークンロゴ
  - 対象アカウント数
  - 総エアドロ額
  - Claim 済件数

- エアドロ詳細の閲覧

  - タイトル
  - トークンアドレス
  - トークン名
  - トークンロゴ
  - 対象アカウント数
  - 総エアドロ額
  - Claim 済件数

- エアドロのクレーム
- 自分が対象のエアドロ一覧の取得
- 自分が対象のエアドロ詳細の閲覧

● エアドロ主催者

- ログイン / ログアウト
- 自エアドロ一覧の閲覧
- 自エアドロ詳細の閲覧
- 新規エアドロ登録
  - マークルツリーの登録（※3）
    - マークルツリー作成（&アップロード）
      - マニュアル
      - スナップショット
    - 既存のマークルツリーをアップロード（フォーマットのバリデーション必須）
    - オフチェーンデータ登録
      - タイトル
      - テンプレート
  - コントラクトの登録
    - コントラクトのデプロイ
      - token address の指定（標準 ERC20 を想定）
      - Merkle root の指定（オフチェーンデータから自動取得で編集不可）
      - テンプレートの指定（オフチェーンデータから自動取得で編集不可）
      - トークンのデポジット額の指定
    - 既存のコントラクトを紐づけ（※4）
- 自エアドロ編集
  - オフチェーンデータ編集
    - タイトル
    - マークルツリーの変更（コントラクトの登録前のみ）
    - テンプレート（コントラクトの登録前のみ）
  - コントラクトの編集
    - トークンのデポジット
    - トークンの引き出し

※3) オフチェーンデータ登録時に uuid 発行し、それを salt として create2 でコントラクトアドレス事前決定し紐づけておく。コントラクトのデプロイ時に salt を引数で渡す

※4) 直コンでデプロイされたコントラクトを紐づけたい場合のため。条件: Factory に登録済み && Merkle root, token address, テンプレートが合致 && オーナー && 他のエアドロに紐づいていない（オフチェーン）
