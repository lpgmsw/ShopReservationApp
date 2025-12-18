-- Migration: Create reservations and past_reservations tables
-- Created: 2025-12-18
-- Purpose: Implement reservation system with scalability consideration
--          - reservations: Current reservations (within 2 weeks)
--          - past_reservations: Archive for old reservations (older than 2 weeks)
--          - Both tables have identical schema for easy data migration in the future

-- ============================================================================
-- RESERVATIONS TABLE (Current Reservations)
-- ============================================================================

CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  reservation_date date NOT NULL,
  reservation_time time NOT NULL,
  reserver_name text NOT NULL,
  comment text CHECK (length(comment) <= 500),
  status text NOT NULL CHECK (status IN ('active', 'cancelled', 'completed')) DEFAULT 'active',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Prevent duplicate reservations
  CONSTRAINT unique_reservation UNIQUE (user_id, shop_id, reservation_date, reservation_time)
);

-- Indexes for performance
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_shop_id ON reservations(shop_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Trigger for automatic updated_at update
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PAST_RESERVATIONS TABLE (Archive)
-- ============================================================================

-- IMPORTANT: This table has IDENTICAL schema to reservations table
-- This design allows future data migration using simple SQL:
--   INSERT INTO past_reservations SELECT * FROM reservations WHERE ...
-- Migration logic is NOT implemented in this issue.

CREATE TABLE past_reservations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  reservation_date date NOT NULL,
  reservation_time time NOT NULL,
  reserver_name text NOT NULL,
  comment text CHECK (length(comment) <= 500),
  status text NOT NULL CHECK (status IN ('active', 'cancelled', 'completed')) DEFAULT 'active',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Prevent duplicate reservations (same constraint as reservations table)
  CONSTRAINT unique_past_reservation UNIQUE (user_id, shop_id, reservation_date, reservation_time)
);

-- Indexes for performance (same as reservations table)
CREATE INDEX idx_past_reservations_user_id ON past_reservations(user_id);
CREATE INDEX idx_past_reservations_shop_id ON past_reservations(shop_id);
CREATE INDEX idx_past_reservations_date ON past_reservations(reservation_date);
CREATE INDEX idx_past_reservations_status ON past_reservations(status);

-- Trigger for automatic updated_at update (same as reservations table)
CREATE TRIGGER update_past_reservations_updated_at
  BEFORE UPDATE ON past_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE reservations IS 'Current reservations within 2 weeks from current date';
COMMENT ON TABLE past_reservations IS 'Archive for reservations older than 2 weeks. Identical schema to reservations table for easy data migration.';

COMMENT ON COLUMN reservations.reserver_name IS 'Name used at the shop. Can be different from user_name to allow pseudonyms.';
COMMENT ON COLUMN reservations.comment IS 'Message to shop staff. Max 500 characters.';
COMMENT ON COLUMN reservations.status IS 'Reservation status: active, cancelled, or completed';

COMMENT ON COLUMN past_reservations.reserver_name IS 'Name used at the shop. Can be different from user_name to allow pseudonyms.';
COMMENT ON COLUMN past_reservations.comment IS 'Message to shop staff. Max 500 characters.';
COMMENT ON COLUMN past_reservations.status IS 'Reservation status: active, cancelled, or completed';
