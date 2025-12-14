import { updateShop } from '@/features/shop/utils/updateShop'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')

describe('updateShop', () => {
  const mockSupabase = {
    from: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('正常に店舗情報を更新できる場合、成功を返す', async () => {
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        error: null,
      }),
    })

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    })

    const result = await updateShop('shop-123', {
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
    expect(mockUpdate).toHaveBeenCalledWith({
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
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        error: { message: 'Database error' },
      }),
    })

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    })

    const result = await updateShop('shop-123', {
      shop_name: 'テスト店舗',
      business_hours_start: '09:00',
      business_hours_end: '18:00',
      reservation_hours_start: '10:00',
      reservation_hours_end: '17:00',
      business_days: ['月', '火', '水', '木', '金'],
      closed_days: ['土', '日'],
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('店舗情報の更新に失敗しました')
  })

  it('予期しないエラーが発生した場合、エラーを返す', async () => {
    mockSupabase.from.mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const result = await updateShop('shop-123', {
      shop_name: 'テスト店舗',
      business_hours_start: '09:00',
      business_hours_end: '18:00',
      reservation_hours_start: '10:00',
      reservation_hours_end: '17:00',
      business_days: ['月', '火', '水', '木', '金'],
      closed_days: ['土', '日'],
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('店舗情報の更新中にエラーが発生しました')
  })
})
