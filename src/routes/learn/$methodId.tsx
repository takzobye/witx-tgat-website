import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { z } from 'zod'
import { methods, type BankMethod } from '#/content/methods'
import { questions } from '#/content/questions'
import { MethodPickerDialog } from '#/components/learn/MethodPickerDialog'
import { METHOD_LOOKS } from '#/components/learn/method-looks'
import { PracticeStep } from '#/components/learn/PracticeStep'
import { HandsOnStepView, WatchStepView } from '#/components/learn/StepViews'
import { buttonStyles } from '#/components/ui/button-styles'

export const Route = createFileRoute('/learn/$methodId')({
  validateSearch: z.object({
    /** Counting from 1; the step after the last lesson step is the practice question. */
    step: z.int().min(1).optional().catch(undefined),
  }),
  loader: ({ params }) => {
    const index = methods.findIndex((method) => method.id === params.methodId)
    if (index === -1) throw notFound()
    const practiceIndex = questions.findIndex((question) => question.id === methods[index].practiceId)
    if (practiceIndex === -1) throw new Error(`Practice question "${methods[index].practiceId}" is missing`)
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
  const total = lessonSteps + 1
  const number = Math.min(requested, total)

  const stepLink = (to: number, className: string, children: ReactNode) => (
    <Link
      to="/learn/$methodId"
      params={{ methodId: method.id }}
      search={{ step: to }}
      className={className}
    >
      {children}
    </Link>
  )
  const back =
    number > 1 &&
    stepLink(
      number - 1,
      buttonStyles.secondary,
      <>
        <ArrowLeft className="size-4" aria-hidden="true" /> ย้อนกลับ
      </>,
    )
  const nav = (
    <nav className="flex items-center gap-3 border-t border-line pt-5">
      {back}
      {stepLink(
        number + 1,
        `${buttonStyles.primary} ml-auto`,
        <>
          {number === lessonSteps ? 'ลองโจทย์จริง' : 'ขั้นถัดไป'}
          <ArrowRight className="size-4" aria-hidden="true" />
        </>,
      )}
    </nav>
  )

  const step = number <= lessonSteps ? method.steps[number - 1] : null

  return (
    <div className="py-6 sm:py-10">
      <nav className="flex items-center justify-between gap-4 text-sm">
        <Link to="/" className="inline-flex items-center gap-1.5 text-ink-muted transition hover:text-ink">
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
          next={questions[practiceIndex + 1] ?? null}
          number={number}
          onPickAnother={() => setPicking(true)}
          back={back}
        />
      ) : step.handsOn ? (
        <HandsOnStepView step={step} number={number} nav={nav} />
      ) : (
        <WatchStepView step={step} number={number} nav={nav} />
      )}

      <MethodPickerDialog open={picking} onClose={() => setPicking(false)} />
    </div>
  )
}

/** The method's name and a bar of every step; each segment jumps to its step. */
function LessonHeader({ method, number }: { method: BankMethod; number: number }) {
  const { icon: Icon, tile } = METHOD_LOOKS[method.id]
  const titles = [...method.steps.map((step) => step.title), 'ลองโจทย์จริง']

  return (
    <header className="mt-6 mb-6 sm:mb-8">
      <div className="flex items-center gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tile}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-ink">{method.name}</p>
          <p className="text-sm text-ink-muted tabular-nums">
            ขั้นที่ {number} จาก {titles.length} · {titles[number - 1]}
          </p>
        </div>
      </div>
      <ol aria-label="ขั้นตอนของบทเรียน" className="mt-4 flex gap-1.5">
        {titles.map((title, i) => (
          <li key={title} className="flex-1">
            <Link
              to="/learn/$methodId"
              params={{ methodId: method.id }}
              search={{ step: i + 1 }}
              aria-label={`ขั้นที่ ${i + 1}: ${title}`}
              aria-current={i + 1 === number ? 'step' : undefined}
              title={title}
              className="group block py-2"
            >
              <span
                className={`block h-1.5 rounded-full transition ${
                  i + 1 === number
                    ? 'bg-brand-600'
                    : i + 1 < number
                      ? 'bg-brand-300 dark:bg-brand-400/50'
                      : 'bg-fill-strong group-hover:bg-line-strong'
                }`}
              />
            </Link>
          </li>
        ))}
      </ol>
    </header>
  )
}
