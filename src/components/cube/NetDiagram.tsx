import { ART_SIZE, COLORS, STROKE_WIDTH } from '#/cube/art'
import type { NetFace } from '#/cube/net'
import { FaceArt } from './FaceArt'

const PADDING = 4

interface Edge {
  from: readonly [number, number]
  to: readonly [number, number]
  /** Shared by two faces, so the paper folds here. */
  fold: boolean
}

interface NetDiagramProps {
  net: readonly NetFace[]
  /** Label each face with its id, for authoring. */
  showIds?: boolean
  className?: string
}

/** A net drawn like the exam: solid outline, dashed fold lines. */
export function NetDiagram({ net, showIds = false, className }: NetDiagramProps) {
  const minCol = Math.min(...net.map((f) => f.cell[0]))
  const minRow = Math.min(...net.map((f) => f.cell[1]))
  const width = (Math.max(...net.map((f) => f.cell[0])) - minCol + 1) * ART_SIZE
  const height = (Math.max(...net.map((f) => f.cell[1])) - minRow + 1) * ART_SIZE
  const originOf = (face: NetFace) =>
    [(face.cell[0] - minCol) * ART_SIZE, (face.cell[1] - minRow) * ART_SIZE] as const

  return (
    <svg
      viewBox={`${-PADDING} ${-PADDING} ${width + 2 * PADDING} ${height + 2 * PADDING}`}
      role="img"
      aria-label="แผ่นคลี่ของลูกบาศก์"
      className={`dark:figure-rim ${className ?? ''}`}
    >
      {net.map((face) => {
        const [x, y] = originOf(face)
        return (
          <g key={face.id} transform={`translate(${x} ${y})`}>
            <FaceArt art={face.art} />
            {showIds && <FaceIdBadge id={face.id} />}
          </g>
        )
      })}
      {netEdges(net).map(({ from, to, fold }) => {
        const [fx, fy] = from
        const [tx, ty] = to
        return (
          <line
            key={`${fx},${fy},${tx},${ty}`}
            x1={(fx - minCol) * ART_SIZE}
            y1={(fy - minRow) * ART_SIZE}
            x2={(tx - minCol) * ART_SIZE}
            y2={(ty - minRow) * ART_SIZE}
            stroke={COLORS.ink}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap={fold ? 'butt' : 'square'}
            strokeDasharray={fold ? '7 6' : undefined}
          />
        )
      })}
    </svg>
  )
}

function FaceIdBadge({ id }: { id: string }) {
  return (
    <g transform="translate(14 14)">
      <circle r={10} className="fill-indigo-600" />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-white text-[12px] font-semibold"
      >
        {id}
      </text>
    </g>
  )
}

/** Every cell edge in grid units, once each. */
function netEdges(net: readonly NetFace[]): Edge[] {
  const occupied = new Set(net.map(({ cell }) => `${cell[0]},${cell[1]}`))
  const has = (col: number, row: number) => occupied.has(`${col},${row}`)
  const edges: Edge[] = []

  for (const {
    cell: [c, r],
  } of net) {
    edges.push({ from: [c + 1, r], to: [c + 1, r + 1], fold: has(c + 1, r) })
    edges.push({ from: [c, r + 1], to: [c + 1, r + 1], fold: has(c, r + 1) })
    if (!has(c - 1, r)) edges.push({ from: [c, r], to: [c, r + 1], fold: false })
    if (!has(c, r - 1)) edges.push({ from: [c, r], to: [c + 1, r], fold: false })
  }
  return edges
}
