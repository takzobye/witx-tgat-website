import { useThree } from '@react-three/fiber'
import { useMemo, type Ref } from 'react'
import { SRGBColorSpace, type MeshStandardMaterial } from 'three'
import type { Art } from '#/cube/art'
import { paintFace } from './paint-face'

const INSIDE_COLOR = '#c7d2fe'

interface FacePanelProps {
  art: Art
  /** The printed side's material, e.g. to tint the paper. */
  materialRef?: Ref<MeshStandardMaterial>
}

/** A unit face centred on its origin: the drawing in front, plain paper behind. */
export function FacePanel({ art, materialRef }: FacePanelProps) {
  const canvas = useMemo(() => paintFace(art), [art])
  const anisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy())

  return (
    <>
      <mesh>
        <planeGeometry />
        <meshStandardMaterial ref={materialRef} roughness={0.9}>
          <canvasTexture
            attach="map"
            args={[canvas]}
            colorSpace={SRGBColorSpace}
            anisotropy={anisotropy}
          />
        </meshStandardMaterial>
      </mesh>
      <mesh rotation-y={Math.PI}>
        <planeGeometry />
        <meshStandardMaterial color={INSIDE_COLOR} roughness={0.9} />
      </mesh>
    </>
  )
}
