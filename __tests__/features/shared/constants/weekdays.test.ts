import {
  WEEKDAY_MAP,
  WEEKDAYS_MON_START,
  WEEKDAYS_SUN_START,
  getDayName,
} from '@/features/shared/constants/weekdays'

describe('weekdays', () => {
  describe('WEEKDAY_MAP', () => {
    it('should map day numbers to Japanese weekday names', () => {
      expect(WEEKDAY_MAP[0]).toBe('日')
      expect(WEEKDAY_MAP[1]).toBe('月')
      expect(WEEKDAY_MAP[2]).toBe('火')
      expect(WEEKDAY_MAP[3]).toBe('水')
      expect(WEEKDAY_MAP[4]).toBe('木')
      expect(WEEKDAY_MAP[5]).toBe('金')
      expect(WEEKDAY_MAP[6]).toBe('土')
    })

    it('should have 7 entries', () => {
      expect(Object.keys(WEEKDAY_MAP).length).toBe(7)
    })
  })

  describe('WEEKDAYS_MON_START', () => {
    it('should start with Monday', () => {
      expect(WEEKDAYS_MON_START[0]).toBe('月')
      expect(WEEKDAYS_MON_START[6]).toBe('日')
    })

    it('should have 7 weekdays', () => {
      expect(WEEKDAYS_MON_START.length).toBe(7)
    })
  })

  describe('WEEKDAYS_SUN_START', () => {
    it('should start with Sunday', () => {
      expect(WEEKDAYS_SUN_START[0]).toBe('日')
      expect(WEEKDAYS_SUN_START[6]).toBe('土')
    })

    it('should have 7 weekdays', () => {
      expect(WEEKDAYS_SUN_START.length).toBe(7)
    })
  })

  describe('getDayName', () => {
    it('should return the correct weekday name for valid day numbers', () => {
      expect(getDayName(0)).toBe('日')
      expect(getDayName(1)).toBe('月')
      expect(getDayName(2)).toBe('火')
      expect(getDayName(3)).toBe('水')
      expect(getDayName(4)).toBe('木')
      expect(getDayName(5)).toBe('金')
      expect(getDayName(6)).toBe('土')
    })

    it('should return empty string for invalid day numbers', () => {
      expect(getDayName(-1)).toBe('')
      expect(getDayName(7)).toBe('')
      expect(getDayName(100)).toBe('')
    })
  })
})
