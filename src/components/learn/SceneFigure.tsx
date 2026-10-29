import { Pause, Play, RotateCcw } from 'lucide-react'
import type { LessonStep } from '#/lesson/method'
import { LazyLessonStage } from '#/components/cube-3d/LazyLessonStage'
import type { SceneTimeline } from './use-scene-timeline'

const PLAYBACK = {
  pause: { icon: Pause, label: 'หยุด' },
  resume: { icon: Play, label: 'เล่นต่อ' },
  replay: { icon: RotateCcw, label: 'เล่นอีกครั้ง' },
} as const

interface SceneFigureProps {
  step: LessonStep
  timeline: SceneTimeline
}

/** The step's scene playing in 3D, with its caption and controls to replay or step through it. */
export function SceneFigure({ step, timeline }: SceneFigureProps) {
  const { pose, index, count, playing, held } = timeline
  const playback = PLAYBACK[playing ? 'pause' : held || index < count - 1 ? 'resume' : 'replay']

  return (
    <figure className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
      <div className="relative h-72 sm:h-96 lg:h-[30rem]">
        <LazyLessonStage
          sceneId={step.id}
          arts={step.scene.arts}
          pose={pose}
          onArrive={timeline.onArrive}
        />
        <figcaption
          aria-live="polite"
          className="pointer-events-none absolute inset-x-3 top-3 flex justify-start"
        >
          <span className="max-w-md rounded-2xl bg-surface/90 px-3 py-2 text-sm leading-snug font-medium text-ink shadow-sm ring-1 ring-line backdrop-blur-sm">
            {pose.note}
          </span>
        </figcaption>
      </div>

      <div className="flex items-center gap-3 border-t border-line bg-sunken/80 px-3 py-2.5">
        <button
          type="button"
          onClick={playing ? timeline.pause : timeline.play}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-sm font-medium text-canvas transition hover:bg-ink-soft"
        >
          <playback.icon className="size-4" aria-hidden="true" />
          {playback.label}
        </button>
        <ol aria-label="จังหวะของภาพ" className="flex min-w-0 flex-1 items-center gap-1.5">
          {Array.from({ length: count }, (_, i) => (
            <li key={i} className="flex-1">
              <button
                type="button"
                onClick={() => timeline.goTo(i)}
                aria-label={`จังหวะที่ ${i + 1}`}
                aria-current={!held && i === index ? 'step' : undefined}
                className="group flex w-full py-2"
              >
                <span
                  className={`h-1.5 w-full rounded-full transition ${
                    !held && i === index
                      ? 'bg-brand-600'
                      : i < index
                        ? 'bg-brand-300 dark:bg-brand-400/50'
                        : 'bg-fill-strong group-hover:bg-line-strong'
                  }`}
                />
              </button>
            </li>
          ))}
        </ol>
        <span aria-hidden="true" className="shrink-0 text-xs text-ink-muted tabular-nums">
          {index + 1}/{count}
        </span>
      </div>
    </figure>
  )
}
