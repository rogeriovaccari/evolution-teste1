'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Download, Upload, FileText, LogOut } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface TodayStats {
  total: number
  checkins: Array<{
    id: string
    ts: string
    user: { name: string; belt_level: string }
    class: { title: string; location_name: string }
  }>
}

export default function AdminDashboard() {
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null)
  const [usersCount, setUsersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const [statsRes, usersRes] = await Promise.all([
        fetch(`/api/admin/metrics/attendance?scope=day&date=${today}`),
        fetch('/api/admin/users?page=1&page_size=1'),
      ])

      if (!statsRes.ok || !usersRes.ok) {
        throw new Error('Erro ao carregar dados')
      }

      const statsData = await statsRes.json()
      const usersData = await usersRes.json()

      setTodayStats(statsData)
      setUsersCount(usersData.pagination.total)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportDay = async () => {
    const today = new Date().toISOString().split('T')[0]
    window.open(`/api/admin/reports/attendance/export?format=xlsx&period=day&date=${today}`, '_blank')
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
            <h1 className="text-2xl font-bold">🥋 GB Realengo - Admin</h1>
            <p className="text-sm text-gray-300">Painel Administrativo</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 4 Cards principais */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Card 1: Presenças de Hoje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Presenças de Hoje
              </CardTitle>
              <CardDescription>Check-ins realizados hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-4">{todayStats?.total || 0}</div>
              <div className="space-y-2">
                <Button className="w-full" onClick={handleExportDay}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Dia (Excel)
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/admin/attendance')}>
                  Ver Lista Completa
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Usuários Cadastrados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Usuários Cadastrados
              </CardTitle>
              <CardDescription>Total de alunos na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-4">{usersCount}</div>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => router.push('/admin/users')}>
                  Ver Todos os Usuários
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/admin/users/create')}>
                  Criar Novo Aluno
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Importar Alunos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Importar Alunos
              </CardTitle>
              <CardDescription>Importe alunos em massa via Excel/CSV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('/api/admin/import/users/template?format=xlsx', '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Modelo (XLSX)
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('/api/admin/import/users/template?format=csv', '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Modelo (CSV)
              </Button>
              <Button className="w-full" onClick={() => router.push('/admin/import')}>
                <Upload className="w-4 h-4 mr-2" />
                Fazer Upload
              </Button>
            </CardContent>
          </Card>

          {/* Card 4: Relatórios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Relatórios
              </CardTitle>
              <CardDescription>Exporte relatórios de presença</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0]
                  window.open(`/api/admin/reports/attendance/export?format=xlsx&period=day&date=${today}`, '_blank')
                }}
              >
                Exportar Hoje
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0]
                  window.open(`/api/admin/reports/attendance/export?format=xlsx&period=week&date=${today}`, '_blank')
                }}
              >
                Exportar Semana
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0]
                  window.open(`/api/admin/reports/attendance/export?format=xlsx&period=month&date=${today}`, '_blank')
                }}
              >
                Exportar Mês
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('/api/admin/reports/attendance/export?format=xlsx&period=all', '_blank')}
              >
                Exportar Vitalício
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Check-ins de Hoje */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Check-ins de Hoje</CardTitle>
            <CardDescription>
              {todayStats?.total || 0} check-ins realizados hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!todayStats?.checkins || todayStats.checkins.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum check-in realizado hoje
              </p>
            ) : (
              <div className="space-y-3">
                {todayStats.checkins.slice(0, 10).map((checkin) => (
                  <div key={checkin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{checkin.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {checkin.class.title} • {checkin.class.location_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{checkin.user.belt_level}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(checkin.ts)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
