import type { Shop } from '@/features/shop-search/types'

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Parameters for validateReservation function
 */
export interface ValidateReservationParams {
  reservationDate: string // YYYY-MM-DD
  reservationTime: string // HH:MM
  shop: Shop
}

/**
 * Validates reservation business rules:
 * 1. Reservation time must be within shop's reservation hours
 * 2. Reservation date must not be in the past
 *
 * @param params - Validation parameters
 * @returns Validation result with error message if invalid
 */
export function validateReservation(params: ValidateReservationParams): ValidationResult {
  const { reservationDate, reservationTime, shop } = params

  // Check if reservation date is not in the past
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to compare dates only

  const reservationDateObj = new Date(reservationDate)
  reservationDateObj.setHours(0, 0, 0, 0)

  if (reservationDateObj < today) {
    return {
      isValid: false,
      error: '過去の日付は予約できません',
    }
  }

  // Check if reservation time is within shop's reservation hours
  const reservationTimeMinutes = timeToMinutes(reservationTime)
  const startTimeMinutes = timeToMinutes(shop.reservation_hours_start)
  const endTimeMinutes = timeToMinutes(shop.reservation_hours_end)

  if (reservationTimeMinutes < startTimeMinutes || reservationTimeMinutes > endTimeMinutes) {
    // Format times for display (remove seconds if present)
    const startTimeDisplay = shop.reservation_hours_start.substring(0, 5)
    const endTimeDisplay = shop.reservation_hours_end.substring(0, 5)

    return {
      isValid: false,
      error: `予約受付時間外です（受付時間: ${startTimeDisplay}-${endTimeDisplay}）`,
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Converts time string (HH:MM or HH:MM:SS) to minutes since midnight
 *
 * @param time - Time string in HH:MM or HH:MM:SS format
 * @returns Minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
