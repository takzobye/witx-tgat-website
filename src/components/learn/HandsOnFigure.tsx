import { useState } from 'react'
import type { LessonStep } from '#/lesson/method'
import { LazyFoldStage } from '#/components/cube-3d/LazyFoldStage'

/** For hands-on steps: the learner folds the net with a slider and turns it round themselves. */
export function HandsOnFigure({ step }: { step: LessonStep }) {
  const [fold, setFold] = useState(0)
  return (
    <figure className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
      <div className="h-72 sm:h-96 lg:h-[30rem]">
        <LazyFoldStage
          cube={step.scene.cube}
          fold={fold}
          onFoldChange={setFold}
          orientation={null}
        />
      </div>
      <figcaption className="border-t border-line px-4 py-2.5 text-sm text-ink-muted">
        {step.scene.poses[0].note}
      </figcaption>
    </figure>
  )
}
