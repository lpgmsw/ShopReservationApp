export interface ShopData {
  shop_name: string
  business_hours_start: string
  business_hours_end: string
  reservation_hours_start: string
  reservation_hours_end: string
  business_days: string[]
  closed_days: string[]
}

export interface ValidationResult {
  isValid: boolean
  errors: {
    shop_name?: string
    business_time?: string
    reservation_time?: string
    days?: string
  }
}

/**
 * 店舗データのバリデーション
 * @param data 店舗データ
 * @returns バリデーション結果
 */
export function validateShopData(data: ShopData): ValidationResult {
  const errors: ValidationResult['errors'] = {}

  // 店舗名のバリデーション
  if (!data.shop_name || data.shop_name.trim() === '') {
    errors.shop_name = '店舗名を入力してください'
  }

  // 営業時間のバリデーション
  if (data.business_hours_start >= data.business_hours_end) {
    errors.business_time = '営業開始時間は営業終了時間より前である必要があります'
  }

  // 予約受付時間のバリデーション
  if (data.reservation_hours_start >= data.reservation_hours_end) {
    errors.reservation_time = '予約受付開始時間は予約受付終了時間より前である必要があります'
  } else if (
    data.reservation_hours_start < data.business_hours_start ||
    data.reservation_hours_end > data.business_hours_end
  ) {
    errors.reservation_time = '予約受付時間は営業時間内である必要があります'
  }

  // 営業日と定休日のバリデーション
  const businessDaysSet = new Set(data.business_days)
  const closedDaysSet = new Set(data.closed_days)
  const intersection = data.business_days.filter(day => closedDaysSet.has(day))

  if (intersection.length > 0) {
    errors.days = '営業日と定休日が重複しています'
  } else if (data.business_days.length === 0) {
    errors.days = '少なくとも1日は営業日を設定してください'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
