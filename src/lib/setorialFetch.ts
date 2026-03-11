/**
 * Client-side fetch do BCB/SGS — chamado direto do browser.
 * BCB retorna access-control-allow-origin: * então não precisa de proxy.
 */

const SGS = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs'

export type SGSPoint = { date: string; value: number }

function dateParamsBR(yearsBack: number): string {
  const now = new Date()
  const from = new Date(now)
  from.setFullYear(from.getFullYear() - yearsBack)
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  return `dataInicial=${fmt(from)}&dataFinal=${fmt(now)}`
}

async function fetchSGS(serie: number, yearsBack = 5): Promise<SGSPoint[]> {
  try {
    const params = dateParamsBR(yearsBack)
    const res = await fetch(`${SGS}.${serie}/dados?formato=json&${params}`)
    if (!res.ok) return []
    const data: { data: string; valor: string }[] = await res.json()
    if (!Array.isArray(data)) return []
    return data.map(d => ({
      date: d.data.slice(3), // "01/01/2026" → "01/2026"
      value: parseFloat(d.valor),
    }))
  } catch {
    return []
  }
}

export function toBi(points: SGSPoint[]): SGSPoint[] {
  return points.map(p => ({ ...p, value: +(p.value / 1000).toFixed(1) }))
}

// ─── Tipos ────────────────────────────────────────────────────────

export type ModalidadePF = {
  slug: string
  label: string
  descricao: string
  color: string
  concessoes: SGSPoint[]       // R$ mi
  saldo: SGSPoint[]            // R$ bi
  taxa: SGSPoint[] | null      // % a.a. — null = não se aplica
  inadim: SGSPoint[] | null    // % — null = não se aplica
  taxaNA?: string              // texto explicativo quando taxa = null
  inadimNA?: string            // texto explicativo quando inadim = null
}

export type SetorialData = {
  // Visão Geral
  carteiraTotal: SGSPoint[]
  carteiraPF: SGSPoint[]
  carteiraPJ: SGSPoint[]
  inadimTotal: SGSPoint[]
  inadimPF: SGSPoint[]
  inadimPJ: SGSPoint[]
  taxaTotal: SGSPoint[]
  taxaPF: SGSPoint[]
  taxaPJ: SGSPoint[]
  // Modalidades PF
  modalidades: ModalidadePF[]
}

// ─── Fetch ────────────────────────────────────────────────────────

