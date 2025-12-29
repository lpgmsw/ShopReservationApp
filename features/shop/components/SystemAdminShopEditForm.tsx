'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateShopData, ShopData } from '../utils/validateShopData'
import { updateShop } from '../utils/updateShop'
import { fetchShopById } from '../utils/fetchShopById'
import { UpdateShopModal } from './UpdateShopModal'

interface SystemAdminShopEditFormProps {
  shopId: string
}

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

export function SystemAdminShopEditForm({ shopId }: SystemAdminShopEditFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<ShopData>({
    shop_name: '',
    business_hours_start: '',
    business_hours_end: '',
    reservation_hours_start: '',
    reservation_hours_end: '',
    business_days: [],
    closed_days: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // 初期データ取得
  useEffect(() => {
    const loadShopData = async () => {
      const result = await fetchShopById(shopId)

      if (result.success && result.data) {
        setFormData({
          shop_name: result.data.shop_name,
          business_hours_start: result.data.business_hours_start,
          business_hours_end: result.data.business_hours_end,
          reservation_hours_start: result.data.reservation_hours_start,
          reservation_hours_end: result.data.reservation_hours_end,
          business_days: result.data.business_days,
          closed_days: result.data.closed_days,
        })
        setIsLoading(false)
      } else {
        setErrors({ submit: result.error || '店舗情報の取得に失敗しました' })
        setIsLoading(false)
      }
    }

    loadShopData()
  }, [shopId])

  const handleInputChange = (field: keyof ShopData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDayToggle = (day: string, type: 'business' | 'closed') => {
    const field = type === 'business' ? 'business_days' : 'closed_days'
    setFormData(prev => {
      const currentDays = prev[field]
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day]
      return {
        ...prev,
        [field]: newDays,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // バリデーション
    const validation = validateShopData(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    // 確認モーダルを表示
    setShowConfirmModal(true)
  }

  const handleConfirmUpdate = async () => {
    setIsSubmitting(true)
    setShowConfirmModal(false)

    const result = await updateShop(shopId, formData)

    if (result.success) {
      // 成功時はマイページへリダイレクト（クエリパラメータ付き）
      router.push('/system-admin/shops?success=updated')
    } else {
      // 失敗時はエラー表示
      setErrors({ submit: result.error || '更新に失敗しました' })
      setIsSubmitting(false)
    }
  }

  const handleCancelUpdate = () => {
    setShowConfirmModal(false)
  }

  const handleCancel = () => {
    router.push('/system-admin/shops')
  }

  // ローディング中の表示
  if (isLoading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  // エラーがある場合の表示
  if (errors.submit && !formData.shop_name) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600 text-sm">{errors.submit}</p>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* バリデーションエラー表示エリア */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <ul className="space-y-1">
              {Object.entries(errors).map(([key, message]) => (
                <li key={key} className="text-red-600 text-sm">
                  {message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 店舗名 */}
        <div className="space-y-2">
          <Label htmlFor="shop_name">店舗名</Label>
          <Input
            id="shop_name"
            type="text"
            value={formData.shop_name}
            onChange={(e) => handleInputChange('shop_name', e.target.value)}
            placeholder="店舗名を入力"
            aria-invalid={!!errors.shop_name}
          />
        </div>

        {/* 営業開始時間 */}
        <div className="space-y-2">
          <Label htmlFor="business_hours_start">営業開始時間</Label>
          <Input
            id="business_hours_start"
            type="time"
            value={formData.business_hours_start}
            onChange={(e) => handleInputChange('business_hours_start', e.target.value)}
            aria-invalid={!!errors.business_time}
          />
        </div>

        {/* 営業終了時間 */}
        <div className="space-y-2">
          <Label htmlFor="business_hours_end">営業終了時間</Label>
          <Input
            id="business_hours_end"
            type="time"
            value={formData.business_hours_end}
            onChange={(e) => handleInputChange('business_hours_end', e.target.value)}
            aria-invalid={!!errors.business_time}
          />
        </div>

        {/* 予約受付開始時間 */}
        <div className="space-y-2">
          <Label htmlFor="reservation_hours_start">予約受付開始時間</Label>
          <Input
            id="reservation_hours_start"
            type="time"
            value={formData.reservation_hours_start}
            onChange={(e) => handleInputChange('reservation_hours_start', e.target.value)}
            aria-invalid={!!errors.reservation_time}
          />
        </div>

        {/* 予約受付終了時間 */}
        <div className="space-y-2">
          <Label htmlFor="reservation_hours_end">予約受付終了時間</Label>
          <Input
            id="reservation_hours_end"
            type="time"
            value={formData.reservation_hours_end}
            onChange={(e) => handleInputChange('reservation_hours_end', e.target.value)}
            aria-invalid={!!errors.reservation_time}
          />
        </div>

        {/* 営業日 */}
        <div className="space-y-2">
          <Label>営業日</Label>
          <div className="flex gap-2 flex-wrap">
            {WEEKDAYS.map((day) => (
              <button
                key={`business-${day}`}
                type="button"
                onClick={() => handleDayToggle(day, 'business')}
                className={`px-4 py-2 rounded-md border ${
                  formData.business_days.includes(day)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                aria-pressed={formData.business_days.includes(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* 定休日 */}
        <div className="space-y-2">
          <Label>定休日</Label>
          <div className="flex gap-2 flex-wrap">
            {WEEKDAYS.map((day) => (
              <button
                key={`closed-${day}`}
                type="button"
                onClick={() => handleDayToggle(day, 'closed')}
                className={`px-4 py-2 rounded-md border ${
                  formData.closed_days.includes(day)
                    ? 'bg-gray-500 text-white border-gray-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                aria-pressed={formData.closed_days.includes(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            onClick={handleCancel}
            variant="destructive"
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? '更新中...' : '更新'}
          </Button>
        </div>
      </form>

      {/* 確認モーダル */}
      {showConfirmModal && (
        <UpdateShopModal
          onConfirm={handleConfirmUpdate}
          onCancel={handleCancelUpdate}
        />
      )}
    </>
  )
}
