'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignUpForm } from '@/features/auth/components/SignUpForm'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const router = useRouter()

  const handleSuccess = () => {
    // ログイン/登録成功後は店舗設定画面へリダイレクト
    // TODO: 実装後に適切なパスに変更
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'signup' ? 'アカウント登録' : 'ログイン'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              店舗管理者向け予約システム
            </p>
          </div>

          {mode === 'signup' ? (
            <SignUpForm
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setMode('login')}
            />
          ) : (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToSignUp={() => setMode('signup')}
            />
          )}
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          © 2025 店舗予約システム. All rights reserved.
        </p>
      </div>
    </div>
  )
}
