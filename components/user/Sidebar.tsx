'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, Home, History, Settings } from 'lucide-react'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
    setIsHovered(false) // Clear hover state when clicking
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // Show content if permanently open OR temporarily hovered
  const shouldShowContent = isOpen || isHovered

  return (
    <aside
      role="complementary"
      aria-expanded={shouldShowContent}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${
        shouldShowContent ? 'w-64' : 'w-16'
      } bg-gray-50 border-r border-gray-200 transition-all duration-300 flex flex-col`}
    >
      {/* トグルボタン */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center hover:bg-gray-200 rounded p-2 transition-colors"
          aria-label={shouldShowContent ? 'メニューを閉じる' : 'メニューを開く'}
        >
          {shouldShowContent ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* メニュー項目 */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {/* マイページリンク */}
          <Link
            href="/user/mypage"
            className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded transition-colors"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {shouldShowContent && <span className="text-sm">マイページ</span>}
          </Link>

          {/* 予約履歴リンク */}
          <Link
            href="/user/reservations"
            className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded transition-colors"
          >
            <History className="w-5 h-5 flex-shrink-0" />
            {shouldShowContent && <span className="text-sm">予約履歴</span>}
          </Link>
        </nav>
      </div>

      {/* ユーザー設定リンク（下部） */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/user/settings"
          className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded transition-colors border border-gray-300"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {shouldShowContent && <span className="text-sm">ユーザー設定</span>}
        </Link>
      </div>
    </aside>
  )
}
