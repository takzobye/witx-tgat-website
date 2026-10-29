import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, type Group, type MeshStandardMaterial } from 'three'
import type { Art } from '#/cube/art'
import type { Direction } from '#/cube/net'
import type { EdgeMark, Tone } from '#/lesson/scene'
import { FacePanel } from '#/components/fold-stage/FacePanel'

/** Light enough that black ink still reads on the tinted paper. */
const TINTS: Record<Tone, string> = {
  indigo: '#a5b4fc',
  amber: '#fcd34d',
  emerald: '#6ee7b7',
  rose: '#fda4af',
  sky: '#7dd3fc',
  violet: '#c4b5fd',
}

const EDGE_COLORS: Record<Tone, string> = {
  indigo: '#6366f1',
  amber: '#f59e0b',
  emerald: '#10b981',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  violet: '#8b5cf6',
}

const PAPER = '#ffffff'
/** Higher settles faster. */
const TINT_RATE = 6
const EDGE_WIDTH = 0.09
/** Just off the paper, so marks never flicker against it. */
const EDGE_LIFT = 0.004
const LABEL_LIFT = 0.03

/** Where a side's mark sits on the unit panel, and its size. */
const EDGE_BARS: Record<Direction, { position: [number, number, number]; size: [number, number] }> =
  {
    up: { position: [0, 0.5 - EDGE_WIDTH / 2, EDGE_LIFT], size: [1, EDGE_WIDTH] },
    down: { position: [0, -0.5 + EDGE_WIDTH / 2, EDGE_LIFT], size: [1, EDGE_WIDTH] },
    left: { position: [-0.5 + EDGE_WIDTH / 2, 0, EDGE_LIFT], size: [EDGE_WIDTH, 1] },
    right: { position: [0.5 - EDGE_WIDTH / 2, 0, EDGE_LIFT], size: [EDGE_WIDTH, 1] },
  }

interface LessonFaceProps {
  art: Art
  tint: Tone | undefined
  edges: readonly EdgeMark[]
  label: string | undefined
  /** Receives the panel's group; its matrix is set every frame by the model. */
  panelRef: (group: Group | null) => void
}

/** One face of the lesson model: its drawing, a tint that fades in, edge marks and a label. */
export function LessonFace({ art, tint, edges, label, panelRef }: LessonFaceProps) {
  const material = useRef<MeshStandardMaterial>(null)
  const invalidate = useThree((state) => state.invalidate)
  const target = useMemo(() => new Color(tint ? TINTS[tint] : PAPER), [tint])

  useEffect(() => invalidate(), [target, invalidate])

  useFrame((_, delta) => {
    const color = material.current?.color
    if (!color || color.equals(target)) return
    color.lerp(target, 1 - Math.exp(-TINT_RATE * Math.min(delta, 0.1)))
    const gap =
      Math.abs(color.r - target.r) + Math.abs(color.g - target.g) + Math.abs(color.b - target.b)
    if (gap < 1e-3) color.copy(target)
    invalidate()
  })

  return (
    <group ref={panelRef} matrixAutoUpdate={false}>
      <FacePanel art={art} materialRef={material} />
      {edges.map(({ side, tone }) => (
        <mesh key={side} position={EDGE_BARS[side].position}>
          <planeGeometry args={EDGE_BARS[side].size} />
          <meshBasicMaterial color={EDGE_COLORS[tone]} />
        </mesh>
      ))}
      {label && (
        <Html
          center
          position={[0, 0, LABEL_LIFT]}
          occlude
          pointerEvents="none"
          zIndexRange={[20, 0]}
        >
          <span className="rounded-full bg-stone-900/85 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white shadow-sm">
            {label}
          </span>
        </Html>
      )}
    </group>
  )
}
