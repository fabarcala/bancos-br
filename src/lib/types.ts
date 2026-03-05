export interface BankKPIs {
  lucro_liquido_recorrente?: Record<string, number | null>
  roe?: Record<string, number | null>
  indice_eficiencia?: Record<string, number | null>
  carteira_credito?: Record<string, number | null>
  margem_financeira?: Record<string, number | null>
  total_ativos?: Record<string, number | null>
  pl?: Record<string, number | null>
  inadimplencia_90d?: Record<string, number | null>
  basileia?: Record<string, number | null>
  receita_servicos?: Record<string, number | null>
  aum?: Record<string, number | null>
}

export interface Bank {
  banco: string
  ticker: string
  kpis: BankKPIs
}

export type KPIKey = keyof BankKPIs

export interface KPIConfig {
  label: string
  shortLabel: string
  format: 'currency' | 'percent' | 'ratio'
  unit: string
  description: string
  higherIsBetter: boolean
}

export const KPI_CONFIG: Record<KPIKey, KPIConfig> = {
  lucro_liquido_recorrente: {
    label: 'Lucro Líquido Recorrente',
    shortLabel: 'Lucro',
    format: 'currency',
    unit: 'R$ bi',
    description: 'Lucro líquido recorrente/gerencial trimestral',
    higherIsBetter: true,
  },
  roe: {
    label: 'ROE',
    shortLabel: 'ROE',
    format: 'percent',
    unit: '%',
    description: 'Retorno anualizado sobre o patrimônio líquido',
    higherIsBetter: true,
  },
  indice_eficiencia: {
    label: 'Índice de Eficiência',
    shortLabel: 'Eficiência',
    format: 'percent',
    unit: '%',
    description: 'Quanto menor, mais eficiente o banco',
    higherIsBetter: false,
  },
  carteira_credito: {
    label: 'Carteira de Crédito',
    shortLabel: 'Crédito',
    format: 'currency',
    unit: 'R$ bi',
    description: 'Total da carteira de crédito',
    higherIsBetter: true,
  },
  margem_financeira: {
    label: 'Margem Financeira',
    shortLabel: 'Margem',
    format: 'currency',
    unit: 'R$ bi',
    description: 'Margem financeira bruta trimestral',
    higherIsBetter: true,
  },
  total_ativos: {
    label: 'Total de Ativos',
    shortLabel: 'Ativos',
    format: 'currency',
    unit: 'R$ bi',
    description: 'Total de ativos consolidados',
    higherIsBetter: true,
  },
  pl: {
    label: 'Patrimônio Líquido',
    shortLabel: 'PL',
    format: 'currency',
    unit: 'R$ bi',
    description: 'Patrimônio líquido consolidado',
    higherIsBetter: true,
  },
  inadimplencia_90d: {
    label: 'Inadimplência 90d',
    shortLabel: 'NPL 90d',
    format: 'percent',
    unit: '%',
    description: 'Índice de inadimplência acima de 90 dias',
    higherIsBetter: false,
  },
  basileia: {
    label: 'Índice de Basileia',
    shortLabel: 'Basileia',
    format: 'percent',
    unit: '%',
    description: 'Índice de adequação de capital',
    higherIsBetter: true,
  },
  receita_servicos: {
    label: 'Receita de Serviços',
    shortLabel: 'Serviços',
    format: 'currency',
    unit: 'R$ bi',
    description: 'Receitas de prestação de serviços e tarifas',
    higherIsBetter: true,
  },
  aum: {
    label: 'AuM / AuA',
    shortLabel: 'AuM',
    format: 'currency',
    unit: 'R$ bi',
    description: 'Ativos sob gestão e administração',
    higherIsBetter: true,
  },
}

export const BANK_COLORS: Record<string, string> = {
  ITUB4: '#FF6B00',
  BBDC4: '#CC0000',
  BBAS3: '#FFCC00',
  BPAC11: '#1A1A2E',
  SANB11: '#EC0000',
}

export const BANK_COLORS_LIGHT: Record<string, string> = {
  ITUB4: '#FFF0E6',
  BBDC4: '#FFE6E6',
  BBAS3: '#FFFBE6',
  BPAC11: '#E6E6F0',
  SANB11: '#FFE6E6',
}