export async function fetchSetorialDataClient(): Promise<SetorialData> {

  const [
    // Visão Geral
    carteiraTotal, carteiraPF, carteiraPJ,
    inadimTotal, inadimPF, inadimPJ,
    taxaTotal, taxaPF, taxaPJ,
    // Aquisição de Veículos
    vei_con, vei_sal, vei_tax, vei_ina,
    // Consignado Servidores Públicos
    csp_con, csp_sal, csp_tax, csp_ina,
    // Consignado INSS
    cin_con, cin_sal, cin_tax, cin_ina,
    // Consignado Trabalhadores Privados
    cpr_con, cpr_sal, cpr_tax, cpr_ina,
    // Crédito Pessoal
    cpe_con, cpe_sal, cpe_tax, cpe_ina,
    // Cartão à Vista
    cav_con, cav_sal,
    // Cartão Rotativo
    cro_con, cro_sal, cro_tax, cro_ina,
    // Cartão Parcelado
    cpa_con, cpa_sal, cpa_tax, cpa_ina,
    // Cheque Especial
    che_con, che_sal, che_tax, che_ina,
    // Outros Bens
    out_con, out_sal, out_tax, out_ina,
  ] = await Promise.all([
    // Visão Geral
    fetchSGS(20539), fetchSGS(20540), fetchSGS(20541),
    fetchSGS(21082), fetchSGS(21084), fetchSGS(21083),
    fetchSGS(20714), fetchSGS(25433), fetchSGS(25434),
    // Veículos
    fetchSGS(20673), fetchSGS(20581), fetchSGS(20749), fetchSGS(21121),
    // Consignado Público
    fetchSGS(20669), fetchSGS(20577), fetchSGS(20745), fetchSGS(21117),
    // Consignado INSS
    fetchSGS(20670), fetchSGS(20578), fetchSGS(20746), fetchSGS(21118),
    // Consignado Privado
    fetchSGS(20668), fetchSGS(20576), fetchSGS(20744), fetchSGS(21116),
    // Crédito Pessoal
    fetchSGS(20666), fetchSGS(20574), fetchSGS(20742), fetchSGS(21114),
    // Cartão à Vista
    fetchSGS(20681), fetchSGS(20589),
    // Cartão Rotativo
    fetchSGS(20679), fetchSGS(20587), fetchSGS(22022), fetchSGS(21127),
    // Cartão Parcelado
    fetchSGS(20680), fetchSGS(20588), fetchSGS(22023), fetchSGS(21128),
    // Cheque Especial
    fetchSGS(20665), fetchSGS(20573), fetchSGS(20741), fetchSGS(21113),
    // Outros Bens
    fetchSGS(20674), fetchSGS(20582), fetchSGS(20750), fetchSGS(21122),
  ])

  const NA_AVISTA = 'O cartão à vista não incide juros nem gera inadimplência — o saldo é liquidado integralmente no vencimento da fatura.'

  const modalidades: ModalidadePF[] = [
    {
      slug: 'veiculos',
      label: 'Aquisição de Veículos',
      descricao: 'Financiamento para compra de veículos novos e usados · Recursos livres · PF',
      color: '#fbbf24',
      concessoes: vei_con,
      saldo: toBi(vei_sal),
      taxa: vei_tax,
      inadim: vei_ina,
    },
    {
      slug: 'consignado-publico',
      label: 'Consignado — Servidores Públicos',
      descricao: 'Crédito consignado para servidores públicos · Desconto em folha · PF',
      color: '#34d399',
      concessoes: csp_con,
      saldo: toBi(csp_sal),
      taxa: csp_tax,
      inadim: csp_ina,
    },
    {
      slug: 'consignado-inss',
      label: 'Consignado — Beneficiários INSS',
      descricao: 'Crédito consignado para aposentados e pensionistas do INSS · Desconto no benefício · PF',
      color: '#6ee7b7',
      concessoes: cin_con,
      saldo: toBi(cin_sal),
      taxa: cin_tax,
      inadim: cin_ina,
    },
    {
      slug: 'consignado-privado',
      label: 'Consignado — Trabalhadores Privados',
      descricao: 'Crédito consignado para trabalhadores do setor privado (CLT) · Desconto em folha · PF',
      color: '#a7f3d0',
      concessoes: cpr_con,
      saldo: toBi(cpr_sal),
      taxa: cpr_tax,
      inadim: cpr_ina,
    },
    {
      slug: 'credito-pessoal',
      label: 'Crédito Pessoal',
      descricao: 'Crédito pessoal não consignado · Recursos livres · PF',
      color: '#f87171',
      concessoes: cpe_con,
      saldo: toBi(cpe_sal),
      taxa: cpe_tax,
      inadim: cpe_ina,
    },
    {
      slug: 'cartao-avista',
      label: 'Cartão de Crédito — À Vista',
      descricao: 'Compras pagas integralmente no vencimento da fatura · Recursos livres · PF',
      color: '#60a5fa',
      concessoes: cav_con,
      saldo: toBi(cav_sal),
      taxa: null,
      inadim: null,
      taxaNA: NA_AVISTA,
      inadimNA: NA_AVISTA,
    },
    {
      slug: 'cartao-rotativo',
      label: 'Cartão de Crédito — Rotativo',
      descricao: 'Saldo não pago da fatura que entra em rotativo · Recursos livres · PF',
      color: '#f472b6',
      concessoes: cro_con,
      saldo: toBi(cro_sal),
      taxa: cro_tax,
      inadim: cro_ina,
    },
    {
      slug: 'cartao-parcelado',
      label: 'Cartão de Crédito — Parcelado',
      descricao: 'Compras e saques parcelados no cartão · Recursos livres · PF',
      color: '#c084fc',
      concessoes: cpa_con,
      saldo: toBi(cpa_sal),
      taxa: cpa_tax,
      inadim: cpa_ina,
    },
    {
      slug: 'cheque-especial',
      label: 'Cheque Especial',
      descricao: 'Limite de crédito vinculado à conta corrente · Recursos livres · PF',
      color: '#fb923c',
      concessoes: che_con,
      saldo: toBi(che_sal),
      taxa: che_tax,
      inadim: che_ina,
    },
    {
      slug: 'outros-bens',
      label: 'Aquisição de Outros Bens',
      descricao: 'Financiamento para compra de bens duráveis exceto veículos · Recursos livres · PF',
      color: '#94a3b8',
      concessoes: out_con,
      saldo: toBi(out_sal),
      taxa: out_tax,
      inadim: out_ina,
    },
  ]

  return {
    carteiraTotal: toBi(carteiraTotal),
    carteiraPF: toBi(carteiraPF),
    carteiraPJ: toBi(carteiraPJ),
    inadimTotal, inadimPF, inadimPJ,
    taxaTotal, taxaPF, taxaPJ,
    modalidades,
  }
}
