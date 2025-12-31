-- Migration: Add max_reservations_per_slot to shops table
-- Created: 2025-12-31
-- Purpose: Enable shops to configure maximum number of reservations per time slot
--          to support shop scaling and capacity management

-- ============================================================================
-- ADD COLUMN TO SHOPS TABLE
-- ============================================================================

-- Add max_reservations_per_slot column
-- Default value: 1 (one reservation per slot - backward compatible)
-- NOT NULL to ensure every shop has a valid capacity setting
ALTER TABLE shops
ADD COLUMN max_reservations_per_slot integer NOT NULL DEFAULT 1
CHECK (max_reservations_per_slot >= 1);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN shops.max_reservations_per_slot IS
'Maximum number of reservations allowed per time slot. Default is 1. Must be at least 1.';

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

-- All existing shops will have max_reservations_per_slot = 1 (default)
-- This maintains backward compatibility with current reservation behavior
-- Shop owners can update this value via shop settings interface
