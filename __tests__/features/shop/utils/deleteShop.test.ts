import { deleteShop } from '@/features/shop/utils/deleteShop'
import { createClient } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('deleteShop', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('店舗を正常に削除できる', async () => {
    const mockEq = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    })

    const mockDelete = jest.fn().mockReturnValue({
      eq: mockEq,
    })

    const mockFrom = jest.fn().mockReturnValue({
      delete: mockDelete,
    })

    ;(createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    })

    const result = await deleteShop('shop-123')

    expect(result.success).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('shops')
    expect(mockEq).toHaveBeenCalledWith('id', 'shop-123')
  })

  it('削除エラー時にエラーを返す', async () => {
    const mockEq = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Delete failed' },
    })

    const mockDelete = jest.fn().mockReturnValue({
      eq: mockEq,
    })

    const mockFrom = jest.fn().mockReturnValue({
      delete: mockDelete,
    })

    ;(createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    })

    const result = await deleteShop('shop-123')

    expect(result.success).toBe(false)
    expect(result.error).toBe('店舗の削除に失敗しました')
  })

  it('予期しないエラー時にエラーを返す', async () => {
    const mockFrom = jest.fn().mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    ;(createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    })

    const result = await deleteShop('shop-123')

    expect(result.success).toBe(false)
    expect(result.error).toBe('店舗削除中にエラーが発生しました')
  })
})
