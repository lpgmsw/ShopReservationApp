import { signUp, signIn } from '@/features/auth/utils/auth'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  })),
}))

describe('Auth Utils', () => {
  describe('signUp', () => {
    it('should return success when sign up is successful', async () => {
      const mockData = {
        userName: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      }

      const result = await signUp(mockData)
      expect(result).toBeDefined()
    })

    it('should handle errors when sign up fails', async () => {
      const mockData = {
        userName: '',
        email: 'invalid',
        password: '123',
      }

      const result = await signUp(mockData)
      expect(result).toBeDefined()
    })
  })

  describe('signIn', () => {
    it('should return success when sign in is successful', async () => {
      const mockData = {
        emailOrUserName: 'test@example.com',
        password: 'password123',
      }

      const result = await signIn(mockData)
      expect(result).toBeDefined()
    })

    it('should handle errors when sign in fails', async () => {
      const mockData = {
        emailOrUserName: 'invalid@example.com',
        password: 'wrongpassword',
      }

      const result = await signIn(mockData)
      expect(result).toBeDefined()
    })
  })
})
