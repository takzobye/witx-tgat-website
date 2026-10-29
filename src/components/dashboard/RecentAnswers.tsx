import { Link } from '@tanstack/react-router'
import { CircleCheck, CircleX, Inbox } from 'lucide-react'
import { formatTimeAgo } from '#/progress/format'
import type { BankProgress } from '#/progress/use-progress'
import { NetDiagram } from '#/components/cube/NetDiagram'
import { Skeleton } from '#/components/ui/Skeleton'
import { Widget } from './Widget'

const SKELETON_ROWS = 3

interface RecentAnswersProps {
  progress: BankProgress | null
  className?: string
}

export function RecentAnswers({ progress, className }: RecentAnswersProps) {
  return (
    <Widget title="ทำล่าสุด" className={className}>
      {!progress ? (
        <ul className="flex flex-col gap-2">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <li
              key={index}
              className="flex items-center gap-3 rounded-[20px] bg-surface p-2.5 shadow-[0_1px_2px_rgb(28_25_23/0.06)] ring-1 ring-contrast/5"
            >
              <Skeleton className="size-12 rounded-xl" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
            </li>
          ))}
        </ul>
      ) : progress.recent.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-[20px] bg-surface px-6 py-8 text-center shadow-[0_1px_2px_rgb(28_25_23/0.06)] ring-1 ring-contrast/5">
          <Inbox className="size-8 text-ink-faint" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-sm font-semibold text-ink-soft">ยังไม่มีประวัติการทำโจทย์</p>
          <p className="text-xs text-ink-muted">ตรวจคำตอบแล้วผลจะแสดงที่นี่</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {progress.recent.map(({ question, correct, at }) => (
            <li key={`${question.id}-${at}`}>
              <Link
                to="/questions/$questionId"
                params={{ questionId: question.id }}
                className="flex items-center gap-3 rounded-[20px] bg-surface p-2.5 pr-4 shadow-[0_1px_2px_rgb(28_25_23/0.06)] ring-1 ring-contrast/5 transition hover:bg-sunken"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sunken p-1.5 ring-1 ring-contrast/5 ring-inset">
                  <NetDiagram net={question.net} className="max-h-full w-full" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">
                    ข้อ {question.number} · {question.title}
                  </span>
                  {correct ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                      <CircleCheck className="size-3.5" aria-hidden="true" /> ตอบถูก
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-rose-700 dark:text-rose-400">
                      <CircleX className="size-3.5" aria-hidden="true" /> ตอบผิด
                    </span>
                  )}
                </span>
                <time
                  dateTime={new Date(at).toISOString()}
                  className="shrink-0 text-xs text-ink-faint"
                >
                  {formatTimeAgo(at, progress.now)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Widget>
  )
}
