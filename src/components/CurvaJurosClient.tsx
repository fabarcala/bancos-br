'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

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

// Gera degradê de azul: mais escuro = mais recente
function gerarCores(n: number): string[] {
  // do mais claro (#93c5fd) ao mais escuro (#1d4ed8)
  const cores = [
    '#bfdbfe', // 10 — mais antiga
    '#93c5fd',
    '#7ab8fb',
    '#60a5fa',
    '#4d95f9',
    '#3b82f6',
    '#2f73e8',
    '#2563eb',
    '#1d53d4',
    '#1d4ed8', // 1 — mais recente
  ]
  return cores.slice(cores.length - n)
}

// Tick customizado com duas linhas: dias úteis + label legível
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomXAxisTick({ x, y, payload, labels }: any) {
  if (!payload || x === undefined || y === undefined) return null
  const du = payload.value
  const label = labels[String(du)] || ''
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={14} textAnchor="middle" fill="#94a3b8" fontSize={11}>
        {du}
      </text>
      <text x={0} y={0} dy={26} textAnchor="middle" fill="#64748b" fontSize={10}>
        {label}
      </text>
    </g>
  )
}

// Tooltip customizado
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
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-300 font-semibold mb-2">
        {du} du{labelLeg ? ` · ${labelLeg}` : ''}
      </p>
      {[...payload].reverse().map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: p.color }} />
            <span className="text-slate-400 text-xs">{p.name}</span>
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

  // Prepara dados para o Recharts: array de pontos [{du, "10/03":13.85, "07/03":13.9, ...}]
  const chartData = vertices.map(du => {
    const ponto: Record<string, number | string> = { du }
    curvas.forEach(c => {
      const taxa = c.curva[String(du)]
      if (taxa !== undefined) ponto[c.data] = taxa
    })
    return ponto
  })

  // Data mais recente
  const dataRecente = curvas[curvas.length - 1]?.data ?? ''
  const dataAntiga  = curvas[0]?.data ?? ''

  // Min/max para o eixo Y (com margem)
  const todasTaxas = curvas.flatMap(c => Object.values(c.curva))
  const yMin = Math.floor(Math.min(...todasTaxas) * 10) / 10 - 0.2
  const yMax = Math.ceil(Math.max(...todasTaxas) * 10) / 10 + 0.2

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Curva de Juros — DI Prefixado (ETTJ)
        </h1>
        <p className="text-slate-400 text-lg mb-2">
          Evolução diária da estrutura a termo de taxas de juros
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/50 text-blue-300 text-xs font-medium px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            Atualizado diariamente · Fonte: ANBIMA
          </span>
          <span className="text-slate-500 text-sm">
            {dataAntiga} – {dataRecente} · {curvas.length} pregões
          </span>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed max-w-4xl">
          A Estrutura a Termo de Taxas de Juros (ETTJ) prefixada é calculada diariamente pela ANBIMA
          com base nos contratos de DI futuro negociados na B3. O gráfico abaixo mostra a evolução
          da curva nos últimos {curvas.length} pregões — da cor mais clara (mais antiga) à mais escura (mais recente) —
          permitindo visualizar o movimento de abertura ou fechamento da curva ao longo do tempo.
        </p>
      </div>

      {/* Gráfico */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        {/* Legenda de datas (mais antiga → mais recente) */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {curvas.map((c, i) => (
            <div key={c.data} className="flex items-center gap-1.5">
              <span
                className="w-8 h-0.5 inline-block rounded"
                style={{ background: cores[i], height: '3px' }}
              />
              <span className="text-xs" style={{ color: cores[i] }}>
                {c.data}
                {i === curvas.length - 1 && (
                  <span className="ml-1 text-blue-300 font-semibold">(mais recente)</span>
                )}
              </span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={420}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, bottom: 40, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="du"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={vertices}
              tick={(props) => <CustomXAxisTick {...props} labels={labels} />}
              tickLine={false}
              height={50}
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={(v) => `${v.toFixed(1)}%`}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip
              content={(props) => (
                <CustomTooltip {...(props as any)} labels={labels} />
              )}
            />
            {curvas.map((c, i) => (
              <Line
                key={c.data}
                type="monotone"
                dataKey={c.data}
                stroke={cores[i]}
                strokeWidth={i === curvas.length - 1 ? 2.5 : 1.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela resumo — vértice mais curto e mais longo */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[126, 252, 756, 2520].map(du => {
          const label = labels[String(du)]
          const taxaHoje = curvas[curvas.length - 1]?.curva[String(du)]
          const taxaAnt  = curvas[curvas.length - 2]?.curva[String(du)]
          const delta    = taxaHoje !== undefined && taxaAnt !== undefined
            ? (taxaHoje - taxaAnt) * 100  // bps
            : null
          return (
            <div key={du} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-500 text-xs mb-0.5">{du} du · {label}</p>
              <p className="text-white text-2xl font-bold font-mono">
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

      {/* Nota */}
      <p className="text-slate-600 text-xs mt-6">
        Fonte: ANBIMA — Estrutura a Termo de Taxas de Juros (ETTJ) Prefixada.
        Atualizado em: {updated}.
      </p>
    </div>
  )
}
