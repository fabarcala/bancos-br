import { Bank, KPIKey } from './types'

export type KPIMode = 'quarterly' | 'ltm'

// KPIs que se somam ao longo de 4 trimestres no modo L12M
export const FLOW_KPIS: KPIKey[] = ['lucro_liquido_recorrente', 'margem_financeira', 'receita_servicos']
import itauData from '../../data/itau.json'
import bradescuData from '../../data/bradesco.json'
import bbData from '../../data/bb.json'
import btgData from '../../data/btg.json'
import santanderData from '../../data/santander.json'
import bvData from '../../data/bv.json'

export const ALL_BANKS: Bank[] = [
  itauData as Bank,
  bradescuData as Bank,
  bbData as Bank,
  btgData as Bank,
  santanderData as Bank,
  bvData as Bank,
]

export function getBankByTicker(ticker: string): Bank | undefined {
  return ALL_BANKS.find(b => b.ticker === ticker)
}

export function formatPeriod(period: string): string {
  // "2025-Q4" -> "4T25"
  const m = period.match(/^(\d{4})-Q(\d)$/)
  if (m) return `${m[2]}T${m[1].slice(2)}`
  return period
}

export function formatValue(value: number | null | undefined, kpiKey: KPIKey): string {
  if (value === null || value === undefined) return '—'
  
  const formats: Record<KPIKey, (v: number) => string> = {
    lucro_liquido_recorrente: v => `R$ ${v.toFixed(1)}bi`,
    roe: v => `${(v * 100).toFixed(1)}%`,
    indice_eficiencia: v => `${(v * 100).toFixed(1)}%`,
    carteira_credito: v => `R$ ${v.toFixed(0)}bi`,
    margem_financeira: v => `R$ ${v.toFixed(1)}bi`,
    total_ativos: v => `R$ ${v.toFixed(0)}bi`,
    pl: v => `R$ ${v.toFixed(0)}bi`,
    inadimplencia_90d: v => `${(v * 100).toFixed(1)}%`,
    basileia: v => `${(v * 100).toFixed(1)}%`,
    receita_servicos: v => `R$ ${v.toFixed(1)}bi`,
    aum: v => `R$ ${v.toFixed(0)}bi`,
  }
  
  const fn = formats[kpiKey]
  return fn ? fn(value) : value.toString()
}

export function getLatestValue(bank: Bank, kpi: KPIKey): number | null {
  const series = bank.kpis[kpi]
  if (!series) return null
  const keys = Object.keys(series).sort()
  for (let i = keys.length - 1; i >= 0; i--) {
    const v = series[keys[i]]
    if (v !== null && v !== undefined) return v
  }
  return null
}

export function getSeriesForChart(bank: Bank, kpi: KPIKey): { period: string; value: number | null }[] {
  const series = bank.kpis[kpi]
  if (!series) return []
  return Object.entries(series)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, value]) => ({ period: formatPeriod(period), value }))
}

export function getAllPeriods(banks: Bank[], kpi: KPIKey): string[] {
  const periodsSet = new Set<string>()
  banks.forEach(bank => {
    const series = bank.kpis[kpi]
    if (series) Object.keys(series).forEach(p => periodsSet.add(p))
  })
  return Array.from(periodsSet).sort().map(formatPeriod)
}

export function getComparativeData(banks: Bank[], kpi: KPIKey) {
  const allPeriodsRaw = new Set<string>()
  banks.forEach(bank => {
    const series = bank.kpis[kpi]
    if (series) Object.keys(series).forEach(p => allPeriodsRaw.add(p))
  })
  const periods = Array.from(allPeriodsRaw).sort()

  return periods.map(rawPeriod => {
    const row: Record<string, number | null | string> = {
      period: formatPeriod(rawPeriod),
    }
    banks.forEach(bank => {
      const series = bank.kpis[kpi]
      row[bank.ticker] = series?.[rawPeriod] ?? null
    })
    return row
  })
}

export function getLastNPeriods(data: ReturnType<typeof getComparativeData>, n: number) {
  return data.slice(-n)
}

/** Retorna todos os períodos brutos disponíveis (mais recente primeiro) */
export function getAllRawPeriods(banks: Bank[]): string[] {
  const set = new Set<string>()
  banks.forEach(bank => {
    Object.values(bank.kpis).forEach(series => {
      if (series) Object.keys(series).forEach(p => set.add(p))
    })
  })
  return Array.from(set).sort().reverse()
}

/** Valor de um KPI num período específico */
export function getValueForPeriod(bank: Bank, kpi: KPIKey, rawPeriod: string): number | null {
  return bank.kpis[kpi]?.[rawPeriod] ?? null
}

/**
 * Valor L12M: KPIs de fluxo somam os 4 trimestres terminando em rawPeriod.
 * KPIs de ratio/stock retornam o valor do período.
 */
export function getLTMValue(bank: Bank, kpi: KPIKey, rawPeriod: string): number | null {
  if (!FLOW_KPIS.includes(kpi)) {
    return getValueForPeriod(bank, kpi, rawPeriod)
  }
  const series = bank.kpis[kpi]
  if (!series) return null
  const allPeriods = Object.keys(series).sort()
  const idx = allPeriods.indexOf(rawPeriod)
  if (idx < 0) return null
  const last4 = allPeriods.slice(Math.max(0, idx - 3), idx + 1)
  if (last4.length < 4) return null // dados insuficientes
  let sum = 0
  for (const p of last4) {
    const v = series[p]
    if (v == null) return null
    sum += v
  }
  return sum
}
