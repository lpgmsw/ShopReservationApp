/**
 * Tests for fetchShopReservations
 */
import { fetchShopReservations } from '@/features/reservation/utils/fetchShopReservations'
import type { ReservationWithUserInfo } from '@/features/reservation/types'

describe('fetchShopReservations', () => {
  let mockSupabase: any
  let mockFrom: jest.Mock
  let mockSelect: jest.Mock
  let mockEq: jest.Mock
  let mockOrder: jest.Mock
  let mockRange: jest.Mock
  let mockCountFrom: jest.Mock
  let mockCountSelect: jest.Mock
  let mockCountEq: jest.Mock

  beforeEach(() => {
    // Mock for data query
    mockRange = jest.fn()
    const mockOrder2 = jest.fn().mockReturnValue({ range: mockRange })
    mockOrder = jest.fn().mockReturnValue({ order: mockOrder2 })
    mockEq = jest.fn().mockReturnValue({ order: mockOrder })
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq })

    // Mock for count query
    mockCountEq = jest.fn()
    mockCountSelect = jest.fn().mockReturnValue({ eq: mockCountEq })
    mockCountFrom = jest.fn()

    mockFrom = jest.fn((table) => {
      // Return different mocks based on the query context
      const selectMock = jest.fn((columns, options) => {
        if (options?.count === 'exact' && options?.head === true) {
          // This is a count query
          return mockCountSelect(columns, options)
        }
        // This is a data query
        return mockSelect(columns, options)
      })
      return { select: selectMock }
    })

    mockSupabase = {
      from: mockFrom,
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully fetch shop reservations with user info (default pagination)', async () => {
    const mockDbResponse = [
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
        users: {
          user_name: 'tanaka_taro',
        },
      },
      {
        id: '2',
        user_id: 'user-2',
        shop_id: 'shop-1',
        reservation_date: '2025-12-26',
        reservation_time: '15:30:00',
        reserver_name: '鈴木花子',
        comment: '',
        status: 'active',
        created_at: '2025-12-20T11:00:00Z',
        updated_at: '2025-12-20T11:00:00Z',
        users: {
          user_name: 'suzuki_hanako',
        },
      },
    ]

    const expectedReservations: ReservationWithUserInfo[] = [
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
        status: 'active',
        created_at: '2025-12-20T11:00:00Z',
        updated_at: '2025-12-20T11:00:00Z',
        user_name: 'suzuki_hanako',
      },
    ]

    // Mock count query
    mockCountEq.mockResolvedValue({
      count: 2,
      error: null,
    })

    // Mock data query
    mockRange.mockResolvedValue({
      data: mockDbResponse,
      error: null,
    })

    const result = await fetchShopReservations(mockSupabase, {
      shopId: '550e8400-e29b-41d4-a716-446655440000',
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(expectedReservations)
    expect(result.total).toBe(2)
    expect(result.totalPages).toBe(1)
    expect(result.currentPage).toBe(1)
    expect(result.error).toBeUndefined()
  })

  it('should handle pagination correctly', async () => {
    // Mock count query - 50 total items
    mockCountEq.mockResolvedValue({
      count: 50,
      error: null,
    })

    // Mock data query
    mockRange.mockResolvedValue({
      data: [],
      error: null,
    })

    const result = await fetchShopReservations(mockSupabase, {
      shopId: '550e8400-e29b-41d4-a716-446655440000',
      page: 2,
      limit: 20,
    })

    expect(result.success).toBe(true)
    expect(result.total).toBe(50)
    expect(result.totalPages).toBe(3) // 50 / 20 = 2.5 -> 3 pages
    expect(result.currentPage).toBe(2)

    // Verify range was called with correct offset
    expect(mockRange).toHaveBeenCalledWith(20, 39) // page 2, limit 20: offset=20, end=39
  })

  it('should return empty array when no reservations exist', async () => {
    mockCountEq.mockResolvedValue({
      count: 0,
      error: null,
    })

    mockRange.mockResolvedValue({
      data: [],
      error: null,
    })

    const result = await fetchShopReservations(mockSupabase, {
      shopId: '550e8400-e29b-41d4-a716-446655440000',
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
    expect(result.total).toBe(0)
    expect(result.totalPages).toBe(0)
  })

  it('should reject invalid shop ID', async () => {
    const result = await fetchShopReservations(mockSupabase, {
      shopId: 'invalid-id',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('不正な店舗IDです')
  })

  it('should reject invalid page number', async () => {
    const result = await fetchShopReservations(mockSupabase, {
      shopId: '550e8400-e29b-41d4-a716-446655440000',
      page: 0,
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('ページ番号は1以上である必要があります')
  })

  it('should reject invalid limit', async () => {
    const result = await fetchShopReservations(mockSupabase, {
      shopId: '550e8400-e29b-41d4-a716-446655440000',
      limit: 101,
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('1ページあたりの件数は1〜100の範囲である必要があります')
  })

  it('should handle database errors on count query', async () => {
    mockCountEq.mockResolvedValue({
      count: null,
      error: { message: 'Database connection failed', code: 'DB_ERROR' },
    })

    const result = await fetchShopReservations(mockSupabase, {
      shopId: '550e8400-e29b-41d4-a716-446655440000',
    })

    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.error).toBe('予約一覧の取得に失敗しました')
  })

  it('should handle database errors on data query', async () => {
    mockCountEq.mockResolvedValue({
      count: 10,
      error: null,
    })

    mockRange.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed', code: 'DB_ERROR' },
    })

    const result = await fetchShopReservations(mockSupabase, {
      shopId: '550e8400-e29b-41d4-a716-446655440000',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('予約一覧の取得に失敗しました')
  })

  it('should handle network errors', async () => {
    mockCountEq.mockRejectedValue(new Error('Network error'))

    const result = await fetchShopReservations(mockSupabase, {
      shopId: '550e8400-e29b-41d4-a716-446655440000',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('予約一覧の取得に失敗しました')
  })

  it('should transform nested users data to flat structure', async () => {
    const mockDbResponse = [
      {
        id: '1',
        user_id: 'user-1',
        shop_id: 'shop-1',
        reservation_date: '2025-12-25',
        reservation_time: '14:00:00',
        reserver_name: '田中太郎',
        comment: 'コメント',
        status: 'active',
        created_at: '2025-12-20T10:00:00Z',
        updated_at: '2025-12-20T10:00:00Z',
        users: {
          user_name: 'tanaka_taro',
        },
      },
    ]

    mockCountEq.mockResolvedValue({
      count: 1,
      error: null,
    })

    mockRange.mockResolvedValue({
      data: mockDbResponse,
      error: null,
    })

    const result = await fetchShopReservations(mockSupabase, {
      shopId: '550e8400-e29b-41d4-a716-446655440000',
    })

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data![0].user_name).toBe('tanaka_taro')
    // users property should not exist in the transformed data
    expect((result.data![0] as any).users).toBeUndefined()
  })

  it('should include cancelled reservations', async () => {
    const mockDbResponse = [
      {
        id: '1',
        user_id: 'user-1',
        shop_id: 'shop-1',
        reservation_date: '2025-12-25',
        reservation_time: '14:00:00',
        reserver_name: '田中太郎',
        comment: '',
        status: 'cancelled',
        created_at: '2025-12-20T10:00:00Z',
        updated_at: '2025-12-20T10:00:00Z',
        users: {
          user_name: 'tanaka_taro',
        },
      },
    ]

    mockCountEq.mockResolvedValue({
      count: 1,
      error: null,
    })

    mockRange.mockResolvedValue({
      data: mockDbResponse,
      error: null,
    })

    const result = await fetchShopReservations(mockSupabase, {
      shopId: '550e8400-e29b-41d4-a716-446655440000',
    })

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
    expect(result.data![0].status).toBe('cancelled')
  })
})
