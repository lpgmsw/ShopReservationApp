import { createClient } from '@/lib/supabase/client'
import type { SearchParams, SearchResult, Shop } from '../types'
import { WEEKDAY_MAP } from '@/features/shared/constants/weekdays'

export async function searchShops(params: SearchParams): Promise<SearchResult> {
  try {
    const supabase = createClient()
    const { shopName, date, time, page, limit } = params

    // ページネーション計算
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('shops')
      .select('*', { count: 'exact' })

    // 店舗名検索（部分一致）
    if (shopName) {
      query = query.ilike('shop_name', `%${shopName}%`)
    }

    // 時間検索（予約受付時間内）
    if (time) {
      query = query.lte('reservation_hours_start', time)
      query = query.gte('reservation_hours_end', time)
    }

    // 日付による営業日フィルタリング（データベース側）
    // NOTE: Supabaseのarray型に対するcontains演算子を使用
    if (date) {
      const dateObj = new Date(date)
      const dayOfWeek = WEEKDAY_MAP[dateObj.getDay()]
      query = query.contains('business_days', [dayOfWeek])
    }

    // ページネーション適用
    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Shop search error:', error)
      return {
        success: false,
        error: '店舗の検索に失敗しました',
      }
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return {
      success: true,
      data: (data || []) as Shop[],
      total: totalCount,
      totalPages,
    }
  } catch (error) {
    console.error('Unexpected error during shop search:', error)
    return {
      success: false,
      error: '店舗検索中にエラーが発生しました',
    }
  }
}
