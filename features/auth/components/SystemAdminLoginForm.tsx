'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInSchema, type SignInInput } from '../utils/validation'
import { useSystemAdminSignIn } from '../hooks/useSystemAdminSignIn'

interface SystemAdminLoginFormProps {
  onSuccess: () => void
  onSwitchToSignUp?: () => void
}

export function SystemAdminLoginForm({ onSuccess, onSwitchToSignUp }: SystemAdminLoginFormProps) {
  const { execute, isLoading, error: submitError } = useSystemAdminSignIn()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInInput) => {
    const result = await execute(data)

    if (result.success) {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="emailOrUserName">ユーザー名またはメールアドレス</Label>
        <Input
          id="emailOrUserName"
          type="text"
          placeholder="ユーザー名またはメールアドレス"
          {...register('emailOrUserName')}
          aria-invalid={errors.emailOrUserName ? 'true' : 'false'}
          aria-describedby={errors.emailOrUserName ? 'emailOrUserName-error' : undefined}
        />
        {errors.emailOrUserName && (
          <p id="emailOrUserName-error" className="text-sm text-destructive" role="alert">
            {errors.emailOrUserName.message}
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
        {isLoading ? 'ログイン中...' : 'ログイン'}
      </Button>

      {onSwitchToSignUp && (
        <div className="text-center text-sm">
          <span className="text-muted-foreground">アカウントをお持ちでない方は </span>
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-primary hover:underline"
          >
            新規登録
          </button>
        </div>
      )}
    </form>
  )
}
