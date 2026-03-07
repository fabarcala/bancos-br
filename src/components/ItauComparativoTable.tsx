'use client'

import { useState, useMemo } from 'react'

/* ─── Types ──────────────────────────────────────────────────────────── */
interface Trimestre {
  dre: Record<string, number>
  indicadores: Record<string, number>
  carteira: Record<string, number>
  qualidade: Record<string, number>
  capital: Record<string, number>
}
interface ItauData {
  banco: string
  ticker: string
  unidade_dre: string
  unidade_carteira: string
  nota_npl: string
  trimestres: Record<string, Trimestre>
}

/* ─── Row definitions ────────────────────────────────────────────────── */
type RowFmt = 'milhoes' | 'bilhoes' | 'pct' | 'pct_pp'

interface Row {
  label: string
  key: string        // section.field
  fmt: RowFmt
  indent?: number    // 0=header,1=sub,2=sub-sub
  bold?: boolean
}

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: 'DRE',
    rows: [
      { label: 'Receitas Totais',                                          key: 'dre.receitas_totais',                      fmt: 'milhoes', bold: true },
      { label: '  Margem Financeira',                                      key: 'dre.margem_financeira',                    fmt: 'milhoes', indent: 1 },
      { label: '    com Clientes',                                         key: 'dre.margem_financeira_clientes',           fmt: 'milhoes', indent: 2 },
      { label: '    com Mercado',                                          key: 'dre.margem_financeira_mercado',            fmt: 'milhoes', indent: 2 },
      { label: '  Receitas de Prestação de Serviços',                     key: 'dre.receitas_prestacao_servicos',          fmt: 'milhoes', indent: 1 },
      { label: '  Resultado de Operações de Seguros, Prev. e Cap.',       key: 'dre.resultado_seguros_prev_cap',           fmt: 'milhoes', indent: 1 },
      { label: 'Custo do Crédito',                                         key: 'dre.custo_credito',                        fmt: 'milhoes', bold: true },
      { label: '  Despesa de Perda Esperada',                             key: 'dre.despesa_perda_esperada',               fmt: 'milhoes', indent: 1 },
      { label: '  Descontos Concedidos',                                  key: 'dre.descontos_concedidos',                 fmt: 'milhoes', indent: 1 },
      { label: '  Recuperação de Créditos Baixados',                      key: 'dre.recuperacao_creditos_baixados',        fmt: 'milhoes', indent: 1 },
      { label: 'Despesas com Sinistros',                                   key: 'dre.despesas_sinistros',                   fmt: 'milhoes' },
      { label: 'Outras Despesas Operacionais',                             key: 'dre.outras_despesas_operacionais',         fmt: 'milhoes', bold: true },
      { label: '  Desp. não Decorrentes de Juros',                       key: 'dre.desp_nao_decorrentes_juros',           fmt: 'milhoes', indent: 1 },
      { label: '  Desp. Tributárias ISS/PIS/Cofins',                     key: 'dre.desp_tributarias_iss_pis_cofins',      fmt: 'milhoes', indent: 1 },
      { label: '  Desp. de Comercialização de Seguros',                  key: 'dre.desp_comercializacao_seguros',         fmt: 'milhoes', indent: 1 },
      { label: 'Resultado antes da Tributação',                           key: 'dre.resultado_antes_tributacao',           fmt: 'milhoes', bold: true },
      { label: '  IR/CS',                                                  key: 'dre.ir_cs',                                fmt: 'milhoes', indent: 1 },
      { label: '  Participações Minoritárias',                            key: 'dre.participacoes_minoritarias',           fmt: 'milhoes', indent: 1 },
      { label: 'Resultado Recorrente Gerencial',                          key: 'dre.resultado_recorrente_gerencial',       fmt: 'milhoes', bold: true },
    ],
  },
  {
    title: 'Indicadores de Performance',
    rows: [
      { label: 'ROAE (anualizado)',             key: 'indicadores.roae_consolidado_pct',  fmt: 'pct_pp' },
      { label: 'ROAA (anualizado)',             key: 'indicadores.roaa_pct',              fmt: 'pct_pp' },
      { label: 'Índice de Eficiência',          key: 'indicadores.indice_eficiencia_pct', fmt: 'pct_pp' },
      { label: 'NIM Clientes (a.a.)',           key: 'indicadores.nim_clientes_pct',      fmt: 'pct_pp' },
      { label: 'ETR (alíquota efetiva IR/CS)',  key: 'indicadores.etr_pct',               fmt: 'pct_pp' },
    ],
  },
  {
    title: 'Carteira de Crédito',
    rows: [
      { label: 'Total (c/ garantias e TVM)',    key: 'carteira.total',             fmt: 'bilhoes', bold: true },
      { label: '  Pessoas Físicas',             key: 'carteira.pessoas_fisicas',   fmt: 'bilhoes', indent: 1 },
      { label: '    Cartão de Crédito',         key: 'carteira.cartao_credito',    fmt: 'bilhoes', indent: 2 },
      { label: '    Crédito Pessoal',           key: 'carteira.credito_pessoal',   fmt: 'bilhoes', indent: 2 },
      { label: '    Consignado',                key: 'carteira.consignado',        fmt: 'bilhoes', indent: 2 },
      { label: '    Veículos',                  key: 'carteira.veiculos',          fmt: 'bilhoes', indent: 2 },
      { label: '    Imobiliário',               key: 'carteira.imobiliario',       fmt: 'bilhoes', indent: 2 },
      { label: '  MPMEs',                       key: 'carteira.mpmes',             fmt: 'bilhoes', indent: 1 },
      { label: '  Grandes Empresas',            key: 'carteira.grandes_empresas',  fmt: 'bilhoes', indent: 1 },
      { label: '  América Latina',              key: 'carteira.america_latina',    fmt: 'bilhoes', indent: 1 },
    ],
  },
  {
    title: 'Qualidade da Carteira de Crédito',
    rows: [
      { label: 'Inadimplência >90d (Total) *',            key: 'qualidade.npl_90d_total_pct',               fmt: 'pct_pp' },
      { label: 'Custo do Crédito / Carteira (a.a.) **',  key: 'qualidade.custo_credito_sobre_carteira_pct', fmt: 'pct_pp' },
    ],
  },
  {
    title: 'Capital Regulatório (Basileia)',
    rows: [
      { label: 'Patrimônio de Referência (Nível I + II)',  key: 'capital.patrimonio_referencia',  fmt: 'milhoes', bold: true },
      { label: '  Capital Principal (CET1)',               key: 'capital.cet1',                   fmt: 'milhoes', indent: 1 },
      { label: '  Capital Complementar (AT1)',             key: 'capital.at1',                    fmt: 'milhoes', indent: 1 },
      { label: '  Capital Nível II (T2)',                  key: 'capital.capital_nivel_ii',        fmt: 'milhoes', indent: 1 },
      { label: 'RWA (Exp. Total Pond. pelo Risco)',        key: 'capital.rwa_total',              fmt: 'milhoes' },
      { label: '  Risco de Crédito',                      key: 'capital.rwa_credito',            fmt: 'milhoes', indent: 1 },
      { label: '  Risco Operacional',                     key: 'capital.rwa_operacional',        fmt: 'milhoes', indent: 1 },
      { label: '  Risco de Mercado',                      key: 'capital.rwa_mercado',            fmt: 'milhoes', indent: 1 },
      { label: 'Índice de Basileia (PR/RWA)',             key: 'capital.basileia_pct',           fmt: 'pct_pp' },
      { label: 'Índice de Capital Nível I',               key: 'capital.nivel_i_pct',            fmt: 'pct_pp' },
      { label: 'Índice de Capital Principal (CET1/RWA)',  key: 'capital.cet1_pct',               fmt: 'pct_pp' },
    ],
  },
]

