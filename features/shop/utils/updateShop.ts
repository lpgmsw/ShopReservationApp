import { createClient } from '@/lib/supabase/client'
import { ShopData } from './validateShopData'

export interface UpdateShopResult {
  success: boolean
  error?: string
}

/**
 * 店舗情報を更新する
 * @param shopId 店舗ID
 * @param shopData 店舗データ
 * @returns 更新結果
 */
export async function updateShop(
  shopId: string,
  shopData: ShopData
): Promise<UpdateShopResult> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('shops')
      .update({
        shop_name: shopData.shop_name,
        business_hours_start: shopData.business_hours_start,
        business_hours_end: shopData.business_hours_end,
        reservation_hours_start: shopData.reservation_hours_start,
        reservation_hours_end: shopData.reservation_hours_end,
        business_days: shopData.business_days,
        closed_days: shopData.closed_days,
      })
      .eq('id', shopId)

    if (error) {
      console.error('Shop update error:', JSON.stringify(error, null, 2))
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return {
        success: false,
        error: '店舗情報の更新に失敗しました',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Unexpected error during shop update:', error)
    return {
      success: false,
      error: '店舗情報の更新中にエラーが発生しました',
    }
  }
}
