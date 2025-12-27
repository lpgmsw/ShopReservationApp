import { signUpSystemAdmin, signInSystemAdmin } from '@/features/auth/utils/systemAdminAuth'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('System Admin Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signUpSystemAdmin', () => {
    it('should return success when system admin sign up is successful', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({
        data: { user: { id: 'test-system-admin-id' } },
        error: null,
      })
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert })

      mockCreateClient.mockReturnValue({
        auth: { signUp: mockSignUp },
        from: mockFrom,
      } as any)

      const mockData = {
        userName: 'testsystemadmin',
        email: 'systemadmin@example.com',
        password: 'password123',
      }

      const result = await signUpSystemAdmin(mockData)
      expect(result.success).toBe(true)

      // Verify that the user was created with role 'system_admin'
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'system_admin',
          user_name: 'testsystemadmin',
          email: 'systemadmin@example.com',
        })
      )
    })

    it('should handle validation errors', async () => {
      const mockData = {
        userName: 'ab', // too short
        email: 'systemadmin@example.com',
        password: 'password123',
      }

      const result = await signUpSystemAdmin(mockData)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle duplicate email errors', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      })

      mockCreateClient.mockReturnValue({
        auth: { signUp: mockSignUp },
      } as any)

      const mockData = {
        userName: 'testsystemadmin',
        email: 'systemadmin@example.com',
        password: 'password123',
      }

      const result = await signUpSystemAdmin(mockData)
      expect(result.success).toBe(false)
      expect(result.error).toContain('既に登録されています')
    })
  })

  describe('signInSystemAdmin', () => {
    it('should return success when system admin sign in is successful', async () => {
      const mockSignInWithPassword = jest.fn().mockResolvedValue({
        data: { user: { id: 'test-system-admin-id' } },
        error: null,
      })

      mockCreateClient.mockReturnValue({
        auth: { signInWithPassword: mockSignInWithPassword },
      } as any)

      const mockData = {
        emailOrUserName: 'systemadmin@example.com',
        password: 'password123',
      }

      const result = await signInSystemAdmin(mockData)
      expect(result.success).toBe(true)
    })

    it('should handle validation errors', async () => {
      const mockData = {
        emailOrUserName: '', // empty
        password: 'password123',
      }

      const result = await signInSystemAdmin(mockData)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle incorrect credentials', async () => {
      const mockSignInWithPassword = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      })

      mockCreateClient.mockReturnValue({
        auth: { signInWithPassword: mockSignInWithPassword },
      } as any)

      const mockData = {
        emailOrUserName: 'systemadmin@example.com',
        password: 'wrongpassword',
      }

      const result = await signInSystemAdmin(mockData)
      expect(result.success).toBe(false)
      expect(result.error).toContain('正しくありません')
    })

    it('should only support email login (not username)', async () => {
      const mockData = {
        emailOrUserName: 'testsystemadmin', // username without @
        password: 'password123',
      }

      const result = await signInSystemAdmin(mockData)
      expect(result.success).toBe(false)
      expect(result.error).toContain('メールアドレスでのログインのみサポート')
    })
  })
})
