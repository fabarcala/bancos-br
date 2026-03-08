import { fetchSetorialData } from '@/lib/setorialData'
import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  try {
    const data = await fetchSetorialData()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Setorial fetch error:', err)
    return NextResponse.json({ error: 'Falha ao buscar dados do Bacen' }, { status: 500 })
  }
}
