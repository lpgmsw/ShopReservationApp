import { renderHook, act } from '@testing-library/react'
import { useUserSignUp } from '@/features/auth/hooks/useUserSignUp'
import * as userAuth from '@/features/auth/utils/userAuth'

jest.mock('@/features/auth/utils/userAuth')

describe('useUserSignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return initial state', () => {
    const { result } = renderHook(() => useUserSignUp())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(typeof result.current.execute).toBe('function')
  })

  it('should handle successful sign up', async () => {
    const mockSignUpUser = jest.spyOn(userAuth, 'signUpUser')
    mockSignUpUser.mockResolvedValue({ success: true })

    const { result } = renderHook(() => useUserSignUp())

    let response
    await act(async () => {
      response = await result.current.execute({
        userName: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      })
    })

    expect(response).toEqual({ success: true })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle failed sign up', async () => {
    const mockSignUpUser = jest.spyOn(userAuth, 'signUpUser')
    mockSignUpUser.mockResolvedValue({
      success: false,
      error: 'メールアドレスは既に登録されています',
    })

    const { result } = renderHook(() => useUserSignUp())

    let response
    await act(async () => {
      response = await result.current.execute({
        userName: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      })
    })

    expect(response).toEqual({
      success: false,
      error: 'メールアドレスは既に登録されています',
    })
    expect(result.current.error).toBe('メールアドレスは既に登録されています')
    expect(result.current.isLoading).toBe(false)
  })
})