/* ─── Helpers ────────────────────────────────────────────────────────── */
function getVal(t: Trimestre, key: string): number {
  const [section, field] = key.split('.')
  const sec = (t as unknown as Record<string, Record<string, number>>)[section]
  return sec?.[field] ?? NaN
}

function fmtNum(val: number, fmt: RowFmt): string {
  if (isNaN(val)) return '—'
  if (fmt === 'pct' || fmt === 'pct_pp') return `${val.toFixed(1)}%`
  const abs = Math.abs(val)
  const prefix = val < 0 ? '(' : ''
  const suffix = val < 0 ? ')' : ''
  const formatted = abs.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  return `${prefix}${formatted}${suffix}`
}

function fmtDelta(a: number, b: number, fmt: RowFmt): { text: string; positive: boolean | null } {
  if (isNaN(a) || isNaN(b)) return { text: '—', positive: null }
  const delta = b - a

  if (fmt === 'pct_pp') {
    const text = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}pp`
    return { text, positive: delta > 0 }
  }

  if (fmt === 'milhoes' || fmt === 'bilhoes') {
    if (a === 0) return { text: '—', positive: null }
    const pct = ((b - a) / Math.abs(a)) * 100
    const text = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
    return { text, positive: pct > 0 }
  }

  const text = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}`
  return { text, positive: delta > 0 }
}

