import { CameraControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Vector3 } from 'three'
import type { Art } from '#/cube/art'
import type { Pose } from '#/lesson/scene'
import { framingDistance, isShut, stageState } from './kinematics'
import { LessonModel } from './LessonModel'
import { setSeeThrough, useSeeThrough } from './see-through'
import { SeeThroughToggle } from './SeeThroughToggle'

const FOV = 35
/** A flat or half-folded net is seen from the front, a little above and to the right. */
const OPEN_VIEW = new Vector3(0.3, 0.45, 1).normalize()
/** A shut cube is seen along +x +y +z — the same view as the exam's answer choices. */
const SHUT_VIEW = new Vector3(1, 1, 1).normalize()

export interface LessonStageProps {
  /** Changing it starts a new scene from rest instead of animating into it. */
  sceneId: string
  arts: Readonly<Record<string, Art>>
  pose: Pose
  onArrive: () => void
}

export default function LessonStage({ sceneId, arts, pose, onArrive }: LessonStageProps) {
  const [controls, setControls] = useState<CameraControls | null>(null)
  // Bumped to bring the camera back after the learner has orbited away.
  const [reframes, setReframes] = useState(0)
  const seeThrough = useSeeThrough()

  return (
    <div className="relative isolate h-full touch-none">
      <Canvas
        frameloop="demand"
        flat
        dpr={[1, 2]}
        camera={{ position: [0, 0, 9], fov: FOV }}
        className="dark:figure-rim"
      >
        <ambientLight intensity={1.7} />
        <directionalLight position={[2, 6, 3]} intensity={1.2} />
        <directionalLight position={[-4, -2, -3]} intensity={0.5} />
        <LessonModel
          key={sceneId}
          arts={arts}
          pose={pose}
          seeThrough={seeThrough}
          onArrive={onArrive}
        />
        <Framing controls={controls} pose={pose} reframes={reframes} />
        <CameraControls ref={setControls} minDistance={2} maxDistance={18} />
      </Canvas>
      <div className="absolute right-3 bottom-3 flex items-center gap-2">
        <SeeThroughToggle on={seeThrough} onChange={setSeeThrough} />
        <button
          type="button"
          onClick={() => setReframes((n) => n + 1)}
          aria-label="กลับไปมุมมองเริ่มต้น"
          title="กลับไปมุมมองเริ่มต้น"
          className="grid size-8 place-items-center rounded-full bg-surface/90 text-ink-soft shadow-sm ring-1 ring-line transition hover:bg-surface hover:text-ink"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>
    </div>
  )
}

interface FramingProps {
  controls: CameraControls | null
  pose: Pose
  /** Bumped to bring the camera back. */
  reframes: number
}

/** Aims the camera so the whole pose fits, each time the pose, the canvas shape or `reframes` changes. */
function Framing({ controls, pose, reframes }: FramingProps) {
  const aspect = useThree((state) => state.size.width / state.size.height)
  const state = useMemo(() => stageState(pose), [pose])

  useEffect(() => {
    if (!controls) return
    const direction = isShut(state) ? SHUT_VIEW : OPEN_VIEW
    const [x, y, z] = direction
      .clone()
      .multiplyScalar(framingDistance(state, direction, FOV, aspect))
      .toArray()
    void controls.setLookAt(x, y, z, 0, 0, 0, true)
  }, [controls, state, aspect, reframes])

  return null
}
