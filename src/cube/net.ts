import { appearanceKey, type Art } from './art'
import {
  IDENTITY,
  QUARTER_TURNS,
  apply,
  multiply,
  quarterTurn,
  type Matrix3,
  type Vec3,
} from './geometry'

export type Direction = 'up' | 'down' | 'left' | 'right'

const DIRECTIONS: readonly Direction[] = ['up', 'right', 'down', 'left']

export type Cell = readonly [col: number, row: number]

export interface NetFace {
  id: string
  cell: Cell
  art: Art
}

export interface FoldNode {
  face: NetFace
  children: readonly FoldChild[]
}

export interface FoldChild extends FoldNode {
  /** Side of the parent face this face hangs from. */
  hinge: Direction
}

export interface FoldedFace {
  face: NetFace
  /** Outward normal once folded, in the root face's frame. */
  normal: Vec3
  /** Where the top of the drawing points once folded, in the root face's frame. */
  up: Vec3
  /** `appearanceKey` of the drawing for each clockwise quarter turn. */
  appearance: readonly string[]
}

export interface FoldedCube {
  /** Fold tree used to animate the net; the root face stays put. */
  root: FoldNode
  faces: readonly FoldedFace[]
}

/**
 * How a face hangs off its parent, in the parent's local frame. A face spans
 * x ∈ [0, 1], y ∈ [-1, 0] with its printed side facing +z; folding turns each
 * child 90° about `axis` at `pivot`, towards -z, so the print ends up outside.
 */
export interface Hinge {
  pivot: Vec3
  /** Child origin relative to the pivot. */
  offset: Vec3
  axis: 'x' | 'y'
  sign: 1 | -1
}

export const HINGES: Record<Direction, Hinge> = {
  right: { pivot: [1, 0, 0], offset: [0, 0, 0], axis: 'y', sign: 1 },
  left: { pivot: [0, 0, 0], offset: [-1, 0, 0], axis: 'y', sign: -1 },
  up: { pivot: [0, 0, 0], offset: [0, 1, 0], axis: 'x', sign: -1 },
  down: { pivot: [0, -1, 0], offset: [0, 0, 0], axis: 'x', sign: 1 },
}

const STEPS: Record<Direction, Cell> = {
  up: [0, -1],
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
}

export class NetError extends Error {
  override name = 'NetError'
}

/** Reads a net drawn as text rows: one character per cell, `.` for an empty cell. */
export function parseLayout(rows: readonly string[]): { id: string; cell: Cell }[] {
  return rows.flatMap((row, rowIndex) =>
    Array.from(row).flatMap((char, col) =>
      char === '.' ? [] : [{ id: char, cell: [col, rowIndex] as const }],
    ),
  )
}

/** Folds a net into a cube, or throws `NetError` if the cells cannot form one. */
export function foldNet(faces: readonly NetFace[]): FoldedCube {
  if (faces.length !== 6) {
    throw new NetError(`แผ่นคลี่ของลูกบาศก์ต้องมี 6 หน้า แต่พบ ${faces.length} หน้า`)
  }

  const byCell = new Map(faces.map((face) => [cellKey(face.cell), face]))
  const folded: FoldedFace[] = []
  const visited = new Set<string>()

  const build = (face: NetFace, orientation: Matrix3): FoldNode => {
    visited.add(face.id)
    folded.push(foldedFace(face, orientation))

    const children: FoldChild[] = []
    for (const hinge of DIRECTIONS) {
      const neighbour = byCell.get(cellKey(step(face.cell, hinge)))
      if (!neighbour || visited.has(neighbour.id)) continue
      const { axis, sign } = HINGES[hinge]
      const child = build(neighbour, multiply(orientation, quarterTurn(axis, sign)))
      children.push({ ...child, hinge })
    }
    return { face, children }
  }

  const root = build(pickRoot(faces, byCell), IDENTITY)

  if (visited.size !== faces.length) {
    throw new NetError('ทุกหน้าของแผ่นคลี่ต้องต่อกันเป็นชิ้นเดียว')
  }
  if (new Set(folded.map((f) => f.normal.join())).size !== faces.length) {
    throw new NetError('แผ่นคลี่นี้พับเป็นลูกบาศก์ไม่ได้ เพราะมีหน้าที่พับแล้วซ้อนทับกัน')
  }
  return { root, faces: folded }
}

/** The face with the most neighbours stays still, so the fold animation stays centred. */
function pickRoot(faces: readonly NetFace[], byCell: Map<string, NetFace>): NetFace {
  const neighbours = (face: NetFace) =>
    DIRECTIONS.filter((direction) => byCell.has(cellKey(step(face.cell, direction)))).length
  return faces.reduce((best, face) => (neighbours(face) > neighbours(best) ? face : best))
}

function foldedFace(face: NetFace, orientation: Matrix3): FoldedFace {
  return {
    face,
    normal: apply(orientation, [0, 0, 1]),
    up: apply(orientation, [0, 1, 0]),
    appearance: QUARTER_TURNS.map((turns) => appearanceKey(face.art, turns)),
  }
}

function step([col, row]: Cell, direction: Direction): Cell {
  const [dc, dr] = STEPS[direction]
  return [col + dc, row + dr]
}

function cellKey([col, row]: Cell): string {
  return `${col},${row}`
}
