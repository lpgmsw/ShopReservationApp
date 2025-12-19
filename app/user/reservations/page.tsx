'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/user/Header'
import { Sidebar } from '@/components/user/Sidebar'
import { Footer } from '@/components/user/Footer'
import { ReservationWithShop } from '@/features/reservation/types'

export default function ReservationsPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const [reservations, setReservations] = useState<ReservationWithShop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReservations() {
      const supabase = createClient()

      try {
        // Check authentication
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push('/user/login')
          return
        }

        // Fetch user name
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_name')
          .eq('id', user.id)
          .single()

        if (userError || !userData) {
          router.push('/user/login')
          return
        }

        setUserName(userData.user_name)

        // Fetch reservations with shop information
        const { data, error: fetchError } = await supabase
          .from('reservations')
          .select(
            `
            id,
            user_id,
            shop_id,
            reservation_date,
            reservation_time,
            reserver_name,
            comment,
            status,
            created_at,
            updated_at,
            shops!inner (
              id,
              shop_name,
              business_hours_start,
              business_hours_end
            )
          `
          )
          .eq('user_id', user.id)
          .order('reservation_date', { ascending: false })

        if (fetchError) {
          setError('予約データの取得に失敗しました')
          setLoading(false)
          return
        }

        // Transform data to match ReservationWithShop type
        const transformedData = (data || []).map((item: any) => ({
          ...item,
          shops: Array.isArray(item.shops) ? item.shops[0] : item.shops,
        }))

        setReservations(transformedData as ReservationWithShop[])
        setLoading(false)
      } catch (err) {
        setError('予約データの取得に失敗しました')
        setLoading(false)
      }
    }

    loadReservations()
  }, [router])

  const getStatusBadge = (status: 'active' | 'cancelled' | 'completed') => {
    const badgeClasses = {
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    }

    const badgeLabels = {
      active: '予約中',
      cancelled: 'キャンセル',
      completed: '完了',
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses[status]}`}
      >
        {badgeLabels[status]}
      </span>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5) // "HH:MM:SS" -> "HH:MM"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header userName={userName} />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center">読み込み中...</div>
          </main>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userName={userName} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              予約履歴
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {reservations.length === 0 && !error && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">予約履歴がありません</p>
              </div>
            )}

            {reservations.length > 0 && (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                          {reservation.shops.shop_name}
                        </h2>
                        <div className="text-gray-600 space-y-1">
                          <p>
                            {formatDate(reservation.reservation_date)}{' '}
                            {formatTime(reservation.reservation_time)}
                          </p>
                          <p>予約者: {reservation.reserver_name}</p>
                        </div>
                      </div>
                      <div>{getStatusBadge(reservation.status)}</div>
                    </div>

                    {reservation.comment && (
                      <div className="mt-4 p-4 bg-gray-50 rounded">
                        <p className="text-sm text-gray-700">
                          {reservation.comment}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
