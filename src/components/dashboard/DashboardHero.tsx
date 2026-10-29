import { Link } from '@tanstack/react-router'
import { CirclePlay, Flag, LayoutGrid, ListChecks, Target } from 'lucide-react'
import { questions } from '#/content/questions'
import { formatPercent } from '#/progress/format'
import type { BankProgress } from '#/progress/use-progress'
import { Skeleton } from '#/components/ui/Skeleton'

/** The page title, a button to start practising, and the headline numbers. */
export function DashboardHero({ progress }: { progress: BankProgress | null }) {
  // Before hydration the visitor counts as new, so the link works without JavaScript.
  const start = progress?.next ?? questions[0]

  return (
    <header>
      <p className="text-sm font-medium text-accent-ink">TGAT2 · ความสามารถทางด้านมิติสัมพันธ์</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">ฝึกพับกล่อง</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-pretty text-ink-soft">
        ดูแผ่นคลี่ เลือกลูกบาศก์ที่พับได้ แล้วเปิดโมเดล 3 มิติดูว่าแต่ละหน้าไปอยู่ตรงไหน
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-x-10 gap-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/questions/$questionId"
            params={{ questionId: start.id }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/30 focus-visible:outline-none"
          >
            <CirclePlay className="size-5" /> เริ่มฝึก
          </Link>
          <Link
            to="/questions"
            aria-label="คลังโจทย์"
            title="คลังโจทย์"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong bg-surface text-ink-soft transition hover:bg-sunken hover:text-ink focus-visible:ring-4 focus-visible:ring-ink-faint/30 focus-visible:outline-none"
          >
            <LayoutGrid className="size-5" />
          </Link>
        </div>
        <ProgressStats progress={progress} />
      </div>
    </header>
  )
}

function ProgressStats({ progress }: { progress: BankProgress | null }) {
  const stats = [
    {
      icon: Flag,
      label: 'ข้อถัดไป',
      value: progress && (progress.next ? `ข้อ ${progress.next.number}` : 'ครบทุกข้อแล้ว'),
    },
    {
      icon: ListChecks,
      label: 'ทำถูกแล้ว',
      value: progress && `${progress.solved} / ${questions.length} ข้อ`,
    },
    {
      icon: Target,
      label: 'ความแม่นยำ',
      value: progress && (progress.accuracy === null ? '—' : formatPercent(progress.accuracy)),
    },
  ]

  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-4">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-surface/80 text-ink-muted ring-1 ring-contrast/10">
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
          <div>
            <dt className="text-xs text-ink-muted">{label}</dt>
            <dd className="text-sm font-semibold text-ink tabular-nums">
              {value ?? <Skeleton className="mt-1 h-4 w-14 rounded-md" />}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
