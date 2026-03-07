'use client'

import { useState, useMemo } from 'react'

/* ─── Types ─────────────────────────────────────────────────────── */
interface Trimestre {
  dre: Record<string, number | null>
  indicadores: Record<string, number | null>
  carteira: Record<string, number | null>
  qualidade: Record<string, number | null>
  capital: Record<string, number | null>
}

interface BankData {
  banco: string
  ticker: string
  nota?: string
  trimestres: Record<string, Trimestre>
}

type Mode = 'trimestral' | 'ltm'
type RowFmt = 'milhoes' | 'bilhoes' | 'pct' | 'pct_pp'

interface Row {
  label: string
  key: string
  fmt: RowFmt
  indent?: number
  bold?: boolean
  note?: string
}

/* ─── Row definitions (common across banks) ─────────────────────── */
const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: 'DRE',
    rows: [
      { label: 'Receitas Totais',                                     key: 'dre.receitas_totais',                     fmt: 'milhoes', bold: true },
      { label: '  Margem Financeira',                                 key: 'dre.margem_financeira',                   fmt: 'milhoes', indent: 1 },
      { label: '    com Clientes',                                    key: 'dre.margem_financeira_clientes',          fmt: 'milhoes', indent: 2 },
      { label: '    com Mercado',                                     key: 'dre.margem_financeira_mercado',           fmt: 'milhoes', indent: 2 },
      { label: '  Receitas de Prestação de Serviços',                key: 'dre.receitas_prestacao_servicos',         fmt: 'milhoes', indent: 1 },
      { label: '  Resultado de Seguros, Prev. e Cap.',               key: 'dre.resultado_seguros_prev_cap',          fmt: 'milhoes', indent: 1, note: '¹' },
      { label: 'Custo do Crédito / PDD',                             key: 'dre.custo_credito',                       fmt: 'milhoes', bold: true },
      { label: '  Despesa de Perda Esperada / PDD',                 key: 'dre.despesa_perda_esperada',              fmt: 'milhoes', indent: 1 },
      { label: '  Descontos Concedidos',                             key: 'dre.descontos_concedidos',                fmt: 'milhoes', indent: 1 },
      { label: '  Recuperação de Créditos',                         key: 'dre.recuperacao_creditos_baixados',       fmt: 'milhoes', indent: 1 },
      { label: 'Outras Despesas Operacionais',                       key: 'dre.outras_despesas_operacionais',        fmt: 'milhoes', bold: true },
      { label: '  Desp. de Pessoal / DNDJ',                        key: 'dre.desp_nao_decorrentes_juros',          fmt: 'milhoes', indent: 1 },
      { label: '  Desp. Tributárias',                               key: 'dre.desp_tributarias_iss_pis_cofins',     fmt: 'milhoes', indent: 1 },
      { label: 'IR/CS',                                              key: 'dre.ir_cs',                               fmt: 'milhoes' },
      { label: 'Participações Minoritárias',                         key: 'dre.participacoes_minoritarias',          fmt: 'milhoes' },
      { label: 'Resultado Recorrente Gerencial',                     key: 'dre.resultado_recorrente_gerencial',      fmt: 'milhoes', bold: true },
    ],
  },
  {
    title: 'Indicadores de Performance',
    rows: [
      { label: 'ROAE (anualizado)',            key: 'indicadores.roae_consolidado_pct',  fmt: 'pct_pp' },
      { label: 'ROAA (anualizado)',            key: 'indicadores.roaa_pct',              fmt: 'pct_pp' },
      { label: 'Índice de Eficiência',         key: 'indicadores.indice_eficiencia_pct', fmt: 'pct_pp' },
      { label: 'NIM Clientes (a.a.)',          key: 'indicadores.nim_clientes_pct',      fmt: 'pct_pp' },
      { label: 'ETR (alíq. efetiva IR/CS)',   key: 'indicadores.etr_pct',               fmt: 'pct_pp' },
    ],
  },
  {
    title: 'Carteira de Crédito',
    rows: [
      { label: 'Total (R$ bilhões)',           key: 'carteira.total',  fmt: 'bilhoes', bold: true },
    ],
  },
  {
    title: 'Qualidade da Carteira de Crédito',
    rows: [
      { label: 'Inadimplência >90d *',                      key: 'qualidade.npl_90d_total_pct',               fmt: 'pct_pp' },
      { label: 'Custo do Crédito / Carteira (a.a.) **',    key: 'qualidade.custo_credito_sobre_carteira_pct', fmt: 'pct_pp' },
    ],
  },
  {
    title: 'Capital Regulatório (Basileia)',
    rows: [
      { label: 'Índice de Basileia (%)',              key: 'capital.basileia_pct',  fmt: 'pct_pp' },
      { label: 'Índice CET1 (%)',                     key: 'capital.cet1_pct',      fmt: 'pct_pp' },
    ],
  },
]

