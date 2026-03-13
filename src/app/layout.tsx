import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
export const metadata: Metadata = {
  title: {
    default: 'BancosBR — Estatísticas do Sistema Financeiro Nacional',
    template: '%s | BancosBR',
  },
  description: 'Dados e gráficos do sistema financeiro brasileiro: Boletim Focus, resultados de bancos, crédito setorial e indicadores do SFN.',
  metadataBase: new URL('https://bancos-app.vercel.app'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-950 text-slate-100">
        <Navbar />

        {/* Main */}
        <main className="max-w-full px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 mt-16 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-slate-500 text-sm">
            <p>Fontes: Banco Central do Brasil (SGS e Boletim Focus) · ANBIMA (Curva de Juros) · Earnings releases dos bancos (Itaú, Bradesco, Santander, BV).</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
