import { fetchMacroData } from '@/lib/macroData'
import { MacroFocusTable } from '@/components/MacroFocusTable'
import { MacroChartGrid } from '@/components/MacroChart'
import { TrendingUp } from 'lucide-react'

export const revalidate = 3600 // revalida a cada hora

export default async function MacroPage() {
  const { focusDate, focusRows, chartSeries } = await fetchMacroData()

  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Indicadores Macroeconômicos</h1>
        </div>
        <p className="text-slate-400 text-lg">
          Expectativas de mercado (Boletim Focus) e evolução histórica dos principais indicadores da economia brasileira.
        </p>
      </div>

      {/* Focus projections table */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-300 mb-4">Projeções do Mercado</h2>
        <MacroFocusTable focusDate={focusDate} rows={focusRows} />
      </section>

      {/* Historical charts + projections */}
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
        <MacroChartGrid series={chartSeries} />
      </section>
    </div>
  )
}
