import { render, screen, waitFor, act } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import MyPage from '@/app/user/mypage/page'
import { createClient } from '@/lib/supabase/client'

// モック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/components/user/Header', () => ({
  Header: ({ userName }: { userName: string }) => (
    <div data-testid="header">Header: {userName}</div>
  ),
}))

jest.mock('@/components/user/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

jest.mock('@/components/user/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}))

jest.mock('@/features/shop-search/components/SearchForm', () => ({
  SearchForm: () => <div data-testid="search-form">SearchForm</div>,
}))

jest.mock('@/features/shop-search/components/SearchResults', () => ({
  SearchResults: () => <div data-testid="search-results">SearchResults</div>,
}))

describe('User MyPage', () => {
  const mockPush = jest.fn()
  const mockSearchParams = {
    get: jest.fn(),
  }
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    mockSearchParams.get.mockReturnValue(null)
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('認証されていない場合はログインページへリダイレクトする', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    })

    render(<MyPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/user/login')
    })
  })

  it('認証されている場合はマイページが表示される', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { user_name: 'テストユーザー' },
            error: null,
          }),
        }),
      }),
    })

    render(<MyPage />)

    await waitFor(() => {
      expect(screen.getByTestId('header')).toHaveTextContent('テストユーザー')
    })

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('search-form')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('ユーザー情報の取得に失敗した場合はログインページへリダイレクトする', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('User not found'),
          }),
        }),
      }),
    })

    render(<MyPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/user/login')
    })
  })

  it('should display success message when updated=true query parameter is present', async () => {
    mockSearchParams.get.mockReturnValue('true')

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { user_name: 'テストユーザー' },
            error: null,
          }),
        }),
      }),
    })

    render(<MyPage />)

    await waitFor(() => {
      expect(screen.getByText('ユーザー情報を更新しました')).toBeInTheDocument()
    })
  })

  it('should auto-dismiss success message after 3 seconds', async () => {
    mockSearchParams.get.mockReturnValue('true')

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { user_name: 'テストユーザー' },
            error: null,
          }),
        }),
      }),
    })

    render(<MyPage />)

    await waitFor(() => {
      expect(screen.getByText('ユーザー情報を更新しました')).toBeInTheDocument()
    })

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    await waitFor(() => {
      expect(screen.queryByText('ユーザー情報を更新しました')).not.toBeInTheDocument()
    })
  })

  it('should not display success message when updated query parameter is not present', async () => {
    mockSearchParams.get.mockReturnValue(null)

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { user_name: 'テストユーザー' },
            error: null,
          }),
        }),
      }),
    })

    render(<MyPage />)

    await waitFor(() => {
      expect(screen.getByTestId('header')).toHaveTextContent('テストユーザー')
    })

    expect(screen.queryByText('ユーザー情報を更新しました')).not.toBeInTheDocument()
  })
})
