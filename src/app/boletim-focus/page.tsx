import type { Metadata } from 'next'
import MacroPageClient from '@/components/MacroPageClient'

const CANONICAL = 'https://bancos-app.vercel.app/boletim-focus'

export const metadata: Metadata = {
  title: 'Boletim Focus — Projeções e Histórico Macroeconômico',
  description: 'Projeções do Boletim Focus atualizadas toda segunda-feira: IPCA, Selic, PIB, Câmbio, IGP-M e mais. Mediana dos analistas com histórico.',
  alternates: { canonical: CANONICAL },
}

export default function BoletimFocusPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Boletim Focus — Projeções e Histórico Macroeconômico',
    description: 'Projeções do Boletim Focus do Banco Central do Brasil: IPCA, Selic, PIB, Câmbio, IGP-M, Dívida Líquida do Setor Público, Resultado Primário e Nominal.',
    url: CANONICAL,
    creator: { '@type': 'Organization', name: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br' },
    license: 'https://creativecommons.org/licenses/by/4.0/',
    temporalCoverage: '2015/..',
    keywords: ['Boletim Focus', 'Selic', 'IPCA', 'PIB', 'Câmbio', 'IGP-M', 'economia brasileira', 'projeções de mercado'],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MacroPageClient />
    </>
  )
}
