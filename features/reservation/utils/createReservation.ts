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

    // 1. Get shop's max_reservations_per_slot
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select('max_reservations_per_slot')
      .eq('id', shopId)
      .single()

    if (shopError || !shopData) {
      console.error('Failed to fetch shop data:', shopError)
      return {
        success: false,
        error: '店舗情報の取得に失敗しました',
      }
    }

    const maxReservations = shopData.max_reservations_per_slot

    // 2. Count existing reservations for the same date and time
    const { count, error: countError } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .eq('reservation_date', data.reservationDate)
      .eq('reservation_time', reservationTimeWithSeconds)
      .eq('status', 'active')

    if (countError) {
      console.error('Failed to count reservations:', countError)
      return {
        success: false,
        error: '予約数の確認に失敗しました',
      }
    }

    // 3. Check if slot is full
    if (count !== null && count >= maxReservations) {
      return {
        success: false,
        error: '満員のため、ご指定頂いた枠では予約ができません。別の枠を指定してください。',
      }
    }

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
