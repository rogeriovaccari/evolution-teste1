'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { getWeekdayShort, formatTime } from '@/lib/utils'
import { MapPin, Clock, User, LogOut } from 'lucide-react'

interface Class {
  id: string
  title: string
  weekday: number
  start_time: string
  end_time: string
  location_name: string
}

interface User {
  id: string
  name: string
  email: string
  belt_level: string
  avatar_url?: string
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [todayClasses, setTodayClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'checking' | 'granted' | 'denied'>('checking')
  const [position, setPosition] = useState<{ lat: number; lng: number; accuracy: number } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
    requestLocation()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, classesRes] = await Promise.all([
        fetch('/api/me'),
        fetch('/api/classes'),
      ])

      if (!userRes.ok || !classesRes.ok) {
        throw new Error('Erro ao carregar dados')
      }

      const userData = await userRes.json()
      const classesData = await classesRes.json()

      setUser(userData)
      setTodayClasses(classesData.today || [])
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar dados',
      })
    } finally {
      setLoading(false)
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        setLocationStatus('granted')
      },
      (error) => {
        console.error('Geolocation error:', error)
        setLocationStatus('denied')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const handleCheckin = async (classId: string) => {
    if (!position) {
      toast({
        variant: 'destructive',
        title: 'GPS necessário',
        description: 'Ative sua localização para fazer check-in',
      })
      return
    }

    setCheckinLoading(true)

    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: classId,
          lat: position.lat,
          lng: position.lng,
          accuracy: position.accuracy,
          device_id: localStorage.getItem('device_id') || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao fazer check-in')
      }

      toast({
        title: '✅ Check-in realizado!',
        description: data.message,
      })

      // Atualiza posição
      requestLocation()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro no check-in',
        description: error.message,
      })
    } finally {
      setCheckinLoading(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🥋 GB Realengo</h1>
            <p className="text-sm text-gray-300">Olá, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/profile')}>
              <User className="w-4 h-4 mr-2" />
              Perfil
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Status GPS */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Status da Localização
            </CardTitle>
          </CardHeader>
          <CardContent>
            {locationStatus === 'checking' && (
              <p className="text-muted-foreground">Verificando localização...</p>
            )}
            {locationStatus === 'granted' && position && (
              <div className="space-y-2">
                <p className="text-green-600 font-semibold">✅ GPS ativo</p>
                <p className="text-sm text-muted-foreground">
                  Precisão: {position.accuracy.toFixed(1)}m
                </p>
              </div>
            )}
            {locationStatus === 'denied' && (
              <div className="space-y-4">
                <p className="text-red-600 font-semibold">❌ GPS desativado</p>
                <p className="text-sm text-muted-foreground">
                  Ative sua localização no navegador para fazer check-in
                </p>
                <Button size="sm" onClick={requestLocation}>
                  Tentar Novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aulas de Hoje */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Aulas de Hoje</h2>

          {todayClasses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma aula hoje
              </CardContent>
            </Card>
          ) : (
            todayClasses.map((cls) => (
              <Card key={cls.id}>
                <CardHeader>
                  <CardTitle>{cls.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {cls.location_name}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => handleCheckin(cls.id)}
                    disabled={checkinLoading || locationStatus !== 'granted'}
                  >
                    {checkinLoading ? 'Processando...' : 'Fazer Check-in'}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Você pode fazer check-in 15 minutos antes até 30 minutos após o início da aula</p>
            <p>• É necessário estar dentro do raio de 20 metros da academia</p>
            <p>• Mantenha o GPS ativo com boa precisão</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
