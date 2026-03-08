import { Metadata } from 'next'
import { InfoTooltip } from '@/components/InfoTooltip'

import itauRaw    from '../../../data/itau_historico.json'
import bradecoRaw from '../../../data/bradesco_historico.json'
import sanRaw     from '../../../data/santander_historico.json'
import bvRaw      from '../../../data/bv_historico.json'

export const metadata: Metadata = {
  title: 'Ranking dos bancos brasileiros — ROAE, NPL, Basileia, Eficiência | BancosBR',
  description: 'Ranking comparativo dos principais bancos brasileiros por rentabilidade, inadimplência, capital e eficiência operacional.',
}

const BANCO_COLORS: Record<string, string> = {
  'Itaú':      '#f97316',
  'Bradesco':  '#3b82f6',
  'Santander': '#ef4444',
  'BV':        '#22c55e',
}

type BankEntry = {
  banco: string
  ticker: string
  trimestres: Record<string, Record<string, Record<string, number | null>>>
}

function getVal(data: BankEntry, tri: string, section: string, field: string): number | null {
  return data.trimestres?.[tri]?.[section]?.[field] ?? null
}

const LATEST = '4T25'
const PREV   = '4T24'

const ALL = [
  { nome: 'Itaú',      data: itauRaw    as BankEntry },
  { nome: 'Bradesco',  data: bradecoRaw as BankEntry },
  { nome: 'Santander', data: sanRaw     as BankEntry },
  { nome: 'BV',        data: bvRaw      as BankEntry },
]

type RankItem = { banco: string; value: number; formatted: string }

function buildRanking(
  getter: (b: typeof ALL[0]) => number | null,
  formatter: (v: number) => string,
  ascending = false
): RankItem[] {
  const filtered = ALL
    .map(b => ({ banco: b.nome, value: getter(b) }))
    .filter((b): b is { banco: string; value: number } => b.value != null)
  filtered.sort((a, b) => ascending ? a.value - b.value : b.value - a.value)
  return filtered.map(b => ({ ...b, formatted: formatter(b.value) }))
}

function pct(v: number) { return `${v.toFixed(1)}%` }
function bi(v: number)  { return `R$ ${v.toFixed(0)} bi` }
function mi(v: number)  { return `R$ ${(v / 1000).toFixed(1)} bi` }

const roaeRank    = buildRanking(b => getVal(b.data, LATEST, 'indicadores', 'roae_consolidado_pct'), pct)
const nplRank     = buildRanking(b => getVal(b.data, LATEST, 'qualidade',   'npl_90d_total_pct'),    pct, true)
const basileiaRank= buildRanking(b => getVal(b.data, LATEST, 'capital',     'basileia_pct'),         pct)
const ieRank      = buildRanking(b => getVal(b.data, LATEST, 'indicadores', 'indice_eficiencia_pct'),pct, true)
const lucroRank   = buildRanking(b => getVal(b.data, LATEST, 'dre',        'resultado_recorrente_gerencial'), mi)
const carteiraRank= buildRanking(b => getVal(b.data, LATEST, 'carteira',    'total'),                bi)

function crescimento(b: typeof ALL[0]): number | null {
  const now  = getVal(b.data, LATEST, 'carteira', 'total')
  const prev = getVal(b.data, PREV,   'carteira', 'total')
  if (now == null || prev == null || prev === 0) return null
  return ((now - prev) / prev) * 100
}
const crescRank = buildRanking(crescimento, v => `${v.toFixed(1)}%`)

interface RankCardProps {
  title: string
  subtitle: string
  tip?: string
  items: RankItem[]
  ascending?: boolean
  period?: string
}

function RankCard({ title, subtitle, tip, items, period = LATEST }: RankCardProps) {
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
      <div className="mb-4">
        <div className="flex items-center gap-1">
          <h2 className="text-white font-semibold text-base">{title}</h2>
          {tip && <InfoTooltip term={tip} />}
        </div>
        <p className="text-slate-500 text-xs mt-0.5">{subtitle} · {period}</p>
      </div>
      <ol className="space-y-2.5">
        {items.map((item, i) => (
          <li key={item.banco} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-base w-6 text-center">{medals[i] ?? `${i + 1}.`}</span>
              <span
                className="text-sm font-semibold"
                style={{ color: BANCO_COLORS[item.banco] ?? '#94a3b8' }}
              >
                {item.banco}
              </span>
            </div>
            <span className="text-white text-sm font-mono">{item.formatted}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function RankingPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-1">Ranking dos Bancos</h1>
        <p className="text-slate-400 text-lg mb-0.5">Destaque por Indicador — {LATEST}</p>
        <p className="text-slate-500 text-sm">Fonte: Earnings releases dos bancos · Dados gerenciais/recorrentes</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <RankCard
          title="Maior Rentabilidade"
          subtitle="ROAE — Retorno sobre PL"
          tip="ROAE"
          items={roaeRank}
        />
        <RankCard
          title="Menor Inadimplência"
          subtitle="NPL &gt;90 dias — quanto menor melhor"
          tip="NPL"
          items={nplRank}
        />
        <RankCard
          title="Maior Eficiência"
          subtitle="Índice de Eficiência — quanto menor melhor"
          tip="IE"
          items={ieRank}
        />
        <RankCard
          title="Maior Capital Regulatório"
          subtitle="Índice de Basileia III"
          tip="Basileia"
          items={basileiaRank}
        />
        <RankCard
          title="Maior Lucro Líquido"
          subtitle="Resultado recorrente/gerencial"
          items={lucroRank}
        />
        <RankCard
          title="Maior Crescimento de Carteira"
          subtitle="Variação 4T25 vs 4T24"
          items={crescRank}
          period={`${PREV} → ${LATEST}`}
        />
      </div>

      <p className="text-slate-600 text-xs mt-10 text-center">
        Santander: ROAE excluindo ágio
      </p>
    </div>
  )
}
