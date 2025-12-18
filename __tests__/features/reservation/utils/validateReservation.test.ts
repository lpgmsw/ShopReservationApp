import { validateReservation } from '@/features/reservation/utils/validateReservation'
import type { Shop } from '@/features/shop-search/types'

describe('validateReservation', () => {
  const mockShop: Shop = {
    id: 'shop-123',
    owner_id: 'owner-123',
    shop_name: 'テスト店舗',
    business_hours_start: '09:00:00',
    business_hours_end: '22:00:00',
    reservation_hours_start: '10:00:00',
    reservation_hours_end: '20:00:00',
    business_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    closed_days: ['Saturday', 'Sunday'],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  describe('Valid reservations', () => {
    it('should accept reservation within valid time range', () => {
      const result = validateReservation({
        reservationDate: '2025-12-25',
        reservationTime: '15:00',
        shop: mockShop,
      })

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept reservation at start time', () => {
      const result = validateReservation({
        reservationDate: '2025-12-25',
        reservationTime: '10:00',
        shop: mockShop,
      })

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept reservation at end time', () => {
      const result = validateReservation({
        reservationDate: '2025-12-25',
        reservationTime: '20:00',
        shop: mockShop,
      })

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('Invalid time range', () => {
    it('should reject reservation before opening hours', () => {
      const result = validateReservation({
        reservationDate: '2025-12-25',
        reservationTime: '09:00',
        shop: mockShop,
      })

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('予約受付時間外です（受付時間: 10:00-20:00）')
    })

    it('should reject reservation after closing hours', () => {
      const result = validateReservation({
        reservationDate: '2025-12-25',
        reservationTime: '21:00',
        shop: mockShop,
      })

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('予約受付時間外です（受付時間: 10:00-20:00）')
    })

    it('should reject reservation just before opening', () => {
      const result = validateReservation({
        reservationDate: '2025-12-25',
        reservationTime: '09:59',
        shop: mockShop,
      })

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('予約受付時間外です（受付時間: 10:00-20:00）')
    })

    it('should reject reservation just after closing', () => {
      const result = validateReservation({
        reservationDate: '2025-12-25',
        reservationTime: '20:01',
        shop: mockShop,
      })

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('予約受付時間外です（受付時間: 10:00-20:00）')
    })
  })

  describe('Past date validation', () => {
    beforeEach(() => {
      // Mock current date to 2025-12-18
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-12-18T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should reject past date', () => {
      const result = validateReservation({
        reservationDate: '2025-12-17',
        reservationTime: '15:00',
        shop: mockShop,
      })

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('過去の日付は予約できません')
    })

    it('should accept today\'s date', () => {
      const result = validateReservation({
        reservationDate: '2025-12-18',
        reservationTime: '15:00',
        shop: mockShop,
      })

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept future date', () => {
      const result = validateReservation({
        reservationDate: '2025-12-19',
        reservationTime: '15:00',
        shop: mockShop,
      })

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('Edge cases', () => {
    it('should handle shop with 24-hour format times', () => {
      const shop24h: Shop = {
        ...mockShop,
        reservation_hours_start: '00:00:00',
        reservation_hours_end: '23:59:00',
      }

      const result = validateReservation({
        reservationDate: '2025-12-25',
        reservationTime: '23:30',
        shop: shop24h,
      })

      expect(result.isValid).toBe(true)
    })

    it('should handle shop with HH:MM format (without seconds)', () => {
      const shopHHMM: Shop = {
        ...mockShop,
        reservation_hours_start: '10:00',
        reservation_hours_end: '20:00',
      }

      const result = validateReservation({
        reservationDate: '2025-12-25',
        reservationTime: '15:00',
        shop: shopHHMM,
      })

      expect(result.isValid).toBe(true)
    })
  })
})
