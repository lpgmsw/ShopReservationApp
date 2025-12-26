'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/user/Header'
import { Footer } from '@/components/user/Footer'
import { Sidebar } from '@/components/user/Sidebar'
import { UserSettingsForm } from '@/features/auth/components/UserSettingsForm'
import type { UserSettingsInput } from '@/features/auth/utils/validation'

export default function UserSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettingsInput | null>(null)

  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/user/login')
        return
      }

      // Fetch current user data from users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('user_name, email')
        .eq('id', user.id)
        .single()

      if (error || !userData) {
        console.error('Failed to fetch user data:', error)
        router.push('/user/mypage')
        return
      }

      setUserId(user.id)
      setUserSettings({
        userName: userData.user_name,
        email: userData.email,
      })
      setLoading(false)
    }

    checkAuthAndFetchUser()
  }, [router])

  const handleSuccess = () => {
    router.push('/user/mypage?updated=true')
  }

  const handleCancel = () => {
    router.push('/user/mypage')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!userId || !userSettings) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={userSettings.userName} />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow-md rounded-lg p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">ユーザー情報編集</h1>
                <p className="mt-2 text-sm text-gray-600">
                  ユーザー名とメールアドレスを変更できます
                </p>
              </div>

              <UserSettingsForm
                userId={userId}
                defaultValues={userSettings}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
