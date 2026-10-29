import { WEEK_LENGTH } from '#/progress/summary'
import type { BankProgress } from '#/progress/use-progress'
import { Skeleton } from '#/components/ui/Skeleton'
import { Widget } from './Widget'

const shortDay = new Intl.DateTimeFormat('th-TH', { weekday: 'narrow' })
const longDay = new Intl.DateTimeFormat('th-TH', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
})

export function WeeklyActivity({ progress }: { progress: BankProgress | null }) {
  const week = progress?.week
  const answered = week?.reduce((sum, day) => sum + day.answered, 0)
  const correct = week?.reduce((sum, day) => sum + day.correct, 0)
  const busiest = Math.max(1, ...(week ?? []).map((day) => day.answered))

  return (
    <Widget title={`กิจกรรม ${WEEK_LENGTH} วัน`}>
      <div className="flex items-center gap-4 rounded-[20px] bg-surface p-4 shadow-[0_1px_2px_rgb(28_25_23/0.06)] ring-1 ring-contrast/5">
        <div className="grid size-16 shrink-0 place-content-center rounded-2xl bg-accent-soft text-center">
          {answered === undefined ? (
            <Skeleton className="h-7 w-8 rounded-md" />
          ) : (
            <>
              <span className="text-2xl leading-none font-bold text-accent-ink tabular-nums">
                {answered}
              </span>
              <span className="mt-1 text-[11px] text-accent-ink">ครั้ง</span>
            </>
          )}
        </div>
        <ol
          aria-label="จำนวนครั้งที่ตอบในแต่ละวัน"
          className="flex flex-1 items-end justify-between gap-1.5"
        >
          {week
            ? week.map(({ day, answered: count }, index) => {
                const today = index === week.length - 1
                return (
                  <li key={day.getTime()} className="flex flex-1 flex-col items-center gap-1.5">
                    <DayBar share={count / busiest} highlight={today} />
                    <span
                      aria-hidden="true"
                      className={`text-[11px] ${today ? 'font-semibold text-ink' : 'text-ink-faint'}`}
                    >
                      {shortDay.format(day)}
                    </span>
                    <span className="sr-only">
                      {longDay.format(day)} ตอบ {count} ครั้ง
                    </span>
                  </li>
                )
              })
            : Array.from({ length: WEEK_LENGTH }, (_, index) => (
                <li key={index} className="flex flex-1 flex-col items-center gap-1.5">
                  <DayBar share={0} highlight={false} />
                  <Skeleton className="h-3 w-3 rounded-sm" />
                </li>
              ))}
        </ol>
      </div>
      <div className="mt-auto rounded-[20px] bg-surface px-4 py-3 text-center shadow-[0_1px_2px_rgb(28_25_23/0.06)] ring-1 ring-contrast/5">
        {answered === undefined ? (
          <Skeleton className="mx-auto h-4 w-32 rounded-md" />
        ) : (
          <p className="text-xs font-semibold text-ink-soft">
            {answered === 0 ? 'ยังไม่ได้ตอบเลย' : `ตอบถูก ${correct} จาก ${answered} ครั้ง`}
          </p>
        )}
        <p className="mt-0.5 text-[11px] text-ink-faint">ใน {WEEK_LENGTH} วันที่ผ่านมา</p>
      </div>
    </Widget>
  )
}

/** `share` is the day's answers relative to the busiest day, from 0 to 1. */
function DayBar({ share, highlight }: { share: number; highlight: boolean }) {
  return (
    <div className="relative h-16 w-full max-w-5 overflow-hidden rounded-md bg-fill">
      {share > 0 && (
        <div
          className={`absolute inset-x-0 bottom-0 rounded-md ${highlight ? 'bg-brand-600 dark:bg-brand-500' : 'bg-brand-300 dark:bg-brand-400/40'}`}
          style={{ height: `${Math.max(share * 100, 12)}%` }}
        />
      )}
    </div>
  )
}
