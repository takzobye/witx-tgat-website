import { ClientOnly } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import type { FoldStageProps } from './FoldStage'

const FoldStage = lazy(() => import('./FoldStage'))

/** The 3D stage, rendered on the client only and split out so three.js loads when first needed. */
export function LazyFoldStage(props: FoldStageProps) {
  const loading = (
    <div className="grid h-full place-items-center text-sm text-ink-faint">กำลังโหลดโมเดล 3D…</div>
  )
  return (
    <ClientOnly fallback={loading}>
      <Suspense fallback={loading}>
        <FoldStage {...props} />
      </Suspense>
    </ClientOnly>
  )
}
