import { readFileSync } from 'fs'
import { join } from 'path'
import ComparativoTable from '@/components/ComparativoTable'

export const revalidate = 3600

const BANKS = ['itau', 'bradesco', 'santander', 'bb', 'bv', 'btg']

const BANK_META: Record<string, { name: string; ticker: string }> = {
  itau:     { name: 'Itaú',            ticker: 'ITUB4'  },
  bradesco: { name: 'Bradesco',        ticker: 'BBDC4'  },
  santander:{ name: 'Santander',       ticker: 'SANB11' },
  bb:       { name: 'Banco do Brasil', ticker: 'BBAS3'  },
  bv:       { name: 'BV',             ticker: 'BV'     },
  btg:      { name: 'BTG Pactual',    ticker: 'BPAC11' },
}

function loadBank(ticker: string) {
  const path = join(process.cwd(), 'data', `${ticker}.json`)
  return JSON.parse(readFileSync(path, 'utf-8'))
}

export default function ComparativoPage() {
  const banksData = BANKS.map(ticker => {
    const raw = loadBank(ticker)
    return {
      ticker,
      name: BANK_META[ticker].name,
      stockTicker: BANK_META[ticker].ticker,
      kpis: raw.kpis as Record<string, Record<string, number>>,
    }
  })

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="max-w-[1800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Comparativo</h1>
        <p className="text-slate-400 text-sm mb-6">
          4T25 vs 3T25 (ΔTri) · 4T25 vs 4T24 (ΔYoY)
        </p>
        <ComparativoTable banks={banksData} />
      </div>
    </div>
  )
}
