'use client'

import { useEffect, useState } from 'react'
import { SingleLineChart, KPICard } from './SetorialChart'
import { fetchSetorialDataClient, type SetorialData, type ModalidadePF, type SGSPoint } from '@/lib/setorialFetch'
import { InfoTooltip } from './InfoTooltip'

function Skeleton({ height = 240 }: { height?: number }) {
  return <div className="animate-pulse bg-slate-800/60 rounded-xl w-full" style={{ height }} />
}

function latest(series: SGSPoint[] | null | undefined): number | null {
  if (!series?.length) return null
  return series[series.length - 1].value
}

function fmtBi(v: number | null) {
  if (v === null) return '—'
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} bi`
}

function fmtMi(v: number | null) {
  if (v === null) return '—'
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} mi`
}

// Card exibido no lugar de gráfico quando dado não se aplica
function NACard({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center" style={{ minHeight: 200 }}>
      <span className="text-slate-500 text-xs leading-relaxed max-w-xs">{text}</span>
    </div>
  )
}

// Seção de uma modalidade PF — grid 2x2
function ModalidadeSection({ m, loading }: { m: ModalidadePF; loading: boolean }) {
  const saldoLatest = latest(m.saldo)
  const taxaLatest  = latest(m.taxa)
  const inadimLatest = latest(m.inadim)

  return (
    <section className="mb-14">
      {/* Header */}
      <div className="flex flex-wrap items-baseline gap-3 mb-1">
        <span className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: m.color }} />
        <h2 className="text-lg font-semibold text-slate-200">{m.label}</h2>
        {!loading && (
          <span className="text-xs text-slate-500">
            Saldo: {fmtBi(saldoLatest)}
            {taxaLatest !== null && ` · Taxa: ${taxaLatest.toFixed(2)}% a.a.`}
            {inadimLatest !== null && ` · Inadimpl.: ${inadimLatest.toFixed(2)}%`}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-5 ml-6">{m.descricao}</p>

      {/* Grid 2×2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Linha 1: Concessões + Saldo */}
        {loading ? (
          <><Skeleton /><Skeleton /></>
        ) : (
          <>
            <SingleLineChart
              data={m.concessoes}
              label="Concessões"
              unit="R$ mi"
              color={m.color}
            />
            <SingleLineChart
              data={m.saldo}
              label="Saldo da Carteira"
              unit="R$ bi"
              color={m.color}
            />
          </>
        )}

        {/* Linha 2: Taxa + Inadimplência */}
        {loading ? (
          <><Skeleton /><Skeleton /></>
        ) : (
          <>
            {m.taxa
              ? <SingleLineChart data={m.taxa} label="Taxa Média de Juros" unit="% a.a." color="#fb923c" />
              : <NACard text={m.taxaNA ?? 'Dado não disponível para esta modalidade.'} />
            }
            {m.inadim
              ? <SingleLineChart data={m.inadim} label="Inadimplência (> 90 dias)" unit="%" color="#f87171" />
              : <NACard text={m.inadimNA ?? 'Dado não disponível para esta modalidade.'} />
            }
          </>
        )}
      </div>
    </section>
  )
}

