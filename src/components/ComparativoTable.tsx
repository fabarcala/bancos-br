'use client'

import { useState, useEffect } from 'react'

// Periods
const LATEST  = '2025-Q4'
const PREV_Q  = '2025-Q3'
const PREV_Y  = '2024-Q4'

// LTM windows
const LTM_CURR = ['2025-Q4', '2025-Q3', '2025-Q2', '2025-Q1']
const LTM_PREV = ['2024-Q4', '2024-Q3', '2024-Q2', '2024-Q1']

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
  goodUp: boolean
  indent?: boolean
  isFlow?: boolean   // true = sum for LTM; false/undefined = point-in-time (use latest)
  computed?: (kpis: Record<string, KpiSeries>, period: string) => number | null
  computedLtm?: (kpis: Record<string, KpiSeries>, periods: string[]) => number | null
}

type Section = { title: string; rows: RowDef[] }

const SECTIONS: Section[] = [
  {
    title: 'RENTABILIDADE',
    rows: [
      { key: 'roe',  label: 'ROE',  type: 'ratio', goodUp: true  },
      { key: 'roaa', label: 'ROAA', type: 'ratio', goodUp: true  },
    ],
  },
  {
    title: 'PERFORMANCE',
    rows: [
      { key: 'nim',               label: 'NIM Clientes',         type: 'ratio', goodUp: true  },
      { key: 'indice_eficiencia', label: 'Índice de Eficiência', type: 'ratio', goodUp: false },
    ],
  },
  {
    title: 'QUALIDADE DA CARTEIRA',
    rows: [
      { key: 'inadimplencia_90d',   label: 'Inadimplência >90d',      type: 'ratio', goodUp: false },
      {
        key: 'custo_sobre_carteira',
        label: 'Custo Créd. / Carteira',
        type: 'ratio',
        goodUp: false,
        computed: (kpis, period) => {
          const cc   = kpis['custo_credito']?.[period]
          const cart = kpis['carteira_credito']?.[period]
          if (cc == null || cart == null || cart === 0) return null
          return Math.abs(cc) / cart
        },
        computedLtm: (kpis, periods) => {
          const cc   = periods.reduce((s, p) => s + (kpis['custo_credito']?.[p] ?? 0), 0)
          const cart = kpis['carteira_credito']?.[periods[0]] ?? null
          if (!cart || cart === 0) return null
          return Math.abs(cc) / cart
        },
      },
    ],
  },
  {
    title: 'CAPITAL',
    rows: [
      { key: 'basileia', label: 'Basileia (BIS)',           type: 'ratio', goodUp: true },
      { key: 'tier1',    label: 'Nível I',                  type: 'ratio', goodUp: true },
      { key: 'cet1',     label: 'Capital Principal (CET1)', type: 'ratio', goodUp: true },
    ],
  },
  {
    title: 'DRE (R$ Bi)',
    rows: [
      { key: 'receitas_totais',          label: 'Receitas Totais',       type: 'currency', goodUp: true,  isFlow: true },
      { key: 'margem_clientes',          label: '  MF Clientes',         type: 'currency', goodUp: true,  isFlow: true, indent: true },
      { key: 'margem_mercado',           label: '  MF Mercado',          type: 'currency', goodUp: true,  isFlow: true, indent: true },
      { key: 'receita_servicos',         label: '  Receita de Serviços', type: 'currency', goodUp: true,  isFlow: true, indent: true },
      { key: 'custo_credito',            label: 'Custo de Crédito',      type: 'currency', goodUp: false, isFlow: true },
      { key: 'despesas_pessoal',         label: '  Desp. Pessoal',       type: 'currency', goodUp: false, isFlow: true, indent: true },
      { key: 'despesas_admin',           label: '  Desp. Administrativas',type:'currency', goodUp: false, isFlow: true, indent: true },
      { key: 'lucro_liquido_recorrente', label: 'Lucro Líquido',         type: 'currency', goodUp: true,  isFlow: true },
    ],
  },
  {
    title: 'CARTEIRA DE CRÉDITO (R$ Bi)',
    rows: [
      { key: 'carteira_credito', label: 'Total',        type: 'currency', goodUp: true },
      { key: 'total_ativos',     label: 'Total Ativos', type: 'currency', goodUp: true },
    ],
  },
]

