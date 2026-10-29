import { describe, expect, it } from 'vitest'
import type { Art } from './art'
import { CUBE_ROTATIONS, apply, clockwiseTurns, equals } from './geometry'
import { arrange, foldArrangement, reattach, sameArrangement, type Arrangement } from './arrangement'
import { NetError, type FoldedCube } from './net'
import { CUBE_NETS } from './test-nets'

/** Looks different in every rotation, and every face differs from the others. */
const uniqueArts: Record<string, Art> = Object.fromEntries(
  'ABCDEF'.split('').map((id, i) => [
    id,
    [
      { type: 'rect', x: 0, y: 50, w: 50, h: 50, fill: 'none' },
      { type: 'circle', cx: 75, cy: 25, r: 4 + i * 3, fill: 'black' },
    ],
  ]),
)

/** Two foldings make the same cube when one rotation lines up every face and its drawing. */
function sameCube(a: FoldedCube, b: FoldedCube): boolean {
  return CUBE_ROTATIONS.some((rotation) =>
    a.faces.every((face) => {
      const twin = b.faces.find((f) => f.face.id === face.face.id)
      if (!twin || !equals(apply(rotation, face.normal), twin.normal)) return false
      const turns = clockwiseTurns(twin.up, apply(rotation, face.up), twin.normal)
      return twin.appearance[0] === face.appearance[turns]
    }),
  )
}

const fold = (arrangement: Arrangement) => foldArrangement(arrangement, uniqueArts)

describe('reattach', () => {
  it('rolls a face round the corner onto the next wall', () => {
    //  . A . .        . . A .
    //  B C D E   →    B C D E
    //  . F . .        . F . .
    const start = arrange(['.A..', 'BCDE', '.F..'])
    const rolled = reattach(start, fold(start), { face: 'A', from: 'C', onto: 'D' })

    expect(rolled.A).toEqual({ cell: [2, 0], turns: 1 })
    expect(sameCube(fold(start), fold(rolled))).toBe(true)
  })

  it('slides the end of the wall loop, with whatever hangs from it, to the other end', () => {
    //  A . . .        . . . . A
    //  B C D E   →    . C D E B
    //  . F . .        . F . . .
    const start = arrange(['A...', 'BCDE', '.F..'])
    const slid = reattach(start, fold(start), { face: 'B', from: 'C', onto: 'E' })

    expect(slid.B).toEqual({ cell: [4, 1], turns: 0 })
    expect(slid.A).toEqual({ cell: [4, 0], turns: 0 })
    expect(sameCube(fold(start), fold(slid))).toBe(true)
  })

  it('keeps the cube for every possible move on every net', () => {
    let moves = 0
    for (const rows of CUBE_NETS) {
      const start = arrange(rowsWithIds(rows))
      const cube = fold(start)
      for (const [face, { cell }] of Object.entries(start)) {
        for (const [from, other] of Object.entries(start)) {
          if (Math.abs(other.cell[0] - cell[0]) + Math.abs(other.cell[1] - cell[1]) !== 1) continue
          for (const onto of Object.keys(start)) {
            const move = { face, from, onto }
            let moved: Arrangement
            try {
              moved = reattach(start, cube, move)
            } catch (error) {
              // Opposite faces, faces carried along, and overlapping cells are refused.
              expect(error).toBeInstanceOf(NetError)
              continue
            }
            expect(sameCube(cube, fold(moved)), JSON.stringify({ rows, move })).toBe(true)
            moves++
          }
        }
      }
    }
    expect(moves).toBeGreaterThan(100)
  })

  it('refuses faces that are not neighbours in the net', () => {
    const start = arrange(['.A..', 'BCDE', '.F..'])
    expect(() => reattach(start, fold(start), { face: 'A', from: 'D', onto: 'B' })).toThrow(NetError)
  })

  it('refuses to hang a face from the face opposite it', () => {
    const start = arrange(['.A..', 'BCDE', '.F..'])
    expect(() => reattach(start, fold(start), { face: 'A', from: 'C', onto: 'F' })).toThrow(NetError)
  })
})

describe('sameArrangement', () => {
  it('compares cells and turns, not identity', () => {
    expect(sameArrangement(arrange(['AB', '.C']), arrange(['AB', '.C']))).toBe(true)
    expect(sameArrangement(arrange(['AB', '.C']), arrange(['AB', 'C.']))).toBe(false)
  })
})

/** The `X` rows of a test net with faces named A, B, C… in reading order. */
function rowsWithIds(rows: readonly string[]): string[] {
  let next = 0
  return rows.map((row) => row.replace(/X/g, () => String.fromCharCode(65 + next++)))
}
