export type Vec3 = readonly [number, number, number]

/** Row-major 3×3 matrix. Every matrix in this module is an exact integer rotation. */
export type Matrix3 = readonly [Vec3, Vec3, Vec3]

/** Number of clockwise quarter turns (0°, 90°, 180°, 270°). */
export type QuarterTurns = 0 | 1 | 2 | 3

export const QUARTER_TURNS: readonly QuarterTurns[] = [0, 1, 2, 3]

export const IDENTITY: Matrix3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

export function equals(a: Vec3, b: Vec3): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
}

export function apply(m: Matrix3, v: Vec3): Vec3 {
  return [dot(m[0], v), dot(m[1], v), dot(m[2], v)]
}

export function multiply(a: Matrix3, b: Matrix3): Matrix3 {
  const columns: Matrix3 = [
    [b[0][0], b[1][0], b[2][0]],
    [b[0][1], b[1][1], b[2][1]],
    [b[0][2], b[1][2], b[2][2]],
  ]
  return [apply(columns, a[0]), apply(columns, a[1]), apply(columns, a[2])]
}

/** A 90° rotation about the x or y axis (right-hand rule) — the only turns a fold hinge makes. */
export function quarterTurn(axis: 'x' | 'y', sign: 1 | -1): Matrix3 {
  return axis === 'x'
    ? [
        [1, 0, 0],
        [0, 0, -sign],
        [0, sign, 0],
      ]
    : [
        [0, 0, sign],
        [0, 1, 0],
        [-sign, 0, 0],
      ]
}

/**
 * Clockwise quarter turns, seen from outside a face with outward `normal`,
 * that carry the in-plane direction `from` onto `to`.
 */
export function clockwiseTurns(from: Vec3, to: Vec3, normal: Vec3): QuarterTurns {
  let direction = from
  for (const turns of QUARTER_TURNS) {
    if (equals(direction, to)) return turns
    direction = cross(direction, normal)
  }
  throw new Error('Both directions must lie in the plane of the face')
}

/** The 24 rotations of a cube: signed permutation matrices with determinant +1. */
export const CUBE_ROTATIONS: readonly Matrix3[] = buildCubeRotations()

function buildCubeRotations(): Matrix3[] {
  const permutations = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ] as const
  const signs = [1, -1] as const
  const rotations: Matrix3[] = []

  for (const [i, j, k] of permutations) {
    for (const si of signs) {
      for (const sj of signs) {
        for (const sk of signs) {
          const m: Matrix3 = [unit(i, si), unit(j, sj), unit(k, sk)]
          if (dot(m[0], cross(m[1], m[2])) === 1) rotations.push(m)
        }
      }
    }
  }
  return rotations
}

function unit(axis: number, sign: number): Vec3 {
  return [axis === 0 ? sign : 0, axis === 1 ? sign : 0, axis === 2 ? sign : 0]
}