export default function SetorialPageClient() {
  const [data, setData] = useState<SetorialData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchSetorialDataClient()
      .then(d => setData(d))
      .catch(() => setError(true))
  }, [])

  const loading = !data

  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-1">Indicadores Setoriais do SFN — Crédito, Inadimplência e Juros</h1>
        <p className="text-slate-400 text-lg mb-2">Concessões, saldo, taxa de juros e inadimplência por modalidade · Pessoas Físicas</p>

        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/50 text-blue-300 text-xs font-medium px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            Dados mensais · Fonte: Banco Central do Brasil (SGS)
          </span>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed max-w-4xl mb-3">
          Indicadores mensais de crédito para pessoas físicas publicados pelo Banco Central do Brasil.
          Para cada modalidade são apresentados: volume de concessões no mês, saldo da carteira,
          taxa média de juros e inadimplência (operações com atraso superior a 90 dias).
        </p>
        {/* Calendário de atualização */}
        <div className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            Atualização mensal automática · Bacen publica os dados do mês <strong className="text-slate-300">~28 dias após o fechamento</strong>
            {' '}· Próxima atualização: <strong className="text-slate-300">30 mar 2026</strong> (dados de fev/26)
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-sm">
          Não foi possível carregar os dados do Banco Central. Tente recarregar a página.
        </div>
      )}

      {/* KPI cards */}
      <section className="mb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* 1. Concessões — R$ 331,2mi inline */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl px-5 py-4">
            <p className="text-xs text-slate-400 mb-2">Concessões PF</p>
            <p className="text-2xl font-bold text-blue-400">
              {data
                ? (() => {
                    const v = latest(data.pfConcessoes)
                    if (v === null) return '—'
                    return v >= 1000
                      ? `R$ ${(v / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}bi`
                      : `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}mi`
                  })()
                : <span className="animate-pulse text-slate-600">—</span>}
            </p>
            <p className="text-xs text-slate-500 mt-1">no mês</p>
          </div>

          {/* 2. Card duplo lado a lado: Saldo PF | Carteira Total SFN */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden flex">
            {/* Esquerda — Saldo PF */}
            <div className="flex-1 px-4 py-4 border-r border-slate-700/50">
              <p className="text-xs text-slate-400 mb-2 leading-tight">Saldo Carteira PF</p>
              <p className="text-lg font-bold text-blue-400 leading-tight">
                {data
                  ? (() => {
                      const v = latest(data.pfSaldo)
                      if (v === null) return '—'
                      return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}bi`
                    })()
                  : <span className="animate-pulse text-slate-600">—</span>}
              </p>
            </div>
            {/* Direita — Carteira Total SFN */}
            <div className="flex-1 px-4 py-4">
              <p className="text-xs text-slate-400 mb-2 leading-tight">Carteira Total SFN</p>
              <p className="text-lg font-bold text-violet-400 leading-tight">
                {data
                  ? (() => {
                      const v = latest(data.carteiraTotal)
                      if (v === null) return '—'
                      return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}bi`
                    })()
                  : <span className="animate-pulse text-slate-600">—</span>}
              </p>
            </div>
          </div>

          {/* 3. Taxa Média PF — 61,0% inline */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl px-5 py-4">
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              Taxa Média PF <InfoTooltip term="Spread" side="bottom" />
            </p>
            <p className="text-2xl font-bold text-orange-400">
              {data
                ? (() => {
                    const v = latest(data.pfTaxa)
                    return v !== null ? `${v.toFixed(1)}%` : '—'
                  })()
                : <span className="animate-pulse text-slate-600">—</span>}
            </p>
            <p className="text-xs text-slate-500 mt-1">a.a.</p>
          </div>

          {/* 4. Inadimplência PF — 6,9% inline */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl px-5 py-4">
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              Inadimplência PF <InfoTooltip term="Inadimplência" />
            </p>
            <p className="text-2xl font-bold text-red-400">
              {data
                ? (() => {
                    const v = latest(data.pfInadim)
                    return v !== null ? `${v.toFixed(1)}%` : '—'
                  })()
                : <span className="animate-pulse text-slate-600">—</span>}
            </p>
            <p className="text-xs text-slate-500 mt-1">&gt; 90 dias</p>
          </div>

        </div>
      </section>

      {/* ── Crédito Total PF — grid 2×2 ── */}
      <section className="mb-14">
        <div className="flex items-baseline gap-3 mb-1">
          <span className="w-3 h-3 rounded-full flex-shrink-0 mt-1 bg-blue-400" />
          <h2 className="text-lg font-semibold text-slate-200">Crédito e Financiamento Total — Pessoas Físicas</h2>
          {!loading && (
            <span className="text-xs text-slate-500">
              Saldo: {fmtBi(latest(data.pfSaldo))}
              {` · Taxa: ${latest(data.pfTaxa)?.toFixed(2)}% a.a.`}
              {` · Inadimpl.: ${latest(data.pfInadim)?.toFixed(2)}%`}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-5 ml-6">Todas as modalidades · Recursos livres + direcionados · Últimos 5 anos · BCB/SGS</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {loading ? (
            <><Skeleton /><Skeleton /><Skeleton /><Skeleton /></>
          ) : (
            <>
              <SingleLineChart data={data.pfConcessoes} label="Concessões"          unit="R$ mi"   color="#60a5fa" />
              <SingleLineChart data={data.pfSaldo}      label="Saldo da Carteira"   unit="R$ bi"   color="#60a5fa" />
              <SingleLineChart data={data.pfTaxa}       label="Taxa Média de Juros" unit="% a.a."  color="#fb923c" />
              <SingleLineChart data={data.pfInadim}     label="Inadimplência (> 90 dias)" unit="%" color="#f87171" />
            </>
          )}
        </div>
      </section>

      {/* ── Divisor ── */}
      <div className="border-t border-slate-800 mb-14 pt-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Modalidades de Crédito — Pessoas Físicas
        </p>
      </div>

      {/* ── Modalidades PF ── */}
      {loading
        ? Array.from({ length: 3 }).map((_, i) => (
            <section key={i} className="mb-14">
              <div className="h-5 w-64 bg-slate-800 rounded mb-6 animate-pulse" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Skeleton /><Skeleton /><Skeleton /><Skeleton />
              </div>
            </section>
          ))
        : data.modalidades.map(m => (
            <ModalidadeSection key={m.slug} m={m} loading={false} />
          ))
      }

      {/* ── Nota metodológica ── */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 text-xs text-slate-500 mt-4">
        <p className="font-medium text-slate-400 mb-2">Fontes e metodologia</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Concessões: volume de novas operações contratadas no mês (R$ milhões)</li>
          <li>Saldo: estoque total da carteira no fim do mês (R$ bilhões)</li>
          <li>Taxa de juros: média ponderada pelo volume das operações contratadas no mês (% a.a.)</li>
          <li>Inadimplência: percentual de operações com atraso &gt; 90 dias sobre o total da carteira (%)</li>
          <li>Cartão à vista: não possui taxa de juros nem inadimplência pelo critério do BCB — saldo liquidado integralmente no vencimento</li>
          <li>Fonte: Banco Central do Brasil — Sistema Gerenciador de Séries Temporais (SGS)</li>
        </ul>
      </div>
    </div>
  )
}
