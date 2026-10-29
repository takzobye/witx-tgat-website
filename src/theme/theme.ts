import { createIsomorphicFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { z } from 'zod'

const COOKIE_NAME = 'theme'
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

const themeSchema = z.enum(['light', 'dark'])

export type Theme = z.output<typeof themeSchema>

/** The theme the visitor picked, or `null` to follow their device's light or dark setting. */
export type ThemePreference = Theme | null

/** Page background per theme, for the browser's toolbar. Matches `--color-canvas` in styles.css. */
export const CANVAS_COLORS = { light: '#f7f6f3', dark: '#0e0d0c' } as const satisfies Record<
  Theme,
  string
>

const parse = (value: string | undefined): ThemePreference =>
  themeSchema.safeParse(value).data ?? null

/**
 * Read from a cookie rather than browser storage, so the server renders the chosen theme
 * on the first paint instead of flashing the other one.
 */
export const readThemePreference = createIsomorphicFn()
  .server(() => parse(getCookie(COOKIE_NAME)))
  .client(() => parse(readCookie(COOKIE_NAME)))

export function saveThemePreference(theme: Theme) {
  document.cookie = `${COOKIE_NAME}=${theme}; Path=/; Max-Age=${ONE_YEAR_IN_SECONDS}; SameSite=Lax`
}

/** The theme on screen: the chosen one, otherwise the device's. Browser only. */
export function resolveTheme(preference: ThemePreference): Theme {
  if (preference) return preference
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length)
}
