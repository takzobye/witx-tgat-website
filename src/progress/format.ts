const relativeTime = new Intl.RelativeTimeFormat('th', { numeric: 'auto' })
const percent = new Intl.NumberFormat('th', { style: 'percent' })

const UNITS = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
] as const

/** "เมื่อวาน", "3 ชั่วโมงที่ผ่านมา", "ขณะนี้" … */
export function formatTimeAgo(at: number, now: number): string {
  const elapsed = now - at
  for (const [unit, ms] of UNITS) {
    if (elapsed >= ms) return relativeTime.format(-Math.floor(elapsed / ms), unit)
  }
  return relativeTime.format(0, 'second')
}

export const formatPercent = (ratio: number) => percent.format(ratio)
