'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/features/auth/utils/signOut'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  userName: string
}

export function Header({ userName }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      router.push('/system-admin/login')
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold text-gray-800">
              システム管理者: {userName}
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleLogout}
            >
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
