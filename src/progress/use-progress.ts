import { useMemo } from 'react'
import { questions, type BankQuestion } from '#/content/questions'
import { useAttempts } from './attempts'
import { useNow } from './clock'
import { summarizeProgress, type ProgressSummary } from './summary'

export type BankProgress = ProgressSummary<BankQuestion>

/** Progress through the question bank in this browser; `null` until the page hydrates. */
export function useProgress(): BankProgress | null {
  const attempts = useAttempts()
  const now = useNow()
  return useMemo(
    () => (attempts && now !== null ? summarizeProgress(questions, attempts, new Date(now)) : null),
    [attempts, now],
  )
}
