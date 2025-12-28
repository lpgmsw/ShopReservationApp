'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TIME_OPTIONS } from '@/features/shared/utils/timeOptions'
import { WEEKDAYS_MON_START } from '@/features/shared/constants/weekdays'
import { validateAdminSearchForm } from '../utils/validateAdminSearchForm'
import type { Shop } from '../types'

interface AdminSearchFormProps {
  onSearch: (
    results: Shop[],
    page: number,
    total: number,
    searchParams?: {
      shopName?: string
      businessHoursStart?: string
      businessHoursEnd?: string
      businessDays?: string[]
      closedDays?: string[]
    }
  ) => void
}

export function AdminSearchForm({ onSearch }: AdminSearchFormProps) {
  const [shopName, setShopName] = useState('')
  const [businessHoursStart, setBusinessHoursStart] = useState('')
  const [businessHoursEnd, setBusinessHoursEnd] = useState('')
  const [businessDays, setBusinessDays] = useState<string[]>([])
  const [closedDays, setClosedDays] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSearching, setIsSearching] = useState(false)

  const handleBusinessDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setBusinessDays([...businessDays, day])
    } else {
      setBusinessDays(businessDays.filter((d) => d !== day))
    }
  }

  const handleClosedDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setClosedDays([...closedDays, day])
    } else {
      setClosedDays(closedDays.filter((d) => d !== day))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSearching(true)

    // バリデーション
    const validation = validateAdminSearchForm({
      shopName,
      businessHoursStart,
      businessHoursEnd,
      businessDays,
      closedDays,
    })

    if (!validation.isValid) {
      setErrors(validation.errors)
      setIsSearching(false)
      return
    }

    // 検索実行
    const searchParams = {
      shopName: shopName || undefined,
      businessHoursStart: businessHoursStart || undefined,
      businessHoursEnd: businessHoursEnd || undefined,
      businessDays: businessDays.length > 0 ? businessDays : undefined,
      closedDays: closedDays.length > 0 ? closedDays : undefined,
    }

    // 検索ロジックをインポートして実行
    const { searchShopsForAdmin } = await import('../utils/searchShopsForAdmin')
    const result = await searchShopsForAdmin({
      ...searchParams,
      page: 1,
      limit: 20,
    })

    if (result.success && result.data) {
      onSearch(result.data, 1, result.totalPages || 0, searchParams)
    } else {
      setErrors({ submit: result.error || '検索に失敗しました' })
    }

    setIsSearching(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="space-y-4">
        {/* 店舗名 */}
        <div className="space-y-2">
          <Label htmlFor="shopName">店舗名</Label>
          <Input
            id="shopName"
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="店舗名を入力"
            aria-invalid={!!errors.shopName}
          />
          {errors.shopName && (
            <p className="text-sm text-red-600">{errors.shopName}</p>
          )}
        </div>

        {/* 営業時間 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessHoursStart">営業開始時間</Label>
            <select
              id="businessHoursStart"
              value={businessHoursStart}
              onChange={(e) => setBusinessHoursStart(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={!!errors.businessHoursStart}
            >
              <option value="">選択してください</option>
              {TIME_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.businessHoursStart && (
              <p className="text-sm text-red-600">{errors.businessHoursStart}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessHoursEnd">営業終了時間</Label>
            <select
              id="businessHoursEnd"
              value={businessHoursEnd}
              onChange={(e) => setBusinessHoursEnd(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={!!errors.businessHoursEnd}
            >
              <option value="">選択してください</option>
              {TIME_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.businessHoursEnd && (
              <p className="text-sm text-red-600">{errors.businessHoursEnd}</p>
            )}
          </div>
        </div>

        {/* 営業日 */}
        <div className="space-y-2">
          <Label>営業日</Label>
          <div className="flex flex-wrap gap-4">
            {WEEKDAYS_MON_START.map((day) => (
              <label key={day} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={businessDays.includes(day)}
                  onChange={(e) => handleBusinessDayChange(day, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">{day}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 定休日 */}
        <div className="space-y-2">
          <Label>定休日</Label>
          <div className="flex flex-wrap gap-4">
            {WEEKDAYS_MON_START.map((day) => (
              <label key={day} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={closedDays.includes(day)}
                  onChange={(e) => handleClosedDayChange(day, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">{day}</span>
              </label>
            ))}
          </div>
          {errors.closedDays && (
            <p className="text-sm text-red-600">{errors.closedDays}</p>
          )}
        </div>
      </div>

      {/* エラーメッセージ */}
      {errors.submit && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* 検索ボタン */}
      <Button type="submit" disabled={isSearching} className="w-full md:w-auto mt-6">
        {isSearching ? '検索中...' : '検索'}
      </Button>
    </form>
  )
}
