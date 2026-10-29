import type { z } from 'zod'
import { resolveView, viewRefSchema } from '#/cube/question'
import { canFold, matchView, type CubeView, type ViewMatch } from '#/cube/view'
import { heldPose, resolveScene, type Pose, type Scene, type SceneSpec } from './scene'

export type Verdict = 'keep' | 'cut'

export interface ExampleChoiceSpec {
  /** Written like a question file's choice: `{ top: 'A', left: { face: 'B', rotate: 90 }, right: 'C' }`. */
  view: z.input<typeof viewRefSchema>
  /** Whether the method keeps this choice or cuts it. Checked against the real cube. */
  verdict: Verdict
  reason: string
}

export interface StepSpec {
  title: string
  body: readonly string[]
  /** The one thing to remember from this step. */
  rule: string
  /** How to use it under exam time pressure. */
  examTip?: string
  scene: SceneSpec
  /** Lets the learner fold the net by hand rather than watch it play. */
  handsOn?: boolean
  /** Choices to sort into keep / cut with this step's rule, using the scene's net. */
  example?: { prompt: string; choices: readonly ExampleChoiceSpec[] }
}

export interface MethodSpec<Id extends string> {
  id: Id
  name: string
  /** A few words on what sets it apart, e.g. "เร็วที่สุด". */
  badge: string
  tagline: string
  bestFor: string
  strength: string
  caution: string
  minutes: number
  steps: readonly [StepSpec, ...StepSpec[]]
  /** The method boiled down to what to do, in order, on every exam question. */
  checklist: readonly string[]
  /** Question bank id to try the method on at the end. */
  practiceId: string
}

export interface ExampleChoice {
  view: CubeView
  verdict: Verdict
  reason: string
  match: ViewMatch
  /** The real cube, held the way this choice draws it. */
  pose: Pose
}

export interface LessonStep extends Omit<StepSpec, 'scene' | 'example'> {
  /** Unique across all methods. */
  id: string
  scene: Scene
  example?: { prompt: string; choices: readonly ExampleChoice[] }
}

export interface Method<Id extends string = string> extends Omit<MethodSpec<Id>, 'steps'> {
  steps: readonly LessonStep[]
}

/** Resolves every scene and checks every example, so a mistake in a lesson fails at load time. */
export function defineMethod<const Id extends string>(spec: MethodSpec<Id>): Method<Id> {
  return {
    ...spec,
    steps: spec.steps.map((step, index) => {
      const scene = resolveScene(step.scene)
      return {
        ...step,
        id: `${spec.id}-${index + 1}`,
        scene,
        example: step.example && {
          prompt: step.example.prompt,
          choices: step.example.choices.map((choice) => resolveChoice(scene, choice)),
        },
      }
    }),
  }
}

function resolveChoice(scene: Scene, { view: ref, verdict, reason }: ExampleChoiceSpec): ExampleChoice {
  const artById = new Map(Object.entries(scene.arts))
  const view = resolveView(viewRefSchema.parse(ref), artById)
  if (canFold(scene.cube, view) !== (verdict === 'keep')) {
    throw new Error(`Example choice ${JSON.stringify(ref)} should be "${verdict}" but the cube says otherwise`)
  }
  const match = matchView(scene.cube, view)
  const note =
    verdict === 'keep' ? 'กล่องจริงตรงกับรูปนี้ทุกหน้า' : `กล่องจริงตรงกับรูปนี้เพียง ${match.matchedSlots} จาก 3 หน้า`
  return { view, verdict, reason, match, pose: heldPose(scene, match.orientation, note) }
}
