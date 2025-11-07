import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/auth'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

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

    // Parse multipart
    const formData = await req.formData()
    const file = formData.get('avatar') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Valida tamanho
    const maxSize = parseInt(process.env.FILES_MAX_SIZE_MB || '5') * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Valida tipo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Arquivo deve ser uma imagem' }, { status: 400 })
    }

    // Lê arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Processa com sharp (remove EXIF, redimensiona)
    const sizes = [128, 256, 512]
    const avatarMeta: Record<string, string> = {}

    const provider = process.env.FILES_PROVIDER || 'local'

    if (provider === 'local') {
      // Cria diretório
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars', session.userId)
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // Processa e salva cada tamanho
      for (const size of sizes) {
        const processed = await sharp(buffer)
          .rotate() // Auto-rotaciona baseado em EXIF
          .resize(size, size, { fit: 'cover' })
          .jpeg({ quality: 90, mozjpeg: true })
          .toBuffer()

        const filename = `avatar-${size}.jpg`
        const filepath = path.join(uploadDir, filename)
        await writeFile(filepath, processed)

        avatarMeta[`${size}`] = `/uploads/avatars/${session.userId}/${filename}`
      }

      // Atualiza usuário
      const user = await prisma.user.update({
        where: { id: session.userId },
        data: {
          avatar_url: avatarMeta['256'],
          avatar_meta: avatarMeta,
        },
        select: {
          avatar_url: true,
          avatar_meta: true,
        },
      })

      return NextResponse.json(user)
    } else {
      // TODO: Implementar S3/MinIO
      return NextResponse.json(
        { error: 'Provider S3/MinIO não implementado ainda' },
        { status: 501 }
      )
    }
  } catch (error) {
    console.error('Upload avatar error:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload do avatar' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
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

    // Remove avatar
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        avatar_url: null,
        avatar_meta: null,
      },
    })

    // TODO: Deletar arquivos físicos

    return NextResponse.json({ message: 'Avatar removido com sucesso' })
  } catch (error) {
    console.error('Delete avatar error:', error)
    return NextResponse.json({ error: 'Erro ao remover avatar' }, { status: 500 })
  }
}
