import { AlertTriangle, CircleCheck, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { CHOICE_LABELS, type DraftParse } from '#/cube/question'

/** Whether the draft is ready, and if not, what to fix. */
export function DraftStatus({ parsed }: { parsed: DraftParse }) {
  if (parsed.status === 'ready') {
    return parsed.answer.ok ? (
      <Banner tone="success" title={`พร้อมใช้งาน คำตอบคือข้อ ${CHOICE_LABELS[parsed.answer.answer]}`} />
    ) : (
      <Banner tone="warning" title="ยังไม่มีคำตอบที่ชัดเจน">
        {parsed.answer.problem}
      </Banner>
    )
  }
  if (parsed.status === 'syntax-error') {
    return (
      <Banner tone="error" title="รูปแบบ JSON ไม่ถูกต้อง">
        <code className="text-sm">{parsed.message}</code>
      </Banner>
    )
  }
  return (
    <Banner tone="error" title="ยังใช้ไม่ได้ แก้ตามนี้">
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {parsed.issues.map(({ path, message }, i) => (
          <li key={i}>
            {path && (
              <code className="mr-1.5 rounded bg-rose-100 px-1 py-0.5 dark:bg-rose-400/15">
                {path}
              </code>
            )}
            {message}
          </li>
        ))}
      </ul>
    </Banner>
  )
}

const BANNER_TONES = {
  success: {
    box: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200',
    icon: CircleCheck,
  },
  warning: {
    box: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200',
    icon: AlertTriangle,
  },
  error: {
    box: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-200',
    icon: X,
  },
} as const

interface BannerProps {
  tone: keyof typeof BANNER_TONES
  title: string
  children?: ReactNode
}

function Banner({ tone, title, children }: BannerProps) {
  const { box, icon: Icon } = BANNER_TONES[tone]
  return (
    <div role="status" className={`rounded-2xl border px-4 py-3 ${box}`}>
      <p className="flex items-center gap-2 font-semibold">
        <Icon className="size-5 shrink-0" /> {title}
      </p>
      {children && <div className="mt-1">{children}</div>}
    </div>
  )
}
