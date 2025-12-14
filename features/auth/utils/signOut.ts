import { createClient } from '@/lib/supabase/client'
import { AuthResult } from '../types'

/**
 * ログアウト処理
 * Supabase Authからサインアウトする
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out error:', error)
      return {
        success: false,
        error: 'ログアウトに失敗しました',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Unexpected error during sign out:', error)
    return {
      success: false,
      error: 'ログアウト中にエラーが発生しました',
    }
  }
}
