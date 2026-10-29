import { describe, expect, it } from 'vitest'
import { IDENTITY } from '#/cube/geometry'
import { resolveScene, type PoseSpec, type SceneSpec } from './scene'

//  . A . .
//  B C D E    C stays in front; B, D, E wrap round it and A, F close the ends.
//  . F . .
const scene = (...poses: [PoseSpec, ...PoseSpec[]]): SceneSpec => ({
  layout: ['.A..', 'BCDE', '.F..'],
  faces: {},
  anchor: 'C',
  poses,
})

describe('resolveScene', () => {
  it('carries everything but the note over to the next beat', () => {
    const { poses } = resolveScene(
      scene(
        { note: 'flat', paint: { A: 'amber' }, labels: { F: 'พื้น' } },
        { note: 'shut', fold: 1, view: { top: 'A', left: 'C', right: 'D' } },
        { note: 'as laid out', view: null },
      ),
    )
    expect(poses.map((p) => p.note)).toEqual(['flat', 'shut', 'as laid out'])
    expect(poses.map((p) => p.tints)).toEqual([{ A: 'amber' }, { A: 'amber' }, { A: 'amber' }])
    expect(poses[2].labels).toEqual({ F: 'พื้น' })
    expect(poses[2].folds.A).toBe(1)
    expect(poses[2].orientation).toEqual(IDENTITY)
  })

  it('closes only the listed hinges', () => {
    const [pose] = resolveScene(scene({ note: 'walls', fold: { B: 1, D: 0.5 } })).poses
    expect(pose.folds).toEqual({ A: 0, B: 1, C: 0, D: 0.5, E: 0, F: 0 })
  })

  it('tints each opposite pair its own colour', () => {
    const [pose] = resolveScene(scene({ note: 'pairs', opposite: [['B', 'D'], ['A', 'F']] })).poses
    expect(pose.tints).toEqual({ B: 'indigo', D: 'indigo', A: 'amber', F: 'amber' })
  })

  it('marks a shared edge on the drawing of both faces, even after the face is turned', () => {
    const { poses } = resolveScene(
      scene(
        { note: 'before', meet: [['A', 'D']] },
        { note: 'rolled onto D', move: { face: 'A', from: 'C', onto: 'D' } },
      ),
    )
    // The mark stays on the same side of A's drawing although A now lies turned in the net.
    expect(poses[0].edges).toEqual([
      { faceId: 'A', side: 'right', tone: 'rose' },
      { faceId: 'D', side: 'up', tone: 'rose' },
    ])
    expect(poses[1].edges).toEqual(poses[0].edges)
    expect(poses[1].arrangement.A).toEqual({ cell: [2, 0], turns: 1 })
  })

  it.each<[string, PoseSpec]>([
    ['faces that are not opposite', { note: '', opposite: [['B', 'C']] }],
    ['edges of opposite faces', { note: '', meet: [['A', 'F']] }],
    ['a mirror-image view', { note: '', fold: 1, view: { top: 'A', left: 'D', right: 'C' } }],
    ['an unknown face', { note: '', paint: { Z: 'amber' } }],
    ['a fold past shut', { note: '', fold: 1.5 }],
    ['a move between faces that are not neighbours', { note: '', move: { face: 'A', from: 'D', onto: 'B' } }],
  ])('refuses %s', (_, pose) => {
    expect(() => resolveScene(scene(pose))).toThrow()
  })
})
