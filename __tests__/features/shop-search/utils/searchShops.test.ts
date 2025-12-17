import { searchShops } from '@/features/shop-search/utils/searchShops'
import { createClient } from '@/lib/supabase/client'

// モック
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('searchShops', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('店舗名のみで検索できる', async () => {
    const mockData = [
      {
        id: 'shop-1',
        shop_name: 'テスト店舗',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        reservation_hours_start: '09:00',
        reservation_hours_end: '17:00',
      },
    ]

    const mockRange = jest.fn().mockResolvedValue({
      data: mockData,
      error: null,
      count: 1,
    })

    const mockIlike = jest.fn().mockReturnValue({
      range: mockRange,
    })

    const mockSelect = jest.fn().mockReturnValue({
      ilike: mockIlike,
    })

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
    })

    ;(createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    })

    const result = await searchShops({
      shopName: 'テスト',
      page: 1,
      limit: 20,
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockData)
    expect(result.total).toBe(1)
  })

  it('日付と時間で検索できる', async () => {
    const mockData = [
      {
        id: 'shop-1',
        shop_name: 'テスト店舗',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        reservation_hours_start: '09:00',
        reservation_hours_end: '17:00',
        business_days: ['月', '火', '水', '木', '金'],
      },
    ]

    const mockRange = jest.fn().mockResolvedValue({
      data: mockData,
      error: null,
      count: 1,
    })

    const mockContains = jest.fn().mockReturnValue({
      range: mockRange,
    })

    const mockGte = jest.fn().mockReturnValue({
      contains: mockContains,
    })

    const mockLte = jest.fn().mockReturnValue({
      gte: mockGte,
    })

    const mockSelect = jest.fn().mockReturnValue({
      lte: mockLte,
    })

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
    })

    ;(createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    })

    const result = await searchShops({
      date: '2025-12-22', // 月曜日
      time: '10:00',
      page: 1,
      limit: 20,
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockData)
  })

  it('検索条件なしで全件取得できる', async () => {
    const mockData = [
      {
        id: 'shop-1',
        shop_name: 'テスト店舗1',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        reservation_hours_start: '09:00',
        reservation_hours_end: '17:00',
      },
      {
        id: 'shop-2',
        shop_name: 'テスト店舗2',
        business_hours_start: '10:00',
        business_hours_end: '19:00',
        reservation_hours_start: '10:00',
        reservation_hours_end: '18:00',
      },
    ]

    const mockRange = jest.fn().mockResolvedValue({
      data: mockData,
      error: null,
      count: 2,
    })

    const mockSelect = jest.fn().mockReturnValue({
      range: mockRange,
    })

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
    })

    ;(createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    })

    const result = await searchShops({
      page: 1,
      limit: 20,
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockData)
    expect(result.total).toBe(2)
  })

  it('ページネーションが正しく動作する', async () => {
    const mockData = [
      {
        id: 'shop-21',
        shop_name: 'テスト店舗21',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        reservation_hours_start: '09:00',
        reservation_hours_end: '17:00',
      },
    ]

    const mockRange = jest.fn().mockResolvedValue({
      data: mockData,
      error: null,
      count: 25,
    })

    const mockSelect = jest.fn().mockReturnValue({
      range: mockRange,
    })

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
    })

    ;(createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    })

    const result = await searchShops({
      page: 2,
      limit: 20,
    })

    expect(mockRange).toHaveBeenCalledWith(20, 39)
    expect(result.success).toBe(true)
    expect(result.totalPages).toBe(2) // 25件 / 20件 = 2ページ
  })

  it('データが0件の場合', async () => {
    const mockRange = jest.fn().mockResolvedValue({
      data: [],
      error: null,
      count: 0,
    })

    const mockIlike = jest.fn().mockReturnValue({
      range: mockRange,
    })

    const mockSelect = jest.fn().mockReturnValue({
      ilike: mockIlike,
    })

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
    })

    ;(createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    })

    const result = await searchShops({
      shopName: '存在しない店舗',
      page: 1,
      limit: 20,
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
    expect(result.total).toBe(0)
  })

  it('エラーが発生した場合はエラーを返す', async () => {
    const mockRange = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
      count: null,
    })

    const mockSelect = jest.fn().mockReturnValue({
      range: mockRange,
    })

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
    })

    ;(createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    })

    const result = await searchShops({
      page: 1,
      limit: 20,
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('店舗の検索に失敗しました')
  })
})
