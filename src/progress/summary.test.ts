import { describe, expect, it } from 'vitest'
import type { Difficulty } from '#/cube/question'
import type { Attempt } from './attempts'
import { summarizeProgress } from './summary'

const bank: { id: string; difficulty: Difficulty }[] = [
  { id: 'q1', difficulty: 'easy' },
  { id: 'q2', difficulty: 'easy' },
  { id: 'q3', difficulty: 'hard' },
]

const NOW = new Date(2026, 9, 29, 15, 0)
const at = (daysAgo: number, hour = 9) =>
  new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - daysAgo, hour).getTime()
const attempt = (questionId: string, correct: boolean, time = at(0)): Attempt => ({
  questionId,
  correct,
  at: time,
})

describe('summarizeProgress', () => {
  it('starts with every question new', () => {
    const summary = summarizeProgress(bank, [], NOW)
    expect([...summary.statusById.values()]).toEqual(['new', 'new', 'new'])
    expect(summary.accuracy).toBeNull()
    expect(summary.next?.id).toBe('q1')
    expect(summary.recent).toEqual([])
  })

  it('keeps a question solved after a later wrong answer', () => {
    const summary = summarizeProgress(
      bank,
      [attempt('q1', false), attempt('q1', true), attempt('q1', false), attempt('q2', false)],
      NOW,
    )
    expect(summary.statusById.get('q1')).toBe('solved')
    expect(summary.statusById.get('q2')).toBe('retry')
    expect(summary.solved).toBe(1)
    expect(summary.accuracy).toBe(0.25)
  })

  it('points to the first unsolved question, and to none once all are solved', () => {
    expect(summarizeProgress(bank, [attempt('q1', true)], NOW).next?.id).toBe('q2')
    const all = bank.map((q) => attempt(q.id, true))
    expect(summarizeProgress(bank, all, NOW).next).toBeNull()
  })

  it('ignores answers to questions no longer in the bank', () => {
    const summary = summarizeProgress(bank, [attempt('gone', true), attempt('q3', false)], NOW)
    expect(summary.answered).toBe(1)
    expect(summary.accuracy).toBe(0)
    expect(summary.recent.map((a) => a.question.id)).toEqual(['q3'])
  })

  it('counts solved questions per difficulty, skipping levels the bank lacks', () => {
    const summary = summarizeProgress(bank, [attempt('q2', true), attempt('q3', false)], NOW)
    expect(summary.byDifficulty).toEqual([
      { difficulty: 'easy', solved: 1, total: 2 },
      { difficulty: 'hard', solved: 0, total: 1 },
    ])
  })

  it('buckets the last seven local days, ending today', () => {
    const summary = summarizeProgress(
      bank,
      [
        attempt('q1', true, at(7)),
        attempt('q1', false, at(6, 0)),
        attempt('q2', true, at(1, 23)),
        attempt('q2', true, at(0, 0)),
        attempt('q3', false, at(0, 14)),
      ],
      NOW,
    )
    expect(summary.week).toHaveLength(7)
    expect(summary.week[0].day).toEqual(new Date(2026, 9, 23))
    expect(summary.week[6].day).toEqual(new Date(2026, 9, 29))
    expect(summary.week.map((d) => d.answered)).toEqual([1, 0, 0, 0, 0, 1, 2])
    expect(summary.week[6].correct).toBe(1)
  })

  it('lists the latest answers first', () => {
    const attempts = [1, 2, 3, 4, 5].map((n) => attempt('q1', n % 2 === 0, at(0, n)))
    const summary = summarizeProgress(bank, attempts, NOW)
    expect(summary.recent.map((a) => a.at)).toEqual([at(0, 5), at(0, 4), at(0, 3), at(0, 2)])
  })
})
