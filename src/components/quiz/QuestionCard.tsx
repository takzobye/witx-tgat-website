import { Link } from '@tanstack/react-router'
import type { BankQuestion } from '#/content/questions'
import type { QuestionStatus } from '#/progress/summary'
import { NetDiagram } from '#/components/cube/NetDiagram'
import { DifficultyBadge } from './DifficultyBadge'
import { StatusBadge } from './StatusBadge'

interface QuestionCardProps {
  question: BankQuestion
  /** `undefined` while the visitor's history is unknown. */
  status: QuestionStatus | undefined
}

export function QuestionCard({ question, status }: QuestionCardProps) {
  return (
    <Link
      to="/questions/$questionId"
      params={{ questionId: question.id }}
      className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
    >
      <div className="grid h-40 place-items-center rounded-xl bg-sunken p-5">
        <NetDiagram net={question.net} className="max-h-full w-full" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        <span className="font-medium tabular-nums">ข้อ {question.number}</span>
        <DifficultyBadge difficulty={question.difficulty} />
        {question.ask === 'impossible' && (
          <span className="text-xs text-ink-muted">หารูปที่พับไม่ได้</span>
        )}
        {status && (
          <span className="ml-auto">
            <StatusBadge status={status} />
          </span>
        )}
      </div>
      <h3 className="mt-1.5 font-semibold text-ink group-hover:text-accent-ink">
        {question.title}
      </h3>
    </Link>
  )
}
