import { readFileSync } from 'fs'
import { join } from 'path'
import BancosComparativo from '@/components/BancosComparativo'

export const revalidate = 3600

export const metadata = {
  title: 'Comparativo de resultados — Itaú, Bradesco, Santander, BB, BV | BancosBR',
  description: 'Comparativo trimestral de DRE, indicadores, carteira de crédito e capital dos principais bancos brasileiros listados na B3.',
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
    loadBank('bb_historico.json'),
    loadBank('bv_historico.json'),
  ]

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-full px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Resultados dos Principais Bancos</h1>
          <p className="text-slate-400 text-lg mb-0.5">Comparativo Trimestral e LTM</p>
          <p className="text-slate-500 text-sm">Fonte: Earnings releases dos bancos · Trimestral ou LTM (12 meses acumulados) · Δ% mostra a variação entre os períodos</p>
        </div>
        <BancosComparativo banks={banks} />
      </div>
    </main>
  )
}
