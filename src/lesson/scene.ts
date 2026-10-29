import type { Art } from '#/cube/art'
import {
  arrange,
  foldArrangement,
  netFaces,
  reattach,
  type Arrangement,
  type Reattach,
} from '#/cube/arrangement'
import { IDENTITY, equals, type Matrix3 } from '#/cube/geometry'
import { DIRECTIONS, sideFacing, type Direction, type FoldedCube, type NetFace } from '#/cube/net'
import { orientationShowing, type Slot } from '#/cube/view'

export type Tone = 'indigo' | 'amber' | 'emerald' | 'rose' | 'sky' | 'violet'

/** Each opposite pair gets the next of these, so pairs read apart at a glance. */
const PAIR_TONES = ['indigo', 'amber', 'emerald'] as const satisfies readonly Tone[]
/** Each pair of meeting edges gets the next of these. */
const EDGE_TONES = ['rose', 'sky', 'violet'] as const satisfies readonly Tone[]

type FacePair = readonly [string, string]

/** One beat of a lesson animation. Everything except `note` carries over from the beat before. */
export interface PoseSpec {
  /** What to notice in this beat, shown over the scene. */
  note: string
  /** Re-hinges a face first; the net is laid flat to do it. */
  move?: Reattach
  /** How far each hinge is closed, 0 flat to 1 shut. A number sets every hinge; unlisted faces stay flat. */
  fold?: number | Readonly<Record<string, number>>
  /** Holds the cube with these faces on top, left and right, as in an answer choice; `null` holds it as laid out. */
  view?: Readonly<Record<Slot, string>> | null
  paint?: Readonly<Record<string, Tone>>
  /** Pairs of opposite faces, each pair tinted alike. */
  opposite?: readonly FacePair[]
  /** Pairs of faces whose shared edge, once folded, is marked on both. */
  meet?: readonly FacePair[]
  /** A word or two written on a face. */
  labels?: Readonly<Record<string, string>>
}

export interface SceneSpec {
  /** The net as text rows, one character per face and `.` for an empty cell. */
  layout: readonly string[]
  /** Drawings by face id; faces left out are blank. */
  faces: Readonly<Record<string, Art>>
  /** The face that stays put while the rest fold; by default the one with the most neighbours. */
  anchor?: string
  poses: readonly [PoseSpec, ...PoseSpec[]]
}

/** A mark along one side of a face, measured on its own drawing so it travels with the paper. */
export interface EdgeMark {
  faceId: string
  side: Direction
  tone: Tone
}

export interface Pose {
  arrangement: Arrangement
  /** `arrangement` folded; its root face is the one that stays put. */
  cube: FoldedCube
  /** How far each face's hinge to its parent in `cube` is closed, 0 flat to 1 shut. */
  folds: Readonly<Record<string, number>>
  /** Rotation from the root face's frame to view space. */
  orientation: Matrix3
  tints: Readonly<Record<string, Tone>>
  edges: readonly EdgeMark[]
  labels: Readonly<Record<string, string>>
  note: string
}

export interface Scene {
  arts: Readonly<Record<string, Art>>
  /** The net as first drawn, and the cube it folds into. */
  net: readonly NetFace[]
  cube: FoldedCube
  poses: readonly [Pose, ...Pose[]]
}

/**
 * Plays a scene's beats through, checking every claim it makes about the cube — which faces
 * are opposite, which edges meet, how it can be held — so a lesson cannot teach a wrong fact.
 */