// Bank brand colors
const BANK_COLORS: Record<string, string> = {
  itau:      'bg-orange-900/20 border-orange-800/40',
  bradesco:  'bg-red-900/20 border-red-800/40',
  santander: 'bg-red-900/25 border-red-700/40',
  bb:        'bg-yellow-900/20 border-yellow-800/40',
  bv:        'bg-[#00395d]/30 border-[#00395d]/50',
  btg:       'bg-blue-900/20 border-blue-800/40',
}
const BANK_TEXT: Record<string, string> = {
  itau:      'text-orange-400',
  bradesco:  'text-red-300',
  santander: 'text-red-400',
  bb:        'text-yellow-400',
  bv:        'text-[#4fa3e0]',
  btg:       'text-blue-400',
}

// ─── helpers ────────────────────────────────────────────────────────────────

function getVal(kpis: Record<string, KpiSeries>, key: string, period: string): number | null {
  const v = kpis[key]?.[period]
  return v == null ? null : v
}

function getLtmVal(kpis: Record<string, KpiSeries>, key: string, periods: string[]): number | null {
  const vals = periods.map(p => kpis[key]?.[p])
  if (vals.every(v => v == null)) return null
  return vals.reduce((s, v) => (s ?? 0) + (v ?? 0), 0 as number)
}

function formatRatio(v: number | null): string {
  if (v == null) return '—'
  return (v * 100).toFixed(1) + '%'
}

function formatCurrency(v: number | null): string {
  if (v == null) return '—'
  const abs = Math.abs(v) / 1000   // R$ Milhões → Bi
  return (v < 0 ? '-' : '') + 'R$\u00A0' + abs.toFixed(1) + 'bi'
}

type DeltaResult = { text: string; color: string }

function calcDelta(
  current: number | null,
  previous: number | null,
  type: 'ratio' | 'currency',
  goodUp: boolean,
): DeltaResult {
  const neutral = { text: '—', color: 'text-slate-500' }
  if (current == null || previous == null || previous === 0) return neutral

  let delta: number
  let text: string

  if (type === 'ratio') {
    delta = (current - previous) * 100
    text = (delta >= 0 ? '+' : '') + delta.toFixed(1) + 'pp'
  } else {
    if (current < 0 || previous < 0) {
      // expense — compare magnitudes
      const d = ((current - previous) / Math.abs(previous)) * 100
      text = (d >= 0 ? '+' : '') + d.toFixed(1) + '%'
      // for negative values: more negative = more expense; less negative = less expense
      const isLessExpense = current > previous
      const isGood = goodUp ? !isLessExpense : isLessExpense
      const color = Math.abs(d) < 0.1 ? 'text-slate-500' : isGood ? 'text-emerald-400' : 'text-red-400'
      return { text, color }
    }
    delta = ((current - previous) / Math.abs(previous)) * 100
    text = (delta >= 0 ? '+' : '') + delta.toFixed(1) + '%'
  }

  const isUp = delta > 0.05
  const isDown = delta < -0.05
  const isGood = goodUp ? isUp : isDown
  const isBad  = goodUp ? isDown : isUp
  const color = isGood ? 'text-emerald-400' : isBad ? 'text-red-400' : 'text-slate-500'

  return { text, color }
}

// ─── component ──────────────────────────────────────────────────────────────

type Mode = 'trim' | 'ltm'

