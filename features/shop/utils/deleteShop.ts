import { createClient } from '@/lib/supabase/client'

export interface DeleteShopResult {
  success: boolean
  error?: string
}

export async function deleteShop(shopId: string): Promise<DeleteShopResult> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopId)

    if (error) {
      console.error('Delete shop error:', error)
      return {
        success: false,
        error: '店舗の削除に失敗しました',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Unexpected error during shop deletion:', error)
    return {
      success: false,
      error: '店舗削除中にエラーが発生しました',
    }
  }
}
