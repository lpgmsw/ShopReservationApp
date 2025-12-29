import { createClient } from '@/lib/supabase/client'
import { ShopData } from './validateShopData'

export interface FetchShopByIdResult {
  success: boolean
  data?: ShopData & { id: string }
  error?: string
}

/**
 * 店舗IDから店舗情報を取得する
 * @param shopId 店舗ID
 * @returns 取得結果
 */
export async function fetchShopById(
  shopId: string
): Promise<FetchShopByIdResult> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single()

    if (error) {
      // レコードが存在しない場合
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: '店舗が見つかりませんでした',
        }
      }

      console.error('Shop data fetch error:', JSON.stringify(error, null, 2))
      return {
        success: false,
        error: '店舗情報の取得に失敗しました',
      }
    }

    if (!data) {
      return {
        success: false,
        error: '店舗が見つかりませんでした',
      }
    }

    return {
      success: true,
      data: {
        id: data.id,
        shop_name: data.shop_name,
        business_hours_start: data.business_hours_start,
        business_hours_end: data.business_hours_end,
        reservation_hours_start: data.reservation_hours_start,
        reservation_hours_end: data.reservation_hours_end,
        business_days: data.business_days,
        closed_days: data.closed_days,
      },
    }
  } catch (error) {
    console.error('Unexpected error during shop data fetch:', error)
    return {
      success: false,
      error: '店舗情報の取得中にエラーが発生しました',
    }
  }
}
