import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/auth'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export async function GET(req: NextRequest) {
  try {
    // Autenticação
    const sessionToken = req.cookies.get('session')?.value
    if (!sessionToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const session = verifySessionToken(sessionToken)
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || 'week' // week, month, year

    const tz = process.env.TIMEZONE || 'America/Sao_Paulo'
    const now = dayjs().tz(tz)

    let startDate: Date
    switch (range) {
      case 'year':
        startDate = now.startOf('year').toDate()
        break
      case 'month':
        startDate = now.startOf('month').toDate()
        break
      case 'week':
      default:
        startDate = now.startOf('week').toDate()
        break
    }

    // Busca check-ins
    const checkins = await prisma.checkin.findMany({
      where: {
        user_id: session.userId,
        ts: { gte: startDate },
      },
      include: {
        class: true,
      },
      orderBy: {
        ts: 'desc',
      },
    })

    // Conta por status
    const counts = {
      approved: checkins.filter((c) => c.status === 'approved').length,
      pending: checkins.filter((c) => c.status === 'pending').length,
      rejected: checkins.filter((c) => c.status === 'rejected').length,
      total: checkins.length,
    }

    return NextResponse.json({
      checkins,
      counts,
      range,
    })
  } catch (error) {
    console.error('Get my checkins error:', error)
    return NextResponse.json({ error: 'Erro ao buscar check-ins' }, { status: 500 })
  }
}
