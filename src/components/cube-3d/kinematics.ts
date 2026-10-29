import { Matrix4, Quaternion, Vector2, Vector3 } from 'three'
import { sameArrangement, type Arrangement, type Placement } from '#/cube/arrangement'
import { HINGES, type FoldNode, type FoldedCube } from '#/cube/net'
import type { Pose } from '#/lesson/scene'
import { toQuaternion } from './quaternion'

const FOLD_SECONDS = 1.2
const MOVE_SECONDS = 1.1
/** How high a face rises off the table as it swings or slides across the net. */
const LIFT = 0.45
/** Signed turn about +z for each count of clockwise quarter turns (clockwise is negative). */
const SWING = [0, -Math.PI / 2, -Math.PI, Math.PI / 2] as const

/** Where the model is, or is headed: one arrangement of the net, folded so far, held some way. */
export interface StageState {
  arrangement: Arrangement
  /** The arrangement folded; its tree says which hinge each fold amount turns. */
  cube: FoldedCube
  folds: Readonly<Record<string, number>>
  orientation: Quaternion
}

/** One stretch of motion: either folding hinges in place, or re-arranging a flat net. */
export interface Segment {
  kind: 'fold' | 'move'
  from: StageState
  to: StageState
  seconds: number
}

/**
 * Each face's panel — a unit square centred on its origin with the drawing upright —
 * in the net's frame, plus how the whole model is held.
 */
export interface Frames {
  panels: ReadonlyMap<string, Matrix4>
  orientation: Quaternion
}

export function stageState(pose: Pose): StageState {
  return {
    arrangement: pose.arrangement,
    cube: pose.cube,
    folds: pose.folds,
    orientation: toQuaternion(pose.orientation),
  }
}

/** Every hinge shut. */
export function isShut(state: StageState): boolean {
  return Object.values(state.folds).every((amount) => amount === 1)
}

/**
 * The motion from one state to another. A net is only re-arranged while it lies flat and
 * faces the viewer, so a change of arrangement opens up first and closes again after.
 */
export function planTransition(from: StageState, to: StageState): Segment[] {
  if (sameArrangement(from.arrangement, to.arrangement)) {
    return samePose(from, to) ? [] : [{ kind: 'fold', from, to, seconds: FOLD_SECONDS }]
  }
  const fromFlat = laidFlat(from)
  const toFlat = laidFlat(to)
  return [
    ...(samePose(from, fromFlat)
      ? []
      : [{ kind: 'fold' as const, from, to: fromFlat, seconds: FOLD_SECONDS }]),
    { kind: 'move', from: fromFlat, to: toFlat, seconds: MOVE_SECONDS },
    ...(samePose(toFlat, to)
      ? []
      : [{ kind: 'fold' as const, from: toFlat, to, seconds: FOLD_SECONDS }]),
  ]
}

export function stateFrames(state: StageState): Frames {
  return {
    panels: foldedPanels(state.arrangement, state.cube, state.folds),
    orientation: state.orientation,
  }
}

/** The frames `progress` (0 to 1) of the way through a segment, eased in and out. */
export function segmentFrames({ kind, from, to }: Segment, progress: number): Frames {
  const t = easeInOut(progress)
  if (kind === 'move') {
    const panels = new Map(
      Object.keys(to.arrangement).map((id) => [
        id,
        movingPanel(from.arrangement[id], to.arrangement[id], t),
      ]),
    )
    return { panels, orientation: to.orientation }
  }
  const folds = Object.fromEntries(
    Object.keys(to.folds).map((id) => [id, from.folds[id] + (to.folds[id] - from.folds[id]) * t]),
  )
  return {
    panels: foldedPanels(to.arrangement, to.cube, folds),
    orientation: from.orientation.clone().slerp(to.orientation, t),
  }
}

/** The middle of the panels; the stage keeps it at the origin so the model stays in frame. */
export function centreOf(panels: ReadonlyMap<string, Matrix4>): Vector3 {
  const sum = new Vector3()
  for (const matrix of panels.values()) sum.add(new Vector3().setFromMatrixPosition(matrix))
  return sum.divideScalar(panels.size)
}

/**
 * How far a camera looking back along `direction` must stand to see every corner of the
 * model in `state`, with a little room around it.
 */
