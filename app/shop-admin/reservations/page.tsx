'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { checkShopSetup } from '@/features/shop/utils/checkShopSetup'
import { Header } from '@/components/shop-admin/Header'
import { Footer } from '@/components/shop-admin/Footer'
import { Button } from '@/components/ui/button'

function ReservationsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userName, setUserName] = useState<string>('')
  const [isShopSetup, setIsShopSetup] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessageType, setSuccessMessageType] = useState<'registered' | 'updated' | null>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()

      // 認証チェック
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/shop-admin/login')
        return
      }

      // ユーザー名取得
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

      // 店舗設定チェック
      const shopSetup = await checkShopSetup(user.id)
      setIsShopSetup(shopSetup)

      // 成功メッセージの表示チェック
      const successParam = searchParams.get('success')
      if (successParam === 'registered' || successParam === 'updated') {
        setSuccessMessageType(successParam)
        setShowSuccessMessage(true)
        // 3秒後にメッセージを非表示
        setTimeout(() => {
          setShowSuccessMessage(false)
          setSuccessMessageType(null)
        }, 3000)
      }

      setIsLoading(false)
    }

    init()
  }, [router, searchParams])

  const handleGoToShopSettings = () => {
    router.push('/shop-admin/shop-settings')
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={userName} />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* 成功メッセージ */}
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
          // 店舗未設定の場合
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
          // 店舗設定済みの場合
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              予約一覧
            </h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-center py-8">
                予約はまだありません
              </p>
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