export function resolveScene(spec: SceneSpec): Scene {
  const start = arrange(spec.layout)
  const ids = Object.keys(start)
  const assertFace = (id: string) => {
    if (!ids.includes(id)) throw new Error(`Scene has no face "${id}"`)
  }
  Object.keys(spec.faces).forEach(assertFace)
  if (spec.anchor !== undefined) assertFace(spec.anchor)

  const arts = Object.fromEntries(ids.map((id) => [id, spec.faces[id] ?? []]))
  const fold = (arrangement: Arrangement) => foldArrangement(arrangement, arts, spec.anchor)

  let arrangement = start
  let cube = fold(start)
  let shown: Omit<PoseSpec, 'note' | 'move'> = {}

  const resolvePose = ({ note, move, ...changes }: PoseSpec): Pose => {
    if (move) {
      arrangement = reattach(arrangement, cube, move)
      cube = fold(arrangement)
    }
    shown = { ...shown, ...changes }
    const {
      fold: closure = 0,
      view = null,
      paint = {},
      opposite = [],
      meet = [],
      labels = {},
    } = shown

    for (const id of [...Object.keys(paint), ...Object.keys(labels)]) assertFace(id)
    return {
      arrangement,
      cube,
      folds: resolveFolds(ids, closure, assertFace),
      orientation: view ? orientationShowing(cube, view) : IDENTITY,
      tints: { ...paint, ...pairTints(cube, opposite) },
      edges: meet.flatMap((pair, i) =>
        edgeMarks(arrangement, cube, pair, EDGE_TONES[i % EDGE_TONES.length]),
      ),
      labels,
      note,
    }
  }

  const [first, ...rest] = spec.poses
  return {
    arts,
    net: netFaces(start, arts),
    cube: fold(start),
    poses: [resolvePose(first), ...rest.map(resolvePose)],
  }
}

/** The cube held still, fully shut and turned as given — e.g. the way an answer choice shows it. */
export function heldPose(scene: Scene, orientation: Matrix3, note: string): Pose {
  const [first] = scene.poses
  return {
    arrangement: first.arrangement,
    cube: first.cube,
    folds: Object.fromEntries(Object.keys(first.folds).map((id) => [id, 1])),
    orientation,
    tints: {},
    edges: [],
    labels: {},
    note,
  }
}

function resolveFolds(
  ids: readonly string[],
  closure: NonNullable<PoseSpec['fold']>,
  assertFace: (id: string) => void,
): Record<string, number> {
  if (typeof closure !== 'number') Object.keys(closure).forEach(assertFace)
  return Object.fromEntries(
    ids.map((id) => {
      const amount = typeof closure === 'number' ? closure : (closure[id] ?? 0)
      if (amount < 0 || amount > 1) throw new Error(`Fold of "${id}" must be between 0 and 1`)
      return [id, amount]
    }),
  )
}

function pairTints(cube: FoldedCube, pairs: readonly FacePair[]): Record<string, Tone> {
  if (pairs.length > PAIR_TONES.length) throw new Error('A cube has only three opposite pairs')
  return Object.fromEntries(
    pairs.flatMap(([a, b], i) => {
      const [normalA, normalB] = [a, b].map((id) => foldedFace(cube, id).normal)
      if (!equals(normalA, [-normalB[0], -normalB[1], -normalB[2]])) {
        throw new Error(`"${a}" and "${b}" are not opposite`)
      }
      return [
        [a, PAIR_TONES[i]],
        [b, PAIR_TONES[i]],
      ]
    }),
  )
}

/** Marks the edge two faces share once folded, on the drawing of each. */
function edgeMarks(
  arrangement: Arrangement,
  cube: FoldedCube,
  [a, b]: FacePair,
  tone: Tone,
): EdgeMark[] {
  const mark = (faceId: string, otherId: string): EdgeMark => {
    const netSide = sideFacing(foldedFace(cube, faceId), foldedFace(cube, otherId))
    // The drawing is turned clockwise by `turns` in the net; undo that to find its own side.
    const { turns } = arrangement[faceId]
    const side = DIRECTIONS[(DIRECTIONS.indexOf(netSide) - turns + 4) % 4]
    return { faceId, side, tone }
  }
  return [mark(a, b), mark(b, a)]
}

function foldedFace(cube: FoldedCube, id: string) {
  const face = cube.faces.find((f) => f.face.id === id)
  if (!face) throw new Error(`Scene has no face "${id}"`)
  return face
}
