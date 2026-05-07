import type { Metadata } from 'next'
import { Inter, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Beerback · Trink Bier. Krieg Beerback.',
  description: 'Sammle deine Bier-Reise. Lerne mehr über Bier. Werde belohnt.',
  manifest: '/manifest.json',
  themeColor: '#d4a017',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Beerback',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${inter.variable} ${bricolage.variable}`}>
      <body>{children}</body>
    </html>
  )
}
