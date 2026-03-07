'use client'

import { useState, useEffect } from 'react'

const LATEST = '2025-Q4'
const PREV_Q  = '2025-Q3'
const PREV_Y  = '2024-Q4'

type KpiSeries = Record<string, number>
type BankData = {
  ticker: string
  name: string
  stockTicker: string
  kpis: Record<string, KpiSeries>
}

type RowDef = {
  key: string
  label: string
  type: 'ratio' | 'currency'
  goodUp: boolean        // true = higher is better
  indent?: boolean
  computed?: (kpis: Record<string, KpiSeries>, period: string) => number | null
}

type Section = {
  title: string
  rows: RowDef[]
}

const SECTIONS: Section[] = [
  {
    title: 'RENTABILIDADE',
    rows: [
      { key: 'roe',  label: 'ROE',   type: 'ratio', goodUp: true },
      { key: 'roaa', label: 'ROAA',  type: 'ratio', goodUp: true },
    ],
  },
  {
    title: 'PERFORMANCE',
    rows: [
      { key: 'nim',              label: 'NIM Clientes',           type: 'ratio', goodUp: true  },
      { key: 'indice_eficiencia',label: 'Índice de Eficiência',   type: 'ratio', goodUp: false },
    ],
  },
  {
    title: 'QUALIDADE DA CARTEIRA',
    rows: [
      { key: 'inadimplencia_90d', label: 'Inadimplência >90d',         type: 'ratio',    goodUp: false },
      {
        key: 'custo_sobre_carteira',
        label: 'Custo Créd. / Carteira',
        type: 'ratio',
        goodUp: false,
        computed: (kpis, period) => {
          const cc = kpis['custo_credito']?.[period]
          const cart = kpis['carteira_credito']?.[period]
          if (cc == null || cart == null || cart === 0) return null
          return Math.abs(cc) / cart
        },
      },
    ],
  },
  {
    title: 'CAPITAL',
    rows: [
      { key: 'basileia', label: 'Basileia (BIS)', type: 'ratio', goodUp: true },
      { key: 'tier1',    label: 'Nível I',         type: 'ratio', goodUp: true },
      { key: 'cet1',     label: 'Capital Principal (CET1)', type: 'ratio', goodUp: true },
    ],
  },
  {
    title: 'DRE TRIMESTRAL (R$ Bi)',
    rows: [
      { key: 'receitas_totais',         label: 'Receitas Totais',        type: 'currency', goodUp: true  },
      { key: 'margem_clientes',         label: '  MF Clientes',          type: 'currency', goodUp: true, indent: true  },
      { key: 'margem_mercado',          label: '  MF Mercado',           type: 'currency', goodUp: true, indent: true  },
      { key: 'receita_servicos',        label: '  Receita de Serviços',  type: 'currency', goodUp: true, indent: true  },
      { key: 'custo_credito',           label: 'Custo de Crédito',       type: 'currency', goodUp: false },
      { key: 'despesas_pessoal',        label: '  Desp. Pessoal',        type: 'currency', goodUp: false, indent: true },
      { key: 'despesas_admin',          label: '  Desp. Administrativas',type: 'currency', goodUp: false, indent: true },
      { key: 'lucro_liquido_recorrente',label: 'Lucro Líquido',          type: 'currency', goodUp: true  },
    ],
  },
  {
    title: 'CARTEIRA DE CRÉDITO (R$ Bi)',
    rows: [
      { key: 'carteira_credito', label: 'Total',       type: 'currency', goodUp: true },
      { key: 'total_ativos',     label: 'Total Ativos',type: 'currency', goodUp: true },
    ],
  },
]

// Bank brand colors
const BANK_COLORS: Record<string, string> = {
  bv:        'bg-[#00395d]/30 border-[#00395d]/50',
  santander: 'bg-red-900/20 border-red-800/40',
  bradesco:  'bg-red-900/20 border-red-800/40',
  itau:      'bg-orange-900/20 border-orange-800/40',
  bb:        'bg-yellow-900/20 border-yellow-800/40',
  btg:       'bg-blue-900/20 border-blue-800/40',
}

const BANK_TEXT: Record<string, string> = {
  bv:        'text-[#4fa3e0]',
  santander: 'text-red-400',
  bradesco:  'text-red-300',
  itau:      'text-orange-400',
  bb:        'text-yellow-400',
  btg:       'text-blue-400',
}

function getVal(kpis: Record<string, KpiSeries>, key: string, period: string): number | null {
  const v = kpis[key]?.[period]
  return v == null ? null : v
}

function formatRatio(v: number | null): string {
  if (v == null) return '—'
  return (v * 100).toFixed(1) + '%'
}

function formatCurrency(v: number | null): string {
  if (v == null) return '—'
  const abs = Math.abs(v)
  // values in R$ Milhões → show in Bi
  const bi = abs / 1000
  return (v < 0 ? '-' : '') + 'R$\u00A0' + bi.toFixed(1) + 'bi'
}

type DeltaResult = { text: string; color: string } 

