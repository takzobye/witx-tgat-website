import { useCallback, useEffect, useState } from 'react'
import type { Pose, Scene } from '#/lesson/scene'

/** How long each pose stays on screen once it comes to rest, while playing. */
const HOLD_MS = 1800

interface TimelineState {
  scene: Scene
  index: number
  /** Moves on by itself once the current pose comes to rest. */
  playing: boolean
  /** Shown instead of the timeline, e.g. the cube held like an example choice. */
  held: Pose | null
  /** The pose the model last came to rest on. */
  restingOn: Pose | null
}

const startOf = (scene: Scene): TimelineState => ({
  scene,
  index: 0,
  playing: true,
  held: null,
  restingOn: null,
})

const shownBy = (state: TimelineState): Pose => state.held ?? state.scene.poses[state.index]

const isFinished = (state: TimelineState) =>
  state.held === null &&
  state.index === state.scene.poses.length - 1 &&
  state.restingOn === shownBy(state)

/** Plays a scene's poses one after another, and lets the learner step, replay or hold one pose. */
export function useSceneTimeline(scene: Scene) {
  const [stored, setState] = useState(() => startOf(scene))
  // A new scene starts again from its first pose. Not reset with a `key`, which would also
  // remount the 3D canvas that stays on screen from one step to the next.
  const state = stored.scene === scene ? stored : startOf(scene)
  if (stored !== state) setState(state)

  const pose = shownBy(state)
  const resting = state.restingOn === pose
  const finished = isFinished(state)

  useEffect(() => {
    if (!state.playing || state.held || !resting || finished) return
    const timer = setTimeout(() => setState((s) => ({ ...s, index: s.index + 1 })), HOLD_MS)
    return () => clearTimeout(timer)
  }, [state, resting, finished])

  const onArrive = useCallback(() => setState((s) => ({ ...s, restingOn: shownBy(s) })), [])

  return {
    pose,
    index: state.index,
    count: scene.poses.length,
    held: state.held,
    playing: state.playing && state.held === null && !finished,
    onArrive,
    goTo: (index: number) => setState((s) => ({ ...s, index, playing: false, held: null })),
    /** Plays on from here, or from the start once the end has been reached. */
    play: () =>
      setState((s) =>
        isFinished(s) ? { ...s, index: 0, playing: true } : { ...s, playing: true, held: null },
      ),
    pause: () => setState((s) => ({ ...s, playing: false })),
    hold: (held: Pose) => setState((s) => ({ ...s, held, playing: false })),
  }
}

export type SceneTimeline = ReturnType<typeof useSceneTimeline>
