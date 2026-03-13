'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useState, useEffect } from 'react'

type Curva = {
  data: string
  curva: Record<string, number>
}

type CurvaData = {
  curvas: Curva[]
  vertices: number[]
  labels: Record<string, string>
  updated: string
}

function gerarCores(n: number): string[] {
  const todas = [
    '#334155', '#3d5068', '#3a5f7a', '#2e6e8c', '#207d9e',
    '#148cb0', '#0e9cc8', '#07aee0', '#03bef5', '#1d4ed8',
  ]
  return todas.slice(todas.length - n)
}

function gerarOpacidade(i: number, total: number): number {
  const min = 0.25
  const max = 1.0
  return min + (max - min) * (i / (total - 1))
}

function gerarEspessura(i: number, total: number): number {
  if (i === total - 1) return 3
  if (i === total - 2) return 1.8
  return 1.2
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomXAxisTick({ x, y, payload, labels, isMobile }: any) {
  if (!payload || x === undefined || y === undefined) return null
  const du = payload.value
  const label = labels[String(du)] || ''
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={14} textAnchor="middle" fill="#94a3b8" fontSize={isMobile ? 9 : 11}>
        {isMobile ? label : du}
      </text>
      {!isMobile && (
        <text x={0} y={0} dy={26} textAnchor="middle" fill="#64748b" fontSize={10}>
          {label}
        </text>
      )}
    </g>
  )
}

function CustomTooltip({ active, payload, label, labels }: {
  active?: boolean
  payload?: { color: string; name: string; value: number }[]
  label?: number
  labels: Record<string, string>
}) {
  if (!active || !payload?.length) return null
  const du = label
  const labelLeg = labels[String(du)] || ''
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-xs max-w-[180px]">
      <p className="text-slate-300 font-semibold mb-1.5">
        {du} du{labelLeg ? ` · ${labelLeg}` : ''}
      </p>
      {[...payload].reverse().map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3 mb-0.5">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: p.color }} />
            <span className="text-slate-400">{p.name}</span>
          </div>
          <span className="text-white font-mono font-semibold">{p.value.toFixed(2)}%</span>
        </div>
      ))}
    </div>
  )
}

