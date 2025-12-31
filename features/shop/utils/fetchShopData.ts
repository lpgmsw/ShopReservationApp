import { createClient } from '@/lib/supabase/client'
import { ShopData } from './validateShopData'

export interface FetchShopDataResult {
  success: boolean
  data?: ShopData & { id: string }
  error?: string
}

/**
 * ユーザーの店舗情報を取得する
 * @param userId ユーザーID (auth.users.id)
 * @returns 取得結果
 */
export async function fetchShopData(
  userId: string
): Promise<FetchShopDataResult> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', userId)
      .single()

    if (error) {
      // レコードが存在しない場合は正常系として扱う
      if (error.code === 'PGRST116') {
        return {
          success: true,
          data: undefined,
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
        success: true,
        data: undefined,
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
        max_reservations_per_slot: data.max_reservations_per_slot || 1,
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
