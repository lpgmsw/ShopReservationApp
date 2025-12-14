'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateShopData, ShopData } from '../utils/validateShopData'
import { registerShop } from '../utils/registerShop'

interface ShopSettingsFormProps {
  userId: string
}

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

export function ShopSettingsForm({ userId }: ShopSettingsFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<ShopData>({
    shop_name: '',
    business_start_time: '',
    business_end_time: '',
    reservation_start_time: '',
    reservation_end_time: '',
    business_days: [],
    closed_days: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    setIsSubmitting(true)
    setErrors({})

    // バリデーション
    const validation = validateShopData(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      setIsSubmitting(false)
      return
    }

    // 登録処理
    const result = await registerShop(userId, formData)

    if (result.success) {
      // 成功時は予約一覧画面へリダイレクト
      router.push('/shop-admin/reservations?success=registered')
    } else {
      // 失敗時はエラー表示
      setErrors({ submit: result.error || '登録に失敗しました' })
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/shop-admin/reservations')
  }

  return (
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
        <Label htmlFor="business_start_time">営業開始時間</Label>
        <Input
          id="business_start_time"
          type="time"
          value={formData.business_start_time}
          onChange={(e) => handleInputChange('business_start_time', e.target.value)}
          aria-invalid={!!errors.business_time}
        />
      </div>

      {/* 営業終了時間 */}
      <div className="space-y-2">
        <Label htmlFor="business_end_time">営業終了時間</Label>
        <Input
          id="business_end_time"
          type="time"
          value={formData.business_end_time}
          onChange={(e) => handleInputChange('business_end_time', e.target.value)}
          aria-invalid={!!errors.business_time}
        />
      </div>

      {/* 予約受付開始時間 */}
      <div className="space-y-2">
        <Label htmlFor="reservation_start_time">予約受付開始時間</Label>
        <Input
          id="reservation_start_time"
          type="time"
          value={formData.reservation_start_time}
          onChange={(e) => handleInputChange('reservation_start_time', e.target.value)}
          aria-invalid={!!errors.reservation_time}
        />
      </div>

      {/* 予約受付終了時間 */}
      <div className="space-y-2">
        <Label htmlFor="reservation_end_time">予約受付終了時間</Label>
        <Input
          id="reservation_end_time"
          type="time"
          value={formData.reservation_end_time}
          onChange={(e) => handleInputChange('reservation_end_time', e.target.value)}
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
          {isSubmitting ? '登録中...' : '登録'}
        </Button>
      </div>
    </form>
  )
}
