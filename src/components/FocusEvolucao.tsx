'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { fetchFocusEvolution, type FocusEvolutionSeries } from '@/lib/focusEvolution'

function formatDate(d: string) {
  // YYYY-MM-DD → DD/MM
  const [, m, day] = d.split('-')
  return `${day}/${m}`
}

function Sparkline({ semanas, color }: { semanas: { date: string; mediana: number }[]; color: string }) {
  const data = semanas.map(s => ({ v: s.mediana }))
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.8}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
          isAnimationActive={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                {payload[0].value?.toFixed(2)}
              </div>
            )
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function DeltaBadge({ delta, unit }: { delta: number; unit: string }) {
  const isUp   = delta > 0.005
  const isDown = delta < -0.005
  const abs    = Math.abs(delta)
  const fmt    = abs < 0.1 ? abs.toFixed(3) : abs.toFixed(2)

  if (!isUp && !isDown) return (
    <span className="text-slate-500 text-xs font-mono">= estável</span>
  )

  return (
    <span className={`text-xs font-mono font-semibold ${isUp ? 'text-red-400' : 'text-green-400'}`}>
      {isUp ? '▲' : '▼'} {fmt} {unit}
    </span>
  )
}

type CardProps = {
  series: FocusEvolutionSeries
}

function EvolucaoCard({ series }: CardProps) {
  const { label, unit, anoRef, semanas } = series
  if (!semanas.length) return null

  const atual    = semanas[semanas.length - 1]
  const anterior = semanas.length >= 2 ? semanas[semanas.length - 2] : null
  const delta    = anterior ? atual.mediana - anterior.mediana : null

  // Cor por indicador
  const colorMap: Record<string, string> = {
    'IPCA':      '#f97316',
    'Selic':     '#3b82f6',
    'Câmbio':    '#a855f7',
    'PIB Total': '#22c55e',
  }
  const color = colorMap[series.indicador] ?? '#94a3b8'

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-slate-400 text-xs font-medium">{label} · {anoRef}</p>
          <p className="text-white text-2xl font-bold font-mono mt-0.5">
            {unit === 'R$' ? 'R$ ' : ''}{atual.mediana.toFixed(unit === 'R$' ? 2 : 2)}{unit !== 'R$' ? '%' : ''}
          </p>
        </div>
        {delta !== null && (
          <div className="text-right mt-1">
            <DeltaBadge delta={delta} unit={unit === 'R$' ? 'R$' : 'p.p.'} />
            <p className="text-slate-600 text-xs mt-0.5">vs semana anterior</p>
          </div>
        )}
      </div>

      {/* Sparkline */}
      <Sparkline semanas={semanas} color={color} />

      {/* Eixo de datas */}
      <div className="flex justify-between mt-0.5">
        <span className="text-slate-600 text-xs">{formatDate(semanas[0].date)}</span>
        <span className="text-slate-400 text-xs font-medium">{formatDate(atual.date)}</span>
      </div>
    </div>
  )
}

export default function FocusEvolucao() {
  const [series, setSeries] = useState<FocusEvolutionSeries[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchFocusEvolution()
      .then(setSeries)
      .catch(() => setError(true))
  }, [])

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-200">Evolução Semanal das Projeções</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Como cada indicador variou nas últimas 8 semanas do Boletim Focus
          </p>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm">Não foi possível carregar os dados de evolução.</p>
      )}

      {!series && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800/60 rounded-xl h-32" />
          ))}
        </div>
      )}

      {series && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {series.map(s => (
            <EvolucaoCard key={`${s.indicador}-${s.anoRef}`} series={s} />
          ))}
        </div>
      )}
    </section>
  )
}
