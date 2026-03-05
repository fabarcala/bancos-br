import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bancos BR | Estatísticas do Sistema Financeiro',
  description: 'Dashboard com resultados e indicadores dos principais bancos brasileiros',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#0f1117] text-slate-100">
        {/* Header */}
        <header className="border-b border-slate-800 bg-[#0f1117]/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-white">Bancos<span className="text-blue-400">BR</span></span>
            </Link>
            <nav className="flex-1 flex items-center justify-center gap-6 text-sm text-slate-400">
              <Link href="/macro" className="hover:text-white transition-colors">Macro</Link>
              <Link href="/bancos" className="hover:text-white transition-colors">Bancos</Link>
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 mt-16 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-slate-500 text-sm">
            <p>Dados extraídos das planilhas de séries históricas publicadas pelos bancos.</p>
            <p className="mt-1">Fontes: Itaú, Bradesco, Banco do Brasil, BTG Pactual, Santander Brasil.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
