import { useState } from 'react'
import { signInUser } from '../utils/userAuth'
import type { SignInData } from '../types'

export function useUserSignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async (data: SignInData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signInUser(data)

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
