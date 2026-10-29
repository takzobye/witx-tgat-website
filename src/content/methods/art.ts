import type { Art } from '#/cube/art'

/** Drawings shared by the lesson nets; the same marks the exam uses. */

export const DOT: Art = [{ type: 'circle', cx: 50, cy: 50, r: 16, fill: 'black' }]

/** Points up. */
export const ARROW: Art = [
  {
    type: 'polygon',
    points: [
      [50, 12],
      [82, 46],
      [62, 46],
      [62, 88],
      [38, 88],
      [38, 46],
      [18, 46],
    ],
    fill: 'black',
  },
]

/** Left half black. */
export const HALF: Art = [{ type: 'rect', x: 0, y: 0, w: 50, h: 100, fill: 'black' }]

/** Black triangle against the top and left edges. */
export const CORNER: Art = [
  {
    type: 'polygon',
    points: [
      [0, 0],
      [100, 0],
      [0, 100],
    ],
    fill: 'black',
  },
]

/** Two bars running left to right. */
export const STRIPES: Art = [
  { type: 'rect', x: 0, y: 29, w: 100, h: 11, fill: 'black' },
  { type: 'rect', x: 0, y: 60, w: 100, h: 11, fill: 'black' },
]

export const SQUARE: Art = [{ type: 'rect', x: 25, y: 25, w: 50, h: 50, fill: 'black' }]

export const RING: Art = [{ type: 'circle', cx: 50, cy: 50, r: 28, fill: 'none' }]

/** Grey, pointing up. */
export const TRIANGLE: Art = [
  {
    type: 'polygon',
    points: [
      [50, 15],
      [85, 85],
      [15, 85],
    ],
    fill: 'gray',
  },
]
