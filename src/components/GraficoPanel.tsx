'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

import itauRaw    from '../../data/itau_historico.json'
import bradecoRaw from '../../data/bradesco_historico.json'
import sanRaw     from '../../data/santander_historico.json'
import bbRaw      from '../../data/bb_historico.json'
import bvRaw      from '../../data/bv_historico.json'

/* ─── Types ─────────────────────────────────────────────────── */
type BankData = { banco: string; ticker: string; trimestres: Record<string, Record<string, Record<string, number | null>>> }

const ALL_BANKS: { id: string; label: string; data: BankData; color: string }[] = [
  { id: 'itau',      label: 'Itaú',       data: itauRaw    as BankData, color: '#f97316' },
  { id: 'bradesco',  label: 'Bradesco',   data: bradecoRaw as BankData, color: '#3b82f6' },
  { id: 'santander', label: 'Santander',  data: sanRaw     as BankData, color: '#ef4444' },
  { id: 'bb',        label: 'BB',         data: bbRaw      as BankData, color: '#eab308' },
  { id: 'bv',        label: 'BV',         data: bvRaw      as BankData, color: '#22c55e' },
]

/* ─── Metrics ────────────────────────────────────────────────── */
type Fmt = 'pct' | 'milhoes' | 'bilhoes'
interface Metric { label: string; key: string; fmt: Fmt }

const METRICS: Metric[] = [
  // Indicadores
  { label: 'ROAE (%)',                        key: 'indicadores.roae_consolidado_pct',        fmt: 'pct'     },
  { label: 'ROAA (%)',                        key: 'indicadores.roaa_pct',                    fmt: 'pct'     },
  { label: 'Índice de Eficiência (%)',        key: 'indicadores.indice_eficiencia_pct',       fmt: 'pct'     },
  { label: 'NIM Clientes (%)',                key: 'indicadores.nim_clientes_pct',            fmt: 'pct'     },
  // Qualidade
  { label: 'NPL >90 dias (%)',                key: 'qualidade.npl_90d_total_pct',             fmt: 'pct'     },
  { label: 'PDD / Carteira (%)',              key: 'qualidade.custo_credito_sobre_carteira_pct', fmt: 'pct'  },
  // Capital
  { label: 'Basileia (%)',                    key: 'capital.basileia_pct',                    fmt: 'pct'     },
  { label: 'CET1 (%)',                        key: 'capital.cet1_pct',                        fmt: 'pct'     },
  { label: 'Nível I (%)',                     key: 'capital.nivel_i_pct',                     fmt: 'pct'     },
  // DRE
  { label: 'Lucro Líquido (R$ mi)',           key: 'dre.resultado_recorrente_gerencial',      fmt: 'milhoes' },
  { label: 'Receitas Totais (R$ mi)',         key: 'dre.receitas_totais',                     fmt: 'milhoes' },
  { label: 'Margem Financeira (R$ mi)',       key: 'dre.margem_financeira',                   fmt: 'milhoes' },
  { label: 'MF com Clientes (R$ mi)',         key: 'dre.margem_financeira_clientes',          fmt: 'milhoes' },
  { label: 'Custo do Crédito (R$ mi)',        key: 'dre.custo_credito',                       fmt: 'milhoes' },
  { label: 'Outras Desp. Operac. (R$ mi)',    key: 'dre.outras_despesas_operacionais',        fmt: 'milhoes' },
  // Carteira
  { label: 'Carteira Total (R$ bi)',          key: 'carteira.total',                          fmt: 'bilhoes' },
  { label: 'Carteira PF (R$ bi)',             key: 'carteira.pessoas_fisicas',                fmt: 'bilhoes' },
  { label: 'Carteira MPMEs (R$ bi)',          key: 'carteira.mpmes',                          fmt: 'bilhoes' },
  { label: 'Carteira GE (R$ bi)',             key: 'carteira.grandes_empresas',               fmt: 'bilhoes' },
]

/* ─── Helpers ────────────────────────────────────────────────── */
function getVal(obj: Record<string, Record<string, number | null>>, key: string): number | null {
  const [section, field] = key.split('.')
  return obj?.[section]?.[field] ?? null
}

function sortQuarters(qs: string[]): string[] {
  return [...qs].sort((a, b) => {
    const toNum = (q: string) => {
      const [qt, yr] = q.split('T')
      return parseInt('20' + yr) * 10 + parseInt(qt)
    }
    return toNum(a) - toNum(b)
  })
}

