-- ============================================
-- ShopReservationApp - マイグレーション
-- Issue #5: usersテーブルのカラム並び順変更
-- - addressカラムを削除
-- - emailカラムをaddressの位置（full_nameの後）に配置
-- ============================================

-- ⚠️ 重要: このマイグレーションはテーブルを再作成します
-- 実行前にバックアップを取得してください

BEGIN;

-- 1. トリガーを一時的に削除
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- 2. 新しいテーブル構造を作成（理想的なカラム順序で）
CREATE TABLE users_new (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'shop_manager', 'system_admin')),
  user_name text NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE,  -- addressの位置に配置
  phone_number text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. 既存データを新しいテーブルにコピー（addressは除外）
INSERT INTO users_new (
  id,
  role,
  user_name,
  full_name,
  email,
  phone_number,
  created_at,
  updated_at
)
SELECT
  id,
  role,
  user_name,
  full_name,
  email,
  phone_number,
  created_at,
  updated_at
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

-- 8. RLSポリシーがある場合は再作成（必要に応じて）
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

COMMIT;

-- 完了
-- usersテーブルのカラム順序変更が完了しました
-- addressカラムは削除され、emailがその位置に配置されました
