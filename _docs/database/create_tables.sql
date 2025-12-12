-- ============================================
-- ShopReservationApp - テーブル作成スクリプト
-- Issue #3: 店舗テーブル、ユーザーテーブルの作成
-- Issue #4: カラム名の修正（name→shop_name, username→user_name）
-- ============================================

-- 1. usersテーブル（ユーザープロファイル）
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'shop_manager', 'system_admin')),
  user_name text NOT NULL,
  email text UNIQUE,
  full_name text NOT NULL,
  address text,
  phone_number text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. shopsテーブル（店舗情報）
CREATE TABLE shops (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  shop_name text NOT NULL,
  business_hours_start time NOT NULL,
  business_hours_end time NOT NULL,
  reservation_hours_start time NOT NULL,
  reservation_hours_end time NOT NULL,
  business_days text[] NOT NULL,
  closed_days text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. usersテーブルのupdated_atトリガー
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. shopsテーブルのupdated_atトリガー
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. インデックス作成（パフォーマンス最適化）
CREATE INDEX idx_shops_owner_id ON shops(owner_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- 完了
-- テーブル作成が完了しました
