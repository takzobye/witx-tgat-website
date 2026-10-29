import { appearanceKey, type Art } from './art'
import {
  CUBE_ROTATIONS,
  apply,
  clockwiseTurns,
  equals,
  type Matrix3,
  type QuarterTurns,
  type Vec3,
} from './geometry'
import type { FoldedCube } from './net'

/** The three sides visible in an isometric drawing of a cube. */
export type Slot = 'top' | 'left' | 'right'

export const SLOTS: readonly Slot[] = ['top', 'left', 'right']

export interface SlotFace {
  faceId: string
  art: Art
  /** Clockwise quarter turns of the drawing relative to the slot's upright position. */
  turns: QuarterTurns
}

/** A cube as drawn in an answer choice. */
export type CubeView = Readonly<Record<Slot, SlotFace>>

/**
 * Each slot in view space (camera looking from +x +y +z, y up). "Upright" on the
 * top slot points away from the viewer, so a face hinged above the left face in
 * a net lands upright there.
 */
export const SLOT_FRAMES: Record<Slot, { normal: Vec3; up: Vec3 }> = {
  top: { normal: [0, 1, 0], up: [0, 0, -1] },
  left: { normal: [0, 0, 1], up: [0, 1, 0] },
  right: { normal: [1, 0, 0], up: [0, 1, 0] },
}

export interface ViewMatch {
  /** Rotation from the folded cube's frame to view space that looks most like the view. */
  orientation: Matrix3
  /** How many of the visible sides look exactly as drawn under `orientation`. */
  matchedSlots: number
}

/** Finds the way of holding the folded cube that looks most like `view`. */
export function matchView(cube: FoldedCube, view: CubeView): ViewMatch {
  const expected = SLOTS.map((slot) => appearanceKey(view[slot].art, view[slot].turns))
  let best: ViewMatch = { orientation: CUBE_ROTATIONS[0], matchedSlots: -1 }

  for (const orientation of CUBE_ROTATIONS) {
    const matchedSlots = SLOTS.filter(
      (slot, i) => appearanceIn(cube, orientation, slot) === expected[i],
    ).length
    if (matchedSlots > best.matchedSlots) best = { orientation, matchedSlots }
  }
  return best
}

/**
 * The way of holding the folded cube that shows these faces on top, left and right,
 * whatever their drawings look like. Throws if no rotation can, e.g. for a mirror image.
 */
export function orientationShowing(
  cube: FoldedCube,
  faces: Readonly<Record<Slot, string>>,
): Matrix3 {
  const normalOf = (id: string) => {
    const face = cube.faces.find((f) => f.face.id === id)
    if (!face) throw new Error(`No face "${id}" in the folded cube`)
    return face.normal
  }
  const orientation = CUBE_ROTATIONS.find((rotation) =>
    SLOTS.every((slot) => equals(apply(rotation, normalOf(faces[slot])), SLOT_FRAMES[slot].normal)),
  )
  if (!orientation) {
    throw new Error(
      `No way to hold the cube with ${faces.top} on top, ${faces.left} left, ${faces.right} right`,
    )
  }
  return orientation
}

export function canFold(cube: FoldedCube, view: CubeView): boolean {
  return matchView(cube, view).matchedSlots === SLOTS.length
}

function appearanceIn(cube: FoldedCube, orientation: Matrix3, slot: Slot): string {
  const frame = SLOT_FRAMES[slot]
  const face = cube.faces.find((f) => equals(apply(orientation, f.normal), frame.normal))
  if (!face) throw new Error('A folded cube covers every side')
  return face.appearance[clockwiseTurns(frame.up, apply(orientation, face.up), frame.normal)]
}
