import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReservationForm } from '@/features/reservation/components/ReservationForm'
import { useCreateReservation } from '@/features/reservation/hooks/useCreateReservation'
import { validateReservation } from '@/features/reservation/utils/validateReservation'
import type { Shop } from '@/features/shop-search/types'

jest.mock('@/features/reservation/hooks/useCreateReservation')
jest.mock('@/features/reservation/utils/validateReservation')

const mockUseCreateReservation = useCreateReservation as jest.MockedFunction<
  typeof useCreateReservation
>
const mockValidateReservation = validateReservation as jest.MockedFunction<
  typeof validateReservation
>

describe('ReservationForm', () => {
  const mockShop: Shop = {
    id: 'shop-123',
    owner_id: 'owner-123',
    shop_name: 'テスト店舗',
    business_hours_start: '09:00:00',
    business_hours_end: '22:00:00',
    reservation_hours_start: '10:00:00',
    reservation_hours_end: '20:00:00',
    business_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    closed_days: ['Saturday', 'Sunday'],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  const mockCreate = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCreateReservation.mockReturnValue({
      create: mockCreate,
      isLoading: false,
      error: null,
    })
    mockValidateReservation.mockReturnValue({
      isValid: true,
    })
  })

  it('should render form with all fields', () => {
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByLabelText('予約日')).toBeInTheDocument()
    expect(screen.getByLabelText('予約時刻')).toBeInTheDocument()
    expect(screen.getByLabelText('予約者名')).toBeInTheDocument()
    expect(screen.getByLabelText('コメント（任意）')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '予約する' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
  })

  it('should have step attribute of 1800 (30 minutes) for time input', () => {
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const timeInput = screen.getByLabelText('予約時刻') as HTMLInputElement
    expect(timeInput).toHaveAttribute('step', '1800')
  })

  it('should display shop reservation hours', () => {
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText(/受付時間: 10:00-20:00/)).toBeInTheDocument()
  })

  it('should successfully submit valid reservation', async () => {
    mockCreate.mockResolvedValue({ success: true })

    const user = userEvent.setup()
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('予約日'), '2025-12-25')
    await user.type(screen.getByLabelText('予約時刻'), '14:30')
    await user.type(screen.getByLabelText('予約者名'), 'テストユーザー')
    await user.type(screen.getByLabelText('コメント（任意）'), 'よろしくお願いします')

    await user.click(screen.getByRole('button', { name: '予約する' }))

    await waitFor(() => {
      expect(mockValidateReservation).toHaveBeenCalledWith({
        reservationDate: '2025-12-25',
        reservationTime: '14:30',
        shop: mockShop,
      })
    })

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith('user-123', 'shop-123', {
        reservationDate: '2025-12-25',
        reservationTime: '14:30',
        reserverName: 'テストユーザー',
        comment: 'よろしくお願いします',
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('should display validation error for empty reservationDate', async () => {
    const user = userEvent.setup()
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('予約時刻'), '14:30')
    await user.type(screen.getByLabelText('予約者名'), 'テストユーザー')
    await user.click(screen.getByRole('button', { name: '予約する' }))

    await waitFor(() => {
      expect(screen.getByText('予約日を入力してください')).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('should display validation error for empty reservationTime', async () => {
    const user = userEvent.setup()
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('予約日'), '2025-12-25')
    await user.type(screen.getByLabelText('予約者名'), 'テストユーザー')
    await user.click(screen.getByRole('button', { name: '予約する' }))

    await waitFor(() => {
      expect(screen.getByText('予約時刻を入力してください')).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('should display validation error for empty reserverName', async () => {
    const user = userEvent.setup()
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('予約日'), '2025-12-25')
    await user.type(screen.getByLabelText('予約時刻'), '14:30')
    await user.click(screen.getByRole('button', { name: '予約する' }))

    await waitFor(() => {
      expect(screen.getByText('予約者名を入力してください')).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('should display validation error for reserverName exceeding 50 characters', async () => {
    const user = userEvent.setup()
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('予約日'), '2025-12-25')
    await user.type(screen.getByLabelText('予約時刻'), '14:30')
    await user.type(screen.getByLabelText('予約者名'), 'a'.repeat(51))
    await user.click(screen.getByRole('button', { name: '予約する' }))

    await waitFor(() => {
      expect(
        screen.getByText('予約者名は50文字以内で入力してください')
      ).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('should display validation error for comment exceeding 500 characters', async () => {
    const user = userEvent.setup()
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const dateInput = screen.getByLabelText('予約日')
    const timeInput = screen.getByLabelText('予約時刻')
    const nameInput = screen.getByLabelText('予約者名')
    const commentInput = screen.getByLabelText('コメント（任意）')

    await user.type(dateInput, '2025-12-25')
    await user.type(timeInput, '14:30')
    await user.type(nameInput, 'テストユーザー')

    // Use paste for large text to avoid timeout
    await user.click(commentInput)
    await user.paste('a'.repeat(501))

    await user.click(screen.getByRole('button', { name: '予約する' }))

    await waitFor(() => {
      expect(
        screen.getByText('コメントは500文字以内で入力してください')
      ).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('should display business validation error for time outside reservation hours', async () => {
    mockValidateReservation.mockReturnValue({
      isValid: false,
      error: '予約受付時間外です（受付時間: 10:00-20:00）',
    })

    const user = userEvent.setup()
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const dateInput = screen.getByLabelText('予約日')
    const timeInput = screen.getByLabelText('予約時刻')
    const nameInput = screen.getByLabelText('予約者名')

    await user.type(dateInput, '2025-12-25')
    await user.type(timeInput, '21:00')
    await user.type(nameInput, 'テストユーザー')

    await user.click(screen.getByRole('button', { name: '予約する' }))

    await waitFor(() => {
      expect(
        screen.getByText('予約受付時間外です（受付時間: 10:00-20:00）')
      ).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('should display business validation error for past date', async () => {
    mockValidateReservation.mockReturnValue({
      isValid: false,
      error: '過去の日付は予約できません',
    })

    const user = userEvent.setup()
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const dateInput = screen.getByLabelText('予約日')
    const timeInput = screen.getByLabelText('予約時刻')
    const nameInput = screen.getByLabelText('予約者名')

    await user.type(dateInput, '2025-12-17')
    await user.type(timeInput, '14:30')
    await user.type(nameInput, 'テストユーザー')

    await user.click(screen.getByRole('button', { name: '予約する' }))

    await waitFor(() => {
      expect(screen.getByText('過去の日付は予約できません')).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('should display error from useCreateReservation hook', async () => {
    mockUseCreateReservation.mockReturnValue({
      create: mockCreate,
      isLoading: false,
      error: 'この日時は既に予約済みです',
    })

    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('この日時は既に予約済みです')).toBeInTheDocument()
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: 'キャンセル' }))

    expect(mockOnCancel).toHaveBeenCalled()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('should disable buttons while loading', async () => {
    mockUseCreateReservation.mockReturnValue({
      create: mockCreate,
      isLoading: true,
      error: null,
    })

    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByRole('button', { name: '予約中...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeDisabled()
  })

  it('should handle creation failure', async () => {
    mockCreate.mockResolvedValue({
      success: false,
      error: '予約の作成に失敗しました',
    })

    const user = userEvent.setup()
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('予約日'), '2025-12-25')
    await user.type(screen.getByLabelText('予約時刻'), '14:30')
    await user.type(screen.getByLabelText('予約者名'), 'テストユーザー')
    await user.click(screen.getByRole('button', { name: '予約する' }))

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('should allow submitting with empty comment', async () => {
    mockCreate.mockResolvedValue({ success: true })

    const user = userEvent.setup()
    render(
      <ReservationForm
        userId="user-123"
        shop={mockShop}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('予約日'), '2025-12-25')
    await user.type(screen.getByLabelText('予約時刻'), '14:30')
    await user.type(screen.getByLabelText('予約者名'), 'テストユーザー')
    await user.click(screen.getByRole('button', { name: '予約する' }))

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith('user-123', 'shop-123', {
        reservationDate: '2025-12-25',
        reservationTime: '14:30',
        reserverName: 'テストユーザー',
        comment: '',
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
  })
})
