import { z } from 'zod'

/**
 * Zod validation schema for reservation form input
 *
 * Validates:
 * - reservationDate: YYYY-MM-DD format (HTML date input)
 * - reservationTime: HH:MM format (HTML time input)
 * - reserverName: 1-50 characters, trimmed, no whitespace-only
 * - comment: max 500 characters, optional with default empty string
 */
export const reservationSchema = z.object({
  reservationDate: z
    .string()
    .min(1, '予約日を入力してください')
    .regex(/^\d{4}-\d{2}-\d{2}$/, '予約日の形式が正しくありません'),

  reservationTime: z
    .string()
    .min(1, '予約時刻を入力してください')
    .regex(/^\d{2}:\d{2}$/, '予約時刻の形式が正しくありません')
    .refine(
      (time) => {
        const [, minutes] = time.split(':').map(Number)
        return minutes % 30 === 0
      },
      { message: '予約時刻は30分単位で入力してください（例：14:00、14:30）' }
    ),

  reserverName: z
    .string()
    .trim()
    .min(1, '予約者名を入力してください')
    .max(50, '予約者名は50文字以内で入力してください'),

  comment: z
    .string()
    .max(500, 'コメントは500文字以内で入力してください')
    .optional()
    .default(''),
})

/**
 * TypeScript type inferred from the Zod schema
 */
export type ReservationSchemaType = z.infer<typeof reservationSchema>
