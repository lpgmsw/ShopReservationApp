'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/system-admin/Header'
import { Footer } from '@/components/system-admin/Footer'
import { SystemAdminShopEditForm } from '@/features/shop/components/SystemAdminShopEditForm'

function SystemAdminShopEditContent() {
  const router = useRouter()
  const params = useParams()
  const shopId = params?.id as string
  const [userName, setUserName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()

      // 認証チェック
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/system-admin/login')
        return
      }

      // ユーザー名とロール取得
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_name, role')
        .eq('id', user.id)
        .single()

      if (userError || !userData) {
        console.error('Failed to fetch user data:', userError)
        router.push('/system-admin/login')
        return
      }

      // システム管理者チェック
      if (userData.role !== 'system_admin') {
        console.warn('Access denied: User is not a system admin')
        router.push('/user/login')
        return
      }

      setUserName(userData.user_name)
      setIsLoading(false)
    }

    init()
  }, [router])

  if (isLoading) {
    return null
  }

  if (!shopId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">店舗IDが指定されていません</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={userName} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                店舗情報編集
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                店舗の基本情報を編集してください
              </p>
            </div>

            <SystemAdminShopEditForm shopId={shopId} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function SystemAdminShopEditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <SystemAdminShopEditContent />
    </Suspense>
  )
}
