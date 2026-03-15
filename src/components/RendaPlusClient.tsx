'use client'

import { useState, useEffect } from 'react'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

type Ponto = { data: string; taxa: number; pu: number }

type RendaData = {
  titulo: string
  vencimento: string
  dados: Ponto[]
  updated: string
}

function formatData(d: string) {
  // DD/MM/YYYY → DD/MM
  const [day, mon] = d.split('/')
  return `${day}/${mon}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const taxa = payload.find((p: { dataKey: string }) => p.dataKey === 'taxa')
  const pu   = payload.find((p: { dataKey: string }) => p.dataKey === 'pu')
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-300 font-semibold mb-2">{label}</p>
      {taxa && (
        <div className="flex justify-between gap-6 mb-0.5">
          <span className="text-slate-400">Taxa (venda)</span>
          <span className="text-orange-400 font-mono font-bold">{taxa.value?.toFixed(2)}% a.a.</span>
        </div>
      )}
      {pu && (
        <div className="flex justify-between gap-6">
          <span className="text-slate-400">PU (venda)</span>
          <span className="text-blue-400 font-mono font-bold">R$ {pu.value?.toFixed(2)}</span>
        </div>
      )}
    </div>
  )
}

export default function RendaPlusClient({ data }: { data: RendaData }) {
  const { titulo, vencimento, dados, updated } = data
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Subsample no mobile: mostra 1 a cada 3 pontos para não poluir eixo X
  const step   = isMobile ? 3 : 1
  const subset = dados.filter((_, i) => i % step === 0 || i === dados.length - 1)

  const ultimo    = dados[dados.length - 1]
  const penultimo = dados[dados.length - 2]
  const deltaTaxa = ultimo && penultimo ? ultimo.taxa - penultimo.taxa : null
  const deltaPu   = ultimo && penultimo ? ultimo.pu   - penultimo.pu   : null

  const taxaMin = Math.min(...dados.map(d => d.taxa))
  const taxaMax = Math.max(...dados.map(d => d.taxa))
  const puMin   = Math.min(...dados.map(d => d.pu))
  const puMax   = Math.max(...dados.map(d => d.pu))

  // Ticks do eixo X: 1 por mês aproximadamente
  const tickIndices: number[] = []
  let lastMonth = ''
  subset.forEach((p, i) => {
    const mes = p.data.slice(3, 10) // MM/YYYY
    if (mes !== lastMonth) { tickIndices.push(i); lastMonth = mes }
  })
  const ticks = tickIndices.map(i => formatData(subset[i].data))

  const chartData = subset.map(p => ({
    data: formatData(p.data),
    taxa: p.taxa,
    pu:   p.pu,
  }))

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          {titulo}
        </h1>
        <p className="text-slate-400 text-base sm:text-lg mb-2">
          Taxa de juros e preço unitário · Evolução diária
        </p>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-orange-950/60 border border-orange-800/50 text-orange-300 text-xs font-medium px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
            Atualizado diariamente · Fonte: Tesouro Direto
          </span>
          <span className="text-slate-500 text-xs sm:text-sm">
            Venc. {vencimento} · {dados.length} pregões
          </span>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed max-w-4xl hidden sm:block">
          O Tesouro Renda+ Aposentadoria Extra é um título público federal indexado ao IPCA com vencimento em 2064.
          Após o vencimento, paga uma renda mensal por 20 anos. A taxa exibida é a taxa de venda da manhã
          (rentabilidade contratada pelo investidor). Quanto maior a taxa, mais barato o PU — e vice-versa.
        </p>
      </div>

      {/* Cards de destaque */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Taxa atual */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4">
          <p className="text-slate-500 text-xs mb-0.5">Taxa (venda)</p>
          <p className="text-orange-400 text-2xl font-bold font-mono">{ultimo?.taxa.toFixed(2)}%</p>
          {deltaTaxa !== null && (
            <p className={`text-xs mt-1 font-mono ${deltaTaxa > 0 ? 'text-red-400' : deltaTaxa < 0 ? 'text-green-400' : 'text-slate-500'}`}>
              {deltaTaxa > 0 ? '+' : ''}{(deltaTaxa * 100).toFixed(0)} bps vs ontem
            </p>
          )}
        </div>

        {/* PU atual */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4">
          <p className="text-slate-500 text-xs mb-0.5">PU (venda)</p>
          <p className="text-blue-400 text-2xl font-bold font-mono">R$ {ultimo?.pu.toFixed(2)}</p>
          {deltaPu !== null && (
            <p className={`text-xs mt-1 font-mono ${deltaPu < 0 ? 'text-red-400' : deltaPu > 0 ? 'text-green-400' : 'text-slate-500'}`}>
              {deltaPu > 0 ? '+' : ''}R$ {deltaPu.toFixed(2)} vs ontem
            </p>
          )}
        </div>

        {/* Mínima/máxima de taxa no período */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4">
          <p className="text-slate-500 text-xs mb-0.5">Taxa mín/máx (1 ano)</p>
          <p className="text-white text-lg font-bold font-mono">
            <span className="text-green-400">{taxaMin.toFixed(2)}</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className="text-red-400">{taxaMax.toFixed(2)}</span>
            <span className="text-slate-500 text-xs ml-1">%</span>
          </p>
        </div>

        {/* Mínima/máxima de PU no período */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4">
          <p className="text-slate-500 text-xs mb-0.5">PU mín/máx (1 ano)</p>
          <p className="text-white text-lg font-bold font-mono">
            <span className="text-red-400">{puMin.toFixed(0)}</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className="text-green-400">{puMax.toFixed(0)}</span>
            <span className="text-slate-500 text-xs ml-1">R$</span>
          </p>
        </div>
      </div>

      {/* Gráfico de taxa */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-6 mb-4">
        <h2 className="text-slate-300 font-semibold text-sm mb-4">Taxa de Venda (% a.a. · IPCA+)</h2>
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 8, bottom: 20, left: isMobile ? 0 : 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="data"
              ticks={ticks}
              tick={{ fill: '#64748b', fontSize: isMobile ? 9 : 11 }}
              tickLine={false}
              interval={0}
              height={30}
            />
            <YAxis
              domain={[
                Math.floor(taxaMin * 10) / 10 - 0.1,
                Math.ceil(taxaMax * 10) / 10 + 0.1,
              ]}
              tickFormatter={v => `${v.toFixed(1)}%`}
              tick={{ fill: '#94a3b8', fontSize: isMobile ? 9 : 11 }}
              tickLine={false}
              axisLine={false}
              width={isMobile ? 42 : 55}
            />
            <Tooltip content={<CustomTooltip />} trigger={isMobile ? 'click' : 'hover'} />
            <Line
              type="monotone"
              dataKey="taxa"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        {isMobile && <p className="text-slate-600 text-xs text-center mt-1">Toque para ver detalhes</p>}
      </div>

      {/* Gráfico de PU */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-6">
        <h2 className="text-slate-300 font-semibold text-sm mb-4">Preço Unitário de Venda (R$)</h2>
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 8, bottom: 20, left: isMobile ? 0 : 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="data"
              ticks={ticks}
              tick={{ fill: '#64748b', fontSize: isMobile ? 9 : 11 }}
              tickLine={false}
              interval={0}
              height={30}
            />
            <YAxis
              domain={[
                Math.floor(puMin / 10) * 10 - 10,
                Math.ceil(puMax / 10) * 10 + 10,
              ]}
              tickFormatter={v => `R$${v.toFixed(0)}`}
              tick={{ fill: '#94a3b8', fontSize: isMobile ? 9 : 11 }}
              tickLine={false}
              axisLine={false}
              width={isMobile ? 52 : 65}
            />
            <Tooltip content={<CustomTooltip />} trigger={isMobile ? 'click' : 'hover'} />
            <Line
              type="monotone"
              dataKey="pu"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        {isMobile && <p className="text-slate-600 text-xs text-center mt-1">Toque para ver detalhes</p>}
      </div>

      <p className="text-slate-600 text-xs mt-4 sm:mt-6">
        Fonte: Tesouro Nacional — Tesouro Direto (PrecoTaxaTesouroDireto.csv).
        Atualizado em: {updated}.
      </p>
    </div>
  )
}
