import { Link } from '@tanstack/react-router'
import { ArrowRight, Clock, X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { methods, type MethodId } from '#/content/methods'
import { MethodIcon } from './MethodIcon'

const BADGES: Record<MethodId, string> = {
  'four-walls':
    'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-400/10 dark:text-brand-300 dark:ring-brand-400/25',
  'quick-cut':
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25',
  rolling:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25',
}

interface MethodPickerDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * Lets the learner choose one of the three methods and start its lesson: a sheet rising from
 * the bottom on phones, a centred dialog from `sm` up. Both fade their backdrop and animate in
 * and out of the top layer.
 */
export function MethodPickerDialog({ open, onClose }: MethodPickerDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      // The content fills the dialog, so a click on the dialog element itself hit the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[88dvh] w-full max-w-none translate-y-full overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface p-0 text-ink shadow-2xl ring-1 ring-contrast/10 transition-[translate,opacity,overlay,display] transition-discrete duration-300 ease-out backdrop:bg-stone-950/45 backdrop:opacity-0 backdrop:transition-[opacity,overlay,display] backdrop:transition-discrete backdrop:duration-300 open:translate-y-0 open:backdrop:opacity-100 motion-reduce:transition-none motion-reduce:backdrop:transition-none sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[min(44rem,calc(100dvh-4rem))] sm:w-[calc(100%-3rem)] sm:max-w-xl sm:translate-y-4 sm:rounded-[28px] sm:opacity-0 sm:open:translate-y-0 sm:open:opacity-100 starting:open:translate-y-full starting:open:backdrop:opacity-0 sm:starting:open:translate-y-4 sm:starting:open:opacity-0"
    >
      <div className="px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-6 sm:pb-6">
        <div
          aria-hidden="true"
          className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-fill-strong sm:hidden"
        />
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-ink sm:text-xl">
              เลือกวิธีฝึกพับกล่อง
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              ทั้ง 3 วิธีได้คำตอบเดียวกัน เลือกแบบที่เข้ากับคุณ แล้วเรียนทีละขั้นจนลองโจทย์จริง
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-fill hover:text-ink focus-visible:ring-4 focus-visible:ring-brand-500/30 focus-visible:outline-none"
          >
            <X className="size-5" />
          </button>
        </header>

        <ul className="mt-5 flex flex-col gap-2.5">
          {methods.map((method) => (
            <li key={method.id}>
              <Link
                to="/learn/$methodId"
                params={{ methodId: method.id }}
                onClick={onClose}
                className="group flex items-start gap-4 rounded-2xl p-4 ring-1 ring-line transition hover:bg-sunken hover:ring-line-strong focus-visible:ring-4 focus-visible:ring-brand-500/30 focus-visible:outline-none"
              >
                <MethodIcon methodId={method.id} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-ink">{method.name}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${BADGES[method.id]}`}
                    >
                      {method.badge}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                    {method.tagline}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                    <span>เหมาะกับ{method.bestFor}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {method.steps.length + 1} ขั้น · ราว {method.minutes} นาที
                    </span>
                  </span>
                </span>
                <ArrowRight
                  className="mt-3 size-5 shrink-0 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-ink"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  )
}
