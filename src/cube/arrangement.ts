import { turnArt, type Art } from './art'
import { QUARTER_TURNS, type QuarterTurns } from './geometry'
import {
  DIRECTIONS,
  NetError,
  cellKey,
  foldNet,
  parseLayout,
  sideFacing,
  step,
  type Cell,
  type Direction,
  type FoldedCube,
  type NetFace,
} from './net'

/** Where a face lies in a net, and how far its drawing is turned clockwise from how it was first drawn. */
export interface Placement {
  cell: Cell
  turns: QuarterTurns
}

/**
 * A net as the position of each face. Drawings are kept apart and never change,
 * so the same paper face can be followed as it is moved around the net.
 */
export type Arrangement = Readonly<Record<string, Placement>>

/** Cuts one hinge and folds the loose part flat again against another face. */
export interface Reattach {
  /** The face to move; everything hanging from it moves along. */
  face: string
  /** The neighbour in the net it is cut from. */
  from: string
  /** The face it ends up hanging from. */
  onto: string
}

/** Reads a net drawn as text rows, with every drawing upright. */
export function arrange(rows: readonly string[]): Arrangement {
  return Object.fromEntries(parseLayout(rows).map(({ id, cell }) => [id, { cell, turns: 0 }]))
}

/** The net with each drawing turned as placed, ready to fold. */
export function netFaces(arrangement: Arrangement, arts: Readonly<Record<string, Art>>): NetFace[] {
  return Object.entries(arrangement).map(([id, { cell, turns }]) => ({
    id,
    cell,
    art: turnArt(arts[id] ?? [], turns),
  }))
}

/** Folds an arrangement; `rootId`, if given, stays put. */
export function foldArrangement(
  arrangement: Arrangement,
  arts: Readonly<Record<string, Art>>,
  rootId?: string,
): FoldedCube {
  return foldNet(netFaces(arrangement, arts), rootId)
}

export function sameArrangement(a: Arrangement, b: Arrangement): boolean {
  const ids = Object.keys(a)
  return (
    ids.length === Object.keys(b).length &&
    ids.every((id) => {
      const p = a[id]
      const q = b[id]
      return q !== undefined && p.turns === q.turns && cellKey(p.cell) === cellKey(q.cell)
    })
  )
}

/**
 * Moves `face` and everything hanging from it so it hangs from `onto` instead, along the
 * edge the two share once folded. The loose part turns as one piece, so it still folds
 * into the very same cube. `cube` must be `arrangement` folded.
 */
export function reattach(arrangement: Arrangement, cube: FoldedCube, move: Reattach): Arrangement {
  const { face, from, onto } = move
  const cellOf = (id: string) => {
    const placement = arrangement[id]
    if (!placement) throw new NetError(`ไม่มีหน้า "${id}" ในแผ่นคลี่`)
    return placement.cell
  }
  const foldedOf = (id: string) => {
    const folded = cube.faces.find((f) => f.face.id === id)
    if (!folded) throw new NetError(`ไม่มีหน้า "${id}" ในกล่องที่พับแล้ว`)
    return folded
  }

  if (!DIRECTIONS.some((d) => cellKey(step(cellOf(face), d)) === cellKey(cellOf(from)))) {
    throw new NetError(`หน้า "${face}" ไม่ได้ต่อกับ "${from}" ในแผ่นคลี่`)
  }
  const loose = hangingFrom(arrangement, face, from)
  if (loose.has(onto)) throw new NetError(`หน้า "${onto}" ติดไปกับ "${face}" อยู่แล้ว`)

  const faceSide = sideFacing(foldedOf(face), foldedOf(onto))
  const ontoSide = sideFacing(foldedOf(onto), foldedOf(face))
  const anchor = step(cellOf(onto), ontoSide)
  // Turn the loose part until the side of `face` that meets `onto` points back at it.
  const turns = mod4(DIRECTIONS.indexOf(opposite(ontoSide)) - DIRECTIONS.indexOf(faceSide))
  const [faceCol, faceRow] = cellOf(face)

  const moved: Record<string, Placement> = { ...arrangement }
  for (const id of loose) {
    const { cell, turns: drawn } = arrangement[id]
    const [dCol, dRow] = turnOffset([cell[0] - faceCol, cell[1] - faceRow], turns)
    moved[id] = { cell: [anchor[0] + dCol, anchor[1] + dRow], turns: mod4(drawn + turns) }
  }

  const occupied = new Set(Object.values(moved).map(({ cell }) => cellKey(cell)))
  if (occupied.size !== Object.keys(moved).length) {
    throw new NetError(`ย้าย "${face}" ไปต่อกับ "${onto}" แล้วหน้าซ้อนทับกัน`)
  }
  return moved
}

/** `face` and every face reached from it without crossing its hinge to `cut`. */
function hangingFrom(arrangement: Arrangement, face: string, cut: string): Set<string> {
  const byCell = new Map(Object.entries(arrangement).map(([id, { cell }]) => [cellKey(cell), id]))
  const reached = new Set([face])
  const queue = [face]
  // Faces pushed while iterating are visited too.
  for (const id of queue) {
    for (const direction of DIRECTIONS) {
      const neighbour = byCell.get(cellKey(step(arrangement[id].cell, direction)))
      if (neighbour === undefined || reached.has(neighbour)) continue
      if (id === face && neighbour === cut) continue
      reached.add(neighbour)
      queue.push(neighbour)
    }
  }
  return reached
}

/** Turns a cell offset clockwise on the page (rows grow downwards). */
function turnOffset([col, row]: Cell, turns: QuarterTurns): Cell {
  let turned: Cell = [col, row]
  for (let i = 0; i < turns; i++) turned = [-turned[1], turned[0]]
  return turned
}

function opposite(direction: Direction): Direction {
  return DIRECTIONS[mod4(DIRECTIONS.indexOf(direction) + 2)]
}

function mod4(n: number): QuarterTurns {
  return QUARTER_TURNS[((n % 4) + 4) % 4]
}
