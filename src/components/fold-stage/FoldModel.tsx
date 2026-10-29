import { useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { MathUtils, Quaternion, Vector3, type Group } from 'three'
import type { Matrix3 } from '#/cube/geometry'
import { HINGES, type FoldChild, type FoldNode, type FoldedCube } from '#/cube/net'
import { FacePanel } from './FacePanel'
import { toQuaternion } from './quaternion'

/** Higher settles faster. */
const DAMPING = 4
const CUBE_CENTRE = new Vector3(0.5, -0.5, -0.5)
const UNTURNED = new Quaternion()

type RegisterHinge = (faceId: string, group: Group | null) => void

interface FoldModelProps {
  cube: FoldedCube
  /** 0 is the flat net, 1 the closed cube. */
  fold: number
  /** How to hold the closed cube: a rotation from the root face's frame to view space. */
  orientation: Matrix3
  seeThrough: boolean
}

/**
 * The net as nested hinges: each face hangs off its parent's edge and turns about it,
 * so one fold value drives the whole animation. Mirrors `foldNet` in `#/cube/net`.
 */
export function FoldModel({ cube, fold, orientation, seeThrough }: FoldModelProps) {
  const pose = useRef<Group>(null)
  const body = useRef<Group>(null)
  const hinges = useRef(new Map<string, Group>())
  const progress = useRef(0)
  /** Eases towards `orientation` so switching between poses turns smoothly. */
  const aim = useRef(new Quaternion())
  const invalidate = useThree((state) => state.invalidate)

  const target = useMemo(() => toQuaternion(orientation), [orientation])
  const netCentre = useMemo(() => centreOfNet(cube), [cube])
  const hinged = useMemo(() => hingedFaces(cube.root), [cube])

  const registerHinge = useCallback<RegisterHinge>((faceId, group) => {
    if (group) hinges.current.set(faceId, group)
    else hinges.current.delete(faceId)
  }, [])

  // The canvas only renders on demand; wake it whenever there is somewhere new to go.
  useEffect(() => invalidate(), [fold, target, invalidate])

  useFrame((_, delta) => {
    if (!pose.current || !body.current) return

    progress.current = settle(MathUtils.damp(progress.current, fold, DAMPING, delta), fold)
    const angle = (progress.current * Math.PI) / 2
    for (const { face, hinge } of hinged) {
      const group = hinges.current.get(face.id)
      if (group) group.rotation[HINGES[hinge].axis] = HINGES[hinge].sign * angle
    }
    body.current.position.lerpVectors(netCentre, CUBE_CENTRE, progress.current).negate()

    aim.current.slerp(target, 1 - Math.exp(-DAMPING * delta))
    if (aim.current.angleTo(target) < 1e-3) aim.current.copy(target)
    // Lay the net out upright when flat, and turn into the requested pose as it closes.
    pose.current.quaternion.slerpQuaternions(UNTURNED, aim.current, progress.current)

    if (progress.current !== fold || !aim.current.equals(target)) invalidate()
  })

  return (
    <group ref={pose}>
      <group ref={body}>
        <FaceNode node={cube.root} seeThrough={seeThrough} registerHinge={registerHinge} />
      </group>
    </group>
  )
}

interface FaceNodeProps {
  node: FoldNode
  seeThrough: boolean
  registerHinge: RegisterHinge
}

function FaceNode({ node, seeThrough, registerHinge }: FaceNodeProps) {
  return (
    <>
      <group position={[0.5, -0.5, 0]}>
        <FacePanel art={node.face.art} seeThrough={seeThrough} />
      </group>
      {node.children.map((child) => (
        <group
          key={child.face.id}
          position={HINGES[child.hinge].pivot}
          ref={(group) => registerHinge(child.face.id, group)}
        >
          <group position={HINGES[child.hinge].offset}>
            <FaceNode node={child} seeThrough={seeThrough} registerHinge={registerHinge} />
          </group>
        </group>
      ))}
    </>
  )
}

function hingedFaces(node: FoldNode): FoldChild[] {
  return node.children.flatMap((child) => [child, ...hingedFaces(child)])
}

/** Centre of the flat net's bounding box, in the root face's frame. */
function centreOfNet(cube: FoldedCube): Vector3 {
  const cols = cube.faces.map(({ face }) => face.cell[0])
  const rows = cube.faces.map(({ face }) => face.cell[1])
  const [rootCol, rootRow] = cube.root.face.cell
  return new Vector3(
    (Math.min(...cols) + Math.max(...cols) + 1) / 2 - rootCol,
    rootRow - (Math.min(...rows) + Math.max(...rows) + 1) / 2,
    0,
  )
}

function settle(value: number, target: number): number {
  return Math.abs(value - target) < 1e-3 ? target : value
}
