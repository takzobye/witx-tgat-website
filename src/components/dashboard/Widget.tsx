import { useId } from 'react'

interface WidgetProps {
  title: string
  /** Shown opposite the title, e.g. a count or a small action. */
  aside?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** A titled tray of cards; stretches to the height of its grid row. */
export function Widget({ title, aside, className = '', children }: WidgetProps) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className={`flex flex-col gap-3 ${className}`}>
      <div className="flex min-h-6 items-center justify-between gap-3 px-1">
        <h2 id={headingId} className="text-sm font-semibold text-ink-muted">
          {title}
        </h2>
        {aside}
      </div>
      <div className="flex flex-1 flex-col gap-2 rounded-[28px] bg-contrast/[0.035] p-2 ring-1 ring-contrast/5">
        {children}
      </div>
    </section>
  )
}
