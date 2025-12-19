import { reservationSchema } from '@/features/reservation/utils/validation'

describe('reservationSchema', () => {
  it('should validate correct reservation data', () => {
    const validData = {
      reservationDate: '2025-12-25',
      reservationTime: '14:30',
      reserverName: 'テストユーザー',
      comment: 'よろしくお願いします',
    }

    const result = reservationSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('should accept empty comment with default value', () => {
    const dataWithoutComment = {
      reservationDate: '2025-12-25',
      reservationTime: '14:30',
      reserverName: 'テストユーザー',
    }

    const result = reservationSchema.safeParse(dataWithoutComment)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.comment).toBe('')
    }
  })

  it('should reject invalid date format', () => {
    const invalidData = {
      reservationDate: '2025/12/25', // Wrong format
      reservationTime: '14:30',
      reserverName: 'テストユーザー',
      comment: '',
    }

    const result = reservationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject invalid time format', () => {
    const invalidData = {
      reservationDate: '2025-12-25',
      reservationTime: '14:30:00', // Should be HH:MM, not HH:MM:SS
      reserverName: 'テストユーザー',
      comment: '',
    }

    const result = reservationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject empty reservationDate', () => {
    const invalidData = {
      reservationDate: '',
      reservationTime: '14:30',
      reserverName: 'テストユーザー',
      comment: '',
    }

    const result = reservationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject empty reservationTime', () => {
    const invalidData = {
      reservationDate: '2025-12-25',
      reservationTime: '',
      reserverName: 'テストユーザー',
      comment: '',
    }

    const result = reservationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject empty reserverName', () => {
    const invalidData = {
      reservationDate: '2025-12-25',
      reservationTime: '14:30',
      reserverName: '',
      comment: '',
    }

    const result = reservationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject reserverName with only whitespace', () => {
    const invalidData = {
      reservationDate: '2025-12-25',
      reservationTime: '14:30',
      reserverName: '   ',
      comment: '',
    }

    const result = reservationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject reserverName exceeding 50 characters', () => {
    const invalidData = {
      reservationDate: '2025-12-25',
      reservationTime: '14:30',
      reserverName: 'a'.repeat(51),
      comment: '',
    }

    const result = reservationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should accept reserverName at exactly 50 characters', () => {
    const validData = {
      reservationDate: '2025-12-25',
      reservationTime: '14:30',
      reserverName: 'a'.repeat(50),
      comment: '',
    }

    const result = reservationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject comment exceeding 500 characters', () => {
    const invalidData = {
      reservationDate: '2025-12-25',
      reservationTime: '14:30',
      reserverName: 'テストユーザー',
      comment: 'a'.repeat(501),
    }

    const result = reservationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should accept comment at exactly 500 characters', () => {
    const validData = {
      reservationDate: '2025-12-25',
      reservationTime: '14:30',
      reserverName: 'テストユーザー',
      comment: 'a'.repeat(500),
    }

    const result = reservationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should trim reserverName whitespace', () => {
    const dataWithWhitespace = {
      reservationDate: '2025-12-25',
      reservationTime: '14:30',
      reserverName: '  テストユーザー  ',
      comment: '',
    }

    const result = reservationSchema.safeParse(dataWithWhitespace)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reserverName).toBe('テストユーザー')
    }
  })

  it('should accept time in 30-minute intervals (00 minutes)', () => {
    const validData = {
      reservationDate: '2025-12-25',
      reservationTime: '14:00',
      reserverName: 'テストユーザー',
      comment: '',
    }

    const result = reservationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should accept time in 30-minute intervals (30 minutes)', () => {
    const validData = {
      reservationDate: '2025-12-25',
      reservationTime: '14:30',
      reserverName: 'テストユーザー',
      comment: '',
    }

    const result = reservationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject time not in 30-minute intervals (15 minutes)', () => {
    const invalidData = {
      reservationDate: '2025-12-25',
      reservationTime: '14:15',
      reserverName: 'テストユーザー',
      comment: '',
    }

    const result = reservationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('30分単位')
    }
  })

  it('should reject time not in 30-minute intervals (45 minutes)', () => {
    const invalidData = {
      reservationDate: '2025-12-25',
      reservationTime: '14:45',
      reserverName: 'テストユーザー',
      comment: '',
    }

    const result = reservationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('30分単位')
    }
  })
})
