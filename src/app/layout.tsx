import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Bancos BR | Estatísticas do Sistema Financeiro',
  description: 'Dashboard com resultados e indicadores dos principais bancos brasileiros',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-950 text-slate-100">
        {/* Header */}
        <header className="border-b border-slate-800 bg-gray-950/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center">
            <nav className="flex-1 flex items-center justify-center gap-6 text-sm text-slate-400">
              <Link href="/macro" className="hover:text-white transition-colors">Macro</Link>
              <Link href="/setorial" className="hover:text-white transition-colors">Setorial</Link>
              <Link href="/bancos" className="hover:text-white transition-colors">Bancos</Link>
              <Link href="/graficos" className="hover:text-white transition-colors">Gráficos</Link>
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-full px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 mt-16 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-slate-500 text-sm">
            <p>Fontes: Banco Central do Brasil (SGS e Boletim Focus) · Earnings releases dos bancos (Itaú, Bradesco, BB, Santander, BTG Pactual, BV).</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
