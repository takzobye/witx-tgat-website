import { Link } from '@tanstack/react-router'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { questions, type BankQuestion } from '#/content/questions'

/** Back to the bank, and on to the question before or after this one. */
export function QuestionNav({ index }: { index: number }) {
  const previous = index > 0 ? questions[index - 1] : null
  const next = index < questions.length - 1 ? questions[index + 1] : null

  return (
    <nav className="flex items-center justify-between gap-4 text-sm">
      <Link
        to="/questions"
        className="inline-flex items-center gap-1.5 text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-4" /> คลังโจทย์
      </Link>
      <div className="flex items-center gap-1">
        <PagerLink question={previous} label="ข้อก่อนหน้า">
          <ChevronLeft className="size-4" />
        </PagerLink>
        <span className="px-2 text-ink-muted tabular-nums">
          ข้อ {index + 1} / {questions.length}
        </span>
        <PagerLink question={next} label="ข้อถัดไป">
          <ChevronRight className="size-4" />
        </PagerLink>
      </div>
    </nav>
  )
}

interface PagerLinkProps {
  question: BankQuestion | null
  label: string
  children: ReactNode
}

function PagerLink({ question, label, children }: PagerLinkProps) {
  if (!question) {
    return (
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-full text-ink-faint"
      >
        {children}
      </span>
    )
  }
  return (
    <Link
      to="/questions/$questionId"
      params={{ questionId: question.id }}
      aria-label={label}
      title={label}
      className="grid size-8 place-items-center rounded-full text-ink-soft transition hover:bg-fill-strong"
    >
      {children}
    </Link>
  )
}
