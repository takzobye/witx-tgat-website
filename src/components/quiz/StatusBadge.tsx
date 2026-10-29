import { CircleCheck, RotateCcw } from 'lucide-react'
import type { QuestionStatus } from '#/progress/summary'
import { toneStyles } from '#/components/ui/tone-styles'

const STATUSES = {
  solved: { label: 'ทำถูกแล้ว', icon: CircleCheck, className: toneStyles.emerald.text },
  retry: { label: 'ยังไม่ถูก', icon: RotateCcw, className: toneStyles.amber.text },
} as const

/** Nothing for questions not tried yet. */
export function StatusBadge({ status }: { status: QuestionStatus }) {
  if (status === 'new') return null
  const { label, icon: Icon, className } = STATUSES[status]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${className}`}>
      <Icon className="size-3.5" aria-hidden="true" /> {label}
    </span>
  )
}
