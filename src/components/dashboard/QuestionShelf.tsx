import { Link } from '@tanstack/react-router'
import { CircleCheck, RotateCcw } from 'lucide-react'
import { questions } from '#/content/questions'
import type { QuestionStatus } from '#/progress/summary'
import type { BankProgress } from '#/progress/use-progress'
import { NetDiagram } from '#/components/cube/NetDiagram'
import { Widget } from './Widget'

const SHELF_SIZE = 6

const STATUS_LABELS = {
  new: 'ยังไม่ได้ทำ',
  retry: 'ยังไม่ถูก',
  solved: 'ทำถูกแล้ว',
} as const satisfies Record<QuestionStatus, string>

/** The start of the question bank as a grid of nets, marked with how each went. */
export function QuestionShelf({ progress }: { progress: BankProgress | null }) {
  return (
    <Widget
      title="คลังโจทย์"
      aside={<span className="text-xs text-ink-faint tabular-nums">{questions.length} ข้อ</span>}
    >
      <ul className="grid grid-cols-3 gap-2 rounded-[20px] bg-surface p-2 shadow-[0_1px_2px_rgb(28_25_23/0.06)] ring-1 ring-contrast/5">
        {questions.slice(0, SHELF_SIZE).map((question) => {
          const status = progress?.statusById.get(question.id)
          return (
            <li key={question.id}>
              <Link
                to="/questions/$questionId"
                params={{ questionId: question.id }}
                aria-label={`ข้อ ${question.number} ${question.title}${status ? ` (${STATUS_LABELS[status]})` : ''}`}
                className="relative grid aspect-square place-items-center rounded-xl bg-sunken p-3 ring-1 ring-contrast/5 transition ring-inset hover:bg-accent-soft hover:ring-brand-400/40"
              >
                <NetDiagram net={question.net} className="max-h-full w-full" />
                <span className="absolute bottom-1 left-2 text-[10px] font-semibold text-ink-faint tabular-nums">
                  {question.number}
                </span>
                {status === 'solved' && (
                  <CircleCheck
                    className="absolute top-1 right-1 size-4 text-emerald-700 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                )}
                {status === 'retry' && (
                  <RotateCcw
                    className="absolute top-1 right-1 size-3.5 text-amber-700 dark:text-amber-400"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
      <Link
        to="/questions"
        className="mt-auto block rounded-[20px] bg-surface px-4 py-3 text-center text-xs font-semibold text-ink-soft shadow-[0_1px_2px_rgb(28_25_23/0.06)] ring-1 ring-contrast/5 transition hover:bg-sunken hover:text-accent-ink"
      >
        ดูโจทย์ทั้งหมด
      </Link>
    </Widget>
  )
}
