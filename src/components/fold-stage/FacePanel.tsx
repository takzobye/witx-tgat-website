import { useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, type Ref } from 'react'
import {
  DoubleSide,
  FrontSide,
  SRGBColorSpace,
  type Mesh,
  type MeshStandardMaterial,
  type PlaneGeometry,
} from 'three'
import type { Art } from '#/cube/art'
import { paintFace, paintFaceOpacity } from './paint-face'

const INSIDE_COLOR = '#bce0ff'
/** How much the bare paper hides what lies behind it when see-through. */
const GLASS_PAPER_OPACITY = 0.45

interface FacePanelProps {
  art: Art
  /** Frosted glass instead of paper, so the faces behind show through. */
  seeThrough: boolean
  /** The printed side's material, e.g. to tint the paper. */
  materialRef?: Ref<MeshStandardMaterial>
}

/**
 * A unit face centred on its origin: the drawing in front, plain paper behind. See-through,
 * the drawing is on frosted glass instead, read mirrored from behind as through a window.
 */
export function FacePanel({ art, seeThrough, materialRef }: FacePanelProps) {
  const printed = useRef<Mesh<PlaneGeometry, MeshStandardMaterial>>(null)
  const canvas = useMemo(() => paintFace(art), [art])
  const opacity = useMemo(
    () => (seeThrough ? paintFaceOpacity(art, GLASS_PAPER_OPACITY) : null),
    [art, seeThrough],
  )
  const anisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy())

  // three.js compiles a material's shader once; paper and glass differ in blending, sides
  // and alpha map, so switching between them needs a rebuild.
  useLayoutEffect(() => {
    if (printed.current) printed.current.material.needsUpdate = true
  }, [seeThrough])

  return (
    <>
      <mesh ref={printed}>
        <planeGeometry />
        <meshStandardMaterial
          ref={materialRef}
          roughness={0.9}
          side={seeThrough ? DoubleSide : FrontSide}
          transparent={seeThrough}
          // Every pane shows through every other, whatever order they are drawn in.
          depthWrite={!seeThrough}
        >
          <canvasTexture
            attach="map"
            args={[canvas]}
            colorSpace={SRGBColorSpace}
            anisotropy={anisotropy}
          />
          {opacity && <canvasTexture attach="alphaMap" args={[opacity]} anisotropy={anisotropy} />}
        </meshStandardMaterial>
      </mesh>
      {!seeThrough && (
        <mesh rotation-y={Math.PI}>
          <planeGeometry />
          <meshStandardMaterial color={INSIDE_COLOR} roughness={0.9} />
        </mesh>
      )}
    </>
  )
}
