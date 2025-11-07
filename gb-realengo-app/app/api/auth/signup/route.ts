import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deriveBeltCore, isKidsBelt } from '@/lib/belt-utils'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  date_of_birth: z.string().optional(),
  belt_level: z.string().min(1, 'Faixa é obrigatória'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = signupSchema.parse(body)

    // Verifica se já existe
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 })
    }

    // Deriva belt_core e is_kids
    const belt_core = deriveBeltCore(data.belt_level)
    const is_kids = isKidsBelt(data.belt_level)

    // Cria usuário
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        belt_level: data.belt_level,
        belt_core,
        is_kids,
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
        role: 'student',
      },
    })

    return NextResponse.json({
      message: 'Cadastro realizado com sucesso',
      userId: user.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Erro ao criar cadastro' }, { status: 500 })
  }
}
