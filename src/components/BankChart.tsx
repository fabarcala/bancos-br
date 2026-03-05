'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'
import { Bank, KPIKey, KPI_CONFIG, BANK_COLORS } from '@/lib/types'
import { getComparativeData, getLastNPeriods, formatValue } from '@/lib/data'

interface MultiLineChartProps {
  banks: Bank[]
  kpi: KPIKey
  periods?: number
  height?: number
}

const CustomTooltip = ({ active, payload, label, kpi }: {
  active?: boolean
  payload?: { dataKey: string; value: number; color: string; name: string }[]
  label?: string
  kpi: KPIKey
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-xl p-3 shadow-xl text-sm">
      <p className="text-slate-300 font-medium mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-semibold">{formatValue(p.value, kpi)}</span>
        </div>
      ))}
    </div>
  )
}

export function MultiLineChart({ banks, kpi, periods = 20, height = 320 }: MultiLineChartProps) {
  const config = KPI_CONFIG[kpi]
  const allData = getComparativeData(banks, kpi)
  const data = getLastNPeriods(allData, periods)

  const formatYAxis = (value: number) => {
    if (config.format === 'percent') return `${(value * 100).toFixed(0)}%`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
    return value.toFixed(0)
  }

  return (
    <div>
      <p className="text-sm font-medium text-slate-300 mb-3">{config.label} ({config.unit})</p>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="period"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={45}
          />
          <Tooltip content={<CustomTooltip kpi={kpi} />} />
          <Legend
            formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
          />
          {banks.map(bank => (
            <Line
              key={bank.ticker}
              type="monotone"
              dataKey={bank.ticker}
              name={bank.ticker}
              stroke={BANK_COLORS[bank.ticker] || '#6366f1'}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface SingleBankChartProps {
  bank: Bank
  kpi: KPIKey
  periods?: number
  height?: number
  color?: string
}

export function SingleBankChart({ bank, kpi, periods = 20, height = 280, color }: SingleBankChartProps) {
  const config = KPI_CONFIG[kpi]
  const bankColor = color || BANK_COLORS[bank.ticker] || '#6366f1'
  const allData = getComparativeData([bank], kpi)
  const data = getLastNPeriods(allData, periods)

  const formatYAxis = (value: number) => {
    if (config.format === 'percent') return `${(value * 100).toFixed(0)}%`
    return value.toFixed(0)
  }

  return (
    <div>
      <p className="text-sm font-medium text-slate-300 mb-3">{config.label}</p>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="period"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={45}
          />
          <Tooltip content={<CustomTooltip kpi={kpi} />} />
          <Line
            type="monotone"
            dataKey={bank.ticker}
            stroke={bankColor}
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
