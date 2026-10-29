import { DIFFICULTIES, type Difficulty } from '#/cube/question'
import type { Attempt } from './attempts'

export type QuestionStatus = 'new' | 'retry' | 'solved'

export const WEEK_LENGTH = 7
const RECENT_LIMIT = 4

interface SummarizedQuestion {
  id: string
  difficulty: Difficulty
}

export type Answer<Q> = Attempt & { question: Q }

export interface ProgressSummary<Q extends SummarizedQuestion> {
  /** The moment summarized, in epoch milliseconds; answer times are relative to it. */
  now: number
  /** A question is solved once answered correctly, even if later answered wrong. */
  statusById: ReadonlyMap<string, QuestionStatus>
  solved: number
  /** Checked answers to questions still in the bank. */
  answered: number
  /** Share of checked answers that were correct, or `null` before the first one. */
  accuracy: number | null
  /** The first question not solved yet, or `null` once all are. */
  next: Q | null
  /** Only levels the bank has questions for, easiest first. */
  byDifficulty: { difficulty: Difficulty; solved: number; total: number }[]
  /** One entry per local day, oldest first and ending today. */
  week: { day: Date; answered: number; correct: number }[]
  /** Latest first. */
  recent: Answer<Q>[]
}

export function summarizeProgress<Q extends SummarizedQuestion>(
  questions: readonly Q[],
  attempts: readonly Attempt[],
  now: Date,
): ProgressSummary<Q> {
  const questionById = new Map(questions.map((q) => [q.id, q]))
  // Questions can be removed from the bank after they were answered.
  const answers = attempts.flatMap((attempt) => {
    const question = questionById.get(attempt.questionId)
    return question ? [{ ...attempt, question }] : []
  })

  const statusById = new Map<string, QuestionStatus>(questions.map((q) => [q.id, 'new']))
  for (const { questionId, correct } of answers) {
    if (statusById.get(questionId) !== 'solved') {
      statusById.set(questionId, correct ? 'solved' : 'retry')
    }
  }
  const isSolved = (question: Q) => statusById.get(question.id) === 'solved'
  const correct = answers.filter((a) => a.correct).length

  return {
    now: now.getTime(),
    statusById,
    solved: questions.filter(isSolved).length,
    answered: answers.length,
    accuracy: answers.length === 0 ? null : correct / answers.length,
    next: questions.find((q) => !isSolved(q)) ?? null,
    byDifficulty: DIFFICULTIES.map((difficulty) => {
      const level = questions.filter((q) => q.difficulty === difficulty)
      return { difficulty, solved: level.filter(isSolved).length, total: level.length }
    }).filter((level) => level.total > 0),
    week: lastDays(now, WEEK_LENGTH).map((day) => {
      const end = addDays(day, 1)
      const inDay = answers.filter((a) => a.at >= day.getTime() && a.at < end.getTime())
      return { day, answered: inDay.length, correct: inDay.filter((a) => a.correct).length }
    }),
    recent: answers.slice(-RECENT_LIMIT).reverse(),
  }
}

/** Local midnight `days` after `date`'s; the Date constructor handles month ends and DST. */
const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

function lastDays(now: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(now, i - count + 1))
}
