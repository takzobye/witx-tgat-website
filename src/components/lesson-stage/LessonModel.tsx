import { useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import type { Art } from '#/cube/art'
import type { Pose } from '#/lesson/scene'
import {
  centreOf,
  planTransition,
  segmentFrames,
  stageState,
  stateFrames,
  type Segment,
  type StageState,
} from './kinematics'
import { LessonFace } from './LessonFace'

interface Motion {
  /** Where the last finished segment left the model. */
  settled: StageState
  /** Segments still to play; the first is playing. */
  queue: Segment[]
  /** Seconds into the first segment. */
  elapsed: number
  /** The latest target has not been reported as reached yet. */
  arriving: boolean
  /**
   * The canvas was at rest until the coming frame. An on-demand canvas measures a frame
   * from the one before, so that frame's delta spans the whole rest and must not count.
   */
  waking: boolean
}

interface LessonModelProps {
  arts: Readonly<Record<string, Art>>
  pose: Pose
  seeThrough: boolean
  /** Called once the model comes to rest at `pose`. */
  onArrive: () => void
}

/**
 * The lesson's net, moving to each pose it is given: folding hinges, sliding or rolling
 * faces across the flat net, and turning the cube to be held a new way.
 */
export function LessonModel({ arts, pose, seeThrough, onArrive }: LessonModelProps) {
  const holder = useRef<Group>(null)
  const body = useRef<Group>(null)
  const panels = useRef(new Map<string, Group>())
  const invalidate = useThree((state) => state.invalidate)
  const target = useMemo(() => stageState(pose), [pose])

  // Starts at rest on the first pose; later poses are animated to.
  const motion = useRef<Motion>({
    settled: target,
    queue: [],
    elapsed: 0,
    arriving: true,
    waking: false,
  })

  const registerPanel = useCallback((id: string, group: Group | null) => {
    if (group) panels.current.set(id, group)
    else panels.current.delete(id)
  }, [])

  // A segment always plays to its end, so a new target is planned from where it will stop.
  useEffect(() => {
    const current = motion.current
    const [playing] = current.queue
    current.waking = !playing
    current.queue = playing
      ? [playing, ...planTransition(playing.to, target)]
      : planTransition(current.settled, target)
    current.arriving = true
    invalidate()
  }, [target, invalidate])

  useFrame((_, delta) => {
    const current = motion.current
    if (!holder.current || !body.current) return

    const [playing] = current.queue
    const seconds = current.waking ? 0 : delta
    current.waking = false
    if (playing) {
      current.elapsed += seconds
      if (current.elapsed >= playing.seconds) {
        current.settled = playing.to
        current.queue.shift()
        current.elapsed = 0
      }
    }

    const [next] = current.queue
    const frames = next
      ? segmentFrames(next, current.elapsed / next.seconds)
      : stateFrames(current.settled)
    for (const [id, matrix] of frames.panels) {
      const group = panels.current.get(id)
      if (!group) continue
      group.matrix.copy(matrix)
      group.matrixWorldNeedsUpdate = true
    }
    body.current.position.copy(centreOf(frames.panels)).negate()
    holder.current.quaternion.copy(frames.orientation)

    if (next) {
      invalidate()
    } else if (current.arriving) {
      current.arriving = false
      onArrive()
    }
  })

  const edgesOf = (id: string) => pose.edges.filter((edge) => edge.faceId === id)

  return (
    <group ref={holder}>
      <group ref={body}>
        {Object.entries(arts).map(([id, art]) => (
          <LessonFace
            key={id}
            art={art}
            tint={pose.tints[id]}
            edges={edgesOf(id)}
            label={pose.labels[id]}
            seeThrough={seeThrough}
            panelRef={(group) => registerPanel(id, group)}
          />
        ))}
      </group>
    </group>
  )
}
