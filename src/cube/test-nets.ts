import type { Art } from './art'
import { parseLayout, type NetFace } from './net'

/** Builds a net from rows where `X` marks a face; faces are named A, B, C… in reading order. */
export function netFromRows(rows: readonly string[], arts: Record<string, Art> = {}): NetFace[] {
  let next = 0
  const named = rows.map((row) =>
    row.replace(/X/g, () => String.fromCharCode('A'.charCodeAt(0) + next++)),
  )
  return parseLayout(named).map(({ id, cell }) => ({ id, cell, art: arts[id] ?? [] }))
}

/** The 11 nets of a cube. */
export const CUBE_NETS: readonly (readonly string[])[] = [
  ['X...', 'XXXX', 'X...'],
  ['X...', 'XXXX', '.X..'],
  ['X...', 'XXXX', '..X.'],
  ['X...', 'XXXX', '...X'],
  ['.X..', 'XXXX', '.X..'],
  ['.X..', 'XXXX', '..X.'],
  ['XX..', '.XXX', '.X..'],
  ['XX..', '.XXX', '..X.'],
  ['XX..', '.XXX', '...X'],
  ['XX..', '.XX.', '..XX'],
  ['XXX..', '..XXX'],
]
