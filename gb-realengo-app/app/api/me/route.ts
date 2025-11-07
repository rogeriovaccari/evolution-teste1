import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    // Pega token de sessão do cookie
    const sessionToken = req.cookies.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verifica token
    const session = verifySessionToken(sessionToken)

    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
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
        updated_at: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get me error:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 })
  }
}
