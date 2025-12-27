import { renderHook, act } from '@testing-library/react'
import { useSystemAdminSignIn } from '@/features/auth/hooks/useSystemAdminSignIn'
import * as systemAdminAuth from '@/features/auth/utils/systemAdminAuth'

jest.mock('@/features/auth/utils/systemAdminAuth')

describe('useSystemAdminSignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return initial state', () => {
    const { result } = renderHook(() => useSystemAdminSignIn())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(typeof result.current.execute).toBe('function')
  })

  it('should handle successful sign in', async () => {
    const mockSignInSystemAdmin = jest.spyOn(systemAdminAuth, 'signInSystemAdmin')
    mockSignInSystemAdmin.mockResolvedValue({ success: true })

    const { result } = renderHook(() => useSystemAdminSignIn())

    let response
    await act(async () => {
      response = await result.current.execute({
        emailOrUserName: 'systemadmin@example.com',
        password: 'password123',
      })
    })

    expect(response).toEqual({ success: true })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle failed sign in', async () => {
    const mockSignInSystemAdmin = jest.spyOn(systemAdminAuth, 'signInSystemAdmin')
    mockSignInSystemAdmin.mockResolvedValue({
      success: false,
      error: 'メールアドレスまたはパスワードが正しくありません',
    })

    const { result } = renderHook(() => useSystemAdminSignIn())

    let response
    await act(async () => {
      response = await result.current.execute({
        emailOrUserName: 'systemadmin@example.com',
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

  it('should handle exceptions', async () => {
    const mockSignInSystemAdmin = jest.spyOn(systemAdminAuth, 'signInSystemAdmin')
    mockSignInSystemAdmin.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useSystemAdminSignIn())

    let response
    await act(async () => {
      response = await result.current.execute({
        emailOrUserName: 'systemadmin@example.com',
        password: 'password123',
      })
    })

    expect(response?.success).toBe(false)
    expect(result.current.error).toBe('Network error')
    expect(result.current.isLoading).toBe(false)
  })
})
