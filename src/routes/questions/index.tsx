import { createFileRoute } from '@tanstack/react-router'
import { questions } from '#/content/questions'
import { useProgress } from '#/progress/use-progress'
import { QuestionCard } from '#/components/quiz/QuestionCard'
import { Skeleton } from '#/components/ui/Skeleton'

export const Route = createFileRoute('/questions/')({
  head: () => ({ meta: [{ title: 'คลังโจทย์ · ฝึกพับกล่อง TGAT2' }] }),
  component: QuestionBankPage,
})

function QuestionBankPage() {
  const progress = useProgress()

  return (
    <div className="py-8 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">คลังโจทย์</h1>
          <p className="mt-2 text-ink-soft">
            โจทย์พับกล่องทั้งหมด {questions.length} ข้อ เลือกทำข้อไหนก่อนก็ได้
          </p>
        </div>
        {progress ? (
          <p className="text-sm text-ink-muted">
            ทำถูกแล้ว{' '}
            <span className="font-semibold text-ink tabular-nums">
              {progress.solved} / {questions.length}
            </span>{' '}
            ข้อ
          </p>
        ) : (
          <Skeleton className="h-5 w-32 rounded-md" />
        )}
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {questions.map((question) => (
          <li key={question.id}>
            <QuestionCard question={question} status={progress?.statusById.get(question.id)} />
          </li>
        ))}
      </ul>
    </div>
  )
}
