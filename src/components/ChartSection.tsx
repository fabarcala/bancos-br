'use client'

import { useState } from 'react'
import { ALL_BANKS } from '@/lib/data'
import { MultiLineChart } from '@/components/BankChart'
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

const PERIOD_OPTIONS = [
  { label: '8T',   value: 8,   desc: '2 anos' },
  { label: '16T',  value: 16,  desc: '4 anos' },
  { label: 'Todos', value: 999, desc: 'histórico completo' },
]

export function ChartSection() {
  const [periods, setPeriods] = useState(8)

  return (
    <section>
      {/* Header com seletor de janela */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-300">Evolução histórica comparativa</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {periods === 999
              ? 'Cobertura varia por banco e indicador'
              : `Últimos ${periods} trimestres — cobertura completa para todos os bancos`}
          </p>
        </div>
        <div className="flex items-center bg-slate-800 border border-slate-600 rounded-lg p-1 gap-1">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriods(opt.value)}
              title={opt.desc}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                periods === opt.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CHART_KPIS.map(kpi => (
          <div key={kpi} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
            <MultiLineChart banks={ALL_BANKS} kpi={kpi} periods={periods} height={280} />
          </div>
        ))}
      </div>

      {/* Notas */}
      <div className="mt-8 bg-slate-900 border border-slate-700/50 rounded-xl p-5 text-sm text-slate-400">
        <p className="font-medium text-slate-300 mb-2">📋 Notas metodológicas</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Todos os valores monetários em R$ bilhões (exceto BTG que publica em R$ milhões — convertido).</li>
          <li>Lucro: recorrente/gerencial — exclui itens não recorrentes quando disponível.</li>
          <li>ROE e Índice de Eficiência: anualizado, conforme divulgado pelo banco.</li>
          <li>Cobertura histórica varia por banco e por indicador — dados ausentes aparecem como lacunas.</li>
          <li>Fonte: planilhas de séries históricas publicadas pelos bancos nos seus sites de RI (4T25).</li>
        </ul>
      </div>
    </section>
  )
}
