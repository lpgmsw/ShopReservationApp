/**
 * Reservation Type Definitions
 *
 * These types represent the reservation system data structures
 * aligned with the database schema defined in migration_create_reservations_tables.sql
 */

/**
 * Database schema for reservations and past_reservations tables
 */
export interface Reservation {
  id: string
  user_id: string
  shop_id: string
  reservation_date: string // ISO date format (YYYY-MM-DD)
  reservation_time: string // HH:MM:SS format
  reserver_name: string // Name to be used at the shop (can be pseudonym)
  comment: string // Message to shop staff (max 500 characters)
  status: 'active' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
}

/**
 * Form input type for reservation creation
 * Used by react-hook-form in ReservationForm component
 */
export interface ReservationFormInput {
  reservationDate: string // YYYY-MM-DD format from HTML date input
  reservationTime: string // HH:MM format from HTML time input
  reserverName: string
  comment: string
}

/**
 * Result type for reservation creation operation
 */
export interface CreateReservationResult {
  success: boolean
  error?: string
}

/**
 * Reservation with associated shop information
 * Used for displaying reservation history with shop details
 */
export interface ReservationWithShop {
  id: string
  user_id: string
  shop_id: string
  reservation_date: string
  reservation_time: string
  reserver_name: string
  comment: string
  status: 'active' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
  shops: {
    id: string
    shop_name: string
    business_hours_start: string
    business_hours_end: string
  }
}

/**
 * Reservation with associated user information
 * Used for shop admin to view reservations with user details
 */
export interface ReservationWithUserInfo {
  id: string
  user_id: string
  shop_id: string
  reservation_date: string
  reservation_time: string
  reserver_name: string
  comment: string
  status: 'active' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
  user_name: string
  slot_count?: number // Number of reservations for this time slot
  slot_max?: number // Maximum reservations allowed for this time slot
}
