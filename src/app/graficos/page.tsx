import GraficoPanel from '@/components/GraficoPanel'

export const metadata = {
  title: 'Gráficos comparativos de bancos brasileiros | BancosBR',
  description: 'Compare ROAE, Basileia, NPL, NIM e outros indicadores dos principais bancos do Brasil em gráficos interativos por trimestre.',
}

export default function GraficosPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Gráficos Comparativos</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Selecione bancos e métricas em cada painel para comparar a evolução trimestral.
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
