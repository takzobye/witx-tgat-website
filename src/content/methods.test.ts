import { describe, expect, it } from 'vitest'
import { methods } from './methods'
import { questions } from './questions'

describe('methods', () => {
  it('load, with every scene and example checked against the real cube', () => {
    expect(methods.map((method) => method.id)).toEqual(['four-walls', 'quick-cut', 'rolling'])
  })

  it('practise on a question that exists', () => {
    for (const method of methods) {
      expect(questions.map((q) => q.id)).toContain(method.practiceId)
    }
  })

  it('give every step a unique id', () => {
    const ids = methods.flatMap((method) => method.steps.map((step) => step.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keep exactly one choice in every example, like an exam question', () => {
    for (const step of methods.flatMap((method) => method.steps)) {
      if (!step.example) continue
      expect(
        step.example.choices.filter((c) => c.verdict === 'keep'),
        step.id,
      ).toHaveLength(1)
    }
  })
})
