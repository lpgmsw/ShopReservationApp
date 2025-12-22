-- Migration: Add RLS policies for reservations table
-- Created: 2025-12-21
-- Purpose: Allow shop owners to view reservations for their shops

-- Enable RLS on reservations table
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own reservations
CREATE POLICY "Users can view their own reservations"
  ON reservations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Shop owners can view reservations for their shops
CREATE POLICY "Shop owners can view reservations for their shops"
  ON reservations
  FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can insert their own reservations
CREATE POLICY "Users can insert their own reservations"
  ON reservations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reservations
CREATE POLICY "Users can update their own reservations"
  ON reservations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Shop owners can update reservations for their shops (e.g., mark as completed)
CREATE POLICY "Shop owners can update reservations for their shops"
  ON reservations
  FOR UPDATE
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );

-- Enable RLS on past_reservations table (same policies as reservations)
ALTER TABLE past_reservations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own past reservations
CREATE POLICY "Users can view their own past reservations"
  ON past_reservations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Shop owners can view past reservations for their shops
CREATE POLICY "Shop owners can view past reservations for their shops"
  ON past_reservations
  FOR SELECT
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE owner_id = auth.uid()
    )
  );
