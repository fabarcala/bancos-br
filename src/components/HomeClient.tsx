'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ALL_BANKS } from '@/lib/data'
import { BankSummaryCard } from '@/components/KPICard'
import { getAllRawPeriods, formatPeriod, KPIMode } from '@/lib/data'
import { KPIKey } from '@/lib/types'

const kpisHome: KPIKey[] = ['lucro_liquido_recorrente', 'roe', 'indice_eficiencia', 'carteira_credito']

const ALL_PERIODS = getAllRawPeriods(ALL_BANKS) // e.g. ["2025-Q4", "2025-Q3", ...]

export function HomeClient() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(ALL_PERIODS[0])
  const [mode, setMode] = useState<KPIMode>('quarterly')

  const displayPeriod = formatPeriod(selectedPeriod)
  const sectionLabel =
    mode === 'ltm'
      ? `Últimos 12 meses (L12M) — encerrado em ${displayPeriod}`
      : `Resultado trimestral — ${displayPeriod}`

  return (
    <section className="mb-12">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="text-lg font-semibold text-slate-300 flex-1 min-w-0">{sectionLabel}</h2>

        <div className="flex items-center gap-2">
          {/* Period dropdown */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg pl-3 pr-8 py-2 cursor-pointer hover:border-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {ALL_PERIODS.map(p => (
                <option key={p} value={p}>
                  {formatPeriod(p)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Quarterly / LTM toggle */}
          <div className="flex items-center bg-slate-800 border border-slate-600 rounded-lg p-1 gap-1">
            <button
              onClick={() => setMode('quarterly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                mode === 'quarterly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trimestral
            </button>
            <button
              onClick={() => setMode('ltm')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                mode === 'ltm'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              L12M
            </button>
          </div>
        </div>
      </div>

      {/* Bank cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {ALL_BANKS.map(bank => (
          <BankSummaryCard
            key={bank.ticker}
            bank={bank}
            kpis={kpisHome}
            period={selectedPeriod}
            mode={mode}
          />
        ))}
      </div>

      {mode === 'ltm' && (
        <p className="mt-3 text-xs text-slate-500">
          L12M: Lucro soma os 4 trimestres encerrados em {displayPeriod}. ROE, Eficiência e Carteira referem-se ao período selecionado.
        </p>
      )}
    </section>
  )
}
