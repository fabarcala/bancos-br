import { ALL_BANKS } from '@/lib/data'
import { MultiLineChart } from '@/components/BankChart'
import { HomeClient } from '@/components/HomeClient'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">
          Sistema Financeiro Brasileiro
        </h1>
        <p className="text-slate-400 text-lg">
          Resultados gerenciais e indicadores dos principais bancos listados na B3
        </p>
        <p className="text-slate-500 text-sm mt-1">
          Itaú · Bradesco · Banco do Brasil · BTG Pactual · Santander Brasil — dados até 4T25
        </p>
      </div>

      {/* Cards dos bancos — com seleção de período e modo */}
      <HomeClient />

      {/* Gráficos comparativos */}
      <section>
        <h2 className="text-lg font-semibold text-slate-300 mb-6">Evolução histórica comparativa</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ROE */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <MultiLineChart banks={ALL_BANKS} kpi="roe" periods={20} />
          </div>

          {/* Lucro */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <MultiLineChart banks={ALL_BANKS} kpi="lucro_liquido_recorrente" periods={20} />
          </div>

          {/* IE */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <MultiLineChart banks={ALL_BANKS} kpi="indice_eficiencia" periods={20} />
          </div>

          {/* Carteira */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <MultiLineChart banks={ALL_BANKS} kpi="carteira_credito" periods={20} />
          </div>
        </div>
      </section>
    </div>
  )
}
