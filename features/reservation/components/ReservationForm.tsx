'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reservationSchema } from '@/features/reservation/utils/validation'
import { useCreateReservation } from '@/features/reservation/hooks/useCreateReservation'
import { validateReservation } from '@/features/reservation/utils/validateReservation'
import type { ReservationFormInput } from '@/features/reservation/types'
import type { Shop } from '@/features/shop-search/types'

/**
 * Generate hour options from start to end hour
 */
function generateHourOptions(startHour: number, endHour: number): string[] {
  const hours: string[] = []
  for (let i = startHour; i <= endHour; i++) {
    hours.push(i.toString().padStart(2, '0'))
  }
  return hours
}

/**
 * Parse HH:MM:SS format to get hour
 */
function parseHour(timeString: string): number {
  return parseInt(timeString.substring(0, 2), 10)
}

interface ReservationFormProps {
  userId: string
  shop: Shop
  onSuccess: () => void
  onCancel: () => void
}

/**
 * Reservation form component
 *
 * Allows users to create a reservation with:
 * - Reservation date (date input)
 * - Reservation time (time input)
 * - Reserver name (text input, max 50 chars)
 * - Comment (textarea, max 500 chars, optional)
 *
 * Validates input with Zod schema and business rules before submitting
 */
export function ReservationForm({
  userId,
  shop,
  onSuccess,
  onCancel,
}: ReservationFormProps) {
  const [businessError, setBusinessError] = useState<string | null>(null)
  const [selectedHour, setSelectedHour] = useState<string>('')
  const [selectedMinute, setSelectedMinute] = useState<string>('00')
  const { create, isLoading, error: hookError } = useCreateReservation()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReservationFormInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      reservationDate: '',
      reservationTime: '',
      reserverName: '',
      comment: '',
    },
  })

  // Generate hour options based on shop's reservation hours
  const startHour = parseHour(shop.reservation_hours_start)
  const endHour = parseHour(shop.reservation_hours_end)
  const hourOptions = generateHourOptions(startHour, endHour)
  const minuteOptions = ['00', '30']

  // Update reservationTime when hour or minute changes
  useEffect(() => {
    if (selectedHour && selectedMinute) {
      const timeValue = `${selectedHour}:${selectedMinute}`
      setValue('reservationTime', timeValue, { shouldValidate: true })
    }
  }, [selectedHour, selectedMinute, setValue])

  const onSubmit = async (data: ReservationFormInput) => {
    // Clear previous business validation error
    setBusinessError(null)

    // Validate business rules (time range, past date)
    const validation = validateReservation({
      reservationDate: data.reservationDate,
      reservationTime: data.reservationTime,
      shop,
    })

    if (!validation.isValid) {
      setBusinessError(validation.error || null)
      return
    }

    // Create reservation
    const result = await create(userId, shop.id, data)

    if (result.success) {
      onSuccess()
    }
  }

  // Format reservation hours for display (remove seconds)
  const reservationHoursStart = shop.reservation_hours_start.substring(0, 5)
  const reservationHoursEnd = shop.reservation_hours_end.substring(0, 5)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-2">{shop.shop_name}</h2>
        <p className="text-gray-600 mb-6">
          受付時間: {reservationHoursStart}-{reservationHoursEnd}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Reservation Date */}
          <div>
            <label htmlFor="reservationDate" className="block text-sm font-medium mb-1">
              予約日
            </label>
            <input
              id="reservationDate"
              type="date"
              {...register('reservationDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.reservationDate && (
              <p className="text-red-600 text-sm mt-1">
                {errors.reservationDate.message}
              </p>
            )}
          </div>

          {/* Reservation Time */}
          <div>
            <label className="block text-sm font-medium mb-1">
              予約時刻
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="時"
              >
                <option value="">時</option>
                {hourOptions.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
              <span className="text-gray-600">:</span>
              <select
                value={selectedMinute}
                onChange={(e) => setSelectedMinute(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="分"
              >
                {minuteOptions.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
            <input type="hidden" {...register('reservationTime')} />
            {errors.reservationTime && (
              <p className="text-red-600 text-sm mt-1">
                {errors.reservationTime.message}
              </p>
            )}
          </div>

          {/* Reserver Name */}
          <div>
            <label htmlFor="reserverName" className="block text-sm font-medium mb-1">
              予約者名
            </label>
            <input
              id="reserverName"
              type="text"
              {...register('reserverName')}
              placeholder="店舗で使用する名前"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.reserverName && (
              <p className="text-red-600 text-sm mt-1">
                {errors.reserverName.message}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-1">
              コメント（任意）
            </label>
            <textarea
              id="comment"
              {...register('comment')}
              placeholder="店舗へのメッセージ（500文字まで）"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.comment && (
              <p className="text-red-600 text-sm mt-1">{errors.comment.message}</p>
            )}
          </div>

          {/* Business Validation Error */}
          {businessError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {businessError}
            </div>
          )}

          {/* Hook Error */}
          {hookError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {hookError}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '予約中...' : '予約する'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
