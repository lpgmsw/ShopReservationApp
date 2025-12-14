import { registerShop } from '@/features/shop/utils/registerShop'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')

describe('registerShop', () => {
  const mockSupabase = {
    from: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('正常に店舗情報を登録できる場合、成功を返す', async () => {
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'shop-123' },
          error: null,
        }),
      }),
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    })

    const result = await registerShop('user-123', {
      shop_name: 'テスト店舗',
      business_hours_start: '09:00',
      business_hours_end: '18:00',
      reservation_hours_start: '10:00',
      reservation_hours_end: '17:00',
      business_days: ['月', '火', '水', '木', '金'],
      closed_days: ['土', '日'],
    })

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
    expect(mockSupabase.from).toHaveBeenCalledWith('shops')
    expect(mockInsert).toHaveBeenCalledWith({
      owner_id: 'user-123',
      shop_name: 'テスト店舗',
      business_hours_start: '09:00',
      business_hours_end: '18:00',
      reservation_hours_start: '10:00',
      reservation_hours_end: '17:00',
      business_days: ['月', '火', '水', '木', '金'],
      closed_days: ['土', '日'],
    })
  })

  it('データベースエラーが発生した場合、エラーを返す', async () => {
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }),
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    })

    const result = await registerShop('user-123', {
      shop_name: 'テスト店舗',
      business_hours_start: '09:00',
      business_hours_end: '18:00',
      reservation_hours_start: '10:00',
      reservation_hours_end: '17:00',
      business_days: ['月', '火', '水', '木', '金'],
      closed_days: ['土', '日'],
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('店舗情報の登録に失敗しました')
  })

  it('予期しないエラーが発生した場合、エラーを返す', async () => {
    mockSupabase.from.mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const result = await registerShop('user-123', {
      shop_name: 'テスト店舗',
      business_hours_start: '09:00',
      business_hours_end: '18:00',
      reservation_hours_start: '10:00',
      reservation_hours_end: '17:00',
      business_days: ['月', '火', '水', '木', '金'],
      closed_days: ['土', '日'],
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('店舗情報の登録中にエラーが発生しました')
  })
})
