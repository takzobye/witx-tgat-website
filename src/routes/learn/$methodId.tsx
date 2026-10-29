import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft, Shuffle } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { methods } from '#/content/methods'
import { questions } from '#/content/questions'
import { LessonHeader } from '#/components/learn/LessonHeader'
import { MethodPickerDialog } from '#/components/learn/MethodPickerDialog'
import { PracticeStep } from '#/components/learn/PracticeStep'
import { StepNav } from '#/components/learn/StepNav'
import { StepView } from '#/components/learn/StepView'

export const Route = createFileRoute('/learn/$methodId')({
  validateSearch: z.object({
    /** Counting from 1; the step after the last lesson step is the practice question. */
    step: z.int().min(1).optional().catch(undefined),
  }),
  loader: ({ params }) => {
    const index = methods.findIndex((method) => method.id === params.methodId)
    if (index === -1) throw notFound()
    const practiceIndex = questions.findIndex(
      (question) => question.id === methods[index].practiceId,
    )
    if (practiceIndex === -1)
      throw new Error(`Practice question "${methods[index].practiceId}" is missing`)
    // Loader data is sent to the browser with the page, so indexes keep it small.
    return { index, practiceIndex }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${methods[loaderData.index].name} · ฝึกพับกล่อง TGAT2`
          : 'ไม่พบบทเรียน · ฝึกพับกล่อง TGAT2',
      },
    ],
  }),
  component: LessonPage,
})

function LessonPage() {
  const { index, practiceIndex } = Route.useLoaderData()
  const { step: requested = 1 } = Route.useSearch()
  const [picking, setPicking] = useState(false)

  const method = methods[index]
  const lessonSteps = method.steps.length
  // The step after the last lesson step is the practice question.
  const number = Math.min(requested, lessonSteps + 1)
  const step = number <= lessonSteps ? method.steps[number - 1] : null

  return (
    <div className="py-6 sm:py-10">
      <nav className="flex items-center justify-between gap-4 text-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-ink-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> หน้าหลัก
        </Link>
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-ink-muted ring-1 ring-line transition hover:bg-surface hover:text-ink"
        >
          <Shuffle className="size-4" aria-hidden="true" /> เปลี่ยนวิธี
        </button>
      </nav>

      <LessonHeader method={method} number={number} />

      {step === null ? (
        <PracticeStep
          method={method}
          question={questions[practiceIndex]}
          number={number}
          onPickAnother={() => setPicking(true)}
        />
      ) : (
        <StepView
          step={step}
          number={number}
          nav={<StepNav methodId={method.id} number={number} lessonSteps={lessonSteps} />}
        />
      )}

      <MethodPickerDialog open={picking} onClose={() => setPicking(false)} />
    </div>
  )
}
