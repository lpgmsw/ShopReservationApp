'use client'

import { useRouter } from 'next/navigation'
import { SystemAdminSignUpForm } from '@/features/auth/components/SystemAdminSignUpForm'

export default function SystemAdminSignUpPage() {
  const router = useRouter()

  const handleSuccess = () => {
    // 登録成功後はシステム管理者マイページへリダイレクト
    router.push('/system-admin/shops')
  }

  const handleSwitchToLogin = () => {
    router.push('/system-admin/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              アカウント登録
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              システム管理者向け予約システム
            </p>
          </div>

          <SystemAdminSignUpForm
            onSuccess={handleSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          © 2025 店舗予約システム. All rights reserved.
        </p>
      </div>
    </div>
  )
}
