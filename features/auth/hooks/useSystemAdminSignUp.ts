import { useState } from 'react'
import { signUpSystemAdmin } from '../utils/systemAdminAuth'
import type { SignUpData } from '../types'

export function useSystemAdminSignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async (data: SignUpData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signUpSystemAdmin(data)

      if (!result.success) {
        setError(result.error || 'サインアップに失敗しました')
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'サインアップ中にエラーが発生しました'
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
