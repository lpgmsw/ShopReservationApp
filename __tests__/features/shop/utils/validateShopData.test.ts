import { validateShopData } from '@/features/shop/utils/validateShopData'

describe('validateShopData', () => {
  describe('営業時間のバリデーション', () => {
    it('営業開始時間が営業終了時間より後の場合、エラーを返す', () => {
      const result = validateShopData({
        shop_name: 'テスト店舗',
        business_start_time: '18:00',
        business_end_time: '09:00',
        reservation_start_time: '10:00',
        reservation_end_time: '17:00',
        business_days: ['月', '火', '水'],
        closed_days: ['土', '日'],
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.business_time).toBe('営業開始時間は営業終了時間より前である必要があります')
    })

    it('営業開始時間と営業終了時間が同じ場合、エラーを返す', () => {
      const result = validateShopData({
        shop_name: 'テスト店舗',
        business_start_time: '09:00',
        business_end_time: '09:00',
        reservation_start_time: '09:00',
        reservation_end_time: '09:00',
        business_days: ['月'],
        closed_days: ['日'],
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.business_time).toBe('営業開始時間は営業終了時間より前である必要があります')
    })
  })

  describe('予約受付時間のバリデーション', () => {
    it('予約受付開始時間が予約受付終了時間より後の場合、エラーを返す', () => {
      const result = validateShopData({
        shop_name: 'テスト店舗',
        business_start_time: '09:00',
        business_end_time: '18:00',
        reservation_start_time: '17:00',
        reservation_end_time: '10:00',
        business_days: ['月', '火', '水'],
        closed_days: ['土', '日'],
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.reservation_time).toBe('予約受付開始時間は予約受付終了時間より前である必要があります')
    })

    it('予約受付時間が営業時間外の場合、エラーを返す', () => {
      const result = validateShopData({
        shop_name: 'テスト店舗',
        business_start_time: '10:00',
        business_end_time: '18:00',
        reservation_start_time: '09:00',
        reservation_end_time: '19:00',
        business_days: ['月', '火', '水'],
        closed_days: ['土', '日'],
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.reservation_time).toBe('予約受付時間は営業時間内である必要があります')
    })
  })

  describe('営業日と定休日のバリデーション', () => {
    it('営業日と定休日が重複している場合、エラーを返す', () => {
      const result = validateShopData({
        shop_name: 'テスト店舗',
        business_start_time: '09:00',
        business_end_time: '18:00',
        reservation_start_time: '10:00',
        reservation_end_time: '17:00',
        business_days: ['月', '火', '水'],
        closed_days: ['水', '土', '日'],
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.days).toBe('営業日と定休日が重複しています')
    })

    it('営業日が設定されていない場合、エラーを返す', () => {
      const result = validateShopData({
        shop_name: 'テスト店舗',
        business_start_time: '09:00',
        business_end_time: '18:00',
        reservation_start_time: '10:00',
        reservation_end_time: '17:00',
        business_days: [],
        closed_days: ['土', '日'],
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.days).toBe('少なくとも1日は営業日を設定してください')
    })
  })

  describe('店舗名のバリデーション', () => {
    it('店舗名が空の場合、エラーを返す', () => {
      const result = validateShopData({
        shop_name: '',
        business_start_time: '09:00',
        business_end_time: '18:00',
        reservation_start_time: '10:00',
        reservation_end_time: '17:00',
        business_days: ['月', '火', '水'],
        closed_days: ['土', '日'],
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.shop_name).toBe('店舗名を入力してください')
    })
  })

  describe('正常なデータ', () => {
    it('すべてのバリデーションを通過する場合、isValidがtrueを返す', () => {
      const result = validateShopData({
        shop_name: 'テスト店舗',
        business_start_time: '09:00',
        business_end_time: '18:00',
        reservation_start_time: '10:00',
        reservation_end_time: '17:00',
        business_days: ['月', '火', '水', '木', '金'],
        closed_days: ['土', '日'],
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })
  })
})
