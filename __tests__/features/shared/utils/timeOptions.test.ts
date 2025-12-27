import { generateTimeOptions, TIME_OPTIONS } from '@/features/shared/utils/timeOptions'

describe('timeOptions', () => {
  describe('generateTimeOptions', () => {
    it('should generate time options from 00:00 to 23:30', () => {
      const options = generateTimeOptions()

      expect(options.length).toBe(48) // 24時間 × 2（30分刻み）
      expect(options[0]).toBe('00:00')
      expect(options[1]).toBe('00:30')
      expect(options[2]).toBe('01:00')
      expect(options[options.length - 1]).toBe('23:30')
    })

    it('should format hours and minutes with leading zeros', () => {
      const options = generateTimeOptions()

      // すべての時間が "HH:MM" 形式であることを確認
      options.forEach((time) => {
        expect(time).toMatch(/^\d{2}:\d{2}$/)
      })
    })

    it('should generate times in 30-minute intervals', () => {
      const options = generateTimeOptions()

      // 30分刻みであることを確認
      for (let i = 0; i < options.length; i++) {
        const [, minutes] = options[i].split(':')
        expect(['00', '30']).toContain(minutes)
      }
    })
  })

  describe('TIME_OPTIONS', () => {
    it('should be a pre-generated array of time options', () => {
      expect(Array.isArray(TIME_OPTIONS)).toBe(true)
      expect(TIME_OPTIONS.length).toBe(48)
    })

    it('should match the output of generateTimeOptions', () => {
      const generated = generateTimeOptions()
      expect(TIME_OPTIONS).toEqual(generated)
    })
  })
})