function calcDelta(
  current: number | null,
  previous: number | null,
  type: 'ratio' | 'currency',
  goodUp: boolean
): DeltaResult {
  const neutral = { text: '—', color: 'text-slate-500' }
  if (current == null || previous == null || previous === 0) return neutral

  let delta: number
  let text: string

  if (type === 'ratio') {
    delta = (current - previous) * 100  // pp difference
    text = (delta >= 0 ? '+' : '') + delta.toFixed(1) + 'pp'
  } else {
    // For currency: treat absolute values (expenses are stored negative)
    // Delta = % change in absolute terms
    delta = ((Math.abs(current) - Math.abs(previous)) / Math.abs(previous)) * 100
    // But direction of "good" for expenses = smaller absolute
    if (current < 0) {
      // expense: larger negative = more expense = maybe bad
      const actualDelta = ((current - previous) / Math.abs(previous)) * 100
      text = (actualDelta >= 0 ? '+' : '') + actualDelta.toFixed(1) + '%'
      const isGood = current > previous // less expense = closer to 0 = good
      const color = isGood ? (goodUp ? 'text-emerald-400' : 'text-red-400') : (goodUp ? 'text-red-400' : 'text-emerald-400')
      return { text, color }
    }
    const actualDelta = ((current - previous) / Math.abs(previous)) * 100
    text = (actualDelta >= 0 ? '+' : '') + actualDelta.toFixed(1) + '%'
    delta = actualDelta
  }

  const isUp = delta > 0
  const isGood = goodUp ? isUp : !isUp
  const color = Math.abs(type === 'ratio' ? delta : delta) < 0.1
    ? 'text-slate-500'
    : isGood ? 'text-emerald-400' : 'text-red-400'

  return { text, color }
}

export default function ComparativoTable({ banks }: { banks: BankData[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-96 animate-pulse bg-slate-800/50 rounded-lg" />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="text-[11px] border-separate border-spacing-0 min-w-max">
        {/* ── HEADER ── */}
        <thead>
          {/* Bank names */}
          <tr>
            <th className="sticky left-0 z-20 bg-[#0f1117] border-b border-r border-slate-700 px-3 py-2 text-left min-w-[160px]" />
            {banks.map(bank => (
              <th
                key={bank.ticker}
                colSpan={3}
                className={`text-center px-2 py-2 border-b border-r border-slate-700 ${BANK_COLORS[bank.ticker]}`}
              >
                <div className={`font-bold text-xs ${BANK_TEXT[bank.ticker]}`}>{bank.name}</div>
                <div className="text-slate-500 text-[10px]">{bank.stockTicker}</div>
              </th>
            ))}
          </tr>
          {/* Sub-column labels */}
          <tr className="bg-slate-900/60">
            <th className="sticky left-0 z-20 bg-slate-900 border-b border-r border-slate-700 px-3 py-1.5 text-left text-slate-400 font-medium">
              Indicador
            </th>
            {banks.map(bank => (
              <>
                <th key={`${bank.ticker}-val`}   className="px-2 py-1.5 border-b border-slate-700 text-center text-slate-400 font-normal min-w-[72px]">4T25</th>
                <th key={`${bank.ticker}-qtri`}  className="px-2 py-1.5 border-b border-slate-700 text-center text-slate-500 font-normal min-w-[56px]">ΔTri</th>
                <th key={`${bank.ticker}-qyoy`}  className="px-2 py-1.5 border-b border-r border-slate-700 text-center text-slate-500 font-normal min-w-[56px]">ΔYoY</th>
              </>
            ))}
          </tr>
        </thead>

        <tbody>
          {SECTIONS.map((section, si) => (
            <>
              {/* Section header */}
              <tr key={`section-${si}`} className="bg-slate-800/70">
                <td
                  colSpan={1 + banks.length * 3}
                  className="sticky left-0 px-3 py-1.5 font-semibold text-slate-300 text-[10px] tracking-wider border-b border-slate-700"
                >
                  {section.title}
                </td>
              </tr>

              {/* Data rows */}
              {section.rows.map((row, ri) => (
                <tr
                  key={`${si}-${ri}`}
                  className={ri % 2 === 0 ? 'bg-[#0f1117]' : 'bg-slate-900/25'}
                >
                  {/* Label */}
                  <td className={`sticky left-0 z-10 bg-inherit border-r border-slate-800 px-3 py-1.5 text-slate-300 whitespace-nowrap ${row.indent ? 'pl-5 text-slate-400' : ''}`}>
                    {row.label}
                  </td>

                  {/* Per-bank cells */}
                  {banks.map(bank => {
                    const getComputed = (period: string) =>
                      row.computed ? row.computed(bank.kpis, period) : getVal(bank.kpis, row.key, period)

                    const curr  = getComputed(LATEST)
                    const prevQ = getComputed(PREV_Q)
                    const prevY = getComputed(PREV_Y)

                    const fmt = row.type === 'ratio' ? formatRatio : formatCurrency
                    const deltaQ = calcDelta(curr, prevQ, row.type, row.goodUp)
                    const deltaY = calcDelta(curr, prevY, row.type, row.goodUp)

                    return (
                      <>
                        <td key={`${bank.ticker}-v`}  className="px-2 py-1.5 text-center text-slate-200 font-medium tabular-nums">
                          {fmt(curr)}
                        </td>
                        <td key={`${bank.ticker}-tq`} className={`px-2 py-1.5 text-center tabular-nums ${deltaQ.color}`}>
                          {deltaQ.text}
                        </td>
                        <td key={`${bank.ticker}-ty`} className={`px-2 py-1.5 text-center tabular-nums border-r border-slate-800 ${deltaY.color}`}>
                          {deltaY.text}
                        </td>
                      </>
                    )
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
