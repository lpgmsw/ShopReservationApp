'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShopSettingsForm } from '@/features/shop/components/ShopSettingsForm'

export default function ShopSettingsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()

      // 認証チェック
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/shop-admin/login')
        return
      }

      setUserId(user.id)
      setIsLoading(false)
    }

    init()
  }, [router])

  if (isLoading) {
    return null
  }

  if (!userId) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              店舗情報登録
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              店舗の基本情報を入力してください
            </p>
          </div>

          <ShopSettingsForm userId={userId} />
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          © 2025 店舗予約システム. All rights reserved.
        </p>
      </div>
    </div>
  )
}
