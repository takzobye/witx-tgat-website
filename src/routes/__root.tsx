import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { SiteHeader } from '#/components/SiteHeader'
import { buttonStyles } from '#/components/ui/button-styles'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'ฝึกพับกล่อง · TGAT2 ความสามารถทางด้านมิติสัมพันธ์' },
      {
        name: 'description',
        content:
          'ฝึกโจทย์พับกล่อง (แผ่นคลี่ลูกบาศก์) สำหรับ TGAT2 พร้อมโมเดล 3 มิติที่พับให้ดูได้ทันที',
      },
      { name: 'theme-color', content: '#f7f6f3' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <HeadContent />
      </head>
      <body>
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 pb-16">{children}</main>
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
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
      <p className="text-6xl font-bold text-stone-300">404</p>
      <p className="text-lg text-stone-600">ไม่พบหน้าที่ต้องการ</p>
      <Link to="/" className={buttonStyles.primary}>
        กลับหน้าแรก
      </Link>
    </div>
  )
}
