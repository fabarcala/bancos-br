'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { MacroChartSeries } from '@/lib/macroData'

function formatValue(val: number, unit: string): string {
  if (unit === 'R$') return `R$ ${val.toFixed(2)}`
  return `${val.toFixed(2)}${unit.startsWith('%') ? '%' : ` ${unit}`}`
}

type CustomTooltipProps = {
  active?: boolean
  payload?: { name: string; value: number | null; color: string }[]
  label?: string
  unit: string
}

function CustomTooltip({ active, payload, label, unit }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map((p) => {
        if (p.value == null) return null
        const isProjected = p.name === 'Projeção Focus'
        return (
          <p key={p.name} style={{ color: p.color }} className="flex items-center gap-1">
            {isProjected && <span className="text-xs text-slate-400">(estimativa)</span>}
            <span className="font-semibold">{formatValue(p.value, unit)}</span>
            <span className="text-slate-400">— {p.name}</span>
          </p>
        )
      })}
    </div>
  )
}

export function MacroIndicatorChart({ series }: { series: MacroChartSeries }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-white">{series.label}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{series.unit} · Histórico + Projeção Focus</p>
      </div>
      {!mounted ? (
        <div className="h-60 animate-pulse bg-slate-800/50 rounded-lg" />
      ) : null}
      {mounted && <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={series.data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v) => v.toFixed(series.unit === 'R$' ? 1 : 1)}
          />
          <Tooltip content={<CustomTooltip unit={series.unit} />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            content={() => (
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 12, paddingTop: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="16" height="3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke="#60a5fa" strokeWidth="2" /></svg>
                  <span style={{ color: '#94a3b8' }}>Realizado</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="16" height="3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" /></svg>
                  <span style={{ color: '#94a3b8' }}>Projeção Focus</span>
                </span>
              </div>
            )}
          />
          {/* Vertical reference line between historical and projected */}
          <ReferenceLine
            x="2025"
            stroke="#334155"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          {/* Historical data */}
          <Line
            type="monotone"
            dataKey="historical"
            name="Realizado"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={{ r: 3, fill: '#60a5fa' }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
          {/* Projected data */}
          <Line
            type="monotone"
            dataKey="projected"
            name="Projeção Focus"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 3, fill: '#f59e0b' }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>}
    </div>
  )
}

export function MacroChartGrid({ series }: { series: MacroChartSeries[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {series.map((s) => (
        <MacroIndicatorChart key={s.indicador} series={s} />
      ))}
    </div>
  )
}
