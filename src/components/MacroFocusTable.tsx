'use client'

import { MACRO_INDICATORS, FocusRow } from '@/lib/macroData'

const ANOS = ['2026', '2027', '2028', '2029']

function fmt(val: number | null | undefined, decimals: number): string {
  if (val == null) return '—'
  return val.toFixed(decimals)
}

export function MacroFocusTable({
  focusDate,
  rows,
}: {
  focusDate: string
  rows: FocusRow[]
}) {
  const dateFormatted = new Date(focusDate + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
        <div>
          <h2 className="text-base font-semibold text-white">Expectativas de Mercado</h2>
          <p className="text-xs text-slate-400 mt-0.5">Boletim Focus — Mediana dos analistas</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Última publicação</p>
          <p className="text-sm font-medium text-blue-400">{dateFormatted}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left px-6 py-3 text-slate-400 font-medium w-52">Indicador</th>
              {ANOS.map(ano => (
                <th key={ano} className="text-center px-4 py-3 text-slate-300 font-semibold">
                  {ano}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const ind = MACRO_INDICATORS.find(x => x.key === row.indicador)
              if (!ind) return null
              return (
                <tr
                  key={row.indicador}
                  className={`border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors ${
                    i === 0 ? 'bg-slate-800/20' : ''
                  }`}
                >
                  <td className="px-6 py-3">
                    <span className="font-medium text-slate-200">{ind.label}</span>
                    <span className="ml-2 text-xs text-slate-500">{ind.unit}</span>
                  </td>
                  {ANOS.map(ano => {
                    const entry = row.anos[ano]
                    return (
                      <td key={ano} className="text-center px-4 py-3">
                        {entry ? (
                          <div>
                            <span className="font-semibold text-white tabular-nums">
                              {fmt(entry.mediana, ind.decimals)}
                            </span>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {entry.respondentes} resp.
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-slate-800/60">
        <p className="text-xs text-slate-500">
          Fonte:{' '}
          <a
            href="https://www.bcb.gov.br/publicacoes/focus"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Relatório Focus — Banco Central do Brasil
          </a>
          . Mediana das expectativas de mercado para o fim de cada ano.
        </p>
      </div>
    </div>
  )
}
