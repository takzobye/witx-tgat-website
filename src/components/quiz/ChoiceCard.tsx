import { Check, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { CubeView } from '#/cube/view'
import { IsoCube } from '#/components/cube/IsoCube'

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong' | 'muted'

const CARD_STYLES: Record<ChoiceState, string> = {
  idle: 'border-stone-200 hover:border-stone-300',
  selected: 'border-indigo-500 ring-4 ring-indigo-500/15',
  correct: 'border-emerald-500 bg-emerald-50/60 ring-4 ring-emerald-500/15',
  wrong: 'border-rose-500 bg-rose-50/60 ring-4 ring-rose-500/15',
  muted: 'border-stone-200 opacity-75 hover:opacity-100',
}

const BADGE_STYLES: Record<ChoiceState, string> = {
  idle: 'bg-stone-100 text-stone-700',
  selected: 'bg-indigo-600 text-white',
  correct: 'bg-emerald-600 text-white',
  wrong: 'bg-rose-600 text-white',
  muted: 'bg-stone-100 text-stone-500',
}

interface ChoiceCardProps {
  label: string
  view: CubeView
  state: ChoiceState
  pressed: boolean
  onClick: () => void
  /** Small note under the cube. */
  footer?: ReactNode
}

export function ChoiceCard({ label, view, state, pressed, onClick, footer }: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={`ตัวเลือก ${label}`}
      className={`group relative flex flex-col items-center rounded-2xl border-2 bg-white p-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 sm:p-4 ${CARD_STYLES[state]}`}
    >
      <span
        className={`absolute top-2.5 left-2.5 grid size-8 place-items-center rounded-full text-base font-semibold transition ${BADGE_STYLES[state]}`}
      >
        {label}
      </span>
      {state === 'correct' && <Check className="absolute top-3 right-3 size-5 text-emerald-600" />}
      {state === 'wrong' && <X className="absolute top-3 right-3 size-5 text-rose-600" />}
      <IsoCube view={view} className="mt-4 h-28 w-full sm:h-36" />
      <span className="mt-2 flex h-5 items-center text-xs font-medium">{footer}</span>
    </button>
  )
}
