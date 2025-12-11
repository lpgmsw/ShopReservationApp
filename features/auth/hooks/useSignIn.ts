import { useState } from 'react'
import { signIn } from '../utils/auth'
import type { SignInData } from '../types'

export function useSignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async (data: SignInData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn(data)

      if (!result.success) {
        setError(result.error || 'ログインに失敗しました')
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ログイン中にエラーが発生しました'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    execute,
    isLoading,
    error,
  }
}
