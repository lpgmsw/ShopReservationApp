'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpSchema, type SignUpInput } from '../utils/validation'
import { useSystemAdminSignUp } from '../hooks/useSystemAdminSignUp'

interface SystemAdminSignUpFormProps {
  onSuccess: () => void
  onSwitchToLogin?: () => void
}

export function SystemAdminSignUpForm({ onSuccess, onSwitchToLogin }: SystemAdminSignUpFormProps) {
  const { execute, isLoading, error: submitError } = useSystemAdminSignUp()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpInput) => {
    const result = await execute(data)

    if (result.success) {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="userName">ユーザー名</Label>
        <Input
          id="userName"
          type="text"
          placeholder="ユーザー名を入力"
          {...register('userName')}
          aria-invalid={errors.userName ? 'true' : 'false'}
          aria-describedby={errors.userName ? 'userName-error' : undefined}
        />
        {errors.userName && (
          <p id="userName-error" className="text-sm text-destructive" role="alert">
            {errors.userName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          type="password"
          placeholder="パスワードを入力"
          {...register('password')}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {submitError && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md" role="alert">
          {submitError}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? '登録中...' : '登録'}
      </Button>

      {onSwitchToLogin && (
        <div className="text-center text-sm">
          <span className="text-muted-foreground">すでにアカウントをお持ちですか？ </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline"
          >
            ログイン
          </button>
        </div>
      )}
    </form>
  )
}