export default function ComparativoTable({ banks }: { banks: BankData[] }) {
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<Mode>('trim')
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-96 animate-pulse bg-slate-800/50 rounded-lg" />
  }

  const isLtm = mode === 'ltm'

  // Column headers
  const valLabel   = isLtm ? 'LTM 2025' : '4T25'
  const delta1Label = isLtm ? 'Δ LTM' : 'ΔTri'
  const delta2Label = isLtm ? '' : 'ΔYoY'
  const colCount   = isLtm ? 2 : 3

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center gap-1 mb-4 bg-slate-800/60 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode('trim')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'trim'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Trimestral
        </button>
        <button
          onClick={() => setMode('ltm')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'ltm'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          L12M
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="text-[11px] border-separate border-spacing-0 min-w-max">
          {/* ── HEADER ── */}
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-[#0f1117] border-b border-r border-slate-700 px-3 py-2 text-left min-w-[175px]" />
              {banks.map(bank => (
                <th
                  key={bank.ticker}
                  colSpan={colCount}
                  className={`text-center px-2 py-2 border-b border-r border-slate-700 ${BANK_COLORS[bank.ticker]}`}
                >
                  <div className={`font-bold text-xs ${BANK_TEXT[bank.ticker]}`}>{bank.name}</div>
                  <div className="text-slate-500 text-[10px]">{bank.stockTicker}</div>
                </th>
              ))}
            </tr>
            <tr className="bg-slate-900/60">
              <th className="sticky left-0 z-20 bg-slate-900 border-b border-r border-slate-700 px-3 py-1.5 text-left text-slate-400 font-medium">
                Indicador
              </th>
              {banks.map(bank => (
                <>
                  <th key={`${bank.ticker}-val`}  className="px-2 py-1.5 border-b border-slate-700 text-center text-slate-400 font-normal min-w-[76px]">
                    {valLabel}
                  </th>
                  <th key={`${bank.ticker}-d1`}   className={`px-2 py-1.5 border-b border-slate-700 text-center text-slate-500 font-normal min-w-[54px]`}>
                    {delta1Label}
                  </th>
                  {!isLtm && (
                    <th key={`${bank.ticker}-d2`} className="px-2 py-1.5 border-b border-r border-slate-700 text-center text-slate-500 font-normal min-w-[54px]">
                      {delta2Label}
                    </th>
                  )}
                  {isLtm && (
                    <th key={`${bank.ticker}-d2ltm`} className="px-0 py-0 border-b border-r border-slate-700 min-w-0 w-0" />
                  )}
                </>
              ))}
            </tr>
          </thead>

          <tbody>
            {SECTIONS.map((section, si) => (
              <>
                <tr key={`s-${si}`} className="bg-slate-800/70">
                  <td
                    colSpan={1 + banks.length * colCount}
                    className="sticky left-0 px-3 py-1.5 font-semibold text-slate-300 text-[10px] tracking-wider border-b border-slate-700"
                  >
                    {section.title}
                  </td>
                </tr>

                {section.rows.map((row, ri) => (
                  <tr key={`${si}-${ri}`} className={ri % 2 === 0 ? 'bg-[#0f1117]' : 'bg-slate-900/25'}>
                    <td className={`sticky left-0 z-10 bg-inherit border-r border-slate-800 px-3 py-1.5 text-slate-300 whitespace-nowrap ${row.indent ? 'pl-6 text-slate-400' : ''}`}>
                      {row.label}
                    </td>

                    {banks.map(bank => {
                      const { kpis } = bank

                      // Determine current value
                      let curr: number | null
                      let prev1: number | null  // trim: 3T25 / ltm: prev LTM
                      let prev2: number | null  // trim: 4T24 / ltm: N/A

                      if (isLtm && row.isFlow) {
                        // Flow metric — sum 4 quarters
                        if (row.computedLtm) {
                          curr  = row.computedLtm(kpis, LTM_CURR)
                          prev1 = row.computedLtm(kpis, LTM_PREV)
                        } else {
                          curr  = getLtmVal(kpis, row.key, LTM_CURR)
                          prev1 = getLtmVal(kpis, row.key, LTM_PREV)
                        }
                        prev2 = null
                      } else {
                        // Point-in-time or Trimestral mode
                        if (row.computed) {
                          curr  = row.computed(kpis, LATEST)
                          prev1 = row.computed(kpis, isLtm ? LATEST : PREV_Q)
                          prev2 = isLtm ? null : row.computed(kpis, PREV_Y)
                        } else {
                          curr  = getVal(kpis, row.key, LATEST)
                          prev1 = getVal(kpis, row.key, isLtm ? LATEST : PREV_Q)
                          prev2 = isLtm ? null : getVal(kpis, row.key, PREV_Y)
                        }
                        if (isLtm) prev1 = null  // no delta for ratio in LTM
                      }

                      const fmt    = row.type === 'ratio' ? formatRatio : formatCurrency
                      const delta1 = calcDelta(curr, prev1, row.type, row.goodUp)
                      const delta2 = isLtm ? null : calcDelta(curr, prev2, row.type, row.goodUp)

                      return (
                        <>
                          <td key={`${bank.ticker}-v`}  className="px-2 py-1.5 text-center text-slate-200 font-medium tabular-nums">
                            {fmt(curr)}
                          </td>
                          <td key={`${bank.ticker}-d1`} className={`px-2 py-1.5 text-center tabular-nums ${isLtm && !row.isFlow ? 'border-r border-slate-800 text-slate-500' : delta1.color}`}>
                            {isLtm && !row.isFlow ? '—' : delta1.text}
                          </td>
                          {!isLtm && delta2 && (
                            <td key={`${bank.ticker}-d2`} className={`px-2 py-1.5 text-center tabular-nums border-r border-slate-800 ${delta2.color}`}>
                              {delta2.text}
                            </td>
                          )}
                          {isLtm && (
                            <td key={`${bank.ticker}-empty`} className="border-r border-slate-800 w-0 p-0" />
                          )}
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
    </div>
  )
}
