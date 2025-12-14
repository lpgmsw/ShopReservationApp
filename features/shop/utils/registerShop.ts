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
        business_hours_start: shopData.business_hours_start,
        business_hours_end: shopData.business_hours_end,
        reservation_hours_start: shopData.reservation_hours_start,
        reservation_hours_end: shopData.reservation_hours_end,
        business_days: shopData.business_days,
        closed_days: shopData.closed_days,
      })
      .select()
      .single()

    if (error) {
      console.error('Shop registration error:', JSON.stringify(error, null, 2))
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
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
