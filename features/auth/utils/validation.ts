import { z } from 'zod'

export const signUpSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(3, 'ユーザー名は3文字以上で入力してください')
    .max(50, 'ユーザー名は50文字以内で入力してください')
    .regex(/^[a-zA-Z0-9_]+$/, 'ユーザー名は半角英数字とアンダースコアのみ使用できます'),
  email: z
    .string()
    .trim()
    .min(1, 'メールアドレスを入力してください')
    .email('正しいメールアドレス形式で入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .max(100, 'パスワードは100文字以内で入力してください'),
})

export const signInSchema = z.object({
  emailOrUserName: z
    .string()
    .min(1, 'メールアドレスまたはユーザー名を入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください'),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
