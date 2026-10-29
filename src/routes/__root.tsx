import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AppBackdrop } from '#/components/layout/AppBackdrop'
import { AppNav } from '#/components/layout/AppNav'
import { CANVAS_COLORS, readThemePreference } from '#/theme/theme'

import appCss from '#/styles.css?url'

export const Route = createRootRoute({
  loader: () => ({ theme: readThemePreference() }),
  head: ({ loaderData }) => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'ฝึกพับกล่อง · TGAT2 ความสามารถทางด้านมิติสัมพันธ์' },
      {
        name: 'description',
        content: 'ฝึกโจทย์พับกล่อง (แผ่นคลี่ลูกบาศก์) สำหรับ TGAT2 พร้อมโมเดล 3 มิติที่พับให้ดูได้ทันที',
      },
      // Only one theme-color survives HeadContent's de-duplication, so a visitor following
      // their device gets none and the browser picks its own toolbar colour.
      ...(loaderData?.theme
        ? [{ name: 'theme-color', content: CANVAS_COLORS[loaderData.theme] }]
        : []),
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme } = Route.useLoaderData()

  return (
    <html lang="th" data-theme={theme ?? undefined}>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="relative isolate min-h-dvh lg:pl-22">
          <AppBackdrop />
          <AppNav />
          <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">{children}</main>
        </div>
        <TanStackDevtools
          config={{ position: 'bottom-right', triggerMode: 'fixed' }}
          plugins={[{ name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <div className="grid place-items-center gap-4 py-24 text-center">
      <p className="text-6xl font-bold text-ink-faint">404</p>
      <p className="text-lg text-ink-soft">ไม่พบหน้าที่ต้องการ</p>
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/30 focus-visible:outline-none"
      >
        กลับหน้าแรก
      </Link>
    </div>
  )
}