export function framingDistance(
  state: StageState,
  direction: Vector3,
  fovDegrees: number,
  aspect: number,
): number {
  const { panels, orientation } = stateFrames(state)
  const centre = centreOf(panels)
  const towardsCamera = direction.clone().normalize()
  const right = new Vector3(0, 1, 0).cross(towardsCamera).normalize()
  const up = towardsCamera.clone().cross(right)
  const tanV = Math.tan((fovDegrees * Math.PI) / 360)
  const tanH = tanV * aspect

  let distance = 0
  for (const matrix of panels.values()) {
    for (const [x, y] of PANEL_CORNERS) {
      const corner = new Vector3(x, y, 0)
        .applyMatrix4(matrix)
        .sub(centre)
        .applyQuaternion(orientation)
      const depth = corner.dot(towardsCamera)
      distance = Math.max(
        distance,
        depth + Math.abs(corner.dot(right)) / tanH,
        depth + Math.abs(corner.dot(up)) / tanV,
      )
    }
  }
  return distance * FRAMING_MARGIN
}

const PANEL_CORNERS = [
  [-0.5, -0.5],
  [0.5, -0.5],
  [0.5, 0.5],
  [-0.5, 0.5],
] as const

const FRAMING_MARGIN = 1.12

function laidFlat(state: StageState): StageState {
  return {
    ...state,
    folds: Object.fromEntries(Object.keys(state.folds).map((id) => [id, 0])),
    orientation: new Quaternion(),
  }
}

function samePose(a: StageState, b: StageState): boolean {
  return (
    a.orientation.equals(b.orientation) &&
    Object.keys(a.folds).every((id) => a.folds[id] === b.folds[id])
  )
}

/**
 * Walks the fold tree like `foldNet` does: each face hangs off its parent's edge and turns
 * about it. The root keeps its place in the net, so every arrangement shares one frame.
 */
function foldedPanels(
  arrangement: Arrangement,
  cube: FoldedCube,
  folds: Readonly<Record<string, number>>,
): Map<string, Matrix4> {
  const panels = new Map<string, Matrix4>()

  const place = (node: FoldNode, corner: Matrix4) => {
    panels.set(node.face.id, corner.clone().multiply(panelOffset(arrangement[node.face.id])))
    for (const child of node.children) {
      const { pivot, offset, axis, sign } = HINGES[child.hinge]
      const angle = sign * folds[child.face.id] * (Math.PI / 2)
      const hinge = new Matrix4()
        .makeTranslation(...pivot)
        .multiply(
          axis === 'x' ? new Matrix4().makeRotationX(angle) : new Matrix4().makeRotationY(angle),
        )
        .multiply(new Matrix4().makeTranslation(...offset))
      place(child, corner.clone().multiply(hinge))
    }
  }

  const [col, row] = arrangement[cube.root.face.id].cell
  place(cube.root, new Matrix4().makeTranslation(col, -row, 0))
  return panels
}

/** From a face's top-left corner to its panel: the cell's centre, with the drawing turned as placed. */
function panelOffset({ turns }: Placement): Matrix4 {
  return new Matrix4()
    .makeTranslation(0.5, -0.5, 0)
    .multiply(new Matrix4().makeRotationZ(SWING[turns]))
}

/**
 * A face crossing the flat net, lifted a little to clear the others. A face that turns
 * swings about the one point the turn leaves in place — the corner it rolls over.
 */
function movingPanel(start: Placement, end: Placement, t: number): Matrix4 {
  const from = cellCentre(start)
  const to = cellCentre(end)
  const swing = SWING[(end.turns - start.turns + 4) % 4]
  const moves = swing !== 0 || !from.equals(to)
  const centre =
    swing === 0
      ? from.clone().lerp(to, t)
      : from.clone().rotateAround(fixedPoint(from, to, swing), swing * t)
  const lift = moves ? LIFT * Math.sin(Math.PI * t) : 0

  return new Matrix4()
    .makeTranslation(centre.x, centre.y, lift)
    .multiply(new Matrix4().makeRotationZ(SWING[start.turns] + swing * t))
}

function cellCentre({ cell: [col, row] }: Placement): Vector2 {
  return new Vector2(col + 0.5, -row - 0.5)
}

/** The point a turn by `angle` leaves in place while carrying `from` to `to`: solves (I − R)p = to − R·from. */
function fixedPoint(from: Vector2, to: Vector2, angle: number): Vector2 {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const x = to.x - (cos * from.x - sin * from.y)
  const y = to.y - (sin * from.x + cos * from.y)
  const det = (1 - cos) ** 2 + sin ** 2
  return new Vector2(((1 - cos) * x - sin * y) / det, (sin * x + (1 - cos) * y) / det)
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
}
