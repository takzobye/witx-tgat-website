import { describe, expect, it } from 'vitest'
import { appearanceKey, turnArt, type Art } from './art'
import { QUARTER_TURNS } from './geometry'

const turnsOf = (art: Art) => QUARTER_TURNS.map((turns) => appearanceKey(art, turns))

describe('appearanceKey', () => {
  it('treats every blank face as identical in any rotation', () => {
    expect(new Set(turnsOf([])).size).toBe(1)
  })

  it('detects full rotational symmetry', () => {
    const centredSquare: Art = [{ type: 'rect', x: 25, y: 25, w: 50, h: 50, fill: 'black' }]
    expect(new Set(turnsOf(centredSquare)).size).toBe(1)
  })

  it('detects half-turn symmetry', () => {
    const stripes: Art = [
      { type: 'rect', x: 0, y: 29, w: 100, h: 11, fill: 'black' },
      { type: 'rect', x: 0, y: 60, w: 100, h: 11, fill: 'black' },
    ]
    const [up, right, down, left] = turnsOf(stripes)
    expect(down).toBe(up)
    expect(left).toBe(right)
    expect(right).not.toBe(up)
  })

  it('tells every rotation of an asymmetric drawing apart', () => {
    const corner: Art = [{ type: 'rect', x: 0, y: 50, w: 50, h: 50, fill: 'none' }]
    expect(new Set(turnsOf(corner)).size).toBe(4)
  })

  it('ignores how a shape is written down', () => {
    const asRect: Art = [{ type: 'rect', x: 10, y: 20, w: 30, h: 40, fill: 'gray' }]
    const asPolygon: Art = [
      {
        type: 'polygon',
        points: [
          [10, 60],
          [40, 60],
          [40, 20],
          [10, 20],
        ],
        fill: 'gray',
      },
    ]
    expect(appearanceKey(asPolygon, 0)).toBe(appearanceKey(asRect, 0))
  })

  it('ignores shape order and line direction', () => {
    const a: Art = [
      { type: 'line', from: [0, 0], to: [100, 100] },
      { type: 'circle', cx: 20, cy: 80, r: 8, fill: 'black' },
    ]
    const b: Art = [
      { type: 'circle', cx: 20, cy: 80, r: 8, fill: 'black' },
      { type: 'line', from: [100, 100], to: [0, 0] },
    ]
    expect(appearanceKey(b, 2)).toBe(appearanceKey(a, 2))
  })

  it('turns clockwise with y pointing down', () => {
    const dotTop: Art = [{ type: 'circle', cx: 50, cy: 10, r: 5, fill: 'black' }]
    const dotRight: Art = [{ type: 'circle', cx: 90, cy: 50, r: 5, fill: 'black' }]
    expect(appearanceKey(dotTop, 1)).toBe(appearanceKey(dotRight, 0))
  })
})

describe('turnArt', () => {
  const sampler: Art = [
    { type: 'rect', x: 0, y: 50, w: 50, h: 30, fill: 'none' },
    { type: 'circle', cx: 75, cy: 25, r: 8, fill: 'gray' },
    { type: 'polygon', points: [[10, 10], [40, 10], [10, 30]], fill: 'black' },
    { type: 'line', from: [0, 0], to: [100, 60] },
  ]

  it('draws what appearanceKey describes for every turn', () => {
    for (const turns of QUARTER_TURNS) {
      expect(appearanceKey(turnArt(sampler, turns), 0)).toBe(appearanceKey(sampler, turns))
    }
  })

  it('keeps rectangles as rectangles inside the box', () => {
    expect(turnArt([sampler[0]], 1)).toEqual([{ type: 'rect', x: 20, y: 0, w: 30, h: 50, fill: 'none' }])
  })
})
