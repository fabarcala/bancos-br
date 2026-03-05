import { ALL_BANKS } from '@/lib/data'
import { BankSummaryCard } from '@/components/KPICard'
import { KPIKey } from '@/lib/types'

export default function BancosPage() {
  const kpisCard: KPIKey[] = ['lucro_liquido_recorrente', 'roe', 'indice_eficiencia', 'basileia']

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Bancos</h1>
      <p className="text-slate-400 mb-8">Clique em um banco para ver o histórico completo de indicadores.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ALL_BANKS.map(bank => (
          <BankSummaryCard key={bank.ticker} bank={bank} kpis={kpisCard} />
        ))}
      </div>
    </div>
  )
}
