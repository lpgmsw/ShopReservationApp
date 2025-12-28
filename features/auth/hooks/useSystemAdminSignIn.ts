import { useState } from 'react'
import { signInSystemAdmin } from '../utils/systemAdminAuth'
import type { SignInData } from '../types'

export function useSystemAdminSignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async (data: SignInData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signInSystemAdmin(data)

      if (!result.success) {
        setError(result.error || 'サインインに失敗しました')
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'サインイン中にエラーが発生しました'
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
