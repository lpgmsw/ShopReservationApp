'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Shop } from '../types'

interface SearchResultsProps {
  results: Shop[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function SearchResults({
  results,
  currentPage,
  totalPages,
  onPageChange,
}: SearchResultsProps) {
  const router = useRouter()
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center py-8">
          検索に当てはまる店舗がありません。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 検索結果一覧 */}
      <div className="space-y-4">
        {results.map((shop) => (
          <div
            key={shop.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {shop.shop_name}
            </h3>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                営業時間: {shop.business_hours_start} - {shop.business_hours_end}
              </p>
              <p className="text-sm text-gray-600">
                予約受付時間: {shop.reservation_hours_start} -{' '}
                {shop.reservation_hours_end}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push(`/user/reservation/${shop.id}`)}
              >
                予約
              </Button>
              <Button variant="outline" disabled>
                予約キャンセル
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            前へ
          </Button>

          <span className="text-sm text-gray-600">
            {currentPage} / {totalPages} ページ
          </span>

          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  )
}
