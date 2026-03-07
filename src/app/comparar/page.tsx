import { readFileSync } from 'fs'
import { join } from 'path'
import ItauComparativoTable from '@/components/ItauComparativoTable'

export const revalidate = 3600

export default function ComparativoPage() {
  const raw = readFileSync(join(process.cwd(), 'data', 'itau_historico.json'), 'utf-8')
  const data = JSON.parse(raw)

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Comparativo de Resultados</h1>
          <p className="text-gray-400 text-sm mt-1">
            Selecione os períodos para comparar. Δ mostra a variação entre os períodos selecionados.
            L12M = soma (DRE) ou último valor (balanço/indicadores) dos últimos 4 trimestres disponíveis.
          </p>
        </div>

        <ItauComparativoTable data={data} />
      </div>
    </main>
  )
}
