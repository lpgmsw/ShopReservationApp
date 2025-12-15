import { createClient } from '@/lib/supabase/client'
import { SignUpData, SignInData, AuthResult } from '../types'
import { signUpSchema, signInSchema } from './validation'
import { AuthenticationError, ConflictError, ValidationError } from '@/lib/errors'

/**
 * ユーザーのサインアップ
 * 1. Supabase Authでユーザー作成
 * 2. usersテーブルにプロファイル情報を挿入
 */
export async function signUpUser(data: SignUpData): Promise<AuthResult> {
  try {
    // バリデーション
    const validated = signUpSchema.parse(data)

    const supabase = createClient()

    // 1. Supabase Authでユーザー作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new ConflictError('このメールアドレスは既に登録されています')
      }
      throw new AuthenticationError(authError.message)
    }

    if (!authData.user) {
      throw new AuthenticationError('ユーザーの作成に失敗しました')
    }

    // 2. usersテーブルにプロファイル情報を挿入
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        role: 'user',
        user_name: validated.userName,
        email: validated.email,
        full_name: '', // 初期値は空文字（後でプロフィール編集画面で入力）
      })

    if (profileError) {
      // プロファイル作成失敗時は認証ユーザーも削除すべきだが、
      // Supabase Authの削除はサーバーサイドが必要なので、エラーログを出力
      console.error('Profile creation failed:', profileError)
      throw new AuthenticationError('ユーザープロファイルの作成に失敗しました')
    }

    return {
      success: true,
    }
  } catch (error: any) {
    // Zodのバリデーションエラー
    if (error.name === 'ZodError') {
      return {
        success: false,
        error: error.errors[0]?.message || 'バリデーションエラーが発生しました',
      }
    }
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      }
    }
    if (error instanceof ConflictError || error instanceof AuthenticationError) {
      return {
        success: false,
        error: error.message,
      }
    }
    // 予期しないエラー
    console.error('Unexpected error during user sign up:', error)
    return {
      success: false,
      error: 'サインアップ中にエラーが発生しました',
    }
  }
}

/**
 * ユーザーのサインイン
 * メールアドレスでログイン（ユーザー名は今後実装）
 */
export async function signInUser(data: SignInData): Promise<AuthResult> {
  try {
    // バリデーション
    const validated = signInSchema.parse(data)

    const supabase = createClient()

    // メールアドレス形式かチェック
    const isEmail = validated.emailOrUserName.includes('@')

    if (!isEmail) {
      // ユーザー名の場合の処理
      // 注: 現在の実装ではメールアドレスのみサポート
      // ユーザー名でのログインは今後のServer Action実装で対応
      return {
        success: false,
        error: '現在メールアドレスでのログインのみサポートしています',
      }
    }

    // サインイン
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: validated.emailOrUserName,
      password: validated.password,
    })

    if (signInError) {
      throw new AuthenticationError('メールアドレスまたはパスワードが正しくありません')
    }

    return {
      success: true,
    }
  } catch (error: any) {
    // Zodのバリデーションエラー
    if (error.name === 'ZodError') {
      return {
        success: false,
        error: error.errors[0]?.message || 'バリデーションエラーが発生しました',
      }
    }
    if (error instanceof ValidationError || error instanceof AuthenticationError) {
      return {
        success: false,
        error: error.message,
      }
    }
    // 予期しないエラー
    console.error('Unexpected error during user sign in:', error)
    return {
      success: false,
      error: 'ログイン中にエラーが発生しました',
    }
  }
}
