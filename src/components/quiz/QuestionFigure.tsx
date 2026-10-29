import { Box, Grid2x2 } from 'lucide-react'
import type { FoldedCube, NetFace } from '#/cube/net'
import { CHOICE_LABELS } from '#/cube/question'
import { matchView, type CubeView, type ViewMatch } from '#/cube/view'
import { NetDiagram } from '#/components/cube/NetDiagram'
import { LazyFoldStage } from '#/components/cube-3d/LazyFoldStage'
import type { FigureMode, FigureState } from './use-figure-state'

interface QuestionFigureProps {
  net: readonly NetFace[]
  cube: FoldedCube
  choices: readonly CubeView[]
  /** What to show, from `useFigureState`. */
  figure: FigureState
  showFaceIds?: boolean
}

const MODES: { value: FigureMode; label: string; icon: typeof Box }[] = [
  { value: 'net', label: 'แผ่นคลี่', icon: Grid2x2 },
  { value: '3d', label: 'พับ 3D', icon: Box },
]

/** The question's net, switchable to an interactive 3D model of it folding. */
export function QuestionFigure({
  net,
  cube,
  choices,
  figure,
  showFaceIds = false,
}: QuestionFigureProps) {
  const { mode, fold, comparedIndex } = figure
  // A draft in the lab can lose choices while it is edited; a choice that is gone is not compared.
  const comparison =
    comparedIndex === null || comparedIndex >= choices.length
      ? null
      : { label: CHOICE_LABELS[comparedIndex], match: matchView(cube, choices[comparedIndex]) }

  return (
    <figure className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <figcaption className="text-sm font-semibold text-ink-soft">
          {mode === 'net' ? 'แผ่นคลี่' : 'โมเดลจำลองการพับ'}
        </figcaption>
        <div role="group" aria-label="มุมมอง" className="flex rounded-full bg-fill p-1">
          {MODES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => figure.setMode(value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition ${
                mode === value ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-80 sm:h-96">
        {mode === 'net' ? (
          <div className="grid h-full place-items-center p-6 sm:p-10">
            <NetDiagram net={net} showIds={showFaceIds} className="max-h-full w-full" />
          </div>
        ) : (
          <LazyFoldStage
            cube={cube}
            fold={fold}
            onFoldChange={figure.setFold}
            orientation={comparison?.match.orientation ?? null}
            caption={comparison ? comparisonCaption(comparison) : undefined}
          />
        )}
      </div>
    </figure>
  )
}

function comparisonCaption({ label, match }: { label: string; match: ViewMatch }): string {
  return match.matchedSlots === 3
    ? `ตัวเลือก ${label}: ตรงกับกล่องจริงทุกหน้า`
    : `ตัวเลือก ${label}: กล่องจริงตรงกับรูปเพียง ${match.matchedSlots} จาก 3 หน้า`
}
