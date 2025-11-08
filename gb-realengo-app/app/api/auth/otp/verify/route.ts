import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyOtpToken, generateSessionToken } from '@/lib/auth'
import { z } from 'zod'

const verifySchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = verifySchema.parse(body)

    // Verifica token OTP
    const email = await verifyOtpToken(data.token)

    if (!email) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 })
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Gera token de sessão
    const sessionToken = generateSessionToken(user)

    // Retorna com cookie
    const response = NextResponse.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('OTP verify error:', error)
    return NextResponse.json({ error: 'Erro ao verificar token' }, { status: 500 })
  }
}
