import type { Metadata } from 'next'
import SetorialPageClient from '@/components/SetorialPageClient'

const CANONICAL = 'https://bancos-app.vercel.app/setorial'

export const metadata: Metadata = {
  title: 'Indicadores do SFN — Crédito, Inadimplência e Taxas de Juros',
  description: 'Evolução mensal da carteira de crédito, inadimplência e taxas de juros do SFN por modalidade. Dados do Banco Central do Brasil.',
  alternates: { canonical: CANONICAL },
}

export default function SetorialPage() {
  return <SetorialPageClient />
}
