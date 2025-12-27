/**
 * 時間選択肢を生成するユーティリティ
 * 30分単位で00:00から23:30までの時間を生成
 */

export function generateTimeOptions(): string[] {
  const options: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      options.push(timeStr)
    }
  }
  return options
}

/**
 * 事前生成された時間選択肢（パフォーマンス最適化のため）
 * コンポーネントで再生成する必要がないように、定数として export
 */
export const TIME_OPTIONS = generateTimeOptions()
