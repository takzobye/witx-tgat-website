import { CircleCheck, RotateCcw } from 'lucide-react'
import type { QuestionStatus } from '#/progress/summary'

const STATUSES = {
  solved: {
    label: 'ทำถูกแล้ว',
    icon: CircleCheck,
    className: 'text-emerald-700 dark:text-emerald-400',
  },
  retry: { label: 'ยังไม่ถูก', icon: RotateCcw, className: 'text-amber-700 dark:text-amber-400' },
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
