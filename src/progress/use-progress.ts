import { useMemo } from 'react'
import { questions, type BankQuestion } from '#/content/questions'
import { useAttempts } from './attempts'
import { summarizeProgress, type ProgressSummary } from './summary'

export type BankProgress = ProgressSummary<BankQuestion>

/** Progress through the question bank in this browser; `null` until the page hydrates. */
export function useProgress(): BankProgress | null {
  const attempts = useAttempts()
  return useMemo(() => attempts && summarizeProgress(questions, attempts, new Date()), [attempts])
}
