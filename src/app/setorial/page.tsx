import type { Metadata } from 'next'
import SetorialPageClient from '@/components/SetorialPageClient'

export const metadata: Metadata = {
  title: 'Indicadores do SFN — Crédito, Inadimplência e Taxas de Juros',
  description: 'Acompanhe a evolução mensal da carteira de crédito, inadimplência e taxas de juros do Sistema Financeiro Nacional. Dados do Banco Central do Brasil por modalidade.',
}

export default function SetorialPage() {
  return <SetorialPageClient />
}
