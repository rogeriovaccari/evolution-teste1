import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/auth'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
})

export async function PUT(req: NextRequest) {
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

    // Parse body
    const body = await req.json()
    const data = profileSchema.parse(body)

    // Atualiza usuário
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.date_of_birth && { date_of_birth: new Date(data.date_of_birth) }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        date_of_birth: true,
        belt_level: true,
        belt_core: true,
        is_kids: true,
        avatar_url: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
  }
}
