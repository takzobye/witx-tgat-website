import { useSyncExternalStore } from 'react'
import { z } from 'zod'

const STORAGE_KEY = 'witx-tgat:attempts'
/** Older attempts are dropped beyond this, so storage stays small. */
const MAX_ATTEMPTS = 1000

const historySchema = z.array(
  z.object({ questionId: z.string(), correct: z.boolean(), at: z.number() }),
)

/** One checked answer; `at` is when it was checked, in epoch milliseconds. */
export type Attempt = z.output<typeof historySchema>[number]

const listeners = new Set<() => void>()
let snapshot: readonly Attempt[] | undefined

function load(): readonly Attempt[] {
  try {
    const result = historySchema.safeParse(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))
    return result.success ? result.data : []
  } catch {
    // Storage is blocked (private browsing) or holds malformed JSON.
    return []
  }
}

function save(attempts: readonly Attempt[]) {
  snapshot = attempts
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts))
  } catch {
    // Storage is full or blocked; the history still lasts for this visit.
  }
  notify()
}

function notify() {
  for (const listener of listeners) listener()
}

/** Another tab changed the history (`key` is `null` when storage was cleared). */
function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return
  snapshot = undefined
  notify()
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', onStorage)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}

const getSnapshot = () => (snapshot ??= load())

// The server cannot see the visitor's browser storage.
const getServerSnapshot = () => null

/** Answers checked in this browser, oldest first; `null` until the page hydrates. */
export function useAttempts(): readonly Attempt[] | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function recordAttempt(questionId: string, correct: boolean) {
  save([...getSnapshot(), { questionId, correct, at: Date.now() }].slice(-MAX_ATTEMPTS))
}

export function clearAttempts() {
  save([])
}
