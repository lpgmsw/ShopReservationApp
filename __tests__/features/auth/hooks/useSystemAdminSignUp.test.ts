import { renderHook, act } from '@testing-library/react'
import { useSystemAdminSignUp } from '@/features/auth/hooks/useSystemAdminSignUp'
import * as systemAdminAuth from '@/features/auth/utils/systemAdminAuth'

jest.mock('@/features/auth/utils/systemAdminAuth')

describe('useSystemAdminSignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return initial state', () => {
    const { result } = renderHook(() => useSystemAdminSignUp())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(typeof result.current.execute).toBe('function')
  })

  it('should handle successful sign up', async () => {
    const mockSignUpSystemAdmin = jest.spyOn(systemAdminAuth, 'signUpSystemAdmin')
    mockSignUpSystemAdmin.mockResolvedValue({ success: true })

    const { result } = renderHook(() => useSystemAdminSignUp())

    let response
    await act(async () => {
      response = await result.current.execute({
        userName: 'testsystemadmin',
        email: 'systemadmin@example.com',
        password: 'password123',
      })
    })

    expect(response).toEqual({ success: true })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle failed sign up', async () => {
    const mockSignUpSystemAdmin = jest.spyOn(systemAdminAuth, 'signUpSystemAdmin')
    mockSignUpSystemAdmin.mockResolvedValue({
      success: false,
      error: 'メールアドレスは既に登録されています',
    })

    const { result } = renderHook(() => useSystemAdminSignUp())

    let response
    await act(async () => {
      response = await result.current.execute({
        userName: 'testsystemadmin',
        email: 'systemadmin@example.com',
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

  it('should handle exceptions', async () => {
    const mockSignUpSystemAdmin = jest.spyOn(systemAdminAuth, 'signUpSystemAdmin')
    mockSignUpSystemAdmin.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useSystemAdminSignUp())

    let response
    await act(async () => {
      response = await result.current.execute({
        userName: 'testsystemadmin',
        email: 'systemadmin@example.com',
        password: 'password123',
      })
    })

    expect(response?.success).toBe(false)
    expect(result.current.error).toBe('Network error')
    expect(result.current.isLoading).toBe(false)
  })
})
