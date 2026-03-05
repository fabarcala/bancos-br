import { ALL_BANKS } from '@/lib/data'
import { MultiLineChart } from '@/components/BankChart'
import { HomeClient } from '@/components/HomeClient'
import { KPIKey } from '@/lib/types'

const CHART_KPIS: KPIKey[] = [
  'lucro_liquido_recorrente',
  'roe',
  'indice_eficiencia',
  'margem_financeira',
  'carteira_credito',
  'inadimplencia_90d',
  'basileia',
  'total_ativos',
  'pl',
]

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
      <section>
        <h2 className="text-lg font-semibold text-slate-300 mb-6">Evolução histórica comparativa</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {CHART_KPIS.map(kpi => (
            <div key={kpi} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
              <MultiLineChart banks={ALL_BANKS} kpi={kpi} periods={24} height={280} />
            </div>
          ))}
        </div>

        <div className="mt-8 bg-slate-900 border border-slate-700/50 rounded-xl p-5 text-sm text-slate-400">
          <p className="font-medium text-slate-300 mb-2">📋 Notas metodológicas</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Todos os valores monetários em R$ bilhões (exceto BTG que publica em R$ milhões — convertido).</li>
            <li>Lucro: recorrente/gerencial — exclui itens não recorrentes quando disponível.</li>
            <li>ROE e Índice de Eficiência: anualizado, conforme divulgado pelo banco.</li>
            <li>Cobertura histórica varia por banco e por indicador.</li>
            <li>Fonte: planilhas de séries históricas publicadas pelos bancos nos seus sites de RI (4T25).</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
