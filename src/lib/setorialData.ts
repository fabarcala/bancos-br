const SGS = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs'

export type SGSPoint = { date: string; value: number }
export type MultiSeries = { label: string; color: string; data: SGSPoint[] }[]

// Anualiza taxa mensal: ((1 + r/100)^12 - 1) * 100
function annualize(monthly: number): number {
  return (Math.pow(1 + monthly / 100, 12) - 1) * 100
}

function dateParamsBR(yearsBack: number): string {
  const now = new Date()
  const from = new Date(now)
  from.setFullYear(from.getFullYear() - yearsBack)
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  return `dataInicial=${fmt(from)}&dataFinal=${fmt(now)}`
}

async function fetchSGS(serie: number, yearsBack = 5): Promise<SGSPoint[]> {
  try {
    const params = dateParamsBR(yearsBack)
    const res = await fetch(
      `${SGS}.${serie}/dados?formato=json&${params}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return []
    const data: { data: string; valor: string }[] = await res.json()
    if (!Array.isArray(data)) return []
    return data.map(d => ({
      date: d.data.slice(3),
      value: parseFloat(d.valor),
    }))
  } catch {
    return []
  }
}

// Converte R$ milhões → R$ bilhões (arredondado)
function toBi(points: SGSPoint[]): SGSPoint[] {
  return points.map(p => ({ ...p, value: Math.round(p.value / 1000) }))
}

// Anualiza série mensal de taxa
function annualizeSeries(points: SGSPoint[]): SGSPoint[] {
  return points.map(p => ({ ...p, value: parseFloat(annualize(p.value).toFixed(2)) }))
}

// Valor mais recente da série
export function latestValue(series: SGSPoint[]): number | null {
  return series.length > 0 ? series[series.length - 1].value : null
}

// ── Fetch all ─────────────────────────────────────────────────────

export type SetorialData = {
  // Visão Geral — Carteira
  carteiraTotal: SGSPoint[]
  carteiraPF: SGSPoint[]
  carteiraPJ: SGSPoint[]
  // Visão Geral — Inadimplência
  inadimTotal: SGSPoint[]
  inadimPF: SGSPoint[]
  inadimPJ: SGSPoint[]
  // Visão Geral — Taxa
  taxaTotal: SGSPoint[]
  taxaPF: SGSPoint[]  // já anualizada
  taxaPJ: SGSPoint[]  // já anualizada
  // Produto — Carteira
  cartCartao: SGSPoint[]
  cartConsignado: SGSPoint[]
  cartImobiliario: SGSPoint[]
  cartVeiculos: SGSPoint[]
  // Produto — Taxa
  taxaCartaoRot: SGSPoint[]
  taxaConsignado: SGSPoint[]
  taxaImobiliario: SGSPoint[]  // já anualizada
  taxaVeiculos: SGSPoint[]
  // Produto — Inadimplência
  inadimVeiculos: SGSPoint[]
}

export async function fetchSetorialData(): Promise<SetorialData> {
  const [
    carteiraTotal, carteiraPF, carteiraPJ,
    inadimTotal, inadimPF, inadimPJ,
    taxaTotal, taxaPFraw, taxaPJraw,
    cartCartao, cartConsignado, cartImobiliario, cartVeiculos,
    taxaCartaoRot, taxaConsignado, taxaImobiliarioRaw, taxaVeiculos,
    inadimVeiculos,
  ] = await Promise.all([
    fetchSGS(20539), fetchSGS(20540), fetchSGS(20541),
    fetchSGS(21082), fetchSGS(21084), fetchSGS(21083),
    fetchSGS(20714), fetchSGS(25433), fetchSGS(25434),
    fetchSGS(20590), fetchSGS(20579), fetchSGS(20611), fetchSGS(20581),
    fetchSGS(22022), fetchSGS(20746), fetchSGS(25497), fetchSGS(20751),
    fetchSGS(21121),
  ])

  return {
    carteiraTotal: toBi(carteiraTotal),
    carteiraPF: toBi(carteiraPF),
    carteiraPJ: toBi(carteiraPJ),
    inadimTotal, inadimPF, inadimPJ,
    taxaTotal,
    taxaPF: annualizeSeries(taxaPFraw),
    taxaPJ: annualizeSeries(taxaPJraw),
    cartCartao: toBi(cartCartao),
    cartConsignado: toBi(cartConsignado),
    cartImobiliario: toBi(cartImobiliario),
    cartVeiculos: toBi(cartVeiculos),
    taxaCartaoRot,
    taxaConsignado,
    taxaImobiliario: annualizeSeries(taxaImobiliarioRaw),
    taxaVeiculos,
    inadimVeiculos,
  }
}
