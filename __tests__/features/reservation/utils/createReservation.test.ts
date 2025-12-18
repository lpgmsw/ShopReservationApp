import { createReservation } from '@/features/reservation/utils/createReservation'
import { createClient } from '@/lib/supabase/client'
import type { ReservationFormInput } from '@/features/reservation/types'

jest.mock('@/lib/supabase/client')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('createReservation', () => {
  const mockSupabase = {
    from: jest.fn(),
  }

  const userId = 'user-123'
  const shopId = 'shop-456'
  const formData: ReservationFormInput = {
    reservationDate: '2025-12-25',
    reservationTime: '14:30',
    reserverName: 'テストユーザー',
    comment: 'よろしくお願いします',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  it('should successfully create a reservation', async () => {
    const mockInsert = jest.fn().mockResolvedValue({
      data: {
        id: 'reservation-123',
        user_id: userId,
        shop_id: shopId,
        reservation_date: '2025-12-25',
        reservation_time: '14:30:00',
        reserver_name: 'テストユーザー',
        comment: 'よろしくお願いします',
        status: 'active',
        created_at: '2025-12-18T00:00:00Z',
        updated_at: '2025-12-18T00:00:00Z',
      },
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    } as any)

    const result = await createReservation(userId, shopId, formData)

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('reservations')
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: userId,
      shop_id: shopId,
      reservation_date: '2025-12-25',
      reservation_time: '14:30:00',
      reserver_name: 'テストユーザー',
      comment: 'よろしくお願いします',
      status: 'active',
    })
  })

  it('should convert time from HH:MM to HH:MM:SS format', async () => {
    const mockInsert = jest.fn().mockResolvedValue({
      data: {},
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    } as any)

    await createReservation(userId, shopId, formData)

    const insertCall = mockInsert.mock.calls[0][0]
    expect(insertCall.reservation_time).toBe('14:30:00')
  })

  it('should handle empty comment with default value', async () => {
    const mockInsert = jest.fn().mockResolvedValue({
      data: {},
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    } as any)

    const dataWithoutComment: ReservationFormInput = {
      ...formData,
      comment: '',
    }

    await createReservation(userId, shopId, dataWithoutComment)

    const insertCall = mockInsert.mock.calls[0][0]
    expect(insertCall.comment).toBe('')
  })

  it('should detect duplicate reservation (UNIQUE constraint violation)', async () => {
    const mockInsert = jest.fn().mockResolvedValue({
      data: null,
      error: {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      },
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    } as any)

    const result = await createReservation(userId, shopId, formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('この日時は既に予約済みです')
  })

  it('should handle generic database errors', async () => {
    const mockInsert = jest.fn().mockResolvedValue({
      data: null,
      error: {
        code: '42P01',
        message: 'relation "reservations" does not exist',
      },
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    } as any)

    const result = await createReservation(userId, shopId, formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('予約の作成に失敗しました')
  })

  it('should handle network errors', async () => {
    const mockInsert = jest.fn().mockRejectedValue(new Error('Network error'))

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    } as any)

    const result = await createReservation(userId, shopId, formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('予約の作成に失敗しました')
  })

  it('should set status to active by default', async () => {
    const mockInsert = jest.fn().mockResolvedValue({
      data: {},
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    } as any)

    await createReservation(userId, shopId, formData)

    const insertCall = mockInsert.mock.calls[0][0]
    expect(insertCall.status).toBe('active')
  })

  it('should handle special characters in reserver name', async () => {
    const mockInsert = jest.fn().mockResolvedValue({
      data: {},
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    } as any)

    const specialData: ReservationFormInput = {
      ...formData,
      reserverName: '山田 太郎（やまだ たろう）',
    }

    const result = await createReservation(userId, shopId, specialData)

    expect(result.success).toBe(true)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        reserver_name: '山田 太郎（やまだ たろう）',
      })
    )
  })

  it('should handle maximum length comment (500 characters)', async () => {
    const mockInsert = jest.fn().mockResolvedValue({
      data: {},
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    } as any)

    const longCommentData: ReservationFormInput = {
      ...formData,
      comment: 'a'.repeat(500),
    }

    const result = await createReservation(userId, shopId, longCommentData)

    expect(result.success).toBe(true)
  })
})
