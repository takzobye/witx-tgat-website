import { Link, createFileRoute } from '@tanstack/react-router'
import { CirclePlay, Flag, LayoutGrid, ListChecks, Target } from 'lucide-react'
import { questions } from '#/content/questions'
import { formatPercent } from '#/progress/format'
import { useProgress, type BankProgress } from '#/progress/use-progress'
import { DifficultyProgress } from '#/components/dashboard/DifficultyProgress'
import { GuidedPracticeCard, NextQuestionCard } from '#/components/dashboard/FeaturedCards'
import { QuestionShelf } from '#/components/dashboard/QuestionShelf'
import { RecentAnswers } from '#/components/dashboard/RecentAnswers'
import { WeeklyActivity } from '#/components/dashboard/WeeklyActivity'
import { Widget } from '#/components/dashboard/Widget'
import { Skeleton } from '#/components/ui/Skeleton'

export const Route = createFileRoute('/')({ component: DashboardPage })

function DashboardPage() {
  const progress = useProgress()

  return (
    <div className="flex flex-col gap-10 pt-8 sm:pt-12">
      <Hero progress={progress} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Widget title="แนะนำสำหรับคุณ">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <NextQuestionCard progress={progress} />
            <GuidedPracticeCard />
          </div>
        </Widget>
        <DifficultyProgress progress={progress} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr]">
        <WeeklyActivity progress={progress} />
        <QuestionShelf progress={progress} />
        <RecentAnswers progress={progress} className="md:col-span-2 xl:col-span-1" />
      </div>
    </div>
  )
}

function Hero({ progress }: { progress: BankProgress | null }) {
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
