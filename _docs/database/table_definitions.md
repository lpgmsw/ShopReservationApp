# テーブル定義書

## 概要

ShopReservationApp のデータベーステーブル定義書です。
Supabase（PostgreSQL）を使用しています。

**作成日**: 2025-12-10
**対応Issue**: [#3 テーブル新規作成](https://github.com/lpgmsw/ShopReservationApp/issues/3), [#4 店舗テーブルのカラム名の修正](https://github.com/lpgmsw/ShopReservationApp/issues/4)
**バージョン**: 1.1.0

---

## テーブル一覧

| No. | テーブル名 | 論理名 | 説明 |
|-----|-----------|--------|------|
| 1 | users | ユーザー | ユーザー情報を管理 |
| 2 | shops | 店舗 | 店舗情報を管理 |

---

## 1. users（ユーザーテーブル）

### 概要
ユーザーの基本情報とロール（役割）を管理するテーブル。
Supabaseの`auth.users`テーブルと連携し、追加のプロファイル情報を保持します。

### テーブル定義

| カラム名 | データ型 | NULL | デフォルト | 主キー | 外部キー | ユニーク | 説明 |
|---------|---------|------|-----------|--------|---------|---------|------|
| id | uuid | NOT NULL | - | ○ | auth.users(id) | ○ | ユーザーID（Supabase Auth連携） |
| role | text | NOT NULL | - | - | - | - | ユーザーロール（user/shop_manager/system_admin） |
| user_name | text | NOT NULL | - | - | - | - | ユーザー名 |
| full_name | text | NOT NULL | - | - | - | - | 氏名 |
| address | text | NULL | - | - | - | - | 住所 |
| phone_number | text | NULL | - | - | - | - | 電話番号 |
| created_at | timestamptz | NOT NULL | now() | - | - | - | 作成日時 |
| updated_at | timestamptz | NOT NULL | now() | - | - | - | 更新日時 |

### 制約

#### CHECK制約
- `role`: 'user', 'shop_manager', 'system_admin' のいずれか

#### 外部キー制約
- `id` → `auth.users(id)` ON DELETE CASCADE

### インデックス

| インデックス名 | カラム | 種類 | 説明 |
|--------------|--------|------|------|
| users_pkey | id | PRIMARY KEY | 主キー |
| idx_users_role | role | INDEX | ロール検索用 |

### ロール定義

| ロール値 | 説明 | 権限 |
|---------|------|------|
| user | 一般ユーザー | 店舗検索・予約作成・予約変更・予約キャンセル |
| shop_manager | 店舗管理者 | 店舗情報管理・予約一覧閲覧 |
| system_admin | システム管理者 | 全店舗の情報管理・全予約閲覧 |

### トリガー
- `update_users_updated_at`: UPDATE時に`updated_at`を自動更新

---

## 2. shops（店舗テーブル）

### 概要
店舗の基本情報、営業時間、予約受付時間を管理するテーブル。
1人の店舗管理者につき1店舗のみ登録可能。

### テーブル定義

| カラム名 | データ型 | NULL | デフォルト | 主キー | 外部キー | ユニーク | 説明 |
|---------|---------|------|-----------|--------|---------|---------|------|
| id | uuid | NOT NULL | uuid_generate_v4() | ○ | - | ○ | 店舗ID |
| owner_id | uuid | NOT NULL | - | - | auth.users(id) | ○ | 店舗管理者ID |
| shop_name | text | NOT NULL | - | - | - | - | 店舗名 |
| business_hours_start | time | NOT NULL | - | - | - | - | 営業開始時間 |
| business_hours_end | time | NOT NULL | - | - | - | - | 営業終了時間 |
| reservation_hours_start | time | NOT NULL | - | - | - | - | 予約受付開始時間 |
| reservation_hours_end | time | NOT NULL | - | - | - | - | 予約受付終了時間 |
| business_days | text[] | NOT NULL | - | - | - | - | 営業日（曜日の配列） |
| closed_days | text[] | NOT NULL | '{}' | - | - | - | 定休日（曜日の配列） |
| created_at | timestamptz | NOT NULL | now() | - | - | - | 作成日時 |
| updated_at | timestamptz | NOT NULL | now() | - | - | - | 更新日時 |

### 制約

#### UNIQUE制約
- `owner_id`: 1人の店舗管理者につき1店舗のみ登録可能

#### 外部キー制約
- `owner_id` → `auth.users(id)` ON DELETE CASCADE

### インデックス

| インデックス名 | カラム | 種類 | 説明 |
|--------------|--------|------|------|
| shops_pkey | id | PRIMARY KEY | 主キー |
| shops_owner_id_key | owner_id | UNIQUE | 店舗管理者ごとに1店舗のみ |
| idx_shops_owner_id | owner_id | INDEX | 店舗管理者検索用 |

### 曜日データ形式

`business_days`と`closed_days`は、以下の英語曜日名の配列で管理します：

| 曜日 | 値 |
|------|-----|
| 月曜日 | 'monday' |
| 火曜日 | 'tuesday' |
| 水曜日 | 'wednesday' |
| 木曜日 | 'thursday' |
| 金曜日 | 'friday' |
| 土曜日 | 'saturday' |
| 日曜日 | 'sunday' |

**例**:
```sql
-- 月〜金営業、土日定休の場合
business_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
closed_days = ['saturday', 'sunday']
```

### トリガー
- `update_shops_updated_at`: UPDATE時に`updated_at`を自動更新

---

## ER図（テキスト表現）

```
auth.users (Supabase Auth)
    ↓ 1:1
users
    id (PK, FK) ← auth.users.id
    role
    user_name
    full_name
    address
    phone_number
    created_at
    updated_at

    ↓ 1:1 (shop_manager role only)

shops
    id (PK)
    owner_id (FK, UNIQUE) → auth.users.id
    shop_name
    business_hours_start
    business_hours_end
    reservation_hours_start
    reservation_hours_end
    business_days
    closed_days
    created_at
    updated_at
```

---

## データベース関数

### update_updated_at_column()

**説明**: `updated_at`カラムを自動更新するトリガー関数

**実装**:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**使用箇所**:
- `users`テーブル
- `shops`テーブル

---

## セキュリティ

### Row Level Security (RLS)

現時点ではRLSポリシーは未設定です。
今後のIssueで以下のポリシーを実装予定：

1. **users**: ユーザー自身のレコードのみ読み書き可能
2. **shops**: 店舗管理者は自分の店舗のみ編集可能、一般ユーザーは閲覧のみ可能

---

## 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
|------|-----------|--------|---------|
| 2025-12-10 | 1.0.0 | Claude Code | 初版作成（Issue #3対応） |
| 2025-12-10 | 1.1.0 | Claude Code | カラム名修正：username→user_name, name→shop_name（Issue #4対応） |

---

## 備考

- メールアドレスは`auth.users.email`を使用（DRY原則）
- パスワードはSupabase Authで管理（当テーブルには含まない）
- 予約テーブルは今後のMVP2で実装予定
