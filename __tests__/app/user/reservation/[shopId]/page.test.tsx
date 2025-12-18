import { render, screen, waitFor } from '@testing-library/react'
import { useRouter, useParams } from 'next/navigation'
import ReservationPage from '@/app/user/reservation/[shopId]/page'
import { createClient } from '@/lib/supabase/client'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/features/reservation/components/ReservationForm', () => ({
  ReservationForm: ({
    onSuccess,
    onCancel,
  }: {
    onSuccess: () => void
    onCancel: () => void
  }) => (
    <div data-testid="reservation-form">
      <button onClick={onSuccess}>Success</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}))

describe('ReservationPage', () => {
  const mockPush = jest.fn()
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(useParams as jest.Mock).mockReturnValue({
      shopId: 'shop-123',
    })
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('should redirect to login if not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    })

    render(<ReservationPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/user/login')
    })
  })

  it('should display reservation form for authenticated user', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const mockUserData = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { user_name: 'テストユーザー' },
        error: null,
      }),
    }

    const mockShopData = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'shop-123',
          shop_name: 'テスト店舗',
          reservation_hours_start: '10:00:00',
          reservation_hours_end: '20:00:00',
        },
        error: null,
      }),
    }

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') return mockUserData
      if (table === 'shops') return mockShopData
      return {}
    })

    render(<ReservationPage />)

    await waitFor(() => {
      expect(screen.getByTestId('reservation-form')).toBeInTheDocument()
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('users')
    expect(mockSupabase.from).toHaveBeenCalledWith('shops')
  })

  it('should redirect to login if user data fetch fails', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('User not found'),
      }),
    })

    render(<ReservationPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/user/login')
    })
  })

  it('should display error if shop not found', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const mockUserData = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { user_name: 'テストユーザー' },
        error: null,
      }),
    }

    const mockShopData = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Shop not found'),
      }),
    }

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') return mockUserData
      if (table === 'shops') return mockShopData
      return {}
    })

    render(<ReservationPage />)

    await waitFor(() => {
      expect(screen.getByText('店舗情報が見つかりませんでした')).toBeInTheDocument()
    })
  })

  it('should navigate to mypage with reserved=true on success', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const mockUserData = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { user_name: 'テストユーザー' },
        error: null,
      }),
    }

    const mockShopData = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'shop-123',
          shop_name: 'テスト店舗',
          reservation_hours_start: '10:00:00',
          reservation_hours_end: '20:00:00',
        },
        error: null,
      }),
    }

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') return mockUserData
      if (table === 'shops') return mockShopData
      return {}
    })

    render(<ReservationPage />)

    await waitFor(() => {
      expect(screen.getByTestId('reservation-form')).toBeInTheDocument()
    })

    const successButton = screen.getByRole('button', { name: 'Success' })
    successButton.click()

    expect(mockPush).toHaveBeenCalledWith('/user/mypage?reserved=true')
  })

  it('should navigate to mypage on cancel', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const mockUserData = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { user_name: 'テストユーザー' },
        error: null,
      }),
    }

    const mockShopData = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'shop-123',
          shop_name: 'テスト店舗',
          reservation_hours_start: '10:00:00',
          reservation_hours_end: '20:00:00',
        },
        error: null,
      }),
    }

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') return mockUserData
      if (table === 'shops') return mockShopData
      return {}
    })

    render(<ReservationPage />)

    await waitFor(() => {
      expect(screen.getByTestId('reservation-form')).toBeInTheDocument()
    })

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    cancelButton.click()

    expect(mockPush).toHaveBeenCalledWith('/user/mypage')
  })

  it('should show loading state initially', () => {
    mockSupabase.auth.getUser.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<ReservationPage />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })
})
