import { render, screen } from '@testing-library/react'
import ReservationsPage from '@/app/shop-admin/reservations/page'
import { useRouter } from 'next/navigation'

// next/navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Supabaseクライアントのモック
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  })),
}))

// Header, Footerのモック
jest.mock('@/components/shop-admin/Header', () => ({
  Header: ({ userName }: { userName: string }) => <div>Header: {userName}</div>,
}))

jest.mock('@/components/shop-admin/Footer', () => ({
  Footer: () => <div>Footer</div>,
}))

// checkShopSetupのモック
jest.mock('@/features/shop/utils/checkShopSetup', () => ({
  checkShopSetup: jest.fn(),
}))

import { createClient } from '@/lib/supabase/client'
import { checkShopSetup } from '@/features/shop/utils/checkShopSetup'

describe('ReservationsPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  })

  it('ローディング中は何も表示されない', () => {
    const mockGetUser = jest.fn(() => new Promise(() => {})) // 永遠に解決しないPromise
    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
    })

    render(<ReservationsPage />)

    // ローディング状態なので特定の要素は表示されない
    expect(screen.queryByText(/Header:/)).not.toBeInTheDocument()
  })

  it('認証されていない場合、ログイン画面にリダイレクトする', async () => {
    const mockGetUser = jest.fn(() => Promise.resolve({ data: { user: null }, error: null }))
    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
    })

    render(<ReservationsPage />)

    // 非同期処理の完了を待つ
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockPush).toHaveBeenCalledWith('/shop-admin/login')
  })

  it('店舗未設定の場合、設定を促すメッセージとボタンが表示される', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
    }
    const mockUserData = {
      user_name: 'テストユーザー',
    }

    const mockGetUser = jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null }))
    const mockSelect = jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: mockUserData, error: null })),
      })),
    }))
    const mockFrom = jest.fn(() => ({
      select: mockSelect,
    }))

    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    })
    ;(checkShopSetup as jest.Mock).mockResolvedValue(false)

    render(<ReservationsPage />)

    // 非同期処理の完了を待つ
    await screen.findByText(/店舗設定がまだ完了していません/)

    expect(screen.getByText(/店舗設定がまだ完了していません/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /店舗設定へ/ })).toBeInTheDocument()
  })

  it('店舗設定済みの場合、予約一覧が表示される', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
    }
    const mockUserData = {
      user_name: 'テストユーザー',
    }

    const mockGetUser = jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null }))
    const mockSelect = jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: mockUserData, error: null })),
      })),
    }))
    const mockFrom = jest.fn(() => ({
      select: mockSelect,
    }))

    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    })
    ;(checkShopSetup as jest.Mock).mockResolvedValue(true)

    render(<ReservationsPage />)

    // 非同期処理の完了を待つ
    await screen.findByText(/予約一覧/)

    expect(screen.getByText(/予約一覧/)).toBeInTheDocument()
  })
})
