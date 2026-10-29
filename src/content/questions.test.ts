import { describe, expect, it } from 'vitest'
import { questions } from './questions'

describe('question bank', () => {
  it('loads and validates every question file', () => {
    expect(questions.length).toBeGreaterThan(0)
  })

  it('agrees with the exam picture the first question was taken from', () => {
    const question = questions.find((q) => q.id === '01-stripes-and-square')
    expect(question?.answer).toBe(2)
    expect(question?.foldable).toEqual([false, false, true, false])
  })
})
