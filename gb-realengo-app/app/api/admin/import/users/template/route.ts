import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { getAllBeltOptions } from '@/lib/belt-utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'xlsx' // xlsx | csv

    // Template data
    const template = [
      {
        name: 'João da Silva',
        email: 'joao@exemplo.com',
        phone: '21987654321',
        date_of_birth: '1990-05-15',
        belt_level: 'Azul 2º Grau (Adulto)',
        belt_started_at: '2023-01-01',
      },
      {
        name: 'Maria Santos (exemplo kids)',
        email: 'maria@exemplo.com',
        phone: '21987654322',
        date_of_birth: '2015-03-20',
        belt_level: 'Cinza (Criança)',
        belt_started_at: '2024-01-01',
      },
    ]

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Alunos')

    // Add sheet with belt options
    const beltOptions = getAllBeltOptions().map((b) => ({ 'Opções de Faixas': b }))
    const wsBelts = XLSX.utils.json_to_sheet(beltOptions)
    XLSX.utils.book_append_sheet(wb, wsBelts, 'Faixas Disponíveis')

    if (format === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(ws)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="template_alunos.csv"',
        },
      })
    } else {
      // xlsx
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="template_alunos.xlsx"',
        },
      })
    }
  } catch (error) {
    console.error('Get template error:', error)
    return NextResponse.json({ error: 'Erro ao gerar template' }, { status: 500 })
  }
}
