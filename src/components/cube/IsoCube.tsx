import { ART_SIZE, COLORS } from '#/cube/art'
import { SLOTS, type CubeView, type Slot } from '#/cube/view'
import { FaceArt } from './FaceArt'

type Vec2 = readonly [number, number]

const COS_30 = Math.sqrt(3) / 2
const PADDING = 4
const OUTLINE_WIDTH = 3.5

// Screen direction of one cube edge along +x, +y and +z (SVG y points down).
const X: Vec2 = [COS_30 * ART_SIZE, ART_SIZE / 2]
const Y: Vec2 = [0, -ART_SIZE]
const Z: Vec2 = [-COS_30 * ART_SIZE, ART_SIZE / 2]

const add = (...vectors: Vec2[]): Vec2 => [
  vectors.reduce((sum, [x]) => sum + x, 0),
  vectors.reduce((sum, [, y]) => sum + y, 0),
]
const negate = ([x, y]: Vec2): Vec2 => [-x, -y]

/**
 * Where each slot's art box lands: its top-left corner, and the screen directions of
 * the drawing's right (u) and down (v) edges. Matches `SLOT_FRAMES` in `#/cube/view`.
 */
const SLOT_PLACEMENT: Record<Slot, { origin: Vec2; u: Vec2; v: Vec2 }> = {
  top: { origin: Y, u: X, v: Z },
  left: { origin: add(Y, Z), u: X, v: negate(Y) },
  right: { origin: add(X, Y, Z), u: negate(Z), v: negate(Y) },
}

const SLOT_TRANSFORM = mapSlots(({ origin, u, v }) => {
  const scale = (n: number) => n / ART_SIZE
  return `matrix(${scale(u[0])} ${scale(u[1])} ${scale(v[0])} ${scale(v[1])} ${origin[0]} ${origin[1]})`
})

const SLOT_OUTLINE = mapSlots(({ origin, u, v }) =>
  [origin, add(origin, u), add(origin, u, v), add(origin, v)].map((p) => p.join(',')).join(' '),
)

const WIDTH = 2 * COS_30 * ART_SIZE + 2 * PADDING
const HEIGHT = 2 * ART_SIZE + 2 * PADDING

/** A cube drawn in isometric view, the way answer choices appear in the exam. */
export function IsoCube({ view, className }: { view: CubeView; className?: string }) {
  return (
    <svg
      viewBox={`${-WIDTH / 2} ${-HEIGHT / 2} ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="ลูกบาศก์"
      className={className}
    >
      {SLOTS.map((slot) => (
        <g
          key={slot}
          transform={`${SLOT_TRANSFORM[slot]} rotate(${view[slot].turns * 90} ${ART_SIZE / 2} ${ART_SIZE / 2})`}
        >
          <FaceArt art={view[slot].art} />
        </g>
      ))}
      {SLOTS.map((slot) => (
        <polygon
          key={slot}
          points={SLOT_OUTLINE[slot]}
          fill="none"
          stroke={COLORS.ink}
          strokeWidth={OUTLINE_WIDTH}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

function mapSlots<T>(fn: (placement: (typeof SLOT_PLACEMENT)[Slot]) => T): Record<Slot, T> {
  return {
    top: fn(SLOT_PLACEMENT.top),
    left: fn(SLOT_PLACEMENT.left),
    right: fn(SLOT_PLACEMENT.right),
  }
}