function fmtAxis(v: number, fmt: Fmt): string {
  if (fmt === 'pct')     return v.toFixed(1) + '%'
  if (fmt === 'bilhoes') return v.toFixed(0) + 'bi'
  // milhoes → show as 'Xbi' if large
  if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + 'bi'
  return v.toFixed(0) + 'mi'
}

function fmtTooltip(v: number, fmt: Fmt): string {
  if (fmt === 'pct')     return v.toFixed(2) + '%'
  if (fmt === 'bilhoes') return 'R$ ' + v.toFixed(1) + ' bi'
  return 'R$ ' + v.toLocaleString('pt-BR') + ' mi'
}

/* ─── Component ──────────────────────────────────────────────── */
interface Props { defaultMetricKey?: string; defaultBanks?: string[] }

export default function GraficoPanel({ defaultMetricKey, defaultBanks }: Props) {
  const [selectedBanks, setSelectedBanks] = useState<string[]>(
    defaultBanks ?? ['itau', 'bradesco']
  )
  const [metricKey, setMetricKey] = useState(
    defaultMetricKey ?? METRICS[0].key
  )

  const metric = METRICS.find(m => m.key === metricKey) ?? METRICS[0]

  // Collect all quarters across selected banks
  const allQuarters = useMemo(() => {
    const qs = new Set<string>()
    for (const b of ALL_BANKS) {
      if (selectedBanks.includes(b.id)) {
        Object.keys(b.data.trimestres).forEach(q => qs.add(q))
      }
    }
    return sortQuarters(Array.from(qs))
  }, [selectedBanks])

  // Build chart data: one row per quarter
  const chartData = useMemo(() => {
    return allQuarters.map(q => {
      const row: Record<string, string | number | null> = { quarter: q }
      for (const b of ALL_BANKS) {
        if (!selectedBanks.includes(b.id)) continue
        const trimData = b.data.trimestres[q]
        row[b.id] = trimData ? getVal(trimData as any, metricKey) : null
      }
      return row
    })
  }, [allQuarters, selectedBanks, metricKey])

  // Dynamic Y domain with padding
  const yDomain = useMemo((): [number, number] => {
    const vals: number[] = []
    for (const row of chartData) {
      for (const b of ALL_BANKS) {
        if (!selectedBanks.includes(b.id)) continue
        const v = row[b.id]
        if (typeof v === 'number' && isFinite(v)) vals.push(v)
      }
    }
    if (vals.length === 0) return [0, 1]
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const range = max - min || Math.abs(max) * 0.1 || 1
    const pad = range * 0.25
    const lower = min - pad
    const upper = max + pad
    // For percentage metrics, don't go below 0 if all values are positive
    const domMin = metric.fmt === 'pct' && lower > 0 ? parseFloat(lower.toFixed(2)) : parseFloat(lower.toFixed(2))
    return [parseFloat(domMin.toFixed(2)), parseFloat(upper.toFixed(2))]
  }, [chartData, selectedBanks, metric.fmt])

  function toggleBank(id: string) {
    setSelectedBanks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-gray-900 border border-slate-700 rounded-lg p-3 shadow-xl text-sm">
        <p className="text-slate-400 font-medium mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
            <span style={{ color: entry.color }} className="font-semibold">
              {ALL_BANKS.find(b => b.id === entry.dataKey)?.label}:
            </span>
            <span className="text-white">
              {entry.value != null ? fmtTooltip(entry.value, metric.fmt) : '—'}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 h-full">

      {/* Metric selector */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">Métrica</label>
        <select
          value={metricKey}
          onChange={e => setMetricKey(e.target.value)}
          className="w-full bg-gray-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          {METRICS.map(m => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Bank toggles */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Bancos</label>
        <div className="flex flex-wrap gap-2">
          {ALL_BANKS.map(b => {
            const active = selectedBanks.includes(b.id)
            return (
              <button
                key={b.id}
                onClick={() => toggleBank(b.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  active
                    ? 'text-gray-950'
                    : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'
                }`}
                style={active ? { backgroundColor: b.color, borderColor: b.color } : {}}
              >
                {b.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0" style={{ minHeight: 280 }}>
        {selectedBanks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-sm">
            Selecione pelo menos um banco
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="quarter"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                tickFormatter={v => fmtAxis(v, metric.fmt)}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>
                    {ALL_BANKS.find(b => b.id === value)?.label ?? value}
                  </span>
                )}
              />
              {ALL_BANKS.filter(b => selectedBanks.includes(b.id)).map(b => (
                <Line
                  key={b.id}
                  type="monotone"
                  dataKey={b.id}
                  stroke={b.color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: b.color, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
