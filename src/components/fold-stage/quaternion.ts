import { Matrix4, Quaternion } from 'three'
import type { Matrix3 } from '#/cube/geometry'

/** One of the cube's exact rotations, as three.js needs it. */
export function toQuaternion([[a, b, c], [d, e, f], [g, h, i]]: Matrix3): Quaternion {
  const rotation = new Matrix4().set(a, b, c, 0, d, e, f, 0, g, h, i, 0, 0, 0, 0, 1)
  return new Quaternion().setFromRotationMatrix(rotation)
}
