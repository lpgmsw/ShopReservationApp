'use client'

import { useRouter } from 'next/navigation'
import { SystemAdminLoginForm } from '@/features/auth/components/SystemAdminLoginForm'

export default function SystemAdminLoginPage() {
  const router = useRouter()

  const handleSuccess = () => {
    // ログイン成功後はシステム管理者マイページへリダイレクト
    router.push('/system-admin/shops')
  }

  const handleSwitchToSignUp = () => {
    router.push('/system-admin/signup')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              ログイン
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              システム管理者向け予約システム
            </p>
          </div>

          <SystemAdminLoginForm
            onSuccess={handleSuccess}
            onSwitchToSignUp={handleSwitchToSignUp}
          />
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          © 2025 店舗予約システム. All rights reserved.
        </p>
      </div>
    </div>
  )
}
