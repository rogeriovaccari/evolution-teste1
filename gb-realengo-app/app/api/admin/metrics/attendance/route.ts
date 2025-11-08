import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const scope = searchParams.get('scope') || 'day' // day, week, month, year
    const dateParam = searchParams.get('date') // YYYY-MM-DD
    const location = searchParams.get('location') || ''
    const title = searchParams.get('title') || ''
    const is_kids = searchParams.get('is_kids')

    const tz = process.env.TIMEZONE || 'America/Sao_Paulo'
    const date = dateParam ? dayjs(dateParam).tz(tz) : dayjs().tz(tz)

    let startDate: Date
    let endDate: Date

    switch (scope) {
      case 'year':
        startDate = date.startOf('year').toDate()
        endDate = date.endOf('year').toDate()
        break
      case 'month':
        startDate = date.startOf('month').toDate()
        endDate = date.endOf('month').toDate()
        break
      case 'week':
        startDate = date.startOf('week').toDate()
        endDate = date.endOf('week').toDate()
        break
      case 'day':
      default:
        startDate = date.startOf('day').toDate()
        endDate = date.endOf('day').toDate()
        break
    }

    // Build where clause para checkins
    const checkinWhere: any = {
      ts: { gte: startDate, lte: endDate },
      status: 'approved',
    }

    // Filtros de class
    const classWhere: any = {}
    if (location) classWhere.location_name = { contains: location }
    if (title) classWhere.title = { contains: title }

    if (Object.keys(classWhere).length > 0) {
      const classes = await prisma.class.findMany({ where: classWhere })
      const classIds = classes.map((c) => c.id)
      if (classIds.length > 0) {
        checkinWhere.class_id = { in: classIds }
      } else {
        // Nenhuma class encontrada com os filtros
        return NextResponse.json({
          scope,
          date: date.format('YYYY-MM-DD'),
          total: 0,
          checkins: [],
        })
      }
    }

    // Filtro de is_kids
    if (is_kids !== null && is_kids !== undefined && is_kids !== '') {
      const users = await prisma.user.findMany({
        where: { is_kids: is_kids === 'true' },
      })
      const userIds = users.map((u) => u.id)
      if (userIds.length > 0) {
        checkinWhere.user_id = { in: userIds }
      } else {
        return NextResponse.json({
          scope,
          date: date.format('YYYY-MM-DD'),
          total: 0,
          checkins: [],
        })
      }
    }

    // Busca check-ins
    const checkins = await prisma.checkin.findMany({
      where: checkinWhere,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            belt_level: true,
            belt_core: true,
            is_kids: true,
          },
        },
        class: true,
      },
      orderBy: { ts: 'desc' },
    })

    const total = checkins.length

    return NextResponse.json({
      scope,
      date: date.format('YYYY-MM-DD'),
      total,
      checkins,
    })
  } catch (error) {
    console.error('Get attendance metrics error:', error)
    return NextResponse.json({ error: 'Erro ao buscar métricas de presença' }, { status: 500 })
  }
}
