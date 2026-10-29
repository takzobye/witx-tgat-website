const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-40'

export const buttonStyles = {
  primary: `${BASE} bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:ring-indigo-500/30 disabled:hover:bg-indigo-600`,
  secondary: `${BASE} border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 focus-visible:ring-stone-400/30`,
} as const
