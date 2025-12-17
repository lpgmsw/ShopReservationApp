'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { userSettingsSchema, type UserSettingsInput } from '../utils/validation'
import { useState } from 'react'
import { updateUserInfo } from '../utils/userAuth'

interface UserSettingsFormProps {
  userId: string
  defaultValues: UserSettingsInput
  onSuccess: () => void
  onCancel: () => void
}

export function UserSettingsForm({
  userId,
  defaultValues,
  onSuccess,
  onCancel,
}: UserSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSettingsInput>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues,
  })

  const onSubmit = async (data: UserSettingsInput) => {
    setIsLoading(true)
    setSubmitError(null)

    const result = await updateUserInfo(userId, data)

    setIsLoading(false)

    if (result.success) {
      onSuccess()
    } else {
      setSubmitError(result.error || 'ユーザー情報の更新に失敗しました')
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

      {submitError && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md" role="alert">
          {submitError}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          キャンセル
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  )
}
