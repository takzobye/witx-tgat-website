import { describe, expect, it } from 'vitest'
import { CUBE_ROTATIONS, clockwiseTurns } from './geometry'

describe('CUBE_ROTATIONS', () => {
  it('lists the 24 distinct rotations of a cube', () => {
    expect(new Set(CUBE_ROTATIONS.map((m) => m.flat().join())).size).toBe(24)
  })
})

describe('clockwiseTurns', () => {
  it('counts turns as seen from outside the face', () => {
    // Front face (+z): up → right is one clockwise turn.
    expect(clockwiseTurns([0, 1, 0], [1, 0, 0], [0, 0, 1])).toBe(1)
    // Top face (+y), upright pointing away (-z): turning clockwise points it right (+x).
    expect(clockwiseTurns([0, 0, -1], [1, 0, 0], [0, 1, 0])).toBe(1)
    expect(clockwiseTurns([0, 1, 0], [0, -1, 0], [1, 0, 0])).toBe(2)
  })
})
