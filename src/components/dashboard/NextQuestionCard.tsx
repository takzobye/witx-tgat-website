import { Link } from '@tanstack/react-router'
import { ArrowRight, Trophy } from 'lucide-react'
import { questions } from '#/content/questions'
import type { BankProgress } from '#/progress/use-progress'
import { NetDiagram } from '#/components/cube/NetDiagram'
import { DifficultyBadge } from '#/components/quiz/DifficultyBadge'
import { Skeleton } from '#/components/ui/Skeleton'
import { FeatureCard } from './FeatureCard'

/** The question to do next, or a nudge to review once every question is solved. */
export function NextQuestionCard({ progress }: { progress: BankProgress | null }) {
  if (!progress) {
    return (
      <FeatureCard
        tone="brand"
        media={null}
        tag={<Skeleton className="h-5 w-16 rounded-full" />}
        title={<Skeleton className="h-5 w-40 rounded-md" />}
        description={<Skeleton className="h-4 w-56 max-w-full rounded-md" />}
        action={<Skeleton className="h-10 w-28 rounded-full" />}
      />
    )
  }

  const { next } = progress
  if (!next) {
    return (
      <FeatureCard
        tone="emerald"
        media={
          <Trophy className="size-14 text-emerald-700 dark:text-emerald-400" strokeWidth={1.5} />
        }
        tag={
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25">
            ครบแล้ว
          </span>
        }
        title="ทำถูกครบทุกข้อแล้ว"
        description="ลองทำซ้ำตั้งแต่ข้อแรกเพื่อพับในหัวให้เร็วและแม่นขึ้น"
        action={
          <Link
            to="/questions/$questionId"
            params={{ questionId: questions[0].id }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-soft px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:bg-brand-100 focus-visible:ring-4 focus-visible:ring-brand-500/30 focus-visible:outline-none dark:hover:bg-brand-400/25"
          >
            ทบทวนอีกรอบ <ArrowRight className="size-4" />
          </Link>
        }
      />
    )
  }

  return (
    <FeatureCard
      tone="brand"
      media={<NetDiagram net={next.net} className="max-h-full w-full" />}
      tag={<DifficultyBadge difficulty={next.difficulty} />}
      aside={<span className="tabular-nums">ข้อถัดไป · ข้อ {next.number}</span>}
      title={next.title}
      description={next.prompt}
      action={
        <Link
          to="/questions/$questionId"
          params={{ questionId: next.id }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-soft px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:bg-brand-100 focus-visible:ring-4 focus-visible:ring-brand-500/30 focus-visible:outline-none dark:hover:bg-brand-400/25"
        >
          เริ่มทำ <ArrowRight className="size-4" />
        </Link>
      }
    />
  )
}
