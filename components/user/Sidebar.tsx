'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, History, Settings } from 'lucide-react'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <aside
      role="complementary"
      className={`${
        isOpen ? 'w-64' : 'w-16'
      } bg-gray-50 border-r border-gray-200 transition-all duration-300 flex flex-col`}
    >
      {/* トグルボタン */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center hover:bg-gray-200 rounded p-2 transition-colors"
          aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* メニュー項目 */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {/* 予約履歴リンク */}
          <Link
            href="/user/reservations"
            className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded transition-colors"
          >
            <History className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm">予約履歴</span>}
          </Link>
        </nav>
      </div>

      {/* ユーザー設定ボタン（下部） */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          className={`w-full ${isOpen ? 'justify-start' : 'justify-center px-2'}`}
          disabled
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="ml-2">ユーザー設定</span>}
        </Button>
      </div>
    </aside>
  )
}
