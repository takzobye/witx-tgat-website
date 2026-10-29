import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'witx-tgat:see-through'

const listeners = new Set<() => void>()
let snapshot: boolean | undefined

function load(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    // Storage is blocked (private browsing).
    return false
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => (snapshot ??= load())

// The server cannot see the visitor's browser storage.
const getServerSnapshot = () => false

/** Whether 3D models are shown see-through. One choice for every model, kept in this browser. */
export function useSeeThrough(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function setSeeThrough(on: boolean) {
  snapshot = on
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    // Storage is full or blocked; the choice still lasts for this visit.
  }
  for (const listener of listeners) listener()
}
