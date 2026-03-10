import type { Metadata } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'
import CurvaJurosClient from '@/components/CurvaJurosClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Curva de Juros — DI Prefixado (ETTJ) | BancosBR',
  description: 'Evolução da curva de juros prefixada brasileira (ETTJ) nos últimos 10 pregões. Dados oficiais da ANBIMA, atualizados diariamente.',
}

export default function CurvaJurosPage() {
  const raw = readFileSync(join(process.cwd(), 'data', 'curva_juros.json'), 'utf-8')
  const data = JSON.parse(raw)
  return <CurvaJurosClient data={data} />
}
