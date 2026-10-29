import type { SceneSpec } from '#/lesson/scene'
import { ARROW, CORNER, DOT, HALF, RING, SQUARE, STRIPES, TRIANGLE } from './art'

/** A net to build scenes on; `anchor` stays in front while the rest fold back. */
type LessonNet = Omit<SceneSpec, 'poses'>

/**
 * ```
 * . A . .
 * B C D E
 * . F . .
 * ```
 */
export const CROSS: LessonNet = {
  layout: ['.A..', 'BCDE', '.F..'],
  faces: { A: CORNER, B: HALF, C: ARROW, D: STRIPES, E: SQUARE, F: TRIANGLE },
  anchor: 'C',
}

/**
 * ```
 * A . . .
 * B C D E
 * . F . .
 * ```
 */
export const HOOK: LessonNet = {
  layout: ['A...', 'BCDE', '.F..'],
  faces: { A: CORNER, B: HALF, C: ARROW, D: RING, E: STRIPES, F: SQUARE },
  anchor: 'C',
}

/**
 * ```
 * A . . .
 * B C D E
 * . . . F
 * ```
 */
export const LONG_HOOK: LessonNet = {
  layout: ['A...', 'BCDE', '...F'],
  faces: { A: DOT, B: CORNER, C: ARROW, D: STRIPES, E: HALF, F: SQUARE },
  anchor: 'C',
}

/**
 * Only three faces in a row, so one has to be swung in to make four walls.
 * ```
 * A B . .
 * . C D E
 * . F . .
 * ```
 */
export const SHORT_ROW: LessonNet = {
  layout: ['AB..', '.CDE', '.F..'],
  faces: { A: ARROW, B: DOT, C: SQUARE, D: RING, E: HALF },
  anchor: 'C',
}

/**
 * ```
 * A B . .
 * . C D .
 * . . E F
 * ```
 */
export const STAIRS: LessonNet = {
  layout: ['AB..', '.CD.', '..EF'],
  faces: { A: DOT, B: HALF, C: ARROW, D: SQUARE, E: RING, F: TRIANGLE },
  anchor: 'C',
}

/**
 * ```
 * A B C
 * . D .
 * . E .
 * . F .
 * ```
 */
export const BIG_T: LessonNet = {
  layout: ['ABC', '.D.', '.E.', '.F.'],
  faces: { A: DOT, B: ARROW, C: SQUARE, D: RING, E: STRIPES, F: TRIANGLE },
  anchor: 'B',
}
