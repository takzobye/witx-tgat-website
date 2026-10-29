/** Status colours, tinted to stay readable on both the light and the dark palette. */
export const toneStyles = {
  emerald: {
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25',
    panel:
      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200',
    tile: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  amber: {
    badge:
      'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25',
    panel:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200',
    tile: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400',
    text: 'text-amber-700 dark:text-amber-400',
  },
  rose: {
    badge:
      'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25',
    panel:
      'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-200',
    tile: 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400',
    text: 'text-rose-700 dark:text-rose-400',
  },
} as const
