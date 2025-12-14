import { checkShopSetup } from '@/features/shop/utils/checkShopSetup'
import { createClient } from '@/lib/supabase/client'

// Supabaseクライアントのモック
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('checkShopSetup', () => {
  const mockSelect = jest.fn()
  const mockEq = jest.fn()
  const mockSingle = jest.fn()
  const mockFrom = jest.fn(() => ({
    select: mockSelect,
  }))

  const mockSupabaseClient = {
    from: mockFrom,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockReturnValue({
      single: mockSingle,
    })
  })

  it('店舗が設定済みの場合、trueを返す', async () => {
    const mockShopData = {
      id: 'shop-uuid',
      shop_name: 'テスト店舗',
    }
    mockSingle.mockResolvedValue({
      data: mockShopData,
      error: null,
    })

    const userId = 'user-uuid'
    const result = await checkShopSetup(userId)

    expect(result).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('shops')
    expect(mockSelect).toHaveBeenCalledWith('id, shop_name')
    expect(mockEq).toHaveBeenCalledWith('owner_id', userId)
    expect(mockSingle).toHaveBeenCalled()
  })

  it('店舗が未設定の場合、falseを返す', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    })

    const userId = 'user-uuid'
    const result = await checkShopSetup(userId)

    expect(result).toBe(false)
  })

  it('予期しないエラーが発生した場合、falseを返す', async () => {
    mockSingle.mockRejectedValue(new Error('Database error'))

    const userId = 'user-uuid'
    const result = await checkShopSetup(userId)

    expect(result).toBe(false)
  })

  it('ユーザーIDが空の場合、falseを返す', async () => {
    const result = await checkShopSetup('')

    expect(result).toBe(false)
    expect(mockFrom).not.toHaveBeenCalled()
  })
})
