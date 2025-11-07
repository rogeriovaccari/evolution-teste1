import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/auth'
import {
  calculateDistance,
  hasValidAccuracy,
  isWithinCheckinWindow,
  generateDeviceFingerprint,
} from '@/lib/geo'
import { z } from 'zod'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const checkinSchema = z.object({
  class_id: z.string().uuid(),
  lat: z.number(),
  lng: z.number(),
  accuracy: z.number(),
  device_id: z.string().optional(),
})

export async function POST(req: NextRequest) {
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
    const data = checkinSchema.parse(body)

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Busca aula
    const classData = await prisma.class.findUnique({
      where: { id: data.class_id },
    })

    if (!classData || !classData.is_active) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
    }

    // Configurações
    const tz = process.env.TIMEZONE || 'America/Sao_Paulo'
    const schoolLat = parseFloat(process.env.SCHOOL_LAT || '-22.8941172')
    const schoolLng = parseFloat(process.env.SCHOOL_LNG || '-43.4420113')
    const radiusM = parseInt(process.env.RADIUS_M || '20')
    const windowBefore = parseInt(process.env.WINDOW_BEFORE_MIN || '15')
    const windowAfter = parseInt(process.env.WINDOW_AFTER_MIN || '30')
    const minAccuracy = parseFloat(process.env.MIN_ACCURACY_M || '50')
    const autoApprove = process.env.AUTO_APPROVE === 'true'

    const now = dayjs().tz(tz)

    // 1. Verifica precisão do GPS
    if (!hasValidAccuracy(data.accuracy, minAccuracy)) {
      return NextResponse.json(
        {
          error: `GPS com precisão insuficiente (${data.accuracy.toFixed(1)}m). Mínimo: ${minAccuracy}m`,
        },
        { status: 400 }
      )
    }

    // 2. Verifica geofence
    const distance = calculateDistance(
      { lat: data.lat, lng: data.lng },
      { lat: schoolLat, lng: schoolLng }
    )

    if (distance > radiusM) {
      return NextResponse.json(
        {
          error: `Você está fora do raio permitido (${distance.toFixed(1)}m). Máximo: ${radiusM}m`,
        },
        { status: 400 }
      )
    }

    // 3. Verifica janela de check-in
    if (
      !isWithinCheckinWindow(
        classData.start_time,
        classData.weekday,
        windowBefore,
        windowAfter,
        now.toDate(),
        tz
      )
    ) {
      return NextResponse.json(
        {
          error: `Fora da janela de check-in (${windowBefore} min antes até ${windowAfter} min depois da aula)`,
        },
        { status: 400 }
      )
    }

    // 4. Verifica duplicidade (1 check-in por dia por aula)
    const startOfDay = now.startOf('day').toDate()
    const endOfDay = now.endOf('day').toDate()

    const existingCheckin = await prisma.checkin.findFirst({
      where: {
        user_id: user.id,
        class_id: classData.id,
        ts: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    if (existingCheckin) {
      return NextResponse.json(
        { error: 'Você já fez check-in nesta aula hoje' },
        { status: 400 }
      )
    }

    // 5. Verifica contato de emergência para kids
    if (
      user.is_kids &&
      classData.require_emergency_contact &&
      (!user.emergency_contact_name || !user.emergency_contact_phone)
    ) {
      return NextResponse.json(
        {
          error:
            'É necessário preencher os dados de contato de emergência no perfil antes de fazer check-in',
          requireEmergencyContact: true,
        },
        { status: 400 }
      )
    }

    // 6. Cria check-in
    const userAgent = req.headers.get('user-agent') || undefined
    const deviceFingerprint = generateDeviceFingerprint(data.device_id, userAgent)

    const checkin = await prisma.checkin.create({
      data: {
        user_id: user.id,
        class_id: classData.id,
        lat: data.lat,
        lng: data.lng,
        accuracy_m: data.accuracy,
        device_id: deviceFingerprint,
        user_agent: userAgent,
        status: autoApprove ? 'approved' : 'pending',
      },
      include: {
        class: true,
      },
    })

    return NextResponse.json({
      message: autoApprove
        ? 'Check-in realizado com sucesso!'
        : 'Check-in registrado e aguardando aprovação',
      checkin: {
        id: checkin.id,
        ts: checkin.ts,
        status: checkin.status,
        class: {
          title: checkin.class.title,
          location: checkin.class.location_name,
        },
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Checkin error:', error)
    return NextResponse.json({ error: 'Erro ao realizar check-in' }, { status: 500 })
  }
}
