import { signUpUser, signInUser } from '@/features/auth/utils/userAuth'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('User Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signUpUser', () => {
    it('should return success when user sign up is successful', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert })

      mockCreateClient.mockReturnValue({
        auth: { signUp: mockSignUp },
        from: mockFrom,
      } as any)

      const mockData = {
        userName: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      }

      const result = await signUpUser(mockData)
      expect(result.success).toBe(true)
    })

    it('should handle validation errors', async () => {
      const mockData = {
        userName: 'ab', // too short
        email: 'test@example.com',
        password: 'password123',
      }

      const result = await signUpUser(mockData)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('signInUser', () => {
    it('should return success when user sign in is successful', async () => {
      const mockSignInWithPassword = jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })

      mockCreateClient.mockReturnValue({
        auth: { signInWithPassword: mockSignInWithPassword },
      } as any)

      const mockData = {
        emailOrUserName: 'test@example.com',
        password: 'password123',
      }

      const result = await signInUser(mockData)
      expect(result.success).toBe(true)
    })

    it('should handle validation errors', async () => {
      const mockData = {
        emailOrUserName: '', // empty
        password: 'password123',
      }

      const result = await signInUser(mockData)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
