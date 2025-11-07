'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VerifyPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('Token não fornecido')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Token inválido')
        }

        setStatus('success')

        // Redireciona baseado no role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            router.push('/admin/dashboard')
          } else {
            router.push('/home')
          }
        }, 1500)
      } catch (error: any) {
        setStatus('error')
        setError(error.message)
      }
    }

    verify()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">
            {status === 'loading' && '⏳ Verificando...'}
            {status === 'success' && '✅ Login realizado!'}
            {status === 'error' && '❌ Erro'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Aguarde enquanto verificamos seu acesso'}
            {status === 'success' && 'Redirecionando você para a plataforma...'}
            {status === 'error' && error}
          </CardDescription>
        </CardHeader>
        {status === 'error' && (
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/auth/login')}
            >
              Voltar para Login
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
