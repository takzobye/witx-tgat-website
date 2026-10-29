import { Lightbulb, Timer, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { LessonStep } from '#/lesson/method'
import { HandsOnFigure } from './HandsOnFigure'
import { SceneFigure } from './SceneFigure'
import { useSceneTimeline } from './use-scene-timeline'
import { WorkedExample } from './WorkedExample'

interface StepViewProps {
  step: LessonStep
  number: number
  /** Links to the neighbouring steps. */
  nav: ReactNode
}

/** A lesson step: its 3D figure beside the explanation. */
export function StepView({ step, number, nav }: StepViewProps) {
  return step.handsOn ? (
    <HandsOnStep step={step} number={number} nav={nav} />
  ) : (
    <WatchStep step={step} number={number} nav={nav} />
  )
}

/** A step taught by a 3D scene that plays by itself, with an optional example to sort. */
function WatchStep({ step, number, nav }: StepViewProps) {
  const timeline = useSceneTimeline(step.scene)
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
      {/* Sticky, so the 3D figure stays in view while the explanation scrolls past. */}
      <div className="lg:sticky lg:top-6">
        <SceneFigure step={step} timeline={timeline} />
      </div>
      <StepArticle step={step} number={number} nav={nav}>
        {step.example && (
          <WorkedExample
            key={step.id}
            example={step.example}
            held={timeline.held}
            onHold={timeline.hold}
          />
        )}
      </StepArticle>
    </div>
  )
}

/** A step where the learner folds the net by hand. */
function HandsOnStep({ step, number, nav }: StepViewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
      <div className="lg:sticky lg:top-6">
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
      <Callout
        icon={Lightbulb}
        title="กฎที่ต้องจำ"
        className="border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-400/25 dark:bg-brand-400/10 dark:text-brand-200"
      >
        {step.rule}
      </Callout>
      {step.examTip && (
        <Callout
          icon={Timer}
          title="เทคนิคในห้องสอบ"
          className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200"
        >
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
