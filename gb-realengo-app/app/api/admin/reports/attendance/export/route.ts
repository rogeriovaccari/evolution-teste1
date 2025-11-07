import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'xlsx' // xlsx | csv
    const period = searchParams.get('period') || 'all' // all, week, month, day
    const dateParam = searchParams.get('date') // YYYY-MM-DD

    const tz = process.env.TIMEZONE || 'America/Sao_Paulo'
    const date = dateParam ? dayjs(dateParam).tz(tz) : dayjs().tz(tz)

    let startDate: Date | undefined
    let endDate: Date | undefined

    if (period !== 'all') {
      switch (period) {
        case 'day':
          startDate = date.startOf('day').toDate()
          endDate = date.endOf('day').toDate()
          break
        case 'week':
          startDate = date.startOf('week').toDate()
          endDate = date.endOf('week').toDate()
          break
        case 'month':
          startDate = date.startOf('month').toDate()
          endDate = date.endOf('month').toDate()
          break
      }
    }

    // Busca todos os usuários
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
    })

    // Para cada usuário, buscar contagens de check-in
    const data = await Promise.all(
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
          Nome: user.name,
          Email: user.email,
          Telefone: user.phone || '',
          Faixa: user.belt_level,
          'Faixa Core': user.belt_core,
          'É Kids': user.is_kids ? 'Sim' : 'Não',
          'Data Nascimento': user.date_of_birth
            ? dayjs(user.date_of_birth).format('DD/MM/YYYY')
            : '',
          'Início da Faixa': dayjs(user.belt_started_at).format('DD/MM/YYYY'),
          'Presenças Semana': weekCount,
          'Presenças Mês': monthCount,
          'Presenças Ano': yearCount,
          'Total Presenças': totalCount,
          'Último Check-in': lastCheckin?.ts
            ? dayjs(lastCheckin.ts).format('DD/MM/YYYY HH:mm')
            : 'Nunca',
        }
      })
    )

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório de Presença')

    const filename = `relatorio_presenca_${period}_${date.format('YYYY-MM-DD')}`

    if (format === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(ws)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      })
    } else {
      // xlsx
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      })
    }
  } catch (error) {
    console.error('Export attendance error:', error)
    return NextResponse.json({ error: 'Erro ao exportar relatório' }, { status: 500 })
  }
}
