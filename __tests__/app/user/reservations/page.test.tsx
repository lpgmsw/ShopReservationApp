import { render, screen, waitFor } from '@testing-library/react'
import ReservationsPage from '@/app/user/reservations/page'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

// Mock components
jest.mock('@/components/user/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}))

jest.mock('@/components/user/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}))

jest.mock('@/components/user/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

describe('Reservations Page', () => {
  const mockPush = jest.fn()
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  }

  // Helper function to mock Supabase responses
  const mockSupabaseResponses = (
    userData: any = { user_name: 'テストユーザー' },
    reservations: any[] = []
  ) => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: userData,
                error: null,
              }),
            }),
          }),
        }
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: reservations,
              error: null,
            }),
          }),
        }),
      }
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('Authentication', () => {
    it('未認証ユーザーはログインページにリダイレクトされる', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      render(<ReservationsPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/user/login')
      })
    })

    it('認証済みユーザーはページを表示できる', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
        },
        error: null,
      })

      mockSupabaseResponses()

      render(<ReservationsPage />)

      await waitFor(() => {
        expect(screen.getByText('予約履歴')).toBeInTheDocument()
      })
    })
  })

  describe('Reservation List Display', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
        },
        error: null,
      })
    })

    it('予約データが店舗情報と一緒に表示される', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          user_id: 'user-123',
          shop_id: 'shop-1',
          reservation_date: '2025-12-25',
          reservation_time: '18:00:00',
          reserver_name: '山田太郎',
          comment: '窓側の席を希望します',
          status: 'active',
          created_at: '2025-12-01T10:00:00Z',
          updated_at: '2025-12-01T10:00:00Z',
          shops: {
            id: 'shop-1',
            shop_name: 'テスト寿司',
            business_hours_start: '11:00:00',
            business_hours_end: '22:00:00',
          },
        },
      ]

      mockSupabaseResponses({ user_name: 'テストユーザー' }, mockReservations)

      render(<ReservationsPage />)

      await waitFor(() => {
        expect(screen.getByText('テスト寿司')).toBeInTheDocument()
        expect(screen.getByText(/山田太郎/)).toBeInTheDocument()
        expect(screen.getByText(/2025年12月25日/)).toBeInTheDocument()
        expect(screen.getByText(/18:00/)).toBeInTheDocument()
        expect(screen.getByText('窓側の席を希望します')).toBeInTheDocument()
      })
    })

    it('予約がない場合は空状態が表示される', async () => {
      mockSupabaseResponses()

      render(<ReservationsPage />)

      await waitFor(() => {
        expect(screen.getByText(/予約履歴がありません/)).toBeInTheDocument()
      })
    })
  })

  describe('Status Badge Display', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
        },
        error: null,
      })
    })

    it('activeステータスは緑色のバッジで表示される', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          user_id: 'user-123',
          shop_id: 'shop-1',
          reservation_date: '2025-12-25',
          reservation_time: '18:00:00',
          reserver_name: '山田太郎',
          comment: '',
          status: 'active',
          created_at: '2025-12-01T10:00:00Z',
          updated_at: '2025-12-01T10:00:00Z',
          shops: {
            id: 'shop-1',
            shop_name: 'テスト寿司',
            business_hours_start: '11:00:00',
            business_hours_end: '22:00:00',
          },
        },
      ]

      mockSupabaseResponses({ user_name: 'テストユーザー' }, mockReservations)

      render(<ReservationsPage />)

      await waitFor(() => {
        const badge = screen.getByText('予約中')
        expect(badge).toHaveClass('bg-green-100')
        expect(badge).toHaveClass('text-green-800')
      })
    })

    it('cancelledステータスは赤色のバッジで表示される', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          user_id: 'user-123',
          shop_id: 'shop-1',
          reservation_date: '2025-12-25',
          reservation_time: '18:00:00',
          reserver_name: '山田太郎',
          comment: '',
          status: 'cancelled',
          created_at: '2025-12-01T10:00:00Z',
          updated_at: '2025-12-01T10:00:00Z',
          shops: {
            id: 'shop-1',
            shop_name: 'テスト寿司',
            business_hours_start: '11:00:00',
            business_hours_end: '22:00:00',
          },
        },
      ]

      mockSupabaseResponses({ user_name: 'テストユーザー' }, mockReservations)

      render(<ReservationsPage />)

      await waitFor(() => {
        const badge = screen.getByText('キャンセル')
        expect(badge).toHaveClass('bg-red-100')
        expect(badge).toHaveClass('text-red-800')
      })
    })

    it('completedステータスはグレーのバッジで表示される', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          user_id: 'user-123',
          shop_id: 'shop-1',
          reservation_date: '2025-12-25',
          reservation_time: '18:00:00',
          reserver_name: '山田太郎',
          comment: '',
          status: 'completed',
          created_at: '2025-12-01T10:00:00Z',
          updated_at: '2025-12-01T10:00:00Z',
          shops: {
            id: 'shop-1',
            shop_name: 'テスト寿司',
            business_hours_start: '11:00:00',
            business_hours_end: '22:00:00',
          },
        },
      ]

      mockSupabaseResponses({ user_name: 'テストユーザー' }, mockReservations)

      render(<ReservationsPage />)

      await waitFor(() => {
        const badge = screen.getByText('完了')
        expect(badge).toHaveClass('bg-gray-100')
        expect(badge).toHaveClass('text-gray-800')
      })
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
        },
        error: null,
      })
    })

    it('データ取得エラー時はエラーメッセージを表示する', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { user_name: 'テストユーザー' },
                  error: null,
                }),
              }),
            }),
          }
        }
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
              }),
            }),
          }),
        }
      })

      render(<ReservationsPage />)

      await waitFor(() => {
        expect(
          screen.getByText(/予約データの取得に失敗しました/)
        ).toBeInTheDocument()
      })
    })
  })
})
