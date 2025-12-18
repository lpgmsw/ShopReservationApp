import { createClient } from '@/lib/supabase/client'
import type {
  ReservationFormInput,
  CreateReservationResult,
} from '@/features/reservation/types'

/**
 * Creates a new reservation in the database
 *
 * Converts time from HH:MM (HTML input format) to HH:MM:SS (PostgreSQL time format)
 * and inserts the reservation into the reservations table.
 *
 * @param userId - User ID from authenticated session
 * @param shopId - Shop ID from URL parameter
 * @param data - Reservation form data
 * @returns CreateReservationResult with success status and optional error message
 */
export async function createReservation(
  userId: string,
  shopId: string,
  data: ReservationFormInput
): Promise<CreateReservationResult> {
  try {
    const supabase = createClient()

    // Convert time from HH:MM to HH:MM:SS for PostgreSQL time type
    const reservationTimeWithSeconds = `${data.reservationTime}:00`

    // Insert reservation into database
    const { data: reservationData, error } = await supabase
      .from('reservations')
      .insert({
        user_id: userId,
        shop_id: shopId,
        reservation_date: data.reservationDate,
        reservation_time: reservationTimeWithSeconds,
        reserver_name: data.reserverName,
        comment: data.comment,
        status: 'active',
      })

    // Handle database errors
    if (error) {
      // Check for UNIQUE constraint violation (duplicate reservation)
      if (error.code === '23505') {
        return {
          success: false,
          error: 'この日時は既に予約済みです',
        }
      }

      // Generic database error
      console.error('Reservation creation error:', error)
      return {
        success: false,
        error: '予約の作成に失敗しました',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    // Handle unexpected errors (network, etc.)
    console.error('Unexpected error during reservation creation:', error)
    return {
      success: false,
      error: '予約の作成に失敗しました',
    }
  }
}
