import { fetchSetorialData, latestValue } from '@/lib/setorialData'
import { MultiSeriesChart, SingleLineChart, KPICard } from '@/components/SetorialChart'
import { Activity } from 'lucide-react'

export const revalidate = 3600

export default async function SetorialPage() {
  const d = await fetchSetorialData()

  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-6 h-6 text-emerald-400" />
          <h1 className="text-3xl font-bold text-white">Indicadores Setoriais</h1>
        </div>
        <p className="text-slate-400 text-lg">
          Crédito, taxas de juros e inadimplência do Sistema Financeiro Nacional — dados mensais do Banco Central
        </p>
      </div>

      {/* KPI cards de destaque */}
      <section className="mb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Carteira Total SFN"
            value={latestValue(d.carteiraTotal)}
            unit="R$ bi"
            color="#60a5fa"
          />
          <KPICard
            label="Inadimplência Total"
            value={latestValue(d.inadimTotal)}
            unit="%"
            sub="> 90 dias"
            color="#f87171"
          />
          <KPICard
            label="Taxa Média Total"
            value={latestValue(d.taxaTotal)}
            unit="% a.a."
            color="#fb923c"
          />
          <KPICard
            label="Inadimplência PF"
            value={latestValue(d.inadimPF)}
            unit="%"
            sub="Pessoas Físicas"
            color="#f472b6"
          />
        </div>
      </section>

      {/* ── Visão Geral ──────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold text-slate-300 mb-1">Visão Geral do SFN</h2>
        <p className="text-xs text-slate-500 mb-6">Últimos 5 anos · dados mensais · Fonte: BCB/SGS</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carteira PF vs PJ */}
          <MultiSeriesChart
            label="Carteira de Crédito"
            unit="R$ bi"
            height={240}
            series={[
              { label: 'Pessoas Físicas', color: '#60a5fa', data: d.carteiraPF },
              { label: 'Pessoas Jurídicas', color: '#a78bfa', data: d.carteiraPJ },
            ]}
          />
          {/* Inadimplência PF vs PJ */}
          <MultiSeriesChart
            label="Inadimplência"
            unit="%"
            height={240}
            series={[
              { label: 'Total', color: '#f87171', data: d.inadimTotal },
              { label: 'PF', color: '#fb923c', data: d.inadimPF },
              { label: 'PJ', color: '#fbbf24', data: d.inadimPJ },
            ]}
          />
          {/* Taxa média PF vs PJ */}
          <MultiSeriesChart
            label="Taxa Média de Juros"
            unit="% a.a."
            height={240}
            series={[
              { label: 'Total', color: '#f87171', data: d.taxaTotal },
              { label: 'PF', color: '#fb923c', data: d.taxaPF },
              { label: 'PJ', color: '#fbbf24', data: d.taxaPJ },
            ]}
          />
        </div>
      </section>

      {/* ── Cartão de Crédito ────────────────────────────────────── */}
      <section className="mb-14">
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="text-lg font-semibold text-slate-300">Cartão de Crédito</h2>
          <span className="text-xs text-slate-500">
            Carteira: R$ {latestValue(d.cartCartao)?.toLocaleString('pt-BR')} bi
            · Taxa rotativo: {latestValue(d.taxaCartaoRot)?.toFixed(0)}% a.a.
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-6">Recursos livres · Pessoas Físicas</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SingleLineChart
            data={d.cartCartao}
            label="Carteira"
            unit="R$ bi"
            color="#60a5fa"
          />
          <SingleLineChart
            data={d.taxaCartaoRot}
            label="Taxa — Crédito Rotativo"
            unit="% a.a."
            color="#f87171"
          />
        </div>
      </section>

      {/* ── Consignado ───────────────────────────────────────────── */}
      <section className="mb-14">
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="text-lg font-semibold text-slate-300">Crédito Consignado</h2>
          <span className="text-xs text-slate-500">
            Carteira: R$ {latestValue(d.cartConsignado)?.toLocaleString('pt-BR')} bi
            · Taxa: {latestValue(d.taxaConsignado)?.toFixed(1)}% a.a.
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-6">Recursos livres · Pessoas Físicas</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SingleLineChart
            data={d.cartConsignado}
            label="Carteira"
            unit="R$ bi"
            color="#34d399"
          />
          <SingleLineChart
            data={d.taxaConsignado}
            label="Taxa Média"
            unit="% a.a."
            color="#fb923c"
          />
        </div>
      </section>

      {/* ── Financiamento Imobiliário ────────────────────────────── */}
      <section className="mb-14">
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="text-lg font-semibold text-slate-300">Financiamento Imobiliário</h2>
          <span className="text-xs text-slate-500">
            Carteira: R$ {latestValue(d.cartImobiliario)?.toLocaleString('pt-BR')} bi
            · Taxa: {latestValue(d.taxaImobiliario)?.toFixed(1)}% a.a.
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-6">Recursos direcionados · Pessoas Físicas</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SingleLineChart
            data={d.cartImobiliario}
            label="Carteira"
            unit="R$ bi"
            color="#a78bfa"
          />
          <SingleLineChart
            data={d.taxaImobiliario}
            label="Taxa Média"
            unit="% a.a."
            color="#fb923c"
          />
        </div>
      </section>

      {/* ── Veículos ─────────────────────────────────────────────── */}
      <section className="mb-14">
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="text-lg font-semibold text-slate-300">Aquisição de Veículos</h2>
          <span className="text-xs text-slate-500">
            Carteira: R$ {latestValue(d.cartVeiculos)?.toLocaleString('pt-BR')} bi
            · Taxa: {latestValue(d.taxaVeiculos)?.toFixed(1)}% a.a.
            · Inadimplência: {latestValue(d.inadimVeiculos)?.toFixed(1)}%
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-6">Recursos livres · Pessoas Físicas</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SingleLineChart
            data={d.cartVeiculos}
            label="Carteira"
            unit="R$ bi"
            color="#fbbf24"
          />
          <SingleLineChart
            data={d.taxaVeiculos}
            label="Taxa Média"
            unit="% a.a."
            color="#fb923c"
          />
          <SingleLineChart
            data={d.inadimVeiculos}
            label="Inadimplência"
            unit="%"
            color="#f87171"
          />
        </div>
      </section>

      {/* Nota de rodapé */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 text-xs text-slate-500">
        <p className="font-medium text-slate-400 mb-1">Fontes e metodologia</p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>Carteira de crédito: saldo total, recursos livres + direcionados (SGS 20539–20541, 20579–20611)</li>
          <li>Inadimplência: percentual de operações com atraso &gt; 90 dias sobre o total da carteira (SGS 21082–21121)</li>
          <li>Taxas de juros: média ponderada das operações contratadas no mês (SGS 20714, 22022, 20746, 25497, 20751)</li>
          <li>Atualização automática a cada hora · Fonte: Banco Central do Brasil</li>
        </ul>
      </div>
    </div>
  )
}
