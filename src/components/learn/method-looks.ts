import { BrickWall, Dices, Zap, type LucideIcon } from 'lucide-react'
import type { MethodId } from '#/content/methods'
import { toneStyles } from '#/components/ui/tone-styles'

interface MethodLook {
  icon: LucideIcon
  /** Icon tile. */
  tile: string
  /** Small pill, e.g. the method's badge. */
  badge: string
}

/** How each method is recognised across the app. */
export const METHOD_LOOKS = {
  'four-walls': {
    icon: BrickWall,
    tile: 'bg-brand-50 text-brand-600 dark:bg-brand-400/10 dark:text-brand-300',
    badge:
      'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-400/10 dark:text-brand-300 dark:ring-brand-400/25',
  },
  'quick-cut': { icon: Zap, tile: toneStyles.amber.tile, badge: toneStyles.amber.badge },
  rolling: { icon: Dices, tile: toneStyles.emerald.tile, badge: toneStyles.emerald.badge },
} as const satisfies Record<MethodId, MethodLook>
