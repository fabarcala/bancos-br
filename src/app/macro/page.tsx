import MacroPageClient from '@/components/MacroPageClient'

export const metadata = {
  title: 'Indicadores macroeconômicos do Brasil — Selic, IPCA, PIB | BancosBR',
  description: 'Expectativas de mercado (Boletim Focus) e histórico de Selic, IPCA, PIB e câmbio — dados do Banco Central do Brasil.',
}

export default function MacroPage() {
  return <MacroPageClient />
}
