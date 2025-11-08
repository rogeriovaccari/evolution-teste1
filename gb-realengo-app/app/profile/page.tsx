'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, User, Camera } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface UserData {
  id: string
  name: string
  email: string
  phone?: string
  belt_level: string
  belt_core: string
  is_kids: boolean
  belt_started_at: string
  date_of_birth?: string
  avatar_url?: string
}

interface MedicalData {
  medical_notes?: string
  allergy_list?: string
  medication_notes?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_consent?: boolean
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [medical, setMedical] = useState<MedicalData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'medical'>('profile')
  const router = useRouter()
  const { toast } = useToast()

  const canEditMedical = process.env.NEXT_PUBLIC_PROFILE_STUDENT_CAN_EDIT_MEDICAL === 'true'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, medicalRes] = await Promise.all([
        fetch('/api/me'),
        fetch('/api/profile/medical'),
      ])

      if (!userRes.ok || !medicalRes.ok) {
        throw new Error('Erro ao carregar dados')
      }

      const userData = await userRes.json()
      const medicalData = await medicalRes.json()

      setUser(userData)
      setMedical(medicalData)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar perfil',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
          date_of_birth: user.date_of_birth,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar')
      }

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleMedicalSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile/medical', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medical),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar')
      }

      toast({
        title: 'Dados médicos atualizados!',
        description: 'Suas informações foram salvas com sucesso.',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      const data = await res.json()
      setUser((prev) => (prev ? { ...prev, avatar_url: data.avatar_url } : null))

      toast({
        title: 'Avatar atualizado!',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      })
    } finally {
      setAvatarUploading(false)
    }
  }

  if (loading || !user) {
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
        <div className="container mx-auto">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Avatar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                  />
                </label>
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.belt_level}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Faixa desde: {formatDate(user.belt_started_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            onClick={() => setActiveTab('profile')}
          >
            Dados Pessoais
          </Button>
          <Button
            variant={activeTab === 'medical' ? 'default' : 'outline'}
            onClick={() => setActiveTab('medical')}
          >
            Saúde e Segurança
          </Button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Atualize suas informações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value={user.email} disabled />
                <p className="text-xs text-muted-foreground">
                  O e-mail não pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={user.phone || ''}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  placeholder="(21) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={user.date_of_birth || ''}
                  onChange={(e) => setUser({ ...user, date_of_birth: e.target.value })}
                />
              </div>

              <Button onClick={handleProfileSave} disabled={saving} className="w-full">
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Medical Tab */}
        {activeTab === 'medical' && (
          <Card>
            <CardHeader>
              <CardTitle>Saúde e Segurança</CardTitle>
              <CardDescription>
                {canEditMedical
                  ? 'Informações importantes para sua segurança'
                  : 'Visualize suas informações (apenas admin pode editar)'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Nome do Contato de Emergência</Label>
                <Input
                  id="emergency_contact_name"
                  value={medical.emergency_contact_name || ''}
                  onChange={(e) =>
                    setMedical({ ...medical, emergency_contact_name: e.target.value })
                  }
                  disabled={!canEditMedical}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Telefone de Emergência</Label>
                <Input
                  id="emergency_contact_phone"
                  type="tel"
                  value={medical.emergency_contact_phone || ''}
                  onChange={(e) =>
                    setMedical({ ...medical, emergency_contact_phone: e.target.value })
                  }
                  disabled={!canEditMedical}
                  placeholder="(21) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical_notes">Observações Médicas</Label>
                <textarea
                  id="medical_notes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={medical.medical_notes || ''}
                  onChange={(e) => setMedical({ ...medical, medical_notes: e.target.value })}
                  disabled={!canEditMedical}
                  placeholder="Condições médicas relevantes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergy_list">Alergias</Label>
                <Input
                  id="allergy_list"
                  value={medical.allergy_list || ''}
                  onChange={(e) => setMedical({ ...medical, allergy_list: e.target.value })}
                  disabled={!canEditMedical}
                  placeholder="Liste suas alergias"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medication_notes">Medicações</Label>
                <Input
                  id="medication_notes"
                  value={medical.medication_notes || ''}
                  onChange={(e) => setMedical({ ...medical, medication_notes: e.target.value })}
                  disabled={!canEditMedical}
                  placeholder="Medicações em uso"
                />
              </div>

              {canEditMedical && (
                <Button onClick={handleMedicalSave} disabled={saving} className="w-full">
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
