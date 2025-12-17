import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import MyPage from '@/app/user/mypage/page'
import { createClient } from '@/lib/supabase/client'

// モック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
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
})
