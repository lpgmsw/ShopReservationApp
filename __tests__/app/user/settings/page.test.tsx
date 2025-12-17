import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import UserSettingsPage from '@/app/user/settings/page'
import { createClient } from '@/lib/supabase/client'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/components/user/Header', () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}))

jest.mock('@/components/user/Footer', () => ({
  Footer: () => <div data-testid="mock-footer">Footer</div>,
}))

jest.mock('@/components/user/Sidebar', () => ({
  Sidebar: () => <div data-testid="mock-sidebar">Sidebar</div>,
}))

jest.mock('@/features/auth/components/UserSettingsForm', () => ({
  UserSettingsForm: ({ userId, defaultValues, onSuccess, onCancel }: any) => (
    <div data-testid="mock-settings-form">
      <p>UserId: {userId}</p>
      <p>UserName: {defaultValues.userName}</p>
      <p>Email: {defaultValues.email}</p>
      <button onClick={onSuccess}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('UserSettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any)
  })

  it('should redirect to login if not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    }
    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(<UserSettingsPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/user/login')
    })
  })

  it('should display loading state initially', () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_name: 'testuser', email: 'test@example.com' },
              error: null,
            }),
          }),
        }),
      }),
    }
    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(<UserSettingsPage />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('should render the settings form with user data', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_name: 'testuser', email: 'test@example.com' },
              error: null,
            }),
          }),
        }),
      }),
    }
    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(<UserSettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('mock-settings-form')).toBeInTheDocument()
    })

    expect(screen.getByText('UserId: test-user-id')).toBeInTheDocument()
    expect(screen.getByText('UserName: testuser')).toBeInTheDocument()
    expect(screen.getByText('Email: test@example.com')).toBeInTheDocument()
  })

  it('should redirect to mypage with updated=true on success', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_name: 'testuser', email: 'test@example.com' },
              error: null,
            }),
          }),
        }),
      }),
    }
    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(<UserSettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('mock-settings-form')).toBeInTheDocument()
    })

    const saveButton = screen.getByText('Save')
    saveButton.click()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/user/mypage?updated=true')
    })
  })

  it('should redirect to mypage on cancel', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { user_name: 'testuser', email: 'test@example.com' },
              error: null,
            }),
          }),
        }),
      }),
    }
    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(<UserSettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('mock-settings-form')).toBeInTheDocument()
    })

    const cancelButton = screen.getByText('Cancel')
    cancelButton.click()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/user/mypage')
    })
  })

  it('should redirect to mypage if user data fetch fails', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'User not found' },
            }),
          }),
        }),
      }),
    }
    mockCreateClient.mockReturnValue(mockSupabase as any)

    render(<UserSettingsPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/user/mypage')
    })
  })
})
