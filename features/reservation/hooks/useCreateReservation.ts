import { useState } from 'react'
import { createReservation } from '@/features/reservation/utils/createReservation'
import type {
  ReservationFormInput,
  CreateReservationResult,
} from '@/features/reservation/types'

/**
 * Custom hook for managing reservation creation state
 *
 * Provides:
 * - isLoading: Boolean indicating if creation is in progress
 * - error: Error message from failed creation (null if no error)
 * - create: Function to create a reservation
 *
 * @returns Hook state and functions
 */
export function useCreateReservation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Creates a new reservation
   *
   * @param userId - User ID from authenticated session
   * @param shopId - Shop ID from URL parameter
   * @param data - Reservation form data
   * @returns CreateReservationResult with success status and optional error
   */
  const create = async (
    userId: string,
    shopId: string,
    data: ReservationFormInput
  ): Promise<CreateReservationResult> => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await createReservation(userId, shopId, data)

      if (!result.success && result.error) {
        setError(result.error)
      }

      return result
    } catch (err) {
      const errorMessage = '予約の作成に失敗しました'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    create,
  }
}
