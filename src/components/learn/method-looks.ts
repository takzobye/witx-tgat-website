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
    tile: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300',
    badge:
      'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/25',
  },
  'quick-cut': { icon: Zap, tile: toneStyles.amber.tile, badge: toneStyles.amber.badge },
  rolling: { icon: Dices, tile: toneStyles.emerald.tile, badge: toneStyles.emerald.badge },
} as const satisfies Record<MethodId, MethodLook>
