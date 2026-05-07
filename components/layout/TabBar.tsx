'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, Map, Wallet, User } from 'lucide-react'

const tabs = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/map', icon: Map, label: 'Karte' },
  { href: '/add-beer', icon: Plus, label: 'Bier', center: true },
  { href: '/wallet', icon: Wallet, label: 'Hopfen' },
  { href: '/profile', icon: User, label: 'Profil' },
]

export function TabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-line z-50">
      <div className="max-w-md mx-auto grid grid-cols-5 px-2 pb-4 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = pathname === tab.href

          if (tab.center) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center gap-1 relative"
              >
                <div className="absolute -top-6 w-14 h-14 bg-gradient-to-br from-gold to-gold-deep rounded-full flex items-center justify-center shadow-lg border-4 border-bg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-medium text-ink-soft mt-7">
                  {tab.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 py-1"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  active ? 'text-gold-deep' : 'text-ink-soft'
                }`}
              />
              <span
                className={`text-[10px] font-medium ${
                  active ? 'text-gold-deep' : 'text-ink-soft'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
