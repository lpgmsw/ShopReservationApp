import { fetchShopData } from '@/features/shop/utils/fetchShopData'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')

describe('fetchShopData', () => {
  const mockSupabase = {
    from: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('既存の店舗情報を取得できる場合、成功を返す', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'shop-123',
            shop_name: 'テスト店舗',
            business_hours_start: '09:00',
            business_hours_end: '18:00',
            reservation_hours_start: '10:00',
            reservation_hours_end: '17:00',
            business_days: ['月', '火', '水', '木', '金'],
            closed_days: ['土', '日'],
          },
          error: null,
        }),
      }),
    })

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    const result = await fetchShopData('user-123')

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data?.id).toBe('shop-123')
    expect(result.data?.shop_name).toBe('テスト店舗')
    expect(mockSupabase.from).toHaveBeenCalledWith('shops')
  })

  it('店舗情報が存在しない場合、dataがundefinedで成功を返す', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' },
        }),
      }),
    })

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    const result = await fetchShopData('user-123')

    expect(result.success).toBe(true)
    expect(result.data).toBeUndefined()
  })

  it('データベースエラーが発生した場合、エラーを返す', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST001', message: 'Database error' },
        }),
      }),
    })

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    const result = await fetchShopData('user-123')

    expect(result.success).toBe(false)
    expect(result.error).toBe('店舗情報の取得に失敗しました')
  })

  it('予期しないエラーが発生した場合、エラーを返す', async () => {
    mockSupabase.from.mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const result = await fetchShopData('user-123')

    expect(result.success).toBe(false)
    expect(result.error).toBe('店舗情報の取得中にエラーが発生しました')
  })
})
