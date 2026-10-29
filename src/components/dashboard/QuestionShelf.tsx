import { Link } from '@tanstack/react-router'
import { CircleCheck, RotateCcw } from 'lucide-react'
import { questions } from '#/content/questions'
import type { QuestionStatus } from '#/progress/summary'
import type { BankProgress } from '#/progress/use-progress'
import { NetDiagram } from '#/components/cube/NetDiagram'
import { surfaceStyles } from '#/components/ui/surface-styles'
import { toneStyles } from '#/components/ui/tone-styles'
import { Widget } from './Widget'

const SHELF_SIZE = 6

const STATUS_LABELS = { new: 'ยังไม่ได้ทำ', retry: 'ยังไม่ถูก', solved: 'ทำถูกแล้ว' } as const satisfies Record<
  QuestionStatus,
  string
>

/** The start of the question bank as a grid of nets, marked with how each went. */
export function QuestionShelf({ progress }: { progress: BankProgress | null }) {
  return (
    <Widget
      title="คลังโจทย์"
      aside={<span className="text-xs text-ink-faint tabular-nums">{questions.length} ข้อ</span>}
    >
      <ul className={`${surfaceStyles.card} grid grid-cols-3 gap-2 p-2`}>
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
                    className={`absolute top-1 right-1 size-4 ${toneStyles.emerald.text}`}
                    aria-hidden="true"
                  />
                )}
                {status === 'retry' && (
                  <RotateCcw
                    className={`absolute top-1 right-1 size-3.5 ${toneStyles.amber.text}`}
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
        className={`${surfaceStyles.card} mt-auto block px-4 py-3 text-center text-xs font-semibold text-ink-soft transition hover:bg-sunken hover:text-accent-ink`}
      >
        ดูโจทย์ทั้งหมด
      </Link>
    </Widget>
  )
}
