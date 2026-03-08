/**
 * Client-side fetch do BCB/Focus — chamado direto do browser.
 * BCB retorna access-control-allow-origin: * então não precisa de proxy.
 */

const FOCUS_BASE = 'https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata'
const SGS_BASE = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs'

export type MacroIndicator = {
  key: string
  label: string
  unit: string
  decimals: number
}

export const MACRO_INDICATORS: MacroIndicator[] = [
  { key: 'IPCA',                label: 'IPCA',                unit: '%',      decimals: 2 },
  { key: 'PIB Total',           label: 'PIB Total',            unit: '%',      decimals: 2 },
  { key: 'Câmbio',              label: 'Câmbio (R$/US$)',      unit: 'R$',     decimals: 2 },
  { key: 'Selic',               label: 'Selic',                unit: '% a.a.', decimals: 2 },
  { key: 'IGP-M',               label: 'IGP-M',                unit: '%',      decimals: 2 },
  { key: 'IPCA Administrados',  label: 'IPCA Administrados',   unit: '%',      decimals: 2 },
]

export type FocusRow = {
  indicador: string
  anos: Record<string, { mediana: number; respondentes: number } | null>
}

export type ChartDataPoint = {
  year: string
  historical?: number | null
  projected?: number | null
}

export type MacroChartSeries = {
  indicador: string
  label: string
  unit: string
  data: ChartDataPoint[]
}

async function fetchSGS(serie: number, params: string): Promise<{ data: string; valor: string }[]> {
  try {
    const res = await fetch(`${SGS_BASE}.${serie}/dados?formato=json&${params}`)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

async function fetchIPCAHistorical(): Promise<Record<number, number>> {
  const data = await fetchSGS(13522, 'dataInicial=01/12/2010&dataFinal=01/12/2025')
  const result: Record<number, number> = {}
  for (const d of data) {
    const parts = d.data.split('/')
    if (parts[1] === '12') result[parseInt(parts[2])] = parseFloat(d.valor)
  }
  return result
}

async function fetchPIBHistorical(): Promise<Record<number, number>> {
  const data = await fetchSGS(7326, '')
  const result: Record<number, number> = {}
  for (const d of data) {
    const year = parseInt(d.data.split('/')[2])
    if (year >= 2010) result[year] = parseFloat(d.valor)
  }
  return result
}

async function fetchYearEndSGS(serie: number, years: number[]): Promise<Record<number, number>> {
  const result: Record<number, number> = {}
  await Promise.all(years.map(async (year) => {
    try {
      const res = await fetch(`${SGS_BASE}.${serie}/dados?formato=json&dataInicial=20/12/${year}&dataFinal=31/12/${year}`)
      if (!res.ok) return
      const data: { data: string; valor: string }[] = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        result[year] = parseFloat(data[data.length - 1].valor)
      }
    } catch { /* skip */ }
  }))
  return result
}

async function fetchFocusLatestDate(): Promise<string> {
  const res = await fetch(
    `${FOCUS_BASE}/ExpectativasMercadoAnuais?$top=1&$filter=baseCalculo eq 0&$orderby=Data desc&$format=json&$select=Data`
  )
  const json = await res.json()
  return json.value[0].Data as string
}

async function fetchFocusProjections(latestDate: string): Promise<Record<string, Record<string, { mediana: number; respondentes: number }>>> {
  const indicators = MACRO_INDICATORS.map(i => `Indicador eq '${encodeURIComponent(i.key)}'`).join(' or ')
  const url = `${FOCUS_BASE}/ExpectativasMercadoAnuais?$filter=Data eq '${latestDate}' and baseCalculo eq 0 and (${indicators})&$format=json&$select=Indicador,DataReferencia,Mediana,numeroRespondentes&$top=200`
  const res = await fetch(url)
  const json = await res.json()

  const result: Record<string, Record<string, { mediana: number; respondentes: number }>> = {}
  for (const item of json.value) {
    if (!result[item.Indicador]) result[item.Indicador] = {}
    result[item.Indicador][item.DataReferencia] = {
      mediana: item.Mediana,
      respondentes: item.numeroRespondentes,
    }
  }
  return result
}

export async function fetchMacroDataClient(): Promise<{
  focusDate: string
  focusRows: FocusRow[]
  chartSeries: MacroChartSeries[]
}> {
  const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
  const PROJ_YEARS = [2026, 2027, 2028, 2029]

  const [focusDate, ipcaHist, pibHist, cambioHist, selicHist] = await Promise.all([
    fetchFocusLatestDate(),
    fetchIPCAHistorical(),
    fetchPIBHistorical(),
    fetchYearEndSGS(1, YEARS),
    fetchYearEndSGS(4189, YEARS),
  ])

  const focusProj = await fetchFocusProjections(focusDate)

  const focusRows: FocusRow[] = MACRO_INDICATORS.map(ind => ({
    indicador: ind.key,
    anos: Object.fromEntries(
      PROJ_YEARS.map(yr => [
        String(yr),
        focusProj[ind.key]?.[String(yr)]
          ? { mediana: focusProj[ind.key][String(yr)].mediana, respondentes: focusProj[ind.key][String(yr)].respondentes }
          : null,
      ])
    ),
  }))

  const historicalByIndicator: Record<string, Record<number, number>> = {
    'IPCA': ipcaHist,
    'PIB Total': pibHist,
    'Câmbio': cambioHist,
    'Selic': selicHist,
  }

  const chartIndicators = MACRO_INDICATORS.slice(0, 4)

  const chartSeries: MacroChartSeries[] = chartIndicators.map(ind => {
    const hist = historicalByIndicator[ind.key] ?? {}
    const proj = focusProj[ind.key] ?? {}

    const data: ChartDataPoint[] = [
      ...YEARS.map(yr => ({
        year: String(yr),
        historical: hist[yr] ?? null,
        projected: null,
      })),
      ...PROJ_YEARS.map(yr => ({
        year: String(yr),
        historical: null,
        projected: proj[String(yr)]?.mediana ?? null,
      })),
    ]

    const last = data.find(d => d.year === '2025')
    const first = data.find(d => d.year === '2026')
    if (last?.historical != null && first?.projected != null) {
      last.projected = last.historical
    }

    return { indicador: ind.key, label: ind.label, unit: ind.unit, data }
  })

  return { focusDate, focusRows, chartSeries }
}
