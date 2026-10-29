import { ClientOnly } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import type { LessonStageProps } from './LessonStage'

const LessonStage = lazy(() => import('./LessonStage'))

/** The lesson's 3D stage, rendered on the client only and split out so three.js loads when first needed. */
export function LazyLessonStage(props: LessonStageProps) {
  const loading = (
    <div className="grid h-full place-items-center text-sm text-ink-faint">กำลังโหลดโมเดล 3D…</div>
  )
  return (
    <ClientOnly fallback={loading}>
      <Suspense fallback={loading}>
        <LessonStage {...props} />
      </Suspense>
    </ClientOnly>
  )
}
