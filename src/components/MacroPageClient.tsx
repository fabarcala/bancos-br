'use client'

import { useEffect, useState } from 'react'
import { MacroChartGrid } from './MacroChart'
import { fetchMacroDataClient, type MacroChartSeries } from '@/lib/macroFetch'
import FocusEvolucao from './FocusEvolucao'

function Skeleton({ height = 200 }: { height?: number }) {
  return <div className="animate-pulse bg-slate-800/60 rounded-xl w-full" style={{ height }} />
}

export default function MacroPageClient() {
  const [focusDate, setFocusDate] = useState<string | null>(null)
  const [focusRefDate, setFocusRefDate] = useState<string | null>(null)
  const [focusPubDate, setFocusPubDate] = useState<string | null>(null)
  const [chartSeries, setChartSeries] = useState<MacroChartSeries[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchMacroDataClient()
      .then(d => {
        setFocusDate(d.focusDate)
        setFocusRefDate(d.focusReferenceDate)
        setFocusPubDate(d.focusPublicationDate)
        setChartSeries(d.chartSeries)
      })
      .catch(() => setError(true))
  }, [])

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Boletim Focus — Projeções e Histórico Macroeconômico</h1>
        <p className="text-slate-400 text-lg mb-2">Mediana das expectativas de mercado · Banco Central do Brasil</p>

        {/* Badge + data */}
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/50 text-blue-300 text-xs font-medium px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
            Atualizado toda segunda-feira
          </span>
          {focusPubDate && focusRefDate && (
            <span className="text-slate-500 text-sm">
              Dados até: {focusRefDate} · Publicado em: {focusPubDate}
            </span>
          )}
        </div>

        {/* Bloco explicativo SEO */}
        <p className="text-slate-400 text-sm leading-relaxed max-w-4xl">
          O Boletim Focus é publicado pelo Banco Central do Brasil toda segunda-feira, consolidando as expectativas de mercado.
          O relatório reúne a mediana das projeções de analistas e economistas para os principais indicadores da economia brasileira:
          IPCA, taxa Selic, PIB, câmbio (R$/US$), IGP-M, dívida líquida do setor público e resultados primário e nominal —
          para o ano corrente e os três anos subsequentes. Os gráficos abaixo combinam o histórico realizado de cada indicador
          com as projeções mais recentes do Boletim Focus.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-sm">
          Não foi possível carregar os dados do Banco Central. Tente recarregar a página.
        </div>
      )}

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

      {/* Evolução semanal */}
      <FocusEvolucao />
    </div>
  )
}
