import { z } from 'zod'

// 共通のユーザ名バリデーション
export const userNameSchema = z
  .string()
  .trim()
  .min(3, 'ユーザー名は3文字以上で入力してください')
  .max(50, 'ユーザー名は50文字以内で入力してください')
  .regex(/^[a-zA-Z0-9_]+$/, 'ユーザー名は半角英数字とアンダースコアのみ使用できます')

// 共通のメールアドレスバリデーション
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'メールアドレスを入力してください')
  .email('正しいメールアドレス形式で入力してください')

// 共通のユーザ情報スキーマ（ユーザ名とメールアドレス）
export const userInfoSchema = z.object({
  userName: userNameSchema,
  email: emailSchema,
})

// サインアップ用スキーマ（ユーザ情報 + パスワード）
export const signUpSchema = userInfoSchema.extend({
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .max(100, 'パスワードは100文字以内で入力してください'),
})

// サインイン用スキーマ
export const signInSchema = z.object({
  emailOrUserName: z
    .string()
    .min(1, 'メールアドレスまたはユーザー名を入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください'),
})

// ユーザ情報編集用スキーマ（ユーザ名とメールアドレスのみ）
export const userSettingsSchema = userInfoSchema

export type UserInfoInput = z.infer<typeof userInfoSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type UserSettingsInput = z.infer<typeof userSettingsSchema>
