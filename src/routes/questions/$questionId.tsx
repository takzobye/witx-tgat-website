import { createFileRoute, notFound } from '@tanstack/react-router'
import { questions } from '#/content/questions'
import { recordAttempt } from '#/progress/attempts'
import { DifficultyBadge } from '#/components/quiz/DifficultyBadge'
import { QuestionNav } from '#/components/quiz/QuestionNav'
import { QuestionPlayer } from '#/components/quiz/QuestionPlayer'

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
  const next = index < questions.length - 1 ? questions[index + 1] : null

  return (
    <div className="py-6 sm:py-10">
      <QuestionNav index={index} />

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
