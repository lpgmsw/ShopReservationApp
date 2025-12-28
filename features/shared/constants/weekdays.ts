/**
 * 曜日マッピング定数
 * JavaScriptのDate.getDay()の戻り値（0-6）を日本語の曜日に変換
 */

export const WEEKDAY_MAP: Record<number, string> = {
  0: '日',
  1: '月',
  2: '火',
  3: '水',
  4: '木',
  5: '金',
  6: '土',
} as const

/**
 * 曜日の配列（月曜日始まり）
 */
export const WEEKDAYS_MON_START = ['月', '火', '水', '木', '金', '土', '日'] as const

/**
 * 曜日の配列（日曜日始まり）
 */
export const WEEKDAYS_SUN_START = ['日', '月', '火', '水', '木', '金', '土'] as const

/**
 * 数値を曜日文字列に変換
 * @param dayOfWeek - Date.getDay()の戻り値（0-6）
 * @returns 日本語の曜日文字列（例: "月"）
 */
export function getDayName(dayOfWeek: number): string {
  return WEEKDAY_MAP[dayOfWeek] || ''
}
