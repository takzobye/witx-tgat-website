import { Link } from '@tanstack/react-router'
import type { BankMethod } from '#/content/methods'
import { MethodIcon } from './MethodIcon'

interface LessonHeaderProps {
  method: BankMethod
  /** The step on screen, counting from 1. */
  number: number
}

/** The method's name and a bar of every step; each segment jumps to its step. */
export function LessonHeader({ method, number }: LessonHeaderProps) {
  const titles = [...method.steps.map((step) => step.title), 'ลองโจทย์จริง']

  return (
    <header className="mt-6 mb-6 sm:mb-8">
      <div className="flex items-center gap-3">
        <MethodIcon methodId={method.id} />
        <div className="min-w-0">
          <p className="font-semibold text-ink">{method.name}</p>
          <p className="text-sm text-ink-muted tabular-nums">
            ขั้นที่ {number} จาก {titles.length} · {titles[number - 1]}
          </p>
        </div>
      </div>
      <ol aria-label="ขั้นตอนของบทเรียน" className="mt-4 flex gap-1.5">
        {titles.map((title, i) => (
          <li key={title} className="flex-1">
            <Link
              to="/learn/$methodId"
              params={{ methodId: method.id }}
              search={{ step: i + 1 }}
              aria-label={`ขั้นที่ ${i + 1}: ${title}`}
              aria-current={i + 1 === number ? 'step' : undefined}
              title={title}
              className="group block py-2"
            >
              <span
                className={`block h-1.5 rounded-full transition ${
                  i + 1 === number
                    ? 'bg-brand-600'
                    : i + 1 < number
                      ? 'bg-brand-300 dark:bg-brand-400/50'
                      : 'bg-fill-strong group-hover:bg-line-strong'
                }`}
              />
            </Link>
          </li>
        ))}
      </ol>
    </header>
  )
}
