import { readFileSync } from 'fs'
import { join } from 'path'
import BancosComparativo from '@/components/BancosComparativo'

export const revalidate = 3600

export const metadata = {
  title: 'Resultados dos Bancos Brasileiros — Itaú, Bradesco, Santander | 4T25',
  description: 'Compare os resultados financeiros de Itaú, Bradesco, Santander e BV: ROAE, NIM, carteira de crédito, inadimplência e Basileia. Dados trimestrais e LTM.',
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
          <h1 className="text-3xl font-bold text-white mb-1">Resultados dos Principais Bancos — 4T25</h1>
          <p className="text-slate-400 text-lg mb-2">Comparativo Trimestral e LTM</p>

          {/* Badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Dados até 4T25 · Earnings releases
            </span>
          </div>

          {/* Bloco de texto indexável */}
          <p className="text-slate-400 text-sm leading-relaxed max-w-4xl mb-2">
            Compare os resultados financeiros trimestrais dos principais bancos brasileiros — Itaú, Bradesco, Santander e BV.
            Os dados incluem DRE completa, indicadores de performance (ROAE, NIM, índice de eficiência), carteira de crédito
            e adequação de capital (Basileia). Fonte: earnings releases oficiais publicados pelos bancos.
          </p>
        </div>
        <BancosComparativo banks={banks} />
      </div>
    </main>
  )
}
