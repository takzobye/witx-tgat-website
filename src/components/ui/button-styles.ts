const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-40'

export const buttonStyles = {
  primary: `${BASE} bg-brand-600 text-white shadow-sm hover:bg-brand-500 focus-visible:ring-brand-500/30 disabled:hover:bg-brand-600`,
  secondary: `${BASE} border border-line-strong bg-surface text-ink hover:bg-sunken focus-visible:ring-ink-faint/30`,
  soft: `${BASE} bg-accent-soft text-accent-ink hover:bg-brand-100 focus-visible:ring-brand-500/30 dark:hover:bg-brand-400/25`,
  icon: 'grid size-10 shrink-0 place-items-center rounded-full border border-line-strong bg-surface text-ink-soft transition hover:bg-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink-faint/30',
} as const
