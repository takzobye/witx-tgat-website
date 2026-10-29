import { Link, rootRouteId, useLoaderData, useRouter } from '@tanstack/react-router'
import { House, LayoutGrid, Moon, PenLine, Sun } from 'lucide-react'
import { resolveTheme, saveThemePreference } from '#/theme/theme'
import { LogoMark } from './LogoMark'

const NAV_ITEMS = [
  { to: '/', label: 'หน้าหลัก', icon: House, exact: true },
  { to: '/questions', label: 'คลังโจทย์', icon: LayoutGrid, exact: false },
  { to: '/lab', label: 'สร้างโจทย์', icon: PenLine, exact: false },
] as const

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30'

const ITEM = `group relative flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition lg:size-12 lg:justify-center lg:px-0 ${FOCUS_RING}`
const ITEM_ACTIVE = 'bg-brand-600 text-white'
const ITEM_INACTIVE = 'text-ink-muted hover:bg-surface hover:text-ink'

const TOOLTIP =
  'whitespace-nowrap lg:pointer-events-none lg:absolute lg:left-full lg:ml-4 lg:rounded-lg lg:bg-ink lg:px-2.5 lg:py-1.5 lg:text-xs lg:text-canvas lg:opacity-0 lg:shadow-lg lg:transition lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100'
// Inline next to the icon on tablets, screen-reader only on phones, a tooltip on the rail.
const ITEM_LABEL = `max-sm:sr-only ${TOOLTIP}`
// Screen-reader only until the rail can show it as a tooltip.
const TOGGLE_LABEL = `max-lg:sr-only ${TOOLTIP}`

/** A top bar on small screens that becomes a left rail from `lg` up. */
export function AppNav() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-contrast/5 bg-surface/60 px-4 backdrop-blur-xl sm:px-6 lg:fixed lg:inset-y-0 lg:left-0 lg:h-auto lg:w-22 lg:flex-col lg:border-r lg:border-b-0 lg:px-0 lg:py-7">
      <Link to="/" className="flex items-center gap-2.5 font-semibold text-ink">
        <LogoMark className="size-7 lg:size-9" />
        <span className="whitespace-nowrap max-sm:sr-only lg:sr-only">
          ฝึกพับกล่อง <span className="font-normal text-ink-muted">TGAT2</span>
        </span>
      </Link>
      <nav
        aria-label="เมนูหลัก"
        className="ml-auto flex items-center gap-1 rounded-full bg-contrast/[0.04] p-1 ring-1 ring-contrast/5 lg:my-auto lg:ml-0 lg:flex-col lg:gap-2 lg:p-1.5"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            className={ITEM}
            activeProps={{ className: ITEM_ACTIVE }}
            inactiveProps={{ className: ITEM_INACTIVE }}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span className={ITEM_LABEL}>{label}</span>
          </Link>
        ))}
      </nav>
      <ThemeToggle />
    </header>
  )
}

/** Switches between light and dark; until it is first used, the page follows the device. */
function ThemeToggle() {
  const router = useRouter()
  const { theme } = useLoaderData({ from: rootRouteId })

  const toggle = async () => {
    saveThemePreference(resolveTheme(theme) === 'dark' ? 'light' : 'dark')
    await router.invalidate({ filter: (match) => match.routeId === rootRouteId })
  }

  // CSS picks the icon and label, so the server never has to guess the device's setting.
  return (
    <button
      type="button"
      onClick={toggle}
      className={`group relative grid size-10 shrink-0 place-items-center rounded-full bg-contrast/[0.04] text-ink-muted ring-1 ring-contrast/5 transition hover:bg-surface hover:text-ink lg:size-12 ${FOCUS_RING}`}
    >
      <Moon className="size-5 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-5 dark:block" aria-hidden="true" />
      <span className={`${TOGGLE_LABEL} dark:hidden`}>โหมดมืด</span>
      <span className={`${TOGGLE_LABEL} hidden dark:block`}>โหมดสว่าง</span>
    </button>
  )
}
