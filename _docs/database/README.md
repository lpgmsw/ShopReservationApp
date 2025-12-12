# データベースマイグレーション手順

## 概要

このディレクトリには、Supabaseデータベースのテーブル定義とマイグレーションSQLファイルが含まれています。

---

## 🚨 最新：usersテーブルのカラム並び順変更（Issue #5 - 2025-12-13）

### 問題

- addressカラムが不要
- emailカラムがテーブルの最後に配置されている
- カラムの並び順を整理する必要がある

### 要件

1. **addressカラムを削除**
2. **emailカラムをaddressの位置（full_nameの後）に配置**

### 現在の構造
```
id → role → user_name → full_name → address → phone_number → created_at → updated_at → email
```

### 理想的な構造
```
id → role → user_name → full_name → email → phone_number → created_at → updated_at
```

### 実行手順

**⚠️ 重要：このマイグレーションはテーブルを再作成します。実行前に必ずバックアップを取得してください。**

#### ステップ1: Supabaseダッシュボードにアクセス

1. https://supabase.com/dashboard にアクセス
2. プロジェクト「dqgbfjrofelswtbnyypr」を開く

#### ステップ2: SQL Editorを開く

1. 左サイドバーから **SQL Editor** をクリック
2. **New query** をクリック

#### ステップ3: バックアップを取得（推奨）

```sql
-- usersテーブルのバックアップを作成
CREATE TABLE users_backup AS SELECT * FROM users;
```

#### ステップ4: マイグレーションSQLを実行

**`_docs/database/migration_reorganize_users_table.sql`** の内容を実行してください。

または、以下のSQLを直接実行：

```sql
BEGIN;

-- 1. トリガーを一時的に削除
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- 2. 新しいテーブル構造を作成（理想的なカラム順序で）
CREATE TABLE users_new (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'shop_manager', 'system_admin')),
  user_name text NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE,
  phone_number text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. 既存データを新しいテーブルにコピー（addressは除外）
INSERT INTO users_new (
  id, role, user_name, full_name, email, phone_number, created_at, updated_at
)
SELECT
  id, role, user_name, full_name, email, phone_number, created_at, updated_at
FROM users;

-- 4. 古いテーブルを削除
DROP TABLE users;

-- 5. 新しいテーブルをusersにリネーム
ALTER TABLE users_new RENAME TO users;

-- 6. インデックスを再作成
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- 7. updated_atトリガーを再作成
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

#### ステップ5: 実行結果を確認

**成功メッセージ**:
```
Success. No rows returned
```

#### ステップ6: テーブル構造を確認

1. **Table Editor** を開く
2. **users** テーブルを選択
3. カラムの並び順を確認

**確認すべき構造**:
```
1. id
2. role
3. user_name
4. full_name
5. email ← addressの代わりにここに配置
6. phone_number
7. created_at
8. updated_at
```

**addressカラムが存在しない**ことを確認してください。

#### ステップ7: アプリケーションで動作確認

1. ユーザー登録を試す
2. データが正しく保存されることを確認
3. 既存のユーザーデータが失われていないことを確認

### ロールバック（問題が発生した場合）

```sql
-- バックアップから復元
DROP TABLE users;
ALTER TABLE users_backup RENAME TO users;

-- トリガーを再作成
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🚨 以前の対応：emailカラムの追加（Issue #5 - 2025-12-12）

### 問題

ユーザー登録時に以下のエラーが発生します：

```
Profile creation failed:
{
  code: 'PGRST204',
  message: "Could not find the 'email' column of 'users' in the schema cache"
}
```

### 原因

`users`テーブルに`email`カラムが存在していません。

### 解決方法

**Supabaseダッシュボードで以下のSQLを実行してください：**

---

## 📋 実行手順

### ステップ1: Supabaseダッシュボードにアクセス

1. https://supabase.com/dashboard にアクセス
2. プロジェクト「dqgbfjrofelswtbnyypr」を開く

---

### ステップ2: SQL Editorを開く

1. 左サイドバーから **SQL Editor** をクリック
2. **New query** をクリック

---

### ステップ3: マイグレーションSQLを実行

以下のSQLをコピーして実行してください：

```sql
-- usersテーブルにemailカラムを追加
ALTER TABLE public.users
ADD COLUMN email text;

-- emailカラムにユニーク制約を追加（重複を防ぐ）
ALTER TABLE public.users
ADD CONSTRAINT users_email_unique UNIQUE (email);

-- emailカラムにインデックスを作成（検索の高速化）
CREATE INDEX idx_users_email ON public.users(email);
```

または、`migration_add_email_to_users.sql` の内容をそのまま実行してください。

---

### ステップ4: 実行結果を確認

**成功メッセージ**:
```
Success. No rows returned
```

**エラーが出た場合**:
- すでに`email`カラムが存在する場合:
  ```
  column "email" of relation "users" already exists
  ```
  → 問題ありません。すでに追加されています。

---

### ステップ5: テーブル構造を確認

1. **Table Editor** を開く
2. **users** テーブルを選択
3. カラム一覧に **email** が追加されていることを確認

**確認すべき内容**:
```
カラム名: email
データ型: text
制約: UNIQUE
```

---

### ステップ6: アプリケーションで動作確認

1. ブラウザで http://localhost:3004/shop-admin/signup を開く
2. ユーザー登録を試す
3. エラーが発生しないことを確認
4. Supabaseダッシュボードで**users**テーブルを確認
5. **emailカラムに正しくメールアドレスが保存されている**ことを確認

---

## 📁 ファイル一覧

| ファイル名 | 説明 |
|-----------|------|
| `create_tables.sql` | 全テーブルの初期作成SQL（参照用） |
| `migration_add_email_to_users.sql` | emailカラムを追加するマイグレーション |
| `table_definitions.md` | テーブル定義書 |
| `README.md` | このファイル（マイグレーション手順） |

---

## ⚠️ 注意事項

### 1. 本番環境での実行

本番環境でマイグレーションを実行する前に：

- ✅ バックアップを取得
- ✅ ステージング環境でテスト
- ✅ ダウンタイムの計画

### 2. ロールバック

もしマイグレーションを元に戻す必要がある場合：

```sql
-- emailカラムを削除（ロールバック）
ALTER TABLE public.users
DROP COLUMN email;
```

⚠️ **データが失われるため、実行前に必ずバックアップを取得してください。**

---

## 🔍 トラブルシューティング

### エラー: permission denied for table users

**原因**: データベースへの権限がありません。

**解決方法**:
- プロジェクトの管理者権限があるアカウントでログイン
- または、Supabaseのサポートに連絡

---

### エラー: column "email" already exists

**原因**: すでにemailカラムが追加されています。

**解決方法**:
- 問題ありません。マイグレーション済みです。
- Table Editorで確認してください。

---

### エラー: relation "users" does not exist

**原因**: usersテーブルがまだ作成されていません。

**解決方法**:
1. `create_tables.sql` を先に実行
2. その後、`migration_add_email_to_users.sql` を実行

---

## 📚 参考リンク

- [Supabase ダッシュボード](https://supabase.com/dashboard)
- [Supabase ドキュメント - Database](https://supabase.com/docs/guides/database)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)

---

**作成日**: 2025-12-13
**関連Issue**: #5
**ブランチ**: feature/issue-5-shop-admin-auth
