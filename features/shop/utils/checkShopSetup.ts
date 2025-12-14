import { createClient } from '@/lib/supabase/client'

/**
 * 店舗設定チェック
 * 指定されたユーザーIDの店舗管理者が店舗を設定済みかチェックする
 *
 * @param userId - チェック対象のユーザーID (auth.users.id)
 * @returns 店舗設定済みの場合true、未設定の場合false
 */
export async function checkShopSetup(userId: string): Promise<boolean> {
  try {
    // ユーザーIDが空の場合はfalseを返す
    if (!userId) {
      return false
    }

    const supabase = createClient()

    // shopsテーブルからowner_idでクエリ
    const { data, error } = await supabase
      .from('shops')
      .select('id, shop_name')
      .eq('owner_id', userId)
      .single()

    // データが存在すれば店舗設定済み
    if (data && !error) {
      return true
    }

    // データが存在しない、またはエラーの場合は未設定
    return false
  } catch (error) {
    console.error('Unexpected error during shop setup check:', error)
    return false
  }
}
