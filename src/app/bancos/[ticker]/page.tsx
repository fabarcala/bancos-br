import { getBankByTicker, ALL_BANKS, formatValue, getLatestValue } from '@/lib/data'
import { KPIKey, KPI_CONFIG, BANK_COLORS } from '@/lib/types'
import { SingleBankChart } from '@/components/BankChart'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export async function generateStaticParams() {
  return ALL_BANKS.map(b => ({ ticker: b.ticker.toLowerCase() }))
}

const KPIS_ORDER: KPIKey[] = [
  'lucro_liquido_recorrente',
  'roe',
  'indice_eficiencia',
  'margem_financeira',
  'carteira_credito',
  'inadimplencia_90d',
  'basileia',
  'total_ativos',
  'pl',
  'receita_servicos',
  'aum',
]

export default async function BankPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params
  const bank = getBankByTicker(ticker.toUpperCase())
  if (!bank) notFound()

  const color = BANK_COLORS[bank.ticker] || '#6366f1'

  // KPIs disponíveis para este banco
  const availableKpis = KPIS_ORDER.filter(kpi => {
    const series = bank.kpis[kpi]
    if (!series) return false
    return Object.values(series).some(v => v !== null && v !== undefined)
  })

  return (
    <div>
      {/* Back */}
      <Link href="/bancos" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Todos os bancos
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{bank.banco}</h1>
          <span
            className="text-sm font-mono px-3 py-1 rounded-full mt-2 inline-block"
            style={{ backgroundColor: color + '20', color }}
          >
            {bank.ticker}
          </span>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
        {availableKpis.slice(0, 8).map(kpi => {
          const value = getLatestValue(bank, kpi)
          const config = KPI_CONFIG[kpi]
          return (
            <div key={kpi} className="bg-slate-900 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">{config.shortLabel}</p>
              <p className="text-xl font-bold" style={{ color }}>{formatValue(value, kpi)}</p>
              <p className="text-xs text-slate-500 mt-1">último período</p>
            </div>
          )
        })}
      </div>

      {/* Charts grid */}
      <h2 className="text-lg font-semibold text-slate-300 mb-5">Evolução histórica</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {availableKpis.map(kpi => (
          <div key={kpi} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <SingleBankChart bank={bank} kpi={kpi} periods={40} color={color} />
          </div>
        ))}
      </div>
    </div>
  )
}
