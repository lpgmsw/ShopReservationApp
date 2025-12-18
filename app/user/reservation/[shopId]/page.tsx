'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ReservationForm } from '@/features/reservation/components/ReservationForm'
import type { Shop } from '@/features/shop-search/types'

/**
 * Reservation Page
 *
 * Allows authenticated users to make a reservation at a shop
 *
 * Flow:
 * 1. Get shopId from URL params
 * 2. Check authentication (redirect to /user/login if not authenticated)
 * 3. Fetch user data
 * 4. Fetch shop data
 * 5. Display ReservationForm
 * 6. On success: redirect to /user/mypage?reserved=true
 * 7. On cancel: redirect to /user/mypage
 */
export default function ReservationPage() {
  const router = useRouter()
  const params = useParams()
  const shopId = params.shopId as string

  const [userId, setUserId] = useState<string | null>(null)
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient()

        // Check authentication
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push('/user/login')
          return
        }

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_name')
          .eq('id', user.id)
          .single()

        if (userError || !userData) {
          router.push('/user/login')
          return
        }

        // Fetch shop data
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('id', shopId)
          .single()

        if (shopError || !shopData) {
          setError('店舗情報が見つかりませんでした')
          setLoading(false)
          return
        }

        setUserId(user.id)
        setShop(shopData)
        setLoading(false)
      } catch (err) {
        console.error('Initialization error:', err)
        setError('エラーが発生しました')
        setLoading(false)
      }
    }

    init()
  }, [router, shopId])

  const handleSuccess = () => {
    router.push('/user/mypage?reserved=true')
  }

  const handleCancel = () => {
    router.push('/user/mypage')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/user/mypage')}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            マイページに戻る
          </button>
        </div>
      </div>
    )
  }

  if (!userId || !shop) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ReservationForm
        userId={userId}
        shop={shop}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
