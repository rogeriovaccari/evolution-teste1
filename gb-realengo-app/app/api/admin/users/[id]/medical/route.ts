import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const medicalSchema = z.object({
  medical_notes: z.string().optional(),
  allergy_list: z.string().optional(),
  medication_notes: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_consent: z.boolean().optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        medical_notes: true,
        allergy_list: true,
        medication_notes: true,
        emergency_contact_name: true,
        emergency_contact_phone: true,
        emergency_consent: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get user medical error:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados médicos' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = medicalSchema.parse(body)

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.medical_notes !== undefined && { medical_notes: data.medical_notes }),
        ...(data.allergy_list !== undefined && { allergy_list: data.allergy_list }),
        ...(data.medication_notes !== undefined && { medication_notes: data.medication_notes }),
        ...(data.emergency_contact_name !== undefined && {
          emergency_contact_name: data.emergency_contact_name,
        }),
        ...(data.emergency_contact_phone !== undefined && {
          emergency_contact_phone: data.emergency_contact_phone,
        }),
        ...(data.emergency_consent !== undefined && { emergency_consent: data.emergency_consent }),
      },
      select: {
        medical_notes: true,
        allergy_list: true,
        medication_notes: true,
        emergency_contact_name: true,
        emergency_contact_phone: true,
        emergency_consent: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Update user medical error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar dados médicos' }, { status: 500 })
  }
}
