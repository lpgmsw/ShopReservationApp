import { signOut } from '@/features/auth/utils/signOut'
import { createClient } from '@/lib/supabase/client'

// Supabaseクライアントのモック
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('signOut', () => {
  const mockSignOut = jest.fn()
  const mockSupabaseClient = {
    auth: {
      signOut: mockSignOut,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  it('正常にログアウトできる', async () => {
    mockSignOut.mockResolvedValue({ error: null })

    const result = await signOut()

    expect(result.success).toBe(true)
    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('ログアウト時にエラーが発生した場合、エラーメッセージを返す', async () => {
    const error = new Error('Network error')
    mockSignOut.mockResolvedValue({ error })

    const result = await signOut()

    expect(result.success).toBe(false)
    expect(result.error).toBe('ログアウトに失敗しました')
  })

  it('予期しないエラーが発生した場合、エラーメッセージを返す', async () => {
    mockSignOut.mockRejectedValue(new Error('Unexpected error'))

    const result = await signOut()

    expect(result.success).toBe(false)
    expect(result.error).toBe('ログアウト中にエラーが発生しました')
  })
})
