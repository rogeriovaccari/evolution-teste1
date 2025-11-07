import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOtpToken } from '@/lib/auth'
import { sendOtpEmail } from '@/lib/email-mock'
import { z } from 'zod'

const requestSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = requestSchema.parse(body)

    // Verifica se usuário existe
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Gera token OTP
    const token = await generateOtpToken(data.email)

    // Envia e-mail
    await sendOtpEmail(data.email, token)

    return NextResponse.json({
      message: 'E-mail de acesso enviado com sucesso',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('OTP request error:', error)
    return NextResponse.json({ error: 'Erro ao solicitar acesso' }, { status: 500 })
  }
}
