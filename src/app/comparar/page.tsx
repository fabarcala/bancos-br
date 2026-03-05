import { ALL_BANKS } from '@/lib/data'
import { MultiLineChart } from '@/components/BankChart'
import { KPIKey, KPI_CONFIG } from '@/lib/types'

const ALL_KPIS: KPIKey[] = [
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

export default function CompararPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Comparativo</h1>
      <p className="text-slate-400 mb-8">
        Evolução histórica de todos os indicadores — 5 bancos lado a lado.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ALL_KPIS.map(kpi => (
          <div key={kpi} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <MultiLineChart
              banks={ALL_BANKS}
              kpi={kpi}
              periods={24}
              height={300}
            />
          </div>
        ))}
      </div>

      {/* Nota */}
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
    </div>
  )
}