/* ─── Helpers ───────────────────────────────────────────────────── */
function getVal(t: Trimestre | null, key: string): number | null {
  if (!t) return null
  const [section, field] = key.split('.')
  const val = (t as unknown as Record<string, Record<string, number | null>>)[section]?.[field]
  return val ?? null
}

function fmtNum(val: number | null, fmt: RowFmt): string {
  if (val === null || val === undefined || isNaN(val as number)) return '—'
  if (fmt === 'pct' || fmt === 'pct_pp') return `${val.toFixed(1)}%`
  if (fmt === 'bilhoes') {
    const abs = Math.abs(val)
    const prefix = val < 0 ? '(' : ''
    const suffix = val < 0 ? ')' : ''
    return `${prefix}${abs.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${suffix}`
  }
  const abs = Math.abs(val)
  const prefix = val < 0 ? '(' : ''
  const suffix = val < 0 ? ')' : ''
  return `${prefix}${abs.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${suffix}`
}

function fmtDelta(a: number | null, b: number | null, fmt: RowFmt) {
  if (a === null || b === null || isNaN(a as number) || isNaN(b as number)) return { text: '—', positive: null as boolean | null }
  const delta = b - a
  if (fmt === 'pct_pp') return { text: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}pp`, positive: delta > 0 }
  if (a === 0) return { text: '—', positive: null as boolean | null }
  const pct = ((b - a) / Math.abs(a)) * 100
  return { text: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, positive: pct > 0 }
}

const EXPENSE_FIELDS = new Set([
  'custo_credito','despesa_perda_esperada','descontos_concedidos','outras_despesas_operacionais',
  'desp_nao_decorrentes_juros','desp_tributarias_iss_pis_cofins','despesas_sinistros',
  'ir_cs','participacoes_minoritarias','npl_90d_total_pct','custo_credito_sobre_carteira_pct',
  'indice_eficiencia_pct','etr_pct',
])

function deltaColor(d: { positive: boolean | null }, key: string) {
  if (d.positive === null) return 'text-gray-500'
  const field = key.split('.')[1]
  const good = EXPENSE_FIELDS.has(field) ? !d.positive : d.positive
  return good ? 'text-emerald-400' : 'text-red-400'
}

/* ─── LTM computation ───────────────────────────────────────────── */
function computeLTM(bank: BankData, endQuarter: string): Trimestre | null {
  const quarters = Object.keys(bank.trimestres)
  const endIdx = quarters.indexOf(endQuarter)
  if (endIdx < 3) return null
  const last4 = quarters.slice(endIdx - 3, endIdx + 1)

  const result: Trimestre = { dre: {}, indicadores: {}, carteira: {}, qualidade: {}, capital: {} }

  // DRE: sum
  const dreKeys = Object.keys(bank.trimestres[last4[0]]?.dre ?? {})
  dreKeys.forEach(k => {
    const vals = last4.map(q => bank.trimestres[q]?.dre[k])
    const hasNull = vals.some(v => v === null || v === undefined)
    result.dre[k] = hasNull ? null : vals.reduce((s, v) => (s ?? 0) + (v ?? 0), 0)
  })

  // Indicadores: average of non-null
  const indKeys = Object.keys(bank.trimestres[last4[0]]?.indicadores ?? {})
  indKeys.forEach(k => {
    const vals = last4.map(q => bank.trimestres[q]?.indicadores[k]).filter(v => v !== null && v !== undefined) as number[]
    result.indicadores[k] = vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : null
  })

  // Stock items (last value)
  const lastQ = bank.trimestres[last4[3]]
  result.carteira = { ...lastQ?.carteira }
  result.qualidade = { ...lastQ?.qualidade }
  result.capital = { ...lastQ?.capital }

  return result
}

/* ─── Component ─────────────────────────────────────────────────── */
interface Props { banks: BankData[] }

export default function BancosComparativo({ banks }: Props) {
  const allQuarters = useMemo(() => {
    const set = new Set<string>()
    banks.forEach(b => Object.keys(b.trimestres).forEach(q => set.add(q)))
    return Array.from(set).sort()
  }, [banks])

  const [mode, setMode] = useState<Mode>('trimestral')
  const [periodA, setPeriodA] = useState<string>(allQuarters[allQuarters.length - 2] ?? allQuarters[0])
  const [periodB, setPeriodB] = useState<string>(allQuarters[allQuarters.length - 1] ?? allQuarters[0])

  // For LTM: end quarter options = quarters where at least one bank has 4+ prior quarters
  const ltmOptions = allQuarters.filter((_, i) => i >= 3)

  const getT = (bank: BankData, period: string): Trimestre | null => {
    if (mode === 'trimestral') return bank.trimestres[period] ?? null
    return computeLTM(bank, period)
  }

  const periodLabel = (p: string) => mode === 'ltm' ? `LTM ${p}` : p

  return (
    <div className="space-y-3">
      {/* ── Controls ── */}
      <div className="flex flex-wrap gap-3 items-center bg-gray-800 rounded-xl p-4">
        {/* Toggle */}
        <div className="flex bg-gray-700 rounded-lg p-0.5">
          {(['trimestral', 'ltm'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === m ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {m === 'trimestral' ? 'Trimestral' : 'LTM'}
            </button>
          ))}
        </div>

        {/* Period selectors */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Período A:</span>
          <select
            value={periodA}
            onChange={e => setPeriodA(e.target.value)}
            className="bg-gray-700 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            {(mode === 'ltm' ? ltmOptions : allQuarters).map(q => (
              <option key={q} value={q}>{mode === 'ltm' ? `LTM ${q}` : q}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Período B:</span>
          <select
            value={periodB}
            onChange={e => setPeriodB(e.target.value)}
            className="bg-gray-700 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            {(mode === 'ltm' ? ltmOptions : allQuarters).map(q => (
              <option key={q} value={q}>{mode === 'ltm' ? `LTM ${q}` : q}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-gray-500 ml-auto">3 colunas por banco · scroll horizontal →</span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="text-sm border-collapse" style={{ minWidth: `${280 + banks.length * 310}px` }}>
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              {/* Sticky label col */}
              <th className="sticky left-0 z-20 bg-gray-800 text-left px-4 py-3 text-gray-400 font-medium"
                  style={{ minWidth: '260px', width: '260px' }}>
                Indicador
              </th>
              {/* Per bank: 3 cols */}
              {banks.map(bank => (
                <>
                  <th key={`${bank.ticker}-a`}
                      className="text-right px-3 py-3 text-gray-400 font-medium tabular-nums"
                      style={{ minWidth: '90px' }}>
                    <div className="text-xs text-gray-500">{bank.ticker}</div>
                    <div className="text-gray-200 text-xs">{periodLabel(periodA)}</div>
                  </th>
                  <th key={`${bank.ticker}-d`}
                      className="text-right px-2 py-3 text-gray-600 font-normal"
                      style={{ minWidth: '70px' }}>
                    <div className="text-xs">Δ%</div>
                  </th>
                  <th key={`${bank.ticker}-b`}
                      className="text-right px-3 py-3 text-blue-400 font-semibold"
                      style={{ minWidth: '90px', borderRight: '1px solid #374151' }}>
                    <div className="text-xs text-gray-500">{bank.ticker}</div>
                    <div className="text-xs">{periodLabel(periodB)}</div>
                  </th>
                </>
              ))}
            </tr>
            {/* Bank name row */}
            <tr className="bg-gray-850 border-b border-gray-700">
              <td className="sticky left-0 z-20 bg-[#111] px-4 py-1.5 text-xs text-gray-600">R$ milhões (exceto onde indicado)</td>
              {banks.map(bank => (
                <>
                  <td key={`${bank.ticker}-na`} colSpan={3}
                      className="text-center px-3 py-1.5 text-xs text-gray-500 font-medium"
                      style={{ borderRight: '1px solid #374151' }}>
                    {bank.banco}
                  </td>
                </>
              ))}
            </tr>
          </thead>
          <tbody>
            {SECTIONS.map((section) => (
              <>
                {/* Section header */}
                <tr key={`sec-${section.title}`} className="border-t-2 border-gray-600 bg-gray-900">
                  <td colSpan={1 + banks.length * 3}
                      className="sticky left-0 z-10 bg-gray-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                    {section.title}
                  </td>
                </tr>

                {section.rows.map((row, rowIdx) => {
                  const rowBg = rowIdx % 2 === 0 ? 'bg-gray-900' : 'bg-[#141414]'

                  return (
                    <tr key={row.key} className={`border-t border-gray-800 hover:bg-gray-800/50 transition-colors ${rowBg}`}>
                      {/* Label */}
                      <td className={`sticky left-0 z-10 ${rowBg} px-4 py-2.5 text-gray-300 ${row.bold ? 'font-semibold text-white' : ''}`}
                          style={{ paddingLeft: row.indent ? `${(row.indent * 14) + 16}px` : '16px' }}>
                        {row.label.trim()}{row.note ? <span className="text-gray-500 ml-0.5">{row.note}</span> : ''}
                      </td>

                      {/* Per bank */}
                      {banks.map(bank => {
                        const tA = getT(bank, periodA)
                        const tB = getT(bank, periodB)
                        const vA = getVal(tA, row.key)
                        const vB = getVal(tB, row.key)
                        const d = fmtDelta(vA, vB, row.fmt)

                        return (
                          <>
                            <td key={`${bank.ticker}-a`} className="text-right px-3 py-2.5 text-gray-400 tabular-nums text-xs">
                              {fmtNum(vA, row.fmt)}
                            </td>
                            <td key={`${bank.ticker}-d`} className={`text-right px-2 py-2.5 tabular-nums text-xs ${deltaColor(d, row.key)}`}>
                              {d.text}
                            </td>
                            <td key={`${bank.ticker}-b`} className="text-right px-3 py-2.5 text-blue-200 tabular-nums text-xs font-medium"
                                style={{ borderRight: '1px solid #374151' }}>
                              {fmtNum(vB, row.fmt)}
                            </td>
                          </>
                        )
                      })}
                    </tr>
                  )
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Notes ── */}
      <div className="text-xs text-gray-500 space-y-1 px-1 pt-1">
        <p>¹ Seguros: Bradesco e Santander incluem o resultado líquido de seguros na linha de Receitas Totais de forma distinta do Itaú. BV não segrega seguros.</p>
        <p>* NPL: Itaú inclui TVM a partir do 2T25. Metodologias variam entre bancos.</p>
        <p>** Custo do Crédito / Carteira: Itaú usa saldo médio. Outros bancos: dado não disponível (extraído dos earnings releases).</p>
        <p>— = dado não disponível nesta versão. BB: 4T24 pendente de release.</p>
        <p>Fonte: Earnings Releases 4T24–4T25 e séries históricas RI de cada banco.</p>
      </div>
    </div>
  )
}
