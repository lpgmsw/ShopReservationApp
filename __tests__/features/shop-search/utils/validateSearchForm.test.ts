import { validateSearchForm } from '@/features/shop-search/utils/validateSearchForm'

describe('validateSearchForm', () => {
  it('すべて空の場合は有効', () => {
    const result = validateSearchForm({
      shopName: '',
      date: '',
      time: '',
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('店舗名が100文字以下の場合は有効', () => {
    const result = validateSearchForm({
      shopName: 'あ'.repeat(100),
      date: '',
      time: '',
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('店舗名が101文字以上の場合は無効', () => {
    const result = validateSearchForm({
      shopName: 'あ'.repeat(101),
      date: '',
      time: '',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.shopName).toBe('店舗名は100文字以下で入力してください。')
  })

  it('正しい日付形式の場合は有効', () => {
    const result = validateSearchForm({
      shopName: '',
      date: '2025-12-20',
      time: '',
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('不正な日付形式の場合は無効', () => {
    const result = validateSearchForm({
      shopName: '',
      date: 'invalid-date',
      time: '',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.date).toBe('正しい日付を入力してください。')
  })

  it('存在しない日付の場合は無効', () => {
    const result = validateSearchForm({
      shopName: '',
      date: '2025-02-30', // 2月30日は存在しない
      time: '',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.date).toBe('正しい日付を入力してください。')
  })

  it('正しい時間形式の場合は有効', () => {
    const result = validateSearchForm({
      shopName: '',
      date: '',
      time: '10:00',
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('不正な時間形式の場合は無効', () => {
    const result = validateSearchForm({
      shopName: '',
      date: '',
      time: '25:00',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.time).toBe('正しい時間を入力してください。')
  })

  it('複数のエラーがある場合はすべて返す', () => {
    const result = validateSearchForm({
      shopName: 'あ'.repeat(101),
      date: 'invalid',
      time: '99:99',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.shopName).toBe('店舗名は100文字以下で入力してください。')
    expect(result.errors.date).toBe('正しい日付を入力してください。')
    expect(result.errors.time).toBe('正しい時間を入力してください。')
  })
})
