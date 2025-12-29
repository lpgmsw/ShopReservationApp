'use client'

import { Button } from '@/components/ui/button'

interface UpdateShopModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export function UpdateShopModal({ onConfirm, onCancel }: UpdateShopModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          更新しますか？
        </h2>

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
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            更新
          </Button>
        </div>
      </div>
    </div>
  )
}
