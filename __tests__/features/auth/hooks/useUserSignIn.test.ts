import { renderHook, act } from '@testing-library/react'
import { useUserSignIn } from '@/features/auth/hooks/useUserSignIn'
import * as userAuth from '@/features/auth/utils/userAuth'

jest.mock('@/features/auth/utils/userAuth')

describe('useUserSignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return initial state', () => {
    const { result } = renderHook(() => useUserSignIn())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(typeof result.current.execute).toBe('function')
  })

  it('should handle successful sign in', async () => {
    const mockSignInUser = jest.spyOn(userAuth, 'signInUser')
    mockSignInUser.mockResolvedValue({ success: true })

    const { result } = renderHook(() => useUserSignIn())

    let response
    await act(async () => {
      response = await result.current.execute({
        emailOrUserName: 'test@example.com',
        password: 'password123',
      })
    })

    expect(response).toEqual({ success: true })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle failed sign in', async () => {
    const mockSignInUser = jest.spyOn(userAuth, 'signInUser')
    mockSignInUser.mockResolvedValue({
      success: false,
      error: 'メールアドレスまたはパスワードが正しくありません',
    })

    const { result } = renderHook(() => useUserSignIn())

    let response
    await act(async () => {
      response = await result.current.execute({
        emailOrUserName: 'test@example.com',
        password: 'wrongpassword',
      })
    })

    expect(response).toEqual({
      success: false,
      error: 'メールアドレスまたはパスワードが正しくありません',
    })
    expect(result.current.error).toBe('メールアドレスまたはパスワードが正しくありません')
    expect(result.current.isLoading).toBe(false)
  })
})
