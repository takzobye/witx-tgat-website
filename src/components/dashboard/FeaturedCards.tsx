import { Link } from '@tanstack/react-router'
import { ArrowRight, GraduationCap, Trophy } from 'lucide-react'
import { useState } from 'react'
import { methods } from '#/content/methods'
import { questions } from '#/content/questions'
import type { BankProgress } from '#/progress/use-progress'
import { NetDiagram } from '#/components/cube/NetDiagram'
import { MethodPickerDialog } from '#/components/learn/MethodPickerDialog'
import { METHOD_LOOKS } from '#/components/learn/method-looks'
import { DifficultyBadge } from '#/components/quiz/DifficultyBadge'
import { buttonStyles } from '#/components/ui/button-styles'
import { Skeleton } from '#/components/ui/Skeleton'
import { surfaceStyles } from '#/components/ui/surface-styles'
import { toneStyles } from '#/components/ui/tone-styles'

const TAG =
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset'

const MEDIA_TONES = {
  brand: 'bg-linear-to-br from-brand-50 to-cyan-100 dark:from-brand-500/20 dark:to-cyan-500/10',
  emerald:
    'bg-linear-to-br from-emerald-50 to-teal-100 dark:from-emerald-500/20 dark:to-teal-500/10',
  amber: 'bg-linear-to-br from-amber-50 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/10',
} as const

interface FeatureCardProps {
  media: React.ReactNode
  /** Colour wash behind the media. */
  tone: keyof typeof MEDIA_TONES
  tag: React.ReactNode
  aside?: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode
  action: React.ReactNode
}

function FeatureCard({ media, tone, tag, aside, title, description, action }: FeatureCardProps) {
  return (
    <article className={`${surfaceStyles.card} flex flex-col overflow-hidden`}>
      <div className={`grid h-36 place-items-center p-5 ${MEDIA_TONES[tone]}`}>{media}</div>
      <div className="flex flex-1 flex-col p-4 pt-3.5">
        <div className="flex items-center justify-between gap-2 text-xs text-ink-muted">
          {tag}
          {aside}
        </div>
        <h3 className="mt-2.5 font-semibold text-balance text-ink">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{description}</p>
        <div className="mt-auto flex justify-end pt-4">{action}</div>
      </div>
    </article>
  )
}

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
        media={<Trophy className={`size-14 ${toneStyles.emerald.text}`} strokeWidth={1.5} />}
        tag={<span className={`${TAG} ${toneStyles.emerald.badge}`}>ครบแล้ว</span>}
        title="ทำถูกครบทุกข้อแล้ว"
        description="ลองทำซ้ำตั้งแต่ข้อแรกเพื่อพับในหัวให้เร็วและแม่นขึ้น"
        action={
          <Link
            to="/questions/$questionId"
            params={{ questionId: questions[0].id }}
            className={buttonStyles.soft}
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
          className={buttonStyles.soft}
        >
          เริ่มทำ <ArrowRight className="size-4" />
        </Link>
      }
    />
  )
}

/** Step-by-step lessons in the three methods; opens the picker to choose one. */
export function GuidedPracticeCard() {
  const [picking, setPicking] = useState(false)

  return (
    <>
      <FeatureCard
        tone="amber"
        media={
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {methods.map((method) => {
                const { icon: Icon, tile } = METHOD_LOOKS[method.id]
                return (
                  <span
                    key={method.id}
                    title={method.name}
                    className={`grid size-12 place-items-center rounded-2xl shadow-sm ring-1 ring-contrast/5 ${tile}`}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                )
              })}
            </div>
            <p className="text-sm font-bold text-ink">3 สูตรพับกล่อง</p>
          </div>
        }
        tag={
          <span className={`${TAG} ${toneStyles.amber.badge} gap-1`}>
            <GraduationCap className="size-3.5" aria-hidden="true" /> บทเรียน
          </span>
        }
        aside={<span>ทีละขั้น · ภาพ 3 มิติ</span>}
        title="เริ่มฝึกทีละขั้น พร้อมลงสนามสอบจริง"
        description="เลือก 1 ใน 3 สูตรพับกล่อง เรียนทีละขั้นด้วยภาพ 3 มิติ แล้วลองกับโจทย์จริง"
        action={
          <button type="button" onClick={() => setPicking(true)} className={buttonStyles.soft}>
            เลือกวิธีฝึก <ArrowRight className="size-4" />
          </button>
        }
      />
      <MethodPickerDialog open={picking} onClose={() => setPicking(false)} />
    </>
  )
}
