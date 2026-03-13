/**
 * focusEvolution.ts
 * Busca a evolução semanal das projeções do Focus para os indicadores principais.
 * Retorna as últimas N semanas (sextas-feiras) para cada indicador × ano de referência.
 */

const FOCUS_BASE = 'https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata'

export type FocusWeekPoint = {
  date: string   // YYYY-MM-DD
  mediana: number
}

export type FocusEvolutionSeries = {
  indicador: string
  label: string
  unit: string
  anoRef: string
  semanas: FocusWeekPoint[]  // ordem cronológica, últimas N semanas
}

// Indicadores × anos de referência que queremos exibir
const EVOLUTION_CONFIG: { key: string; label: string; unit: string; anos: string[] }[] = [
  { key: 'IPCA',      label: 'IPCA',            unit: '%',      anos: ['2026', '2027'] },
  { key: 'Selic',     label: 'Selic',           unit: '% a.a.', anos: ['2026', '2027'] },
  { key: 'Câmbio',    label: 'Câmbio (R$/US$)',  unit: 'R$',     anos: ['2026', '2027'] },
  { key: 'PIB Total', label: 'PIB',              unit: '%',      anos: ['2026', '2027'] },
]

/**
 * Dado um array de datas YYYY-MM-DD (ordenadas desc), retorna apenas as
 * "datas de referência semanais" — uma por semana (a mais recente de cada semana ISO).
 */
function filtrarSemanas(dates: string[], maxSemanas = 8): string[] {
  const vistas = new Set<string>()
  const resultado: string[] = []
  for (const d of dates) {
    // Semana ISO: YYYY-Www
    const dt = new Date(d + 'T12:00:00Z')
    const year = dt.getUTCFullYear()
    const startOfYear = new Date(Date.UTC(year, 0, 1))
    const weekNum = Math.ceil(((dt.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getUTCDay() + 1) / 7)
    const semKey = `${year}-W${String(weekNum).padStart(2, '0')}`
    if (!vistas.has(semKey)) {
      vistas.add(semKey)
      resultado.push(d)
    }
    if (resultado.length >= maxSemanas) break
  }
  return resultado.reverse() // cronológico
}

export async function fetchFocusEvolution(): Promise<FocusEvolutionSeries[]> {
  const results: FocusEvolutionSeries[] = []

  await Promise.all(
    EVOLUTION_CONFIG.flatMap(({ key, label, unit, anos }) =>
      anos.map(async (anoRef) => {
        try {
          const filter = `baseCalculo eq 0 and Indicador eq '${encodeURIComponent(key)}' and DataReferencia eq '${anoRef}'`
          const url = `${FOCUS_BASE}/ExpectativasMercadoAnuais?$top=56&$filter=${encodeURIComponent(filter)}&$orderby=Data%20desc&$format=json&$select=Data,Mediana`
          const res = await fetch(url)
          if (!res.ok) return
          const json = await res.json()

          const allDates: string[] = (json.value as { Data: string; Mediana: number }[]).map(v => v.Data)
          const semanas = filtrarSemanas(allDates, 8)

          const byDate = Object.fromEntries(
            (json.value as { Data: string; Mediana: number }[]).map(v => [v.Data, v.Mediana])
          )

          results.push({
            indicador: key,
            label,
            unit,
            anoRef,
            semanas: semanas.map(d => ({ date: d, mediana: byDate[d] })),
          })
        } catch { /* skip */ }
      })
    )
  )

  // Ordena: por indicador, depois por anoRef
  results.sort((a, b) => {
    const keyOrder = ['IPCA', 'Selic', 'Câmbio', 'PIB Total']
    const ai = keyOrder.indexOf(a.indicador)
    const bi = keyOrder.indexOf(b.indicador)
    if (ai !== bi) return ai - bi
    return a.anoRef.localeCompare(b.anoRef)
  })

  return results
}
