import { describe, expect, it } from 'vitest'
import type { Art } from './art'
import {
  CUBE_ROTATIONS,
  QUARTER_TURNS,
  apply,
  clockwiseTurns,
  equals,
  type Matrix3,
} from './geometry'
import { foldNet, type FoldedCube } from './net'
import { CUBE_NETS, netFromRows } from './test-nets'
import { SLOT_FRAMES, canFold, matchView, type CubeView, type Slot, type SlotFace } from './view'

/** Looks different in every rotation; the dot size makes each face unique. */
const uniqueArt = (index: number): Art => [
  { type: 'rect', x: 0, y: 50, w: 50, h: 50, fill: 'none' },
  { type: 'circle', cx: 75, cy: 25, r: 4 + index * 3, fill: 'black' },
]

const uniqueArts = Object.fromEntries('ABCDEF'.split('').map((id, i) => [id, uniqueArt(i)]))

/** What the folded cube shows when held in `orientation`. */
function viewOf(cube: FoldedCube, orientation: Matrix3): CubeView {
  const slotFace = (slot: Slot): SlotFace => {
    const frame = SLOT_FRAMES[slot]
    const folded = cube.faces.find((f) => equals(apply(orientation, f.normal), frame.normal))
    if (!folded) throw new Error('Every side is covered')
    const turns = clockwiseTurns(frame.up, apply(orientation, folded.up), frame.normal)
    return { faceId: folded.face.id, art: folded.face.art, turns }
  }
  return { top: slotFace('top'), left: slotFace('left'), right: slotFace('right') }
}

const cubes = CUBE_NETS.map((rows) => foldNet(netFromRows(rows, uniqueArts)))

describe('matchView', () => {
  it('recognises every way of holding every folded net', () => {
    for (const cube of cubes) {
      for (const orientation of CUBE_ROTATIONS) {
        expect(matchView(cube, viewOf(cube, orientation))).toEqual({ orientation, matchedSlots: 3 })
      }
    }
  })

  it('rejects mirror images', () => {
    for (const cube of cubes) {
      for (const orientation of CUBE_ROTATIONS) {
        const view = viewOf(cube, orientation)
        expect(canFold(cube, { ...view, left: view.right, right: view.left })).toBe(false)
      }
    }
  })

  it('reports how close a wrong drawing comes', () => {
    const view = viewOf(cubes[0], CUBE_ROTATIONS[5])
    const turned: CubeView = { ...view, top: { ...view.top, turns: QUARTER_TURNS[(view.top.turns + 1) % 4] } }
    expect(matchView(cubes[0], turned).matchedSlots).toBe(2)
  })

  it('accepts any blank face where a blank face belongs', () => {
    const cube = foldNet(netFromRows(['X...', 'XXXX', '.X..'], { A: uniqueArt(0) }))
    const view = viewOf(cube, CUBE_ROTATIONS[0])
    const blanks = cube.faces.filter((f) => f.face.art.length === 0).map((f) => f.face)
    for (const slot of ['top', 'left', 'right'] as const) {
      if (view[slot].art.length > 0) continue
      for (const blank of blanks) {
        expect(canFold(cube, { ...view, [slot]: { faceId: blank.id, art: blank.art, turns: 0 } })).toBe(true)
      }
    }
  })
})
