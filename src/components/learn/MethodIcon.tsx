import { BrickWall, Dices, Zap, type LucideIcon } from 'lucide-react'
import type { MethodId } from '#/content/methods'

const LOOKS: Record<MethodId, { icon: LucideIcon; tile: string }> = {
  'four-walls': {
    icon: BrickWall,
    tile: 'bg-brand-50 text-brand-600 dark:bg-brand-400/10 dark:text-brand-300',
  },
  'quick-cut': {
    icon: Zap,
    tile: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400',
  },
  rolling: {
    icon: Dices,
    tile: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400',
  },
}

interface MethodIconProps {
  methodId: MethodId
  title?: string
  /** Extra styling for the tile, e.g. a shadow. */
  className?: string
}

/** How each method is recognised across the app: its icon on a tile in its colour. */
export function MethodIcon({ methodId, title, className = '' }: MethodIconProps) {
  const { icon: Icon, tile } = LOOKS[methodId]
  return (
    <span
      title={title}
      className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tile} ${className}`}
    >
      <Icon className="size-6" aria-hidden="true" />
    </span>
  )
}
