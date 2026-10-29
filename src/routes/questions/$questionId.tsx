import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { questions, type BankQuestion } from '#/content/questions'
import { DifficultyBadge } from '#/components/quiz/DifficultyBadge'
import { QuestionPlayer } from '#/components/quiz/QuestionPlayer'
import { recordAttempt } from '#/progress/attempts'

export const Route = createFileRoute('/questions/$questionId')({
  loader: ({ params }) => {
    const index = questions.findIndex((q) => q.id === params.questionId)
    if (index === -1) throw notFound()
    return { index }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `ข้อ ${loaderData.index + 1} ${questions[loaderData.index].title} · ฝึกพับกล่อง TGAT2`
          : 'ไม่พบโจทย์ · ฝึกพับกล่อง TGAT2',
      },
    ],
  }),
  component: QuestionPage,
})

function QuestionPage() {
  const { index } = Route.useLoaderData()
  const question = questions[index]
  const previous = index > 0 ? questions[index - 1] : null
  const next = index < questions.length - 1 ? questions[index + 1] : null

  return (
    <div className="py-6 sm:py-10">
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

      <header className="mt-6 mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <span>{question.title}</span>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
        <h1 className="mt-2 text-2xl font-bold text-balance sm:text-3xl">{question.prompt}</h1>
      </header>

      <QuestionPlayer
        key={question.id}
        question={question}
        nextId={next?.id ?? null}
        onCheck={(correct) => recordAttempt(question.id, correct)}
      />
    </div>
  )
}

interface PagerLinkProps {
  question: BankQuestion | null
  label: string
  children: React.ReactNode
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
