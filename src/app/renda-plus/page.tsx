import type { Metadata } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'
import RendaPlusClient from '@/components/RendaPlusClient'

// Revalida a cada 24h — GitHub Actions atualiza diariamente
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Tesouro Renda+ 2064 — Taxa e Preço Diário | BancosBR',
  description: 'Evolução diária da taxa de juros e preço unitário do Tesouro Renda+ Aposentadoria Extra 2064. Dados oficiais do Tesouro Nacional.',
}

export default function RendaPlusPage() {
  const raw  = readFileSync(join(process.cwd(), 'data', 'renda_plus_2064.json'), 'utf-8')
  const data = JSON.parse(raw)
  return <RendaPlusClient data={data} />
}
