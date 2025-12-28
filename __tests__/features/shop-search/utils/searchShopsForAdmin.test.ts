import { searchShopsForAdmin } from '@/features/shop-search/utils/searchShopsForAdmin'
import { createClient } from '@/lib/supabase/client'

// モック
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('searchShopsForAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('条件なしで全店舗を検索できる', async () => {
    const mockData = [
      {
        id: 'shop-1',
        shop_name: 'テスト店舗1',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        business_days: ['月', '火', '水'],
      },
    ]

    const mockRange = jest.fn().mockResolvedValue({
      data: mockData,
      error: null,
      count: 1,
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

    const result = await searchShopsForAdmin({
      page: 1,
      limit: 20,
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockData)
    expect(result.total).toBe(1)
    expect(result.totalPages).toBe(1)
  })

  it('店舗名で検索できる', async () => {
    const mockData = [
      {
        id: 'shop-1',
        shop_name: 'テスト店舗',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
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

    const result = await searchShopsForAdmin({
      shopName: 'テスト',
      page: 1,
      limit: 20,
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockData)
    expect(mockIlike).toHaveBeenCalledWith('shop_name', '%テスト%')
  })

  it('データベースエラー時にエラーを返す', async () => {
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

    const result = await searchShopsForAdmin({
      page: 1,
      limit: 20,
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('店舗の検索に失敗しました')
  })

  it('ページネーションが正しく計算される', async () => {
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      id: `shop-${i + 1}`,
      shop_name: `店舗${i + 1}`,
      business_hours_start: '09:00',
      business_hours_end: '18:00',
    }))

    const mockRange = jest.fn().mockResolvedValue({
      data: mockData,
      error: null,
      count: 45, // 全45件
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

    const result = await searchShopsForAdmin({
      page: 2,
      limit: 20,
    })

    expect(result.success).toBe(true)
    expect(result.total).toBe(45)
    expect(result.totalPages).toBe(3) // 45 / 20 = 2.25 -> 3
    expect(mockRange).toHaveBeenCalledWith(20, 39) // page 2: from 20 to 39
  })
})
