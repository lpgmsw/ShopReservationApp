/**
 * Tests for ReservationList component
 */
import { render, screen } from '@testing-library/react'
import { ReservationList } from '@/features/reservation/components/ReservationList'
import type { ReservationWithUserInfo } from '@/features/reservation/types'

describe('ReservationList', () => {
  const mockReservations: ReservationWithUserInfo[] = [
    {
      id: '1',
      user_id: 'user-1',
      shop_id: 'shop-1',
      reservation_date: '2025-12-25',
      reservation_time: '14:00:00',
      reserver_name: '田中太郎',
      comment: 'よろしくお願いします',
      status: 'active',
      created_at: '2025-12-20T10:00:00Z',
      updated_at: '2025-12-20T10:00:00Z',
      user_name: 'tanaka_taro',
    },
    {
      id: '2',
      user_id: 'user-2',
      shop_id: 'shop-1',
      reservation_date: '2025-12-26',
      reservation_time: '15:30:00',
      reserver_name: '鈴木花子',
      comment: '',
      status: 'cancelled',
      created_at: '2025-12-20T11:00:00Z',
      updated_at: '2025-12-20T11:00:00Z',
      user_name: 'suzuki_hanako',
    },
  ]

  beforeAll(() => {
    // Mock current date to 2025-12-20
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-12-20T12:00:00Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should render reservation list with all data', () => {
    render(<ReservationList reservations={mockReservations} />)

    // Check table headers
    expect(screen.getByText('予約日時')).toBeInTheDocument()
    expect(screen.getByText('ユーザー名')).toBeInTheDocument()
    expect(screen.getByText('予約者名')).toBeInTheDocument()
    expect(screen.getByText('コメント')).toBeInTheDocument()
    expect(screen.getByText('ステータス')).toBeInTheDocument()

    // Check first reservation data
    expect(screen.getByText('2025-12-25 14:00')).toBeInTheDocument()
    expect(screen.getByText('tanaka_taro')).toBeInTheDocument()
    expect(screen.getByText('田中太郎')).toBeInTheDocument()
    expect(screen.getByText('よろしくお願いします')).toBeInTheDocument()
    expect(screen.getByText('受付前')).toBeInTheDocument()

    // Check second reservation data
    expect(screen.getByText('2025-12-26 15:30')).toBeInTheDocument()
    expect(screen.getByText('suzuki_hanako')).toBeInTheDocument()
    expect(screen.getByText('鈴木花子')).toBeInTheDocument()
    expect(screen.getByText('キャンセル')).toBeInTheDocument()
  })

  it('should display empty message when no reservations', () => {
    render(<ReservationList reservations={[]} />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('should highlight today reservations with yellow background', () => {
    const todayReservation: ReservationWithUserInfo = {
      id: '3',
      user_id: 'user-3',
      shop_id: 'shop-1',
      reservation_date: '2025-12-20', // Today
      reservation_time: '18:00:00',
      reserver_name: '今日太郎',
      comment: '今日の予約',
      status: 'active',
      created_at: '2025-12-19T10:00:00Z',
      updated_at: '2025-12-19T10:00:00Z',
      user_name: 'today_user',
    }

    const { container } = render(<ReservationList reservations={[todayReservation]} />)

    // Find the row for today's reservation
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(1)
    expect(rows[0]).toHaveClass('bg-yellow-100')
  })

  it('should not highlight future reservations', () => {
    const futureReservation: ReservationWithUserInfo = {
      id: '4',
      user_id: 'user-4',
      shop_id: 'shop-1',
      reservation_date: '2025-12-21', // Tomorrow
      reservation_time: '18:00:00',
      reserver_name: '明日太郎',
      comment: '明日の予約',
      status: 'active',
      created_at: '2025-12-19T10:00:00Z',
      updated_at: '2025-12-19T10:00:00Z',
      user_name: 'tomorrow_user',
    }

    const { container } = render(<ReservationList reservations={[futureReservation]} />)

    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(1)
    expect(rows[0]).not.toHaveClass('bg-yellow-100')
  })

  it('should format time without seconds', () => {
    render(<ReservationList reservations={mockReservations} />)

    // Time should be displayed as HH:MM without seconds
    expect(screen.getByText('2025-12-25 14:00')).toBeInTheDocument()
    expect(screen.getByText('2025-12-26 15:30')).toBeInTheDocument()
    expect(screen.queryByText(/14:00:00/)).not.toBeInTheDocument()
  })

  it('should display status in Japanese', () => {
    render(<ReservationList reservations={mockReservations} />)

    expect(screen.getByText('受付前')).toBeInTheDocument() // active
    expect(screen.getByText('キャンセル')).toBeInTheDocument() // cancelled
  })

  it('should display dash when comment is empty', () => {
    render(<ReservationList reservations={mockReservations} />)

    const cells = screen.getAllByRole('cell')
    const commentCell = cells.find((cell) => cell.textContent === '-')
    expect(commentCell).toBeInTheDocument()
  })

  it('should handle completed status', () => {
    const completedReservation: ReservationWithUserInfo = {
      id: '5',
      user_id: 'user-5',
      shop_id: 'shop-1',
      reservation_date: '2025-12-19',
      reservation_time: '10:00:00',
      reserver_name: '完了太郎',
      comment: '',
      status: 'completed',
      created_at: '2025-12-18T10:00:00Z',
      updated_at: '2025-12-19T10:00:00Z',
      user_name: 'completed_user',
    }

    render(<ReservationList reservations={[completedReservation]} />)

    expect(screen.getByText('完了')).toBeInTheDocument()
  })
})
