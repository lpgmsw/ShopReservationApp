import { createClient } from '@/lib/supabase/client'
import { ShopData } from './validateShopData'

export interface RegisterShopResult {
  success: boolean
  error?: string
}

/**
 * 店舗情報を登録する
 * @param userId ユーザーID (auth.users.id)
 * @param shopData 店舗データ
 * @returns 登録結果
 */
export async function registerShop(
  userId: string,
  shopData: ShopData
): Promise<RegisterShopResult> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('shops')
      .insert({
        owner_id: userId,
        shop_name: shopData.shop_name,
        business_start_time: shopData.business_start_time,
        business_end_time: shopData.business_end_time,
        reservation_start_time: shopData.reservation_start_time,
        reservation_end_time: shopData.reservation_end_time,
        business_days: shopData.business_days,
        closed_days: shopData.closed_days,
      })
      .select()
      .single()

    if (error) {
      console.error('Shop registration error:', error)
      return {
        success: false,
        error: '店舗情報の登録に失敗しました',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Unexpected error during shop registration:', error)
    return {
      success: false,
      error: '店舗情報の登録中にエラーが発生しました',
    }
  }
}
