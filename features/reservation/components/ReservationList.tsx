/**
 * ReservationList Component
 * Displays shop's reservations in a table format
 * Highlights today's reservations with yellow background
 */
'use client'

import { useMemo } from 'react'
import type { ReservationWithUserInfo } from '@/features/reservation/types'

interface ReservationListProps {
  reservations: ReservationWithUserInfo[]
}

/**
 * Format time from HH:MM:SS to HH:MM
 */
function formatTime(time: string): string {
  return time.substring(0, 5)
}

/**
 * Get status label in Japanese
 */
function getStatusLabel(status: 'active' | 'cancelled' | 'completed'): string {
  switch (status) {
    case 'active':
      return '受付前'
    case 'cancelled':
      return 'キャンセル'
    case 'completed':
      return '完了'
  }
}

export function ReservationList({ reservations }: ReservationListProps) {
  // Calculate today's date once and memoize it
  const todayStr = useMemo(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }, [])

  if (reservations.length === 0) {
    return null
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">予約日時</th>
            <th className="border border-gray-300 px-4 py-2 text-left">ユーザー名</th>
            <th className="border border-gray-300 px-4 py-2 text-left">予約者名</th>
            <th className="border border-gray-300 px-4 py-2 text-left">コメント</th>
            <th className="border border-gray-300 px-4 py-2 text-left">予約枠</th>
            <th className="border border-gray-300 px-4 py-2 text-left">ステータス</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => {
            const rowClassName = reservation.reservation_date === todayStr
              ? 'bg-yellow-100'
              : ''

            return (
              <tr key={reservation.id} className={rowClassName}>
                <td className="border border-gray-300 px-4 py-2">
                  {reservation.reservation_date} {formatTime(reservation.reservation_time)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {reservation.user_name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {reservation.reserver_name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {reservation.comment || '-'}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {reservation.slot_count !== undefined && reservation.slot_max !== undefined
                    ? `${reservation.slot_count} / ${reservation.slot_max}`
                    : '-'}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {getStatusLabel(reservation.status)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
