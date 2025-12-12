-- ============================================
-- ShopReservationApp - マイグレーション
-- Issue #5: usersテーブルにemailカラムを追加
-- ============================================

-- usersテーブルにemailカラムを追加
ALTER TABLE public.users
ADD COLUMN email text;

-- emailカラムにユニーク制約を追加（重複を防ぐ）
ALTER TABLE public.users
ADD CONSTRAINT users_email_unique UNIQUE (email);

-- emailカラムにインデックスを作成（検索の高速化）
CREATE INDEX idx_users_email ON public.users(email);

-- 完了
-- emailカラムの追加が完了しました
