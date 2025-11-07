import { prisma } from './prisma'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { User, Role } from '@prisma/client'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'changeme'

/**
 * Gera token OTP
 */
export async function generateOtpToken(email: string): Promise<string> {
  const token = jwt.sign({ email, type: 'otp' }, JWT_SECRET, { expiresIn: '15m' })
  
  // Salva no banco
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

  await prisma.otpToken.create({
    data: {
      email,
      token,
      expires_at: expiresAt,
    },
  })

  return token
}

/**
 * Verifica token OTP
 */
export async function verifyOtpToken(token: string): Promise<string | null> {
  try {
    // Busca token no banco
    const otpToken = await prisma.otpToken.findUnique({
      where: { token },
    })

    if (!otpToken || otpToken.used) {
      return null
    }

    // Verifica expiração
    if (otpToken.expires_at < new Date()) {
      return null
    }

    // Verifica JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; type: string }

    if (decoded.type !== 'otp') {
      return null
    }

    // Marca como usado
    await prisma.otpToken.update({
      where: { id: otpToken.id },
      data: { used: true },
    })

    return decoded.email
  } catch (error) {
    return null
  }
}

/**
 * Gera token de sessão JWT
 */
export function generateSessionToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

/**
 * Verifica token de sessão
 */
export function verifySessionToken(token: string): {
  userId: string
  email: string
  role: Role
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      role: Role
    }
    return decoded
  } catch {
    return null
  }
}

/**
 * Hash de senha (para modo admin com password)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Verifica senha
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Gera token de troca de e-mail
 */
export async function generateEmailChangeToken(
  userId: string,
  newEmail: string
): Promise<string> {
  const token = jwt.sign({ userId, newEmail, type: 'email_change' }, JWT_SECRET, {
    expiresIn: '15m',
  })
  return token
}

/**
 * Verifica token de troca de e-mail
 */
export function verifyEmailChangeToken(token: string): {
  userId: string
  newEmail: string
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      newEmail: string
      type: string
    }

    if (decoded.type !== 'email_change') {
      return null
    }

    return {
      userId: decoded.userId,
      newEmail: decoded.newEmail,
    }
  } catch {
    return null
  }
}
