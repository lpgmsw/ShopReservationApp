import { createClient } from '@/lib/supabase/client'
import type { SearchResult, Shop } from '../types'

export interface AdminSearchParams {
  shopName?: string
  businessHoursStart?: string
  businessHoursEnd?: string
  businessDays?: string[]
  closedDays?: string[]
  page: number
  limit: number
}

export async function searchShopsForAdmin(
  params: AdminSearchParams
): Promise<SearchResult> {
  try {
    const supabase = createClient()
    const { shopName, businessHoursStart, businessHoursEnd, businessDays, closedDays, page, limit } = params

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

    // 営業開始時間検索（指定時間以前に開始する店舗）
    if (businessHoursStart) {
      query = query.lte('business_hours_start', businessHoursStart)
    }

    // 営業終了時間検索（指定時間以降に終了する店舗）
    if (businessHoursEnd) {
      query = query.gte('business_hours_end', businessHoursEnd)
    }

    // 営業日検索（指定曜日を全て含む店舗）
    if (businessDays && businessDays.length > 0) {
      query = query.contains('business_days', businessDays)
    }

    // 定休日検索（指定曜日を含まない店舗）
    // NOTE: Supabaseのnot.overlaps演算子を使用
    if (closedDays && closedDays.length > 0) {
      query = query.not('business_days', 'cs', closedDays)
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
