import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateSessionToken } from '@/lib/auth'
import { z } from 'zod'

const passwordSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export async function POST(req: NextRequest) {
  try {
    const adminLoginMode = process.env.ADMIN_LOGIN_MODE || 'otp'

    if (adminLoginMode !== 'password') {
      return NextResponse.json(
        { error: 'Login com senha não está habilitado' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = passwordSchema.parse(body)

    // Busca usuário admin
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user || user.role !== 'admin' || !user.password_hash) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    // Verifica senha
    const isValid = await verifyPassword(data.password, user.password_hash)

    if (!isValid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
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

    console.error('Password login error:', error)
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 })
  }
}
