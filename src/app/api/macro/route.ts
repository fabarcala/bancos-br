import { fetchMacroData } from '@/lib/macroData'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await fetchMacroData()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Macro fetch error:', err)
    return NextResponse.json({ error: 'Falha ao buscar dados do Bacen' }, { status: 500 })
  }
}
