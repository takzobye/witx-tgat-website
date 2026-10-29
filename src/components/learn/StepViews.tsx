import { Lightbulb, Timer, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { LessonStep } from '#/lesson/method'
import { toneStyles } from '#/components/ui/tone-styles'
import { HandsOnFigure, SceneFigure } from './SceneFigure'
import { useSceneTimeline } from './use-scene-timeline'
import { WorkedExample } from './WorkedExample'

const LAYOUT = 'grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start'
/** Keeps the 3D figure in view while the explanation scrolls past on wide screens. */
const FIGURE_COLUMN = 'lg:sticky lg:top-6'

const RULE_PANEL =
  'border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-400/25 dark:bg-brand-400/10 dark:text-brand-200'

interface StepViewProps {
  step: LessonStep
  number: number
  /** Links to the neighbouring steps. */
  nav: ReactNode
}

/** A step taught by a 3D scene that plays by itself, with an optional example to sort. */
export function WatchStepView({ step, number, nav }: StepViewProps) {
  const timeline = useSceneTimeline(step.scene)
  return (
    <div className={LAYOUT}>
      <div className={FIGURE_COLUMN}>
        <SceneFigure step={step} timeline={timeline} />
      </div>
      <StepArticle step={step} number={number} nav={nav}>
        {step.example && (
          <WorkedExample key={step.id} example={step.example} held={timeline.held} onHold={timeline.hold} />
        )}
      </StepArticle>
    </div>
  )
}

/** A step where the learner folds the net by hand. */
export function HandsOnStepView({ step, number, nav }: StepViewProps) {
  return (
    <div className={LAYOUT}>
      <div className={FIGURE_COLUMN}>
        <HandsOnFigure step={step} />
      </div>
      <StepArticle step={step} number={number} nav={nav} />
    </div>
  )
}

function StepArticle({ step, number, nav, children }: StepViewProps & { children?: ReactNode }) {
  return (
    <article className="flex flex-col gap-5">
      <header>
        <p className="text-sm font-medium text-accent-ink">ขั้นที่ {number}</p>
        <h1 className="mt-1 text-2xl font-bold text-balance sm:text-3xl">{step.title}</h1>
      </header>
      <div className="space-y-3 leading-relaxed text-pretty text-ink-soft">
        {step.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <Callout icon={Lightbulb} title="กฎที่ต้องจำ" className={RULE_PANEL}>
        {step.rule}
      </Callout>
      {step.examTip && (
        <Callout icon={Timer} title="เทคนิคในห้องสอบ" className={toneStyles.amber.panel}>
          {step.examTip}
        </Callout>
      )}
      {children}
      {nav}
    </article>
  )
}

interface CalloutProps {
  icon: LucideIcon
  title: string
  /** Border, background and text colours. */
  className: string
  children: ReactNode
}

function Callout({ icon: Icon, title, className, children }: CalloutProps) {
  return (
    <div className={`flex gap-3 rounded-2xl border px-4 py-3 ${className}`}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold tracking-wide opacity-80">{title}</p>
        <p className="mt-0.5 leading-relaxed font-medium">{children}</p>
      </div>
    </div>
  )
}
