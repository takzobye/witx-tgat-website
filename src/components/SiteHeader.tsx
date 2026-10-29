import { Link } from '@tanstack/react-router'

const NAV_LINK =
  'rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-[#f7f6f3]/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-stone-900">
          <LogoMark />
          <span>
            ฝึกพับกล่อง <span className="font-normal text-stone-500">TGAT2</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/" hash="questions" className={NAV_LINK}>
            โจทย์
          </Link>
          <Link to="/lab" className={NAV_LINK} activeProps={{ className: 'bg-stone-100 text-stone-900' }}>
            สร้างโจทย์
          </Link>
        </nav>
      </div>
    </header>
  )
}

function LogoMark() {
  return (
    <svg viewBox="-10 -11.5 20 23" className="size-6" aria-hidden="true">
      <path d="M0 -10 8.66 -5 0 0 -8.66 -5Z" className="fill-indigo-500" />
      <path d="M-8.66 -5 0 0 0 10 -8.66 5Z" className="fill-indigo-700" />
      <path d="M8.66 -5 0 0 0 10 8.66 5Z" className="fill-indigo-300" />
    </svg>
  )
}
