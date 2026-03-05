import { HomeClient } from '@/components/HomeClient'
import { ChartSection } from '@/components/ChartSection'

export default function BancosPage() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Bancos</h1>
        <p className="text-slate-400 text-lg">
          Resultados gerenciais e indicadores dos principais bancos listados na B3
        </p>
        <p className="text-slate-500 text-sm mt-1">
          Itaú · Bradesco · Banco do Brasil · BTG Pactual · Santander Brasil — dados até 4T25
        </p>
      </div>

      {/* Cards com seleção de período e modo L12M */}
      <HomeClient />

      {/* Gráficos históricos comparativos */}
      <ChartSection />
    </div>
  )
}
