import { readFileSync } from 'fs'
import { join } from 'path'
import type { Metadata } from 'next'
import BancosComparativo from '@/components/BancosComparativo'

export const revalidate = 3600

const CANONICAL = 'https://bancos-app.vercel.app/bancos'

export const metadata: Metadata = {
  title: 'Ranking dos Bancos Brasileiros — ROAE, Inadimplência, Lucro | 4T25',
  description: 'Ranking com ROAE, inadimplência, eficiência, lucro líquido e crescimento de carteira; dados de earnings releases (4T25).',
  alternates: { canonical: CANONICAL },
}

function loadBank(filename: string) {
  const path = join(process.cwd(), 'data', filename)
  return JSON.parse(readFileSync(path, 'utf-8'))
}

export default function BancosPage() {
  const banks = [
    loadBank('itau_historico.json'),
    loadBank('bradesco_historico.json'),
    loadBank('santander_historico.json'),
    loadBank('bv_historico.json'),
  ]

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-full px-4 py-8 space-y-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-white mb-1">Ranking dos Bancos — 4T25</h1>
          <p className="text-slate-400 text-lg mb-2">Comparativo Trimestral e LTM · Itaú, Bradesco, Santander, BV</p>

          {/* Badge padronizado */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Dados até 4T25 · Earnings releases
            </span>
          </div>

          {/* Bloco indexável */}
          <p className="text-slate-400 text-sm leading-relaxed max-w-4xl mb-1">
            Compare os resultados financeiros trimestrais dos principais bancos brasileiros — Itaú, Bradesco,
            Santander e BV. Os dados incluem DRE completa, indicadores de performance (ROAE, NIM, índice de
            eficiência), carteira de crédito e adequação de capital (Basileia III). Selecione os bancos e
            períodos para comparação lado a lado.
          </p>
          <p className="text-slate-500 text-xs mb-2">Fonte: Earnings releases oficiais · Itaú, Bradesco, Santander, BV · Séries históricas RI · Dados até 4T25</p>
        </div>
        <BancosComparativo banks={banks} />
      </div>
    </main>
  )
}
