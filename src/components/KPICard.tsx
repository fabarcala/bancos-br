'use client'

import { Bank, KPIKey, KPI_CONFIG, BANK_COLORS } from '@/lib/types'
import { getLatestValue, formatValue, getValueForPeriod, getLTMValue, KPIMode, FLOW_KPIS } from '@/lib/data'
import Link from 'next/link'

interface Props {
  bank: Bank
  kpi: KPIKey
  showLabel?: boolean
  period?: string
  mode?: KPIMode
}

export function KPICard({ bank, kpi, showLabel = true, period, mode = 'quarterly' }: Props) {
  const value = period
    ? mode === 'ltm' ? getLTMValue(bank, kpi, period) : getValueForPeriod(bank, kpi, period)
    : getLatestValue(bank, kpi)
  const config = KPI_CONFIG[kpi]
  const color = BANK_COLORS[bank.ticker] || '#6366f1'

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
      {showLabel && (
        <p className="text-xs text-slate-400 mb-1 truncate">{config.shortLabel}</p>
      )}
      <p className="text-xl font-bold" style={{ color }}>
        {formatValue(value, kpi)}
      </p>
    </div>
  )
}

interface BankCardProps {
  bank: Bank
  kpis?: KPIKey[]
  period?: string
  mode?: KPIMode
}

export function BankSummaryCard({
  bank,
  kpis = ['lucro_liquido_recorrente', 'roe', 'indice_eficiencia', 'carteira_credito'],
  period,
  mode = 'quarterly',
}: BankCardProps) {
  const color = BANK_COLORS[bank.ticker] || '#6366f1'

  return (
    <Link href={`/bancos/${bank.ticker.toLowerCase()}`}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-500 hover:bg-slate-800/50 transition-all cursor-pointer group h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
              {bank.banco}
            </h3>
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{ backgroundColor: color + '20', color }}
            >
              {bank.ticker}
            </span>
          </div>
        </div>

        {/* KPIs grid */}
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(kpi => {
            const value = period
              ? mode === 'ltm' ? getLTMValue(bank, kpi, period) : getValueForPeriod(bank, kpi, period)
              : getLatestValue(bank, kpi)
            const config = KPI_CONFIG[kpi]
            const isFlow = FLOW_KPIS.includes(kpi)
            return (
              <div key={kpi} className="bg-slate-800/60 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">
                  {config.shortLabel}
                  {mode === 'ltm' && isFlow && (
                    <span className="ml-1 text-amber-500/70 text-[10px]">L12M</span>
                  )}
                </p>
                <p className="text-base font-semibold text-white">
                  {formatValue(value, kpi)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </Link>
  )
}
