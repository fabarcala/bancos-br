import type { Metadata } from 'next'
import GraficoPanel from '@/components/GraficoPanel'

export const metadata: Metadata = {
  title: 'Gráficos Comparativos de Bancos — ROAE, Basileia, NIM, Inadimplência',
  description: 'Compare ROAE, Basileia, NIM, inadimplência e outras métricas financeiras de Itaú, Bradesco, Santander e BV por trimestre. Dados dos earnings releases.',
}

export default function GraficosPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Gráficos Comparativos — Métricas Financeiras dos Bancos</h1>
        <p className="text-slate-400 text-lg mb-2">Evolução trimestral por banco e métrica · Earnings releases</p>

        {/* Badge */}
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Dados até 4T25
          </span>
        </div>

        {/* Bloco de texto indexável */}
        <p className="text-slate-400 text-sm leading-relaxed max-w-4xl">
          Compare a evolução trimestral dos principais indicadores financeiros dos maiores bancos brasileiros —
          Itaú, Bradesco, Santander e BV. Selecione a métrica e os bancos desejados em cada painel.
          Dados extraídos dos earnings releases oficiais.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GraficoPanel
          defaultBanks={['itau', 'bradesco', 'santander']}
          defaultMetricKey="indicadores.roae_consolidado_pct"
        />
        <GraficoPanel
          defaultBanks={['itau', 'bradesco', 'santander']}
          defaultMetricKey="capital.basileia_pct"
        />
      </div>
    </div>
  )
}
