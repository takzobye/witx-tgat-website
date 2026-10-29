import { ScanEye } from 'lucide-react'

interface SeeThroughToggleProps {
  on: boolean
  onChange: (on: boolean) => void
}

/** Switches a 3D model between paper and frosted glass, through which its far side shows. */
export function SeeThroughToggle({ on, onChange }: SeeThroughToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      title="มองทะลุให้เห็นหน้าด้านหลัง"
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2 text-sm font-medium shadow-sm ring-1 transition sm:px-3 ${
        on
          ? 'bg-brand-600 text-white ring-brand-600 hover:bg-brand-500'
          : 'bg-surface/90 text-ink-soft ring-line hover:bg-surface hover:text-ink'
      }`}
    >
      <ScanEye className="size-4" aria-hidden="true" />
      <span className="max-sm:sr-only">มองทะลุ</span>
    </button>
  )
}
