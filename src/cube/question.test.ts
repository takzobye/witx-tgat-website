import { describe, expect, it } from 'vitest'
import { parseQuestionDraft } from './question'

//  . A . .
//  B C D E
//  . F . .
// A half-black A on top of a dotted C: only the upright A folds.
const draft = {
  title: 'ตัวอย่าง',
  difficulty: 'easy',
  layout: ['.A..', 'BCDE', '.F..'],
  faces: {
    A: [{ type: 'rect', x: 0, y: 0, w: 50, h: 100 }],
    C: [{ type: 'circle', cx: 50, cy: 50, r: 20 }],
  },
  choices: [
    { top: 'A', left: 'C', right: 'D' },
    { top: { face: 'A', rotate: 90 }, left: 'C', right: 'D' },
  ],
}

describe('parseQuestionDraft', () => {
  it('folds a valid draft and finds its answer', () => {
    const parsed = parseQuestionDraft(JSON.stringify(draft))
    expect(parsed.status === 'ready' && parsed.answer).toEqual({ ok: true, answer: 0 })
  })

  it('reports JSON that does not parse', () => {
    expect(parseQuestionDraft('{ "title": ').status).toBe('syntax-error')
  })

  it('lists what to fix, with where each problem is', () => {
    const parsed = parseQuestionDraft(JSON.stringify({ ...draft, difficulty: 'expert' }))
    expect(parsed.status === 'invalid' && parsed.issues.map((issue) => issue.path)).toEqual([
      'difficulty',
    ])
  })
})
