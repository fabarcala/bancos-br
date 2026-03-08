'use client'

import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { MacroFocusTable } from './MacroFocusTable'
import { MacroChartGrid } from './MacroChart'
import { fetchMacroDataClient, type FocusRow, type MacroChartSeries } from '@/lib/macroFetch'

function Skeleton({ height = 200 }: { height?: number }) {
  return <div className="animate-pulse bg-slate-800/60 rounded-xl w-full" style={{ height }} />
}

export default function MacroPageClient() {
  const [focusDate, setFocusDate] = useState<string | null>(null)
  const [focusRows, setFocusRows] = useState<FocusRow[] | null>(null)
  const [chartSeries, setChartSeries] = useState<MacroChartSeries[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchMacroDataClient()
      .then(d => {
        setFocusDate(d.focusDate)
        setFocusRows(d.focusRows)
        setChartSeries(d.chartSeries)
      })
      .catch(() => setError(true))
  }, [])

  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Indicadores Macroeconômicos</h1>
        </div>
        <p className="text-slate-400 text-lg mb-1">
          Histórico e Projeções (Boletim Focus)
        </p>
        {focusDate && (
          <p className="text-slate-500 text-sm">
            Última publicação: {focusDate}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-sm">
          Não foi possível carregar os dados do Banco Central. Tente recarregar a página.
        </div>
      )}

      {/* Focus projections table */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-300 mb-4">Projeções do Mercado</h2>
        {!focusDate || !focusRows
          ? <Skeleton height={180} />
          : <MacroFocusTable focusDate={focusDate} rows={focusRows} />
        }
      </section>

      {/* Historical charts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-300">Histórico e Projeções</h2>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-0.5 bg-blue-400 rounded"></span>
              Realizado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-0.5 border-t-2 border-dashed border-amber-400"></span>
              Projeção Focus
            </span>
          </div>
        </div>
        {!chartSeries
          ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div>
          : <MacroChartGrid series={chartSeries} />
        }
      </section>
    </div>
  )
}
