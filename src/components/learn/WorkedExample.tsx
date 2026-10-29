import { CircleCheck, CircleX, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { CHOICE_LABELS } from '#/cube/question'
import type { ExampleChoice, LessonStep, Verdict } from '#/lesson/method'
import type { Pose } from '#/lesson/scene'
import { ChoiceCard, type ChoiceState } from '#/components/quiz/ChoiceCard'

interface VerdictLook {
  label: string
  icon: LucideIcon
  state: ChoiceState
  /** Colour of the label under the choice. */
  text: string
  /** Colours of the panel explaining the verdict. */
  panel: string
}

const VERDICTS: Record<Verdict, VerdictLook> = {
  keep: {
    label: 'ใช้ได้',
    icon: CircleCheck,
    state: 'correct',
    text: 'text-emerald-700 dark:text-emerald-400',
    panel:
      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200',
  },
  cut: {
    label: 'ตัดทิ้ง',
    icon: CircleX,
    state: 'wrong',
    text: 'text-rose-700 dark:text-rose-400',
    panel:
      'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-200',
  },
}

interface WorkedExampleProps {
  example: NonNullable<LessonStep['example']>
  /** The pose the stage is holding, if it is one of these choices. */
  held: Pose | null
  /** Shows the real cube held the way a choice draws it. */
  onHold: (pose: Pose) => void
}

/** Choices to sort with the step's rule: tapping one reveals its verdict and turns the real cube to match. */
export function WorkedExample({ example, held, onHold }: WorkedExampleProps) {
  const [revealed, setRevealed] = useState<ReadonlySet<number>>(new Set())
  const shown = example.choices.findIndex((choice) => choice.pose === held)

  const reveal = (index: number) => {
    setRevealed((previous) => new Set(previous).add(index))
    onHold(example.choices[index].pose)
  }

  return (
    <section aria-label="ลองตัดเอง" className="rounded-3xl border border-line bg-surface p-4 sm:p-5">
      <p className="text-xs font-semibold tracking-wide text-accent-ink">ลองตัดเอง</p>
      <h2 className="mt-1 font-semibold text-balance text-ink">{example.prompt}</h2>
      <p className="mt-1 text-sm text-ink-muted">แตะทีละข้อเพื่อเฉลย แล้วดูกล่องจริงในภาพ 3 มิติ</p>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {example.choices.map((choice, index) => {
          const verdict = revealed.has(index) ? VERDICTS[choice.verdict] : null
          return (
            <ChoiceCard
              key={index}
              label={CHOICE_LABELS[index]}
              view={choice.view}
              state={verdict?.state ?? 'idle'}
              pressed={shown === index}
              onClick={() => reveal(index)}
              footer={
                verdict ? (
                  <span className={verdict.text}>{verdict.label}</span>
                ) : (
                  <span className="text-ink-faint">แตะเพื่อเฉลย</span>
                )
              }
            />
          )
        })}
      </div>

      {shown !== -1 && <Verdict label={CHOICE_LABELS[shown]} choice={example.choices[shown]} />}
    </section>
  )
}

interface VerdictProps {
  label: string
  choice: ExampleChoice
}

function Verdict({ label, choice }: VerdictProps) {
  const { label: verdict, icon: Icon, panel } = VERDICTS[choice.verdict]
  return (
    <p
      role="status"
      className={`mt-4 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${panel}`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        <span className="font-semibold">
          ข้อ {label} {verdict}:
        </span>{' '}
        {choice.reason}
      </span>
    </p>
  )
}
