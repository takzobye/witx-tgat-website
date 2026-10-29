import { z } from 'zod'
import { ART_SIZE, type Art } from './art'
import type { QuarterTurns } from './geometry'
import { NetError, foldNet, parseLayout, type FoldedCube, type NetFace } from './net'
import { SLOTS, canFold, type CubeView, type SlotFace } from './view'

z.config(z.locales.th())

/** Thai exam choice letters; also caps how many choices a question may have. */
export const CHOICE_LABELS = ['ก', 'ข', 'ค', 'ง', 'จ'] as const

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

export type Difficulty = (typeof DIFFICULTIES)[number]

export const DIFFICULTY_LABELS = {
  easy: 'ง่าย',
  medium: 'ปานกลาง',
  hard: 'ยาก',
} as const satisfies Record<Difficulty, string>

const DEFAULT_PROMPTS = {
  possible: 'ถ้านำแผ่นคลี่นี้มาพับเป็นลูกบาศก์ จะได้รูปใด',
  impossible: 'รูปใดไม่สามารถพับได้จากแผ่นคลี่นี้',
} as const

const TURNS_BY_DEGREES = { 0: 0, 90: 1, 180: 2, 270: 3 } as const satisfies Record<
  number,
  QuarterTurns
>

const coordinate = z.number().min(0).max(ART_SIZE)
const point = z.tuple([coordinate, coordinate])
const fill = z.enum(['black', 'gray', 'none']).default('black')

const shapeSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('rect'),
    x: coordinate,
    y: coordinate,
    w: z.number().positive(),
    h: z.number().positive(),
    fill,
  }),
  z.strictObject({
    type: z.literal('circle'),
    cx: coordinate,
    cy: coordinate,
    r: z.number().positive(),
    fill,
  }),
  z.strictObject({ type: z.literal('polygon'), points: z.array(point).min(3), fill }),
  z.strictObject({ type: z.literal('line'), from: point, to: point }),
])

const faceIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9]$/, 'ชื่อหน้าต้องเป็นตัวอักษร A–Z หรือตัวเลข 1 ตัว')

/** `"A"` or `{ "face": "A", "rotate": 90 }` — rotation is clockwise, in degrees. */
const slotRefSchema = z.union([
  faceIdSchema.transform((faceId) => ({ faceId, turns: TURNS_BY_DEGREES[0] })),
  z
    .strictObject({
      face: faceIdSchema,
      rotate: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]).default(0),
    })
    .transform(({ face, rotate }) => ({ faceId: face, turns: TURNS_BY_DEGREES[rotate] })),
])

const viewRefSchema = z.strictObject({ top: slotRefSchema, left: slotRefSchema, right: slotRefSchema })

type SlotRef = z.output<typeof slotRefSchema>
type ViewRef = z.output<typeof viewRefSchema>

const questionInputSchema = z.strictObject({
  title: z.string().trim().min(1),
  difficulty: z.enum(DIFFICULTIES),
  ask: z.enum(['possible', 'impossible']).default('possible'),
  prompt: z.string().trim().min(1).optional(),
  /** The net drawn as text rows, one character per cell, `.` for empty cells. */
  layout: z
    .array(z.string().regex(/^[A-Za-z0-9.]+$/, 'ใช้ได้เฉพาะ A–Z, ตัวเลข และ . (ช่องว่าง)'))
    .min(1),
  /** Drawings per face id; faces left out are blank. */
  faces: z.record(faceIdSchema, z.array(shapeSchema)).default({}),
  choices: z.array(viewRefSchema).min(2).max(CHOICE_LABELS.length),
  explanation: z.string().trim().min(1).optional(),
})

/** A structurally valid question whose net folds; the answer is not checked yet. */
export const questionDraftSchema = questionInputSchema.transform((input, ctx) => {
  let valid = true
  const issue = (path: PropertyKey[], message: string) => {
    valid = false
    ctx.addIssue({ code: 'custom', path, message })
  }

  const cells = parseLayout(input.layout)
  const ids = new Set<string>()
  for (const { id } of cells) {
    if (ids.has(id)) issue(['layout'], `หน้า "${id}" อยู่ในแผ่นคลี่มากกว่า 1 ช่อง`)
    ids.add(id)
  }
  for (const id of Object.keys(input.faces)) {
    if (!ids.has(id)) issue(['faces', id], `ไม่มีหน้า "${id}" ใน layout`)
  }
  input.choices.forEach((choice, i) => {
    for (const slot of SLOTS) {
      const { faceId } = choice[slot]
      if (!ids.has(faceId)) issue(['choices', i, slot], `ไม่มีหน้า "${faceId}" ใน layout`)
    }
  })
  if (!valid) return z.NEVER

  const net: NetFace[] = cells.map(({ id, cell }) => ({ id, cell, art: input.faces[id] ?? [] }))
  let cube: FoldedCube
  try {
    cube = foldNet(net)
  } catch (error) {
    if (!(error instanceof NetError)) throw error
    issue(['layout'], error.message)
    return z.NEVER
  }

  const artById = new Map(net.map((face) => [face.id, face.art]))
  const choices = input.choices.map((choice) => resolveView(choice, artById))

  return {
    title: input.title,
    difficulty: input.difficulty,
    ask: input.ask,
    prompt: input.prompt ?? DEFAULT_PROMPTS[input.ask],
    explanation: input.explanation,
    net,
    cube,
    choices,
    /** Whether each choice can be made by folding the net. */
    foldable: choices.map((choice) => canFold(cube, choice)),
  }
})

export type QuestionDraft = z.output<typeof questionDraftSchema>

export type AnswerCheck = { ok: true; answer: number } | { ok: false; problem: string }

/** A valid question has exactly one choice that answers what it asks. */
export function checkAnswer(draft: QuestionDraft): AnswerCheck {
  const wanted = draft.ask === 'possible'
  const answers = draft.foldable.flatMap((foldable, i) => (foldable === wanted ? [i] : []))
  if (answers.length === 1) return { ok: true, answer: answers[0] }

  const kind = wanted ? 'พับได้' : 'พับไม่ได้'
  const found = answers.map((i) => CHOICE_LABELS[i]).join(', ') || 'ไม่มีเลย'
  return { ok: false, problem: `ต้องมีตัวเลือกที่${kind}เพียง 1 ข้อ แต่ตอนนี้ข้อที่${kind}คือ ${found}` }
}

export const questionSchema = questionDraftSchema.transform((draft, ctx) => {
  const check = checkAnswer(draft)
  if (!check.ok) {
    ctx.addIssue({ code: 'custom', path: ['choices'], message: check.problem })
    return z.NEVER
  }
  return { ...draft, answer: check.answer }
})

export type Question = z.output<typeof questionSchema>

function resolveView(view: ViewRef, artById: ReadonlyMap<string, Art>): CubeView {
  const resolve = ({ faceId, turns }: SlotRef): SlotFace => {
    const art = artById.get(faceId)
    if (!art) throw new Error(`Unknown face "${faceId}" should have been rejected`)
    return { faceId, art, turns }
  }
  return { top: resolve(view.top), left: resolve(view.left), right: resolve(view.right) }
}
