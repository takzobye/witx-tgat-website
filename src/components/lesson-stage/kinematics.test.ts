import { Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import { resolveScene, type PoseSpec } from '#/lesson/scene'
import { centreOf, planTransition, segmentFrames, stageState, stateFrames } from './kinematics'

//  . A . .
//  B C D E
//  . F . .
const scene = (...poses: [PoseSpec, ...PoseSpec[]]) =>
  resolveScene({ layout: ['.A..', 'BCDE', '.F..'], faces: {}, anchor: 'C', poses })

const normalOf = (matrix: { elements: number[] }) =>
  new Vector3(matrix.elements[8], matrix.elements[9], matrix.elements[10]).round()

const positionOf = (matrix: Parameters<Vector3['setFromMatrixPosition']>[0]) =>
  new Vector3().setFromMatrixPosition(matrix)

describe('stateFrames', () => {
  it('folds the panels onto the sides foldNet puts them on', () => {
    const { poses } = scene({ note: 'shut', fold: 1 })
    const { panels } = stateFrames(stageState(poses[0]))

    for (const face of poses[0].cube.faces) {
      expect(normalOf(panels.get(face.face.id)!).toArray()).toEqual([...face.normal])
    }
    // Every panel sits half a unit from the middle of the cube.
    const centre = centreOf(panels)
    for (const matrix of panels.values()) {
      expect(positionOf(matrix).distanceTo(centre)).toBeCloseTo(0.5)
    }
  })

  it('lays a flat net out cell by cell', () => {
    const { panels } = stateFrames(stageState(scene({ note: 'flat' }).poses[0]))
    expect(positionOf(panels.get('E')!).toArray()).toEqual([3.5, -1.5, 0])
    expect(positionOf(panels.get('A')!).toArray()).toEqual([1.5, -0.5, 0])
  })
})

describe('planTransition', () => {
  const { poses } = scene(
    { note: 'flat' },
    { note: 'shut', fold: 1 },
    { note: 'rolled and shut', move: { face: 'A', from: 'C', onto: 'D' } },
  )
  const [flat, shut, rolled] = poses.map(stageState)

  it('folds in place when the arrangement stays', () => {
    expect(planTransition(flat, shut).map((s) => s.kind)).toEqual(['fold'])
    expect(planTransition(shut, shut)).toEqual([])
  })

  it('opens up, re-arranges flat, then closes again', () => {
    expect(planTransition(shut, rolled).map((s) => s.kind)).toEqual(['fold', 'move', 'fold'])
  })
})

describe('segmentFrames', () => {
  const { poses } = scene({ note: 'flat' }, { note: 'rolled', move: { face: 'A', from: 'C', onto: 'D' } })
  const [move] = planTransition(stageState(poses[0]), stageState(poses[1]))

  it('starts and ends exactly where the two states are', () => {
    const ends = [
      [0, poses[0]],
      [1, poses[1]],
    ] as const
    for (const [progress, pose] of ends) {
      const expected = stateFrames(stageState(pose)).panels
      for (const [id, matrix] of segmentFrames(move, progress).panels) {
        expect(matrix.elements.map((n) => n + 0)).toEqual(
          expected.get(id)!.elements.map((n) => expect.closeTo(n, 9)),
        )
      }
    }
  })

  it('rolls the face over the corner it shares with both walls', () => {
    // The corner A, C and D share is (2, -1) in the net's frame.
    const corner = new Vector3(2, -1, 0)
    for (const progress of [0.25, 0.5, 0.75]) {
      const a = positionOf(segmentFrames(move, progress).panels.get('A')!)
      expect(Math.hypot(a.x - corner.x, a.y - corner.y)).toBeCloseTo(Math.SQRT1_2)
      expect(a.z).toBeGreaterThan(0)
    }
    // Faces that stay put do not lift.
    expect(positionOf(segmentFrames(move, 0.5).panels.get('C')!).z).toBe(0)
  })
})
