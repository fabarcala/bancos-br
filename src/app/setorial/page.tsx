import type { Metadata } from 'next'
import SetorialPageClient from '@/components/SetorialPageClient'

export const metadata: Metadata = {
  title: 'Dados Setoriais PF — Crédito, Inadimplência e Taxas por Modalidade | BancosBR',
  description: 'Acompanhe a evolução mensal de concessões, saldo da carteira, taxa de juros e inadimplência por modalidade de crédito para Pessoas Físicas no Brasil. Dados do Banco Central do Brasil.',
}

export default function SetorialPage() {
  return <SetorialPageClient />
}
