import { updateUserInfo } from '@/features/auth/utils/userAuth'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('updateUserInfo', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase = {
      from: jest.fn(),
      auth: {
        updateUser: jest.fn(),
      },
    }
    mockCreateClient.mockReturnValue(mockSupabase)
  })

  it('should successfully update user info', async () => {
    mockSupabase.from.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }),
    })
    mockSupabase.auth.updateUser.mockResolvedValue({ error: null })

    const result = await updateUserInfo('test-user-id', {
      userName: 'newusername',
      email: 'newemail@example.com',
    })

    expect(result.success).toBe(true)
    expect(mockSupabase.from).toHaveBeenCalledWith('users')
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
      email: 'newemail@example.com',
    })
  })

  it('should return error when users table update fails', async () => {
    mockSupabase.from.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Update failed' },
        }),
      }),
    })

    const result = await updateUserInfo('test-user-id', {
      userName: 'newusername',
      email: 'newemail@example.com',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('ユーザー情報の更新に失敗しました')
  })

  it('should return error for validation failure - userName too short', async () => {
    const result = await updateUserInfo('test-user-id', {
      userName: 'ab',
      email: 'test@example.com',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('ユーザー名は3文字以上で入力してください')
  })

  it('should return error for validation failure - invalid email', async () => {
    const result = await updateUserInfo('test-user-id', {
      userName: 'validusername',
      email: 'invalid-email',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('正しいメールアドレス形式で入力してください')
  })

  it('should return error for validation failure - userName with invalid characters', async () => {
    const result = await updateUserInfo('test-user-id', {
      userName: 'invalid-user@name',
      email: 'test@example.com',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('ユーザー名は半角英数字とアンダースコアのみ使用できます')
  })

  it('should succeed even if auth email update fails', async () => {
    mockSupabase.from.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }),
    })
    mockSupabase.auth.updateUser.mockResolvedValue({
      error: { message: 'Auth update failed' },
    })

    const result = await updateUserInfo('test-user-id', {
      userName: 'newusername',
      email: 'newemail@example.com',
    })

    // Should still succeed since users table was updated
    expect(result.success).toBe(true)
  })

  it('should trim whitespace from userName and email', async () => {
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        error: null,
      }),
    })
    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    })
    mockSupabase.auth.updateUser.mockResolvedValue({ error: null })

    await updateUserInfo('test-user-id', {
      userName: '  testuser  ',
      email: '  test@example.com  ',
    })

    expect(mockUpdate).toHaveBeenCalledWith({
      user_name: 'testuser',
      email: 'test@example.com',
    })
  })
})