export default function CurvaJurosClient({ data }: { data: CurvaData }) {
  const { curvas, vertices, labels, updated } = data
  const cores = gerarCores(curvas.length)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Vértices reduzidos no mobile para não poluir eixo X
  const verticesMobile = [126, 252, 504, 756, 1260, 2520]
  const verticesExibidos = isMobile
    ? vertices.filter(v => verticesMobile.includes(v))
    : vertices

  const chartData = vertices.map(du => {
    const ponto: Record<string, number | string> = { du }
    curvas.forEach(c => {
      const taxa = c.curva[String(du)]
      if (taxa !== undefined) ponto[c.data] = taxa
    })
    return ponto
  })

  const dataRecente = curvas[curvas.length - 1]?.data ?? ''
  const dataAntiga  = curvas[0]?.data ?? ''

  const todasTaxas = curvas.flatMap(c => Object.values(c.curva))
  const yMin = Math.floor(Math.min(...todasTaxas) * 10) / 10 - 0.2
  const yMax = Math.ceil(Math.max(...todasTaxas) * 10) / 10 + 0.2

  // Cards de destaque: mobile mostra só 2, desktop 4
  const cardsDu = isMobile ? [252, 2520] : [126, 252, 756, 2520]

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          Curva de Juros — DI Prefixado (ETTJ)
        </h1>
        <p className="text-slate-400 text-base sm:text-lg mb-2">
          Evolução diária da estrutura a termo de taxas de juros
        </p>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <span className="inline-flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/50 text-blue-300 text-xs font-medium px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            Atualizado diariamente · Fonte: ANBIMA
          </span>
          <span className="text-slate-500 text-xs sm:text-sm">
            {dataAntiga} – {dataRecente} · {curvas.length} pregões
          </span>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed max-w-4xl hidden sm:block">
          A Estrutura a Termo de Taxas de Juros (ETTJ) prefixada é calculada diariamente pela ANBIMA
          com base nos contratos de DI futuro negociados na B3. O gráfico abaixo mostra a evolução
          da curva nos últimos {curvas.length} pregões — da cor mais clara (mais antiga) à mais escura (mais recente).
        </p>
      </div>

      {/* Cards de destaque */}
      <div className={`grid gap-3 mb-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
        {cardsDu.map(du => {
          const label = labels[String(du)]
          const taxaHoje = curvas[curvas.length - 1]?.curva[String(du)]
          const taxaAnt  = curvas[curvas.length - 2]?.curva[String(du)]
          const delta    = taxaHoje !== undefined && taxaAnt !== undefined
            ? (taxaHoje - taxaAnt) * 100
            : null
          return (
            <div key={du} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4">
              <p className="text-slate-500 text-xs mb-0.5">{du} du · {label}</p>
              <p className="text-white text-xl sm:text-2xl font-bold font-mono">
                {taxaHoje?.toFixed(2)}%
              </p>
              {delta !== null && (
                <p className={`text-xs mt-1 font-mono ${delta > 0 ? 'text-red-400' : delta < 0 ? 'text-green-400' : 'text-slate-500'}`}>
                  {delta > 0 ? '+' : ''}{delta.toFixed(1)} bps vs ontem
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Gráfico */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-6">
        {/* Legenda de datas — scroll horizontal no mobile */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {curvas.map((c, i) => {
            const isRecente = i === curvas.length - 1
            const opacidade = gerarOpacidade(i, curvas.length)
            return (
              <div key={c.data} className="flex items-center gap-1 shrink-0">
                <span
                  className="inline-block rounded"
                  style={{
                    background: cores[i],
                    opacity: opacidade,
                    width: isRecente ? 22 : 16,
                    height: isRecente ? 3 : 2,
                  }}
                />
                <span className="text-xs whitespace-nowrap" style={{ color: cores[i], opacity: Math.max(opacidade, 0.6) }}>
                  {c.data}
                  {isRecente && <span className="ml-0.5 text-blue-400 font-bold">★</span>}
                </span>
              </div>
            )
          })}
        </div>

        <ResponsiveContainer width="100%" height={isMobile ? 280 : 420}>
          <LineChart
            data={chartData}
            margin={isMobile
              ? { top: 5, right: 8, bottom: 20, left: 0 }
              : { top: 5, right: 20, bottom: 40, left: 10 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="du"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={verticesExibidos}
              tick={(props) => <CustomXAxisTick {...props} labels={labels} isMobile={isMobile} />}
              tickLine={false}
              height={isMobile ? 30 : 50}
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={(v) => `${v.toFixed(1)}%`}
              tick={{ fill: '#94a3b8', fontSize: isMobile ? 9 : 11 }}
              tickLine={false}
              axisLine={false}
              width={isMobile ? 42 : 55}
            />
            <Tooltip
              content={(props) => (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <CustomTooltip {...(props as any)} labels={labels} />
              )}
              trigger={isMobile ? 'click' : 'hover'}
            />
            {curvas.map((c, i) => (
              <Line
                key={c.data}
                type="monotone"
                dataKey={c.data}
                stroke={cores[i]}
                strokeWidth={gerarEspessura(i, curvas.length)}
                strokeOpacity={gerarOpacidade(i, curvas.length)}
                dot={false}
                activeDot={{ r: isMobile ? 4 : 5, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {isMobile && (
          <p className="text-slate-600 text-xs text-center mt-2">
            Toque no gráfico para ver as taxas
          </p>
        )}
      </div>

      {/* Nota */}
      <p className="text-slate-600 text-xs mt-4 sm:mt-6">
        Fonte: ANBIMA — Estrutura a Termo de Taxas de Juros (ETTJ) Prefixada.
        Atualizado em: {updated}.
      </p>
    </div>
  )
}
