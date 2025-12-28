'use client'

import { Button } from '@/components/ui/button'

interface DeleteShopModalProps {
  shopName: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteShopModal({ shopName, onConfirm, onCancel }: DeleteShopModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          店舗削除の確認
        </h2>

        <p className="text-gray-700 mb-6">
          <span className="font-semibold">{shopName}</span> を削除しますか？
        </p>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-6"
          >
            キャンセル
          </Button>
          <Button
            onClick={onConfirm}
            className="px-6 bg-red-600 hover:bg-red-700 text-white"
          >
            削除
          </Button>
        </div>
      </div>
    </div>
  )
}
