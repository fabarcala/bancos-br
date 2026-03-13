'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/boletim-focus', label: 'Boletim Focus' },
  { href: '/curva-juros',   label: 'Curva de Juros' },
  { href: '/setorial',      label: 'Setorial PF' },
  { href: '/bancos',        label: 'Bancos' },
  { href: '/graficos',      label: 'Gráficos' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="border-b border-slate-800 bg-gray-950/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* Logo / Brand */}
        <Link href="/bancos" className="text-white font-semibold text-sm tracking-wide shrink-0">
          🏦 BancosBR
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm text-slate-400">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`hover:text-white transition-colors ${pathname === l.href ? 'text-white font-medium' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Hamburguer button (mobile) */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-md hover:bg-slate-800 transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-slate-300 transition-transform duration-200 ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block w-5 h-0.5 bg-slate-300 transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-slate-300 transition-transform duration-200 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-slate-800 bg-gray-950">
          <nav className="flex flex-col py-2">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`px-6 py-3 text-sm transition-colors ${
                  pathname === l.href
                    ? 'text-white font-medium bg-slate-800/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
