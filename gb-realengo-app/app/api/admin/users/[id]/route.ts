import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deriveBeltCore, isKidsBelt } from '@/lib/belt-utils'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  belt_level: z.string().optional(),
  date_of_birth: z.string().optional(),
  belt_started_at: z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Busca estatísticas de check-in
    const now = new Date()
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    const [weekCount, monthCount, yearCount, totalCount, lastCheckin] = await Promise.all([
      prisma.checkin.count({
        where: { user_id: id, status: 'approved', ts: { gte: weekStart } },
      }),
      prisma.checkin.count({
        where: { user_id: id, status: 'approved', ts: { gte: monthStart } },
      }),
      prisma.checkin.count({
        where: { user_id: id, status: 'approved', ts: { gte: yearStart } },
      }),
      prisma.checkin.count({ where: { user_id: id, status: 'approved' } }),
      prisma.checkin.findFirst({
        where: { user_id: id },
        orderBy: { ts: 'desc' },
      }),
    ])

    return NextResponse.json({
      ...user,
      stats: {
        week_count: weekCount,
        month_count: monthCount,
        year_count: yearCount,
        total_count: totalCount,
        last_checkin_at: lastCheckin?.ts || null,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = updateUserSchema.parse(body)

    // Se alterar belt_level, recalcula belt_core e is_kids
    let updateData: any = {}

    if (data.name) updateData.name = data.name
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.date_of_birth) updateData.date_of_birth = new Date(data.date_of_birth)
    if (data.belt_started_at) updateData.belt_started_at = new Date(data.belt_started_at)

    if (data.belt_level) {
      updateData.belt_level = data.belt_level
      updateData.belt_core = deriveBeltCore(data.belt_level)
      updateData.is_kids = isKidsBelt(data.belt_level)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
}
