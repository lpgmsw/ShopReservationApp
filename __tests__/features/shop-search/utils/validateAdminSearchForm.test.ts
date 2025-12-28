import { validateAdminSearchForm } from '@/features/shop-search/utils/validateAdminSearchForm'

describe('validateAdminSearchForm', () => {
  describe('全フィールドが空の場合', () => {
    it('バリデーションが通る', () => {
      const result = validateAdminSearchForm({
        shopName: '',
        businessHoursStart: '',
        businessHoursEnd: '',
        businessDays: [],
        closedDays: [],
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })
  })

  describe('営業時間のバリデーション', () => {
    it('開始時間のみ入力されている場合はエラー', () => {
      const result = validateAdminSearchForm({
        shopName: '',
        businessHoursStart: '09:00',
        businessHoursEnd: '',
        businessDays: [],
        closedDays: [],
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.businessHoursEnd).toBe('営業終了時間を入力してください')
    })

    it('終了時間のみ入力されている場合はエラー', () => {
      const result = validateAdminSearchForm({
        shopName: '',
        businessHoursStart: '',
        businessHoursEnd: '18:00',
        businessDays: [],
        closedDays: [],
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.businessHoursStart).toBe('営業開始時間を入力してください')
    })

    it('開始時間 >= 終了時間の場合はエラー', () => {
      const result = validateAdminSearchForm({
        shopName: '',
        businessHoursStart: '18:00',
        businessHoursEnd: '09:00',
        businessDays: [],
        closedDays: [],
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.businessHoursEnd).toBe('営業終了時間は開始時間より後にしてください')
    })

    it('開始時間 = 終了時間の場合はエラー', () => {
      const result = validateAdminSearchForm({
        shopName: '',
        businessHoursStart: '09:00',
        businessHoursEnd: '09:00',
        businessDays: [],
        closedDays: [],
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.businessHoursEnd).toBe('営業終了時間は開始時間より後にしてください')
    })

    it('正しい営業時間範囲の場合は通る', () => {
      const result = validateAdminSearchForm({
        shopName: '',
        businessHoursStart: '09:00',
        businessHoursEnd: '18:00',
        businessDays: [],
        closedDays: [],
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })
  })

  describe('営業日と定休日のバリデーション', () => {
    it('営業日と定休日に重複がある場合はエラー', () => {
      const result = validateAdminSearchForm({
        shopName: '',
        businessHoursStart: '',
        businessHoursEnd: '',
        businessDays: ['月', '火', '水'],
        closedDays: ['水', '木'],
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.closedDays).toBe('営業日と定休日に重複があります')
    })

    it('営業日と定休日に重複がない場合は通る', () => {
      const result = validateAdminSearchForm({
        shopName: '',
        businessHoursStart: '',
        businessHoursEnd: '',
        businessDays: ['月', '火', '水'],
        closedDays: ['木', '金'],
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('営業日のみ選択の場合は通る', () => {
      const result = validateAdminSearchForm({
        shopName: '',
        businessHoursStart: '',
        businessHoursEnd: '',
        businessDays: ['月', '火', '水'],
        closedDays: [],
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('定休日のみ選択の場合は通る', () => {
      const result = validateAdminSearchForm({
        shopName: '',
        businessHoursStart: '',
        businessHoursEnd: '',
        businessDays: [],
        closedDays: ['木', '金'],
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })
  })

  describe('店舗名のバリデーション', () => {
    it('店舗名が入力されている場合は通る', () => {
      const result = validateAdminSearchForm({
        shopName: 'テスト店舗',
        businessHoursStart: '',
        businessHoursEnd: '',
        businessDays: [],
        closedDays: [],
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })
  })

  describe('複合的なバリデーション', () => {
    it('全項目が正しく入力されている場合は通る', () => {
      const result = validateAdminSearchForm({
        shopName: 'テスト店舗',
        businessHoursStart: '09:00',
        businessHoursEnd: '18:00',
        businessDays: ['月', '火', '水'],
        closedDays: ['土', '日'],
      })

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('複数のエラーがある場合は全て返される', () => {
      const result = validateAdminSearchForm({
        shopName: '',
        businessHoursStart: '18:00',
        businessHoursEnd: '09:00',
        businessDays: ['月', '火'],
        closedDays: ['火', '水'],
      })

      expect(result.isValid).toBe(false)
      expect(result.errors.businessHoursEnd).toBe('営業終了時間は開始時間より後にしてください')
      expect(result.errors.closedDays).toBe('営業日と定休日に重複があります')
    })
  })
})
