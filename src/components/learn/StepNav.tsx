import { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { MethodId } from '#/content/methods'

interface StepNavProps {
  methodId: MethodId
  /** The step on screen, counting from 1. */
  number: number
  /** Steps before the practice question. */
  lessonSteps: number
}

/** Back to the step before, and on to the next one or to the practice question. */
export function StepNav({ methodId, number, lessonSteps }: StepNavProps) {
  return (
    <nav className="flex items-center gap-3 border-t border-line pt-5">
      {number > 1 && (
        <Link
          to="/learn/$methodId"
          params={{ methodId }}
          search={{ step: number - 1 }}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-sunken focus-visible:ring-4 focus-visible:ring-ink-faint/30 focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> ย้อนกลับ
        </Link>
      )}
      <Link
        to="/learn/$methodId"
        params={{ methodId }}
        search={{ step: number + 1 }}
        className="ml-auto inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/30 focus-visible:outline-none"
      >
        {number === lessonSteps ? 'ลองโจทย์จริง' : 'ขั้นถัดไป'}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </nav>
  )
}
