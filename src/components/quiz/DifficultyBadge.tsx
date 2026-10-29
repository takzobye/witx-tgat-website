import { DIFFICULTY_LABELS, type Difficulty } from '#/cube/question'
import { toneStyles } from '#/components/ui/tone-styles'

const STYLES = {
  easy: toneStyles.emerald.badge,
  medium: toneStyles.amber.badge,
  hard: toneStyles.rose.badge,
} as const satisfies Record<Difficulty, string>

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[difficulty]}`}
    >
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  )
}
