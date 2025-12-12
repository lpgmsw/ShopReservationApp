# データベースマイグレーション手順

## 概要

このディレクトリには、Supabaseデータベースのテーブル定義とマイグレーションSQLファイルが含まれています。

---

## 🚨 緊急対応：emailカラムの追加（Issue #5）

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
