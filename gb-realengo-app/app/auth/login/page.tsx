'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const adminLoginMode = process.env.NEXT_PUBLIC_ADMIN_LOGIN_MODE || 'otp'

  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao solicitar acesso')
      }

      setOtpSent(true)
      toast({
        title: 'E-mail enviado!',
        description: 'Verifique sua caixa de entrada para acessar a plataforma.',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao fazer login')
      }

      toast({
        title: 'Login realizado!',
        description: 'Redirecionando...',
      })

      setTimeout(() => {
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/home')
        }
      }, 1000)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  if (otpSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">✉️ E-mail Enviado</CardTitle>
            <CardDescription>
              Enviamos um link de acesso para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Clique no link no e-mail para fazer login. O link expira em 15 minutos.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setOtpSent(false)
                setEmail('')
              }}
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">🥋 GB Realengo</CardTitle>
          <CardDescription>Entre para fazer check-in nas aulas</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={adminLoginMode === 'password' ? handlePasswordLogin : handleOtpRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {adminLoginMode === 'password' && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Carregando...' : adminLoginMode === 'password' ? 'Entrar' : 'Enviar Link de Acesso'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
