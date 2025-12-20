'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { checkShopSetup } from '@/features/shop/utils/checkShopSetup'
import { fetchShopData } from '@/features/shop/utils/fetchShopData'
import { Header } from '@/components/shop-admin/Header'
import { Footer } from '@/components/shop-admin/Footer'
import { Button } from '@/components/ui/button'
import { ReservationList } from '@/features/reservation/components/ReservationList'
import { Pagination } from '@/features/reservation/components/Pagination'
import { useSuccessMessage } from '@/features/shop/hooks/useSuccessMessage'
import { useShopReservations } from '@/features/reservation/hooks/useShopReservations'

function ReservationsPageContent() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const [shopName, setShopName] = useState<string>('')
  const [isShopSetup, setIsShopSetup] = useState<boolean>(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const { showSuccessMessage, successMessageType } = useSuccessMessage()
  const {
    reservations,
    currentPage,
    totalPages,
    total,
    isLoading,
    loadReservations,
    handlePageChange,
  } = useShopReservations()

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()

      // Authentication check
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/shop-admin/login')
        return
      }

      // Fetch user name
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_name')
        .eq('id', user.id)
        .single()

      if (userError || !userData) {
        console.error('Failed to fetch user data:', userError)
        router.push('/shop-admin/login')
        return
      }

      setUserName(userData.user_name)

      // Check shop setup
      const shopSetup = await checkShopSetup(user.id)
      setIsShopSetup(shopSetup)

      // Fetch shop data and reservations if shop is set up
      if (shopSetup) {
        const shopResult = await fetchShopData(user.id)
        if (shopResult.success && shopResult.data) {
          setShopName(shopResult.data.shop_name)

          // Load reservations with pagination
          await loadReservations(shopResult.data.id, 1)
        }
      }

      setIsInitialLoading(false)
    }

    init()
  }, [router, loadReservations])

  const handleGoToShopSettings = () => {
    router.push('/shop-admin/shop-settings')
  }

  if (isInitialLoading) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={userName} shopName={shopName} />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Success message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-600 font-medium">
              {successMessageType === 'updated'
                ? '店舗情報を更新しました。'
                : '店舗情報を登録しました。'}
            </p>
          </div>
        )}

        {!isShopSetup ? (
          // Shop not set up
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                店舗設定がまだ完了していません
              </h2>
              <p className="text-gray-600 mb-8">
                予約を受け付けるには、まず店舗情報を設定してください。
              </p>
              <Button onClick={handleGoToShopSettings}>
                店舗設定へ
              </Button>
            </div>
          </div>
        ) : (
          // Shop set up - show reservations
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              予約一覧
              {total > 0 && (
                <span className="text-lg text-gray-600 ml-4">
                  （全{total}件）
                </span>
              )}
            </h1>
            <div className="bg-white rounded-lg shadow p-6">
              {isLoading ? (
                <p className="text-gray-600 text-center py-8">
                  読み込み中...
                </p>
              ) : reservations.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  予約はまだありません
                </p>
              ) : (
                <>
                  <ReservationList reservations={reservations} />
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function ReservationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReservationsPageContent />
    </Suspense>
  )
}