// For expense rows, negative delta = improvement (green)
function isExpenseRow(key: string): boolean {
  const expenses = [
    'custo_credito', 'despesa_perda_esperada', 'descontos_concedidos',
    'outras_despesas_operacionais', 'desp_nao_decorrentes_juros',
    'desp_tributarias_iss_pis_cofins', 'desp_comercializacao_seguros',
    'despesas_sinistros', 'ir_cs', 'participacoes_minoritarias',
    'npl_90d_total_pct', 'custo_credito_sobre_carteira_pct',
    'indice_eficiencia_pct', 'etr_pct',
  ]
  const field = key.split('.')[1]
  return expenses.includes(field)
}

/* ─── Component ──────────────────────────────────────────────────────── */
export default function ItauComparativoTable({ data }: { data: ItauData }) {
  const quarters = Object.keys(data.trimestres)

  const [periodA, setPeriodA] = useState<string>('4T24')
  const [periodB, setPeriodB] = useState<string>('3T25')
  const [periodC, setPeriodC] = useState<string>('4T25')

  const periods = [periodA, periodB, periodC]
  const trimestres = data.trimestres

  // L12M: sum last 4 quarters (flow items) or last value (stock items)
  const l12m = useMemo(() => {
    const last4 = quarters.slice(-4)
    const result: Trimestre = {
      dre: {}, indicadores: {}, carteira: {}, qualidade: {}, capital: {}
    }
    // DRE: sum
    const dreKeys = Object.keys(trimestres[last4[0]]?.dre ?? {})
    dreKeys.forEach(k => {
      result.dre[k] = last4.reduce((s, q) => s + (trimestres[q]?.dre[k] ?? 0), 0)
    })
    // Indicadores: average
    const indKeys = Object.keys(trimestres[last4[0]]?.indicadores ?? {})
    indKeys.forEach(k => {
      result.indicadores[k] = last4.reduce((s, q) => s + (trimestres[q]?.indicadores[k] ?? 0), 0) / 4
    })
    // Carteira: last value
    const cartKeys = Object.keys(trimestres[last4[3]]?.carteira ?? {})
    cartKeys.forEach(k => {
      result.carteira[k] = trimestres[last4[3]]?.carteira[k] ?? NaN
    })
    // Qualidade: last value
    const qualKeys = Object.keys(trimestres[last4[3]]?.qualidade ?? {})
    qualKeys.forEach(k => {
      result.qualidade[k] = trimestres[last4[3]]?.qualidade[k] ?? NaN
    })
    // Capital: last value
    const capKeys = Object.keys(trimestres[last4[3]]?.capital ?? {})
    capKeys.forEach(k => {
      result.capital[k] = trimestres[last4[3]]?.capital[k] ?? NaN
    })
    return result
  }, [quarters, trimestres])

  const deltaAB = (key: string, fmt: RowFmt) => {
    const a = getVal(trimestres[periodA], key)
    const b = getVal(trimestres[periodB], key)
    return fmtDelta(a, b, fmt)
  }
  const deltaBC = (key: string, fmt: RowFmt) => {
    const a = getVal(trimestres[periodB], key)
    const b = getVal(trimestres[periodC], key)
    return fmtDelta(a, b, fmt)
  }

  const deltaColor = (d: { positive: boolean | null }, key: string) => {
    if (d.positive === null) return 'text-gray-400'
    const expense = isExpenseRow(key)
    const good = expense ? !d.positive : d.positive
    return good ? 'text-emerald-400' : 'text-red-400'
  }

  return (
    <div className="space-y-2">

      {/* ── Period selector ── */}
      <div className="flex flex-wrap gap-3 items-center bg-gray-800 rounded-xl p-4">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mr-1">Períodos:</span>
        {[
          { val: periodA, set: setPeriodA, label: 'A' },
          { val: periodB, set: setPeriodB, label: 'B' },
          { val: periodC, set: setPeriodC, label: 'C' },
        ].map(({ val, set, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">{label}</span>
            <select
              value={val}
              onChange={e => set(e.target.value)}
              className="bg-gray-700 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              {quarters.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
        ))}
        <span className="text-xs text-gray-500 ml-auto">Itaú Unibanco · ITUB4</span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th className="sticky left-0 bg-gray-800 text-left px-4 py-3 text-gray-400 font-medium w-72 min-w-[280px]">
                Indicador
              </th>
              <th className="text-right px-4 py-3 text-gray-300 font-semibold min-w-[110px]">{periodA}</th>
              <th className="text-right px-3 py-3 text-gray-500 font-normal text-xs min-w-[80px]">Δ A→B</th>
              <th className="text-right px-4 py-3 text-gray-300 font-semibold min-w-[110px]">{periodB}</th>
              <th className="text-right px-3 py-3 text-gray-500 font-normal text-xs min-w-[80px]">Δ B→C</th>
              <th className="text-right px-4 py-3 text-blue-400 font-semibold min-w-[110px]">{periodC}</th>
              <th className="text-right px-4 py-3 text-purple-400 font-semibold min-w-[110px]">L12M</th>
            </tr>
          </thead>
          <tbody>
            {SECTIONS.map((section) => (
              <>
                {/* Section header */}
                <tr key={`sec-${section.title}`} className="bg-gray-900 border-t-2 border-gray-600">
                  <td
                    colSpan={7}
                    className="sticky left-0 bg-gray-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-400"
                  >
                    {section.title}
                  </td>
                </tr>

                {section.rows.map((row) => {
                  const dAB = deltaAB(row.key, row.fmt)
                  const dBC = deltaBC(row.key, row.fmt)
                  const rowEven = section.rows.indexOf(row) % 2 === 0
                  const bg = rowEven ? 'bg-gray-900' : 'bg-gray-850'

                  const vA = getVal(trimestres[periodA], row.key)
                  const vB = getVal(trimestres[periodB], row.key)
                  const vC = getVal(trimestres[periodC], row.key)
                  const vL = getVal(l12m, row.key)

                  return (
                    <tr
                      key={row.key}
                      className={`border-t border-gray-800 hover:bg-gray-750 transition-colors ${rowEven ? 'bg-gray-900' : 'bg-[#141414]'}`}
                    >
                      <td
                        className={`sticky left-0 ${rowEven ? 'bg-gray-900' : 'bg-[#141414]'} px-4 py-2.5 text-gray-300 ${row.bold ? 'font-semibold text-white' : ''}`}
                        style={{ paddingLeft: row.indent ? `${(row.indent * 16) + 16}px` : '16px' }}
                      >
                        {row.label.trim()}
                      </td>
                      <td className="text-right px-4 py-2.5 text-gray-300 tabular-nums">{fmtNum(vA, row.fmt)}</td>
                      <td className={`text-right px-3 py-2.5 tabular-nums text-xs ${deltaColor(dAB, row.key)}`}>{dAB.text}</td>
                      <td className="text-right px-4 py-2.5 text-gray-300 tabular-nums">{fmtNum(vB, row.fmt)}</td>
                      <td className={`text-right px-3 py-2.5 tabular-nums text-xs ${deltaColor(dBC, row.key)}`}>{dBC.text}</td>
                      <td className="text-right px-4 py-2.5 text-blue-200 font-medium tabular-nums">{fmtNum(vC, row.fmt)}</td>
                      <td className="text-right px-4 py-2.5 text-purple-300 tabular-nums">
                        {/* L12M: only DRE flow items make sense as sum; others show last value */}
                        {row.key.startsWith('dre.') || row.key.startsWith('indicadores.') || row.key.startsWith('qualidade.') || row.key.startsWith('capital.')
                          ? fmtNum(vL, row.fmt)
                          : fmtNum(vL, row.fmt)}
                      </td>
                    </tr>
                  )
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Notes ── */}
      <div className="text-xs text-gray-500 space-y-1 px-1 pt-2">
        <p>* {data.nota_npl}</p>
        <p>** Custo do Crédito / Carteira de Crédito: saldo médio da carteira (incluindo TVM e garantias). Fonte: Itaú Earnings Release, pág. 13.</p>
        <p>DRE em R$ milhões · Carteira em R$ bilhões · Capital em R$ milhões · Fonte: Relatórios de Análise Gerencial Itaú Unibanco (4T24–4T25).</p>
      </div>
    </div>
  )
}
