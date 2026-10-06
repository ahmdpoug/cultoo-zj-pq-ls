import type { Metadata, Viewport } from 'next'
import { Geist, Archivo_Black } from 'next/font/google'
import { SiteHeader } from '@/components/layout/site-header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { SiteFooter } from '@/components/layout/site-footer'
import { AuthProvider } from '@/components/providers/auth-provider'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
// Single weight, so the display face costs one small file.
const archivo = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--font-archivo', display: 'swap' })

const description =
  'CT is the game. Turn your Crypto Twitter identity into a collectible card, battle the community, forge legends and ascend through the CULT.'

export const metadata: Metadata = {
  title: { default: '$CULT — CT Card Universe', template: '%s · $CULT' },
  description,
  applicationName: '$CULT',
  generator: 'v0.app',
  openGraph: {
    type: 'website',
    siteName: '$CULT',
    title: '$CULT — CT Card Universe',
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: '$CULT — CT Card Universe',
    description,
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${archivo.variable} bg-background`}>
      <body className="min-h-dvh antialiased">
        <AuthProvider>
          <SiteHeader />
          <main className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 md:pt-12">{children}</main>
          <SiteFooter />
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  )
}
