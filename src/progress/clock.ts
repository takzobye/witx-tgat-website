import { useSyncExternalStore } from 'react'

/** Relative times are shown to the minute, so the clock only needs to move that often. */
const TICK_MS = 60_000

const listeners = new Set<() => void>()
let snapshot: number | undefined
let timer: ReturnType<typeof setInterval> | undefined

function tick() {
  snapshot = Date.now()
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) timer = setInterval(tick, TICK_MS)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      clearInterval(timer)
      // The next page to mount reads the time afresh instead of where the clock stopped.
      snapshot = undefined
    }
  }
}

const getSnapshot = () => (snapshot ??= Date.now())

// Time-dependent output waits for hydration so server and client markup match.
const getServerSnapshot = () => null

/** The current time in epoch milliseconds, moving every minute; `null` until the page hydrates. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
