import type { Metadata } from 'next'
import MacroPageClient from '@/components/MacroPageClient'

export const metadata: Metadata = {
  title: 'Boletim Focus — Projeções de Mercado: Selic, IPCA, PIB, Câmbio',
  description: 'Projeções do Boletim Focus atualizadas toda segunda-feira: IPCA, Selic, PIB, Câmbio, IGP-M e mais. Mediana dos analistas de mercado com histórico desde 2015.',
}

export default function BoletimFocusPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Boletim Focus — Projeções e Histórico Macroeconômico',
    description: 'Projeções do Boletim Focus do Banco Central do Brasil: IPCA, Selic, PIB, Câmbio, IGP-M, Dívida Líquida do Setor Público, Resultado Primário e Nominal.',
    url: 'https://bancos-app.vercel.app/boletim-focus',
    creator: {
      '@type': 'Organization',
      name: 'Banco Central do Brasil',
      url: 'https://www.bcb.gov.br',
    },
    license: 'https://creativecommons.org/licenses/by/4.0/',
    temporalCoverage: '2015/..',
    updateFrequency: 'Semanal (toda segunda-feira)',
    keywords: ['Boletim Focus', 'Selic', 'IPCA', 'PIB', 'Câmbio', 'IGP-M', 'economia brasileira', 'projeções de mercado'],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MacroPageClient />
    </>
  )
}
