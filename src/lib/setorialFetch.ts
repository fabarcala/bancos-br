/**
 * Client-side fetch do BCB/SGS — chamado direto do browser.
 * BCB retorna access-control-allow-origin: * então não precisa de proxy.
 */

const SGS = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs'

export type SGSPoint = { date: string; value: number }

function annualize(monthly: number): number {
  return (Math.pow(1 + monthly / 100, 12) - 1) * 100
}

async function fetchSGS(serie: number, months = 60): Promise<SGSPoint[]> {
  try {
    const res = await fetch(`${SGS}.${serie}/dados/ultimos/${months}?formato=json`)
    if (!res.ok) return []
    const data: { data: string; valor: string }[] = await res.json()
    if (!Array.isArray(data)) return []
    return data.map(d => ({
      date: d.data.slice(3), // "01/01/2026" → "01/2026"
      value: parseFloat(d.valor),
    }))
  } catch {
    return []
  }
}

function toBi(points: SGSPoint[]): SGSPoint[] {
  return points.map(p => ({ ...p, value: Math.round(p.value / 1000) }))
}

function annualizeSeries(points: SGSPoint[]): SGSPoint[] {
  return points.map(p => ({ ...p, value: parseFloat(annualize(p.value).toFixed(2)) }))
}

export type SetorialData = {
  carteiraTotal: SGSPoint[]
  carteiraPF: SGSPoint[]
  carteiraPJ: SGSPoint[]
  inadimTotal: SGSPoint[]
  inadimPF: SGSPoint[]
  inadimPJ: SGSPoint[]
  taxaTotal: SGSPoint[]
  taxaPF: SGSPoint[]
  taxaPJ: SGSPoint[]
  cartCartao: SGSPoint[]
  cartConsignado: SGSPoint[]
  cartImobiliario: SGSPoint[]
  cartVeiculos: SGSPoint[]
  taxaCartaoRot: SGSPoint[]
  taxaConsignado: SGSPoint[]
  taxaImobiliario: SGSPoint[]
  taxaVeiculos: SGSPoint[]
  inadimVeiculos: SGSPoint[]
}

export async function fetchSetorialDataClient(): Promise<SetorialData> {
  const [
    carteiraTotal, carteiraPF, carteiraPJ,
    inadimTotal, inadimPF, inadimPJ,
    taxaTotal, taxaPFraw, taxaPJraw,
    cartCartao, cartConsignado, cartImobiliario, cartVeiculos,
    taxaCartaoRot, taxaConsignado, taxaImobiliarioRaw, taxaVeiculos,
    inadimVeiculos,
  ] = await Promise.all([
    fetchSGS(20539, 60), fetchSGS(20540, 60), fetchSGS(20541, 60),
    fetchSGS(21082, 60), fetchSGS(21084, 60), fetchSGS(21083, 60),
    fetchSGS(20714, 60), fetchSGS(25433, 60), fetchSGS(25434, 60),
    fetchSGS(20590, 60), fetchSGS(20579, 60), fetchSGS(20611, 60), fetchSGS(20581, 60),
    fetchSGS(22022, 60), fetchSGS(20746, 60), fetchSGS(25497, 60), fetchSGS(20751, 60),
    fetchSGS(21121, 60),
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
