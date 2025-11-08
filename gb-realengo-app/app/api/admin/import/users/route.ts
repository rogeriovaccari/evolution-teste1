import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deriveBeltCore, isKidsBelt } from '@/lib/belt-utils'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
  try {
    // Parse multipart
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Valida extensão
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      return NextResponse.json(
        { error: 'Formato inválido. Use .xlsx, .xls ou .csv' },
        { status: 400 }
      )
    }

    // Lê arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse com xlsx
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet) as any[]

    if (data.length === 0) {
      return NextResponse.json({ error: 'Arquivo vazio' }, { status: 400 })
    }

    // Cria job
    const job = await prisma.importJob.create({
      data: {
        filename: file.name,
        total_rows: data.length,
        success_count: 0,
        error_count: 0,
        status: 'processing',
      },
    })

    let successCount = 0
    let errorCount = 0
    const errors: Array<{ row: number; field?: string; message: string }> = []

    // Processa cada linha
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNumber = i + 2 // +2 porque começa em 1 e tem header

      try {
        // Valida campos obrigatórios
        if (!row.name || !row.email || !row.belt_level) {
          throw new Error('Campos obrigatórios faltando: name, email, belt_level')
        }

        // Deriva campos
        const belt_core = deriveBeltCore(row.belt_level)
        const is_kids = isKidsBelt(row.belt_level)

        // Upsert por e-mail
        await prisma.user.upsert({
          where: { email: row.email },
          update: {
            name: row.name,
            phone: row.phone || null,
            date_of_birth: row.date_of_birth ? new Date(row.date_of_birth) : null,
            belt_level: row.belt_level,
            belt_core,
            is_kids,
            belt_started_at: row.belt_started_at ? new Date(row.belt_started_at) : undefined,
          },
          create: {
            name: row.name,
            email: row.email,
            phone: row.phone || null,
            date_of_birth: row.date_of_birth ? new Date(row.date_of_birth) : null,
            belt_level: row.belt_level,
            belt_core,
            is_kids,
            belt_started_at: row.belt_started_at ? new Date(row.belt_started_at) : new Date(),
            role: 'student',
          },
        })

        successCount++
      } catch (error: any) {
        errorCount++
        errors.push({
          row: rowNumber,
          message: error.message || 'Erro desconhecido',
        })

        // Salva erro no banco
        await prisma.importError.create({
          data: {
            job_id: job.id,
            row_number: rowNumber,
            message: error.message || 'Erro desconhecido',
          },
        })
      }
    }

    // Atualiza job
    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        success_count: successCount,
        error_count: errorCount,
        status: errorCount > 0 ? 'completed' : 'completed',
        completed_at: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Importação concluída',
      job_id: job.id,
      total: data.length,
      success: successCount,
      errors: errorCount,
      error_details: errors.slice(0, 10), // Primeiros 10 erros
    })
  } catch (error) {
    console.error('Import users error:', error)
    return NextResponse.json({ error: 'Erro ao importar usuários' }, { status: 500 })
  }
}
