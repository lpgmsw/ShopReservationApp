import { z } from 'zod'

export const searchFormSchema = z.object({
  shopName: z
    .string()
    .max(100, '店舗名は100文字以下で入力してください。')
    .optional()
    .or(z.literal('')),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '正しい日付を入力してください。')
    .refine((val) => {
      if (!val) return true
      const dateObj = new Date(val)
      const [year, month, day] = val.split('-').map(Number)
      return (
        dateObj.getFullYear() === year &&
        dateObj.getMonth() + 1 === month &&
        dateObj.getDate() === day
      )
    }, '正しい日付を入力してください。')
    .optional()
    .or(z.literal('')),
  time: z
    .string()
    .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, '正しい時間を入力してください。')
    .optional()
    .or(z.literal('')),
})

export type SearchFormData = z.infer<typeof searchFormSchema>

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateSearchForm(data: SearchFormData): ValidationResult {
  const result = searchFormSchema.safeParse(data)

  if (result.success) {
    return {
      isValid: true,
      errors: {},
    }
  }

  const errors: Record<string, string> = {}
  result.error.errors.forEach((err) => {
    const field = err.path[0] as string
    errors[field] = err.message
  })

  return {
    isValid: false,
    errors,
  }
}
