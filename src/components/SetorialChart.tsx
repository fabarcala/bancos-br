'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { SGSPoint, MultiSeries } from '@/lib/setorialData'

// ── Tooltip ──────────────────────────────────────────────────────

function CustomTooltip({
  active, payload, label, unit,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  unit: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          <span className="font-semibold">{p.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
          <span className="text-slate-400 ml-1">{unit} — {p.name}</span>
        </p>
      ))}
    </div>
  )
}

// ── Single-series chart ───────────────────────────────────────────

export function SingleLineChart({
  data,
  label,
  unit,
  color = '#60a5fa',
  height = 180,
}: {
  data: SGSPoint[]
  label: string
  unit: string
  color?: string
  height?: number
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const chartData = data.map(d => ({ date: d.date, value: d.value }))

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
      <p className="text-sm font-medium text-slate-300 mb-1">{label}</p>
      <p className="text-xs text-slate-500 mb-4">{unit}</p>
      {!mounted ? (
        <div style={{ height }} className="animate-pulse bg-slate-800/50 rounded-lg" />
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false} tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false} tickLine={false}
              width={42}
              tickFormatter={v =>
                v >= 1000
                  ? `${(v / 1000).toFixed(0)}k`
                  : v.toFixed(v < 10 ? 1 : 0)
              }
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Line
              type="monotone"
              dataKey="value"
              name={label}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ── Multi-series chart ────────────────────────────────────────────

export function MultiSeriesChart({
  series,
  label,
  unit,
  height = 220,
}: {
  series: MultiSeries
  label: string
  unit: string
  height?: number
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Merge all series by date
  const dateSet = new Set<string>()
  series.forEach(s => s.data.forEach(d => dateSet.add(d.date)))
  const dates = Array.from(dateSet).sort((a, b) => {
    const [ma, ya] = a.split('/'); const [mb, yb] = b.split('/')
    return parseInt(ya) !== parseInt(yb)
      ? parseInt(ya) - parseInt(yb)
      : parseInt(ma) - parseInt(mb)
  })

  const chartData = dates.map(date => {
    const row: Record<string, string | number> = { date }
    series.forEach(s => {
      const pt = s.data.find(d => d.date === date)
      row[s.label] = pt?.value ?? null!
    })
    return row
  })

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
      <p className="text-sm font-medium text-slate-300 mb-1">{label}</p>
      <p className="text-xs text-slate-500 mb-4">{unit}</p>
      {!mounted ? (
        <div style={{ height }} className="animate-pulse bg-slate-800/50 rounded-lg" />
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false} tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false} tickLine={false}
              width={42}
              tickFormatter={v =>
                v >= 1000
                  ? `${(v / 1000).toFixed(0)}k`
                  : v.toFixed(v < 10 ? 1 : 0)
              }
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={v => <span style={{ color: '#94a3b8' }}>{v}</span>}
            />
            {series.map(s => (
              <Line
                key={s.label}
                type="monotone"
                dataKey={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ── KPI card ──────────────────────────────────────────────────────

export function KPICard({
  label, value, unit, sub, color = '#60a5fa',
}: {
  label: React.ReactNode
  value: number | null
  unit: string
  sub?: string
  color?: string
}) {
  const fmt = value == null
    ? '—'
    : value >= 1000
      ? `${(value / 1000).toFixed(2)}T`
      : value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{fmt}</p>
      <p className="text-xs text-slate-500 mt-1">{unit}{sub ? ` · ${sub}` : ''}</p>
    </div>
  )
}
