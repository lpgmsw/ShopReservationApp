export interface AdminSearchFormData {
  shopName: string
  businessHoursStart: string
  businessHoursEnd: string
  businessDays: string[]
  closedDays: string[]
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateAdminSearchForm(
  data: AdminSearchFormData
): ValidationResult {
  const errors: Record<string, string> = {}

  // 営業時間のバリデーション
  if (data.businessHoursStart && !data.businessHoursEnd) {
    errors.businessHoursEnd = '営業終了時間を入力してください'
  }

  if (!data.businessHoursStart && data.businessHoursEnd) {
    errors.businessHoursStart = '営業開始時間を入力してください'
  }

  if (data.businessHoursStart && data.businessHoursEnd) {
    if (data.businessHoursStart >= data.businessHoursEnd) {
      errors.businessHoursEnd = '営業終了時間は開始時間より後にしてください'
    }
  }

  // 営業日と定休日の重複チェック
  if (data.businessDays.length > 0 && data.closedDays.length > 0) {
    const hasOverlap = data.businessDays.some((day) =>
      data.closedDays.includes(day)
    )
    if (hasOverlap) {
      errors.closedDays = '営業日と定休日に重複があります'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
