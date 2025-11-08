import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const belt_core = searchParams.get('belt_core') || ''
    const is_kids = searchParams.get('is_kids')
    const page = parseInt(searchParams.get('page') || '1')
    const page_size = parseInt(searchParams.get('page_size') || '50')

    // Build where clause
    const where: Prisma.UserWhereInput = {}

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (belt_core) {
      where.belt_core = belt_core
    }

    if (is_kids !== null && is_kids !== undefined && is_kids !== '') {
      where.is_kids = is_kids === 'true'
    }

    // Count total
    const total = await prisma.user.count({ where })

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        belt_level: true,
        belt_core: true,
        is_kids: true,
        belt_started_at: true,
        date_of_birth: true,
        avatar_url: true,
        created_at: true,
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * page_size,
      take: page_size,
    })

    // Para cada usuário, buscar contagens de check-in
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const now = new Date()
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const yearStart = new Date(now.getFullYear(), 0, 1)

        const [weekCount, monthCount, yearCount, totalCount, lastCheckin] = await Promise.all([
          prisma.checkin.count({
            where: { user_id: user.id, status: 'approved', ts: { gte: weekStart } },
          }),
          prisma.checkin.count({
            where: { user_id: user.id, status: 'approved', ts: { gte: monthStart } },
          }),
          prisma.checkin.count({
            where: { user_id: user.id, status: 'approved', ts: { gte: yearStart } },
          }),
          prisma.checkin.count({ where: { user_id: user.id, status: 'approved' } }),
          prisma.checkin.findFirst({
            where: { user_id: user.id },
            orderBy: { ts: 'desc' },
            select: { ts: true },
          }),
        ])

        return {
          ...user,
          stats: {
            week_count: weekCount,
            month_count: monthCount,
            year_count: yearCount,
            total_count: totalCount,
            last_checkin_at: lastCheckin?.ts || null,
          },
        }
      })
    )

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        page_size,
        total,
        total_pages: Math.ceil(total / page_size),
      },
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}
