import type { ReactNode } from 'react'

const MEDIA_TONES = {
  brand: 'bg-linear-to-br from-brand-50 to-cyan-100 dark:from-brand-500/20 dark:to-cyan-500/10',
  emerald:
    'bg-linear-to-br from-emerald-50 to-teal-100 dark:from-emerald-500/20 dark:to-teal-500/10',
  amber: 'bg-linear-to-br from-amber-50 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/10',
} as const

interface FeatureCardProps {
  media: ReactNode
  /** Colour wash behind the media. */
  tone: keyof typeof MEDIA_TONES
  tag: ReactNode
  aside?: ReactNode
  title: ReactNode
  description: ReactNode
  action: ReactNode
}

/** A recommendation: a picture on a colour wash, a tag, a title, a short description and one action. */
export function FeatureCard({
  media,
  tone,
  tag,
  aside,
  title,
  description,
  action,
}: FeatureCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] bg-surface shadow-[0_1px_2px_rgb(28_25_23/0.06)] ring-1 ring-contrast/5">
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
