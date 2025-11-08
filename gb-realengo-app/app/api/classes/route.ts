import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export async function GET(req: NextRequest) {
  try {
    const tz = process.env.TIMEZONE || 'America/Sao_Paulo'
    const today = dayjs().tz(tz).day() // 0-6

    // Busca todas as classes ativas
    const classes = await prisma.class.findMany({
      where: { is_active: true },
      orderBy: [{ weekday: 'asc' }, { start_time: 'asc' }],
    })

    // Agrupa por dia da semana
    const groupedByDay = classes.reduce((acc, cls) => {
      if (!acc[cls.weekday]) {
        acc[cls.weekday] = []
      }
      acc[cls.weekday].push(cls)
      return acc
    }, {} as Record<number, typeof classes>)

    // Classes de hoje
    const todayClasses = groupedByDay[today] || []

    return NextResponse.json({
      all: classes,
      byDay: groupedByDay,
      today: todayClasses,
      currentWeekday: today,
    })
  } catch (error) {
    console.error('Get classes error:', error)
    return NextResponse.json({ error: 'Erro ao buscar classes' }, { status: 500 })
  }
}
