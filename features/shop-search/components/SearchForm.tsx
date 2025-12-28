'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TIME_OPTIONS } from '@/features/shared/utils/timeOptions'
import { searchShops } from '../utils/searchShops'
import { validateSearchForm } from '../utils/validateSearchForm'
import type { Shop } from '../types'

interface SearchFormProps {
  onSearch: (
    results: Shop[],
    page: number,
    total: number,
    searchParams?: { shopName?: string; date?: string; time?: string }
  ) => void
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [shopName, setShopName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSearching, setIsSearching] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSearching(true)

    // バリデーション
    const validation = validateSearchForm({ shopName, date, time })
    if (!validation.isValid) {
      setErrors(validation.errors)
      setIsSearching(false)
      return
    }

    // 検索実行
    const searchParams = {
      shopName: shopName || undefined,
      date: date || undefined,
      time: time || undefined,
    }

    const result = await searchShops({
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

        {/* 日付 */}
        <div className="space-y-2">
          <Label htmlFor="date">日付</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={!!errors.date}
          />
          {errors.date && (
            <p className="text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        {/* 時間 */}
        <div className="space-y-2">
          <Label htmlFor="time">時間</Label>
          <select
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-invalid={!!errors.time}
          >
            <option value="">選択してください</option>
            {TIME_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.time && (
            <p className="text-sm text-red-600">{errors.time}</p>
          )}
        </div>
      </div>

      {/* エラーメッセージ */}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* 検索ボタン */}
      <Button type="submit" disabled={isSearching} className="w-full md:w-auto">
        {isSearching ? '検索中...' : '検索'}
      </Button>
    </form>
  )
}
