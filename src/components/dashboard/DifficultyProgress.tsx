import { HardDrive, SignalHigh, SignalLow, SignalMedium } from 'lucide-react'
import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from '#/cube/question'
import { clearAttempts } from '#/progress/attempts'
import type { BankProgress } from '#/progress/use-progress'
import { Skeleton } from '#/components/ui/Skeleton'
import { surfaceStyles } from '#/components/ui/surface-styles'
import { toneStyles } from '#/components/ui/tone-styles'
import { Widget } from './Widget'

const LEVELS = {
  easy: { icon: SignalLow, tile: toneStyles.emerald.tile, bar: 'bg-emerald-500' },
  medium: { icon: SignalMedium, tile: toneStyles.amber.tile, bar: 'bg-amber-500' },
  hard: { icon: SignalHigh, tile: toneStyles.rose.tile, bar: 'bg-rose-500' },
} as const satisfies Record<Difficulty, unknown>

export function DifficultyProgress({ progress }: { progress: BankProgress | null }) {
  const clear = () => {
    if (window.confirm('ล้างประวัติการทำโจทย์ทั้งหมดในเบราว์เซอร์นี้?')) clearAttempts()
  }

  return (
    <Widget title="ความคืบหน้าตามระดับ">
      <ul className="grid gap-2 md:grid-cols-3 xl:grid-cols-1">
        {progress
          ? progress.byDifficulty.map((level) => <LevelRow key={level.difficulty} {...level} />)
          : DIFFICULTIES.map((difficulty) => <LevelRowSkeleton key={difficulty} />)}
      </ul>
      <div
        className={`${surfaceStyles.card} mt-auto flex items-center justify-between gap-3 px-4 py-3`}
      >
        <p className="flex min-w-0 items-center gap-2 text-xs text-ink-muted">
          <HardDrive className="size-4 shrink-0" aria-hidden="true" />
          เก็บไว้ในเบราว์เซอร์นี้
        </p>
        {progress && progress.answered > 0 && (
          <button
            type="button"
            onClick={clear}
            className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-ink-muted transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-400/10 dark:hover:text-rose-300 focus-visible:ring-4 focus-visible:ring-rose-500/20 focus-visible:outline-none"
          >
            ล้างประวัติ
          </button>
        )}
      </div>
    </Widget>
  )
}

interface LevelRowProps {
  difficulty: Difficulty
  solved: number
  total: number
}

function LevelRow({ difficulty, solved, total }: LevelRowProps) {
  const { icon: Icon, tile, bar } = LEVELS[difficulty]
  return (
    <li className={`${surfaceStyles.card} flex flex-col gap-3 p-3.5`}>
      <div className="flex items-center gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tile}`}>
          <Icon className="size-6" strokeWidth={2.75} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{DIFFICULTY_LABELS[difficulty]}</p>
          <p className="text-xs text-ink-muted">
            ถูก {solved} จาก {total} ข้อ
          </p>
        </div>
        {solved === total ? (
          <span className={`text-xs font-semibold ${toneStyles.emerald.text}`}>ครบแล้ว</span>
        ) : (
          <span className="text-xs text-ink-faint tabular-nums">
            {Math.round((solved / total) * 100)}%
          </span>
        )}
      </div>
      <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-fill">
        <div
          className={`h-full rounded-full transition-[width] ${bar}`}
          style={{ width: `${(solved / total) * 100}%` }}
        />
      </div>
    </li>
  )
}

function LevelRowSkeleton() {
  return (
    <li className={`${surfaceStyles.card} flex flex-col gap-3 p-3.5`}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-1.5 rounded-full" />
    </li>
  )
}
