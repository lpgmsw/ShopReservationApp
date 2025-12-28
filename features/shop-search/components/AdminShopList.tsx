'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DeleteShopModal } from './DeleteShopModal'
import { deleteShop } from '@/features/shop/utils/deleteShop'
import type { Shop } from '../types'

interface AdminShopListProps {
  results: Shop[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onShopDeleted: () => void
}

export function AdminShopList({
  results,
  currentPage,
  totalPages,
  onPageChange,
  onShopDeleted,
}: AdminShopListProps) {
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDeleteClick = (shop: Shop) => {
    setShopToDelete(shop)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!shopToDelete) return

    setIsDeleting(true)
    setDeleteError(null)

    const result = await deleteShop(shopToDelete.id)

    if (result.success) {
      setShopToDelete(null)
      onShopDeleted()
    } else {
      setDeleteError(result.error || '削除に失敗しました')
    }

    setIsDeleting(false)
  }

  const handleDeleteCancel = () => {
    setShopToDelete(null)
    setDeleteError(null)
  }

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
    <>
      <div className="space-y-6">
        {/* エラーメッセージ */}
        {deleteError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{deleteError}</p>
          </div>
        )}

        {/* 店舗一覧 */}
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
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteClick(shop)}
                >
                  削除
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

      {/* 削除確認モーダル */}
      {shopToDelete && (
        <DeleteShopModal
          shopName={shopToDelete.shop_name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </>
  )
}
