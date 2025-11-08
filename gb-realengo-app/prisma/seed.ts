import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // 1. Criar regras de faixa para adultos
  console.log('📊 Criando regras de faixa para adultos...')
  
  const beltRules = [
    {
      belt: 'branca',
      min_months: 12,
      min_presences: 96,
      recommended: 120,
      ideal: 144,
      per_year: false,
      strict_minimum: 130,
    },
    {
      belt: 'azul',
      min_months: 24,
      min_presences: 192,
      recommended: 240,
      ideal: 288,
      per_year: false,
      strict_minimum: null,
    },
    {
      belt: 'roxa',
      min_months: 18,
      min_presences: 144,
      recommended: 180,
      ideal: 216,
      per_year: false,
      strict_minimum: null,
    },
    {
      belt: 'marrom',
      min_months: 18,
      min_presences: 144,
      recommended: 180,
      ideal: 216,
      per_year: false,
      strict_minimum: null,
    },
    {
      belt: 'preta',
      min_months: 12,
      min_presences: 96,
      recommended: 120,
      ideal: 144,
      per_year: true,
      strict_minimum: null,
    },
  ]

  for (const rule of beltRules) {
    await prisma.beltRule.upsert({
      where: { belt: rule.belt },
      update: rule,
      create: rule,
    })
  }

  console.log(`✅ ${beltRules.length} regras de faixa adulto criadas`)

  // 2. Criar regras de faixa para crianças
  console.log('👶 Criando regras de faixa para crianças...')
  
  const kidsRules = [
    { belt_level: 'Cinza/Branca (Criança)', min_months: 4, min_presences: 32, recommended: 40, ideal: 48 },
    { belt_level: 'Cinza (Criança)', min_months: 4, min_presences: 32, recommended: 40, ideal: 48 },
    { belt_level: 'Amarela/Cinza (Criança)', min_months: 4, min_presences: 32, recommended: 40, ideal: 48 },
    { belt_level: 'Amarela (Criança)', min_months: 4, min_presences: 32, recommended: 40, ideal: 48 },
    { belt_level: 'Laranja/Amarela (Criança)', min_months: 4, min_presences: 32, recommended: 40, ideal: 48 },
    { belt_level: 'Laranja (Criança)', min_months: 4, min_presences: 32, recommended: 40, ideal: 48 },
    { belt_level: 'Verde/Laranja (Criança)', min_months: 4, min_presences: 32, recommended: 40, ideal: 48 },
    { belt_level: 'Verde (Criança)', min_months: 4, min_presences: 32, recommended: 40, ideal: 48 },
  ]

  for (const rule of kidsRules) {
    await prisma.beltRuleKids.upsert({
      where: { belt_level: rule.belt_level },
      update: rule,
      create: rule,
    })
  }

  console.log(`✅ ${kidsRules.length} regras de faixa infantil criadas`)

  // 3. Criar usuário admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gbrealengo.com'
  const adminLoginMode = process.env.ADMIN_LOGIN_MODE || 'otp'
  
  console.log(`👤 Criando usuário admin (${adminEmail})...`)

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (!existingAdmin) {
    let passwordHash = null
    if (adminLoginMode === 'password' && process.env.ADMIN_PASSWORD) {
      passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
    }

    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        role: 'admin',
        belt_level: 'Preta (Adulto)',
        belt_core: 'preta',
        is_kids: false,
        password_hash: passwordHash,
      },
    })
    console.log('✅ Admin criado')
  } else {
    console.log('ℹ️  Admin já existe')
  }

  // 4. Criar grade de aulas
  console.log('🥋 Criando grade de aulas...')

  const classes = [
    // Segunda-feira (1)
    { title: 'Gi Todos', weekday: 1, start_time: '06:00', end_time: '07:30', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Kids Básico', weekday: 1, start_time: '07:30', end_time: '08:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Intermediário', weekday: 1, start_time: '08:30', end_time: '09:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Avançado', weekday: 1, start_time: '09:30', end_time: '10:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Gi Todos', weekday: 1, start_time: '10:30', end_time: '12:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'No-Gi Todos', weekday: 1, start_time: '12:00', end_time: '13:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Kids Básico', weekday: 1, start_time: '16:00', end_time: '17:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Intermediário', weekday: 1, start_time: '17:00', end_time: '18:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Avançado', weekday: 1, start_time: '18:00', end_time: '19:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Gi Iniciante', weekday: 1, start_time: '19:00', end_time: '20:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Gi Avançado', weekday: 1, start_time: '20:00', end_time: '21:30', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    
    { title: 'No-Gi Drilling', weekday: 1, start_time: '18:30', end_time: '19:30', location_name: 'Tatame 2º Piso', require_emergency_contact: false },
    { title: 'No-Gi Todos', weekday: 1, start_time: '19:30', end_time: '21:00', location_name: 'Tatame 2º Piso', require_emergency_contact: false },

    // Terça-feira (2)
    { title: 'Gi Todos', weekday: 2, start_time: '06:00', end_time: '07:30', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Kids Básico', weekday: 2, start_time: '07:30', end_time: '08:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Intermediário', weekday: 2, start_time: '08:30', end_time: '09:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Avançado', weekday: 2, start_time: '09:30', end_time: '10:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Gi Todos', weekday: 2, start_time: '10:30', end_time: '12:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'No-Gi Todos', weekday: 2, start_time: '12:00', end_time: '13:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Kids Básico', weekday: 2, start_time: '16:00', end_time: '17:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Intermediário', weekday: 2, start_time: '17:00', end_time: '18:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Avançado', weekday: 2, start_time: '18:00', end_time: '19:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Gi Iniciante', weekday: 2, start_time: '19:00', end_time: '20:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Gi Avançado', weekday: 2, start_time: '20:00', end_time: '21:30', location_name: 'Tatame 1º Piso', require_emergency_contact: false },

    // Quarta-feira (3)
    { title: 'Gi Todos', weekday: 3, start_time: '06:00', end_time: '07:30', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Kids Básico', weekday: 3, start_time: '07:30', end_time: '08:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Intermediário', weekday: 3, start_time: '08:30', end_time: '09:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Avançado', weekday: 3, start_time: '09:30', end_time: '10:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Gi Todos', weekday: 3, start_time: '10:30', end_time: '12:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'No-Gi Todos', weekday: 3, start_time: '12:00', end_time: '13:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Kids Básico', weekday: 3, start_time: '16:00', end_time: '17:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Intermediário', weekday: 3, start_time: '17:00', end_time: '18:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Avançado', weekday: 3, start_time: '18:00', end_time: '19:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Gi Iniciante', weekday: 3, start_time: '19:00', end_time: '20:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Gi Avançado', weekday: 3, start_time: '20:00', end_time: '21:30', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    
    { title: 'No-Gi Drilling', weekday: 3, start_time: '18:30', end_time: '19:30', location_name: 'Tatame 2º Piso', require_emergency_contact: false },
    { title: 'No-Gi Todos', weekday: 3, start_time: '19:30', end_time: '21:00', location_name: 'Tatame 2º Piso', require_emergency_contact: false },

    // Quinta-feira (4)
    { title: 'Gi Todos', weekday: 4, start_time: '06:00', end_time: '07:30', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Kids Básico', weekday: 4, start_time: '07:30', end_time: '08:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Intermediário', weekday: 4, start_time: '08:30', end_time: '09:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Avançado', weekday: 4, start_time: '09:30', end_time: '10:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Gi Todos', weekday: 4, start_time: '10:30', end_time: '12:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'No-Gi Todos', weekday: 4, start_time: '12:00', end_time: '13:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Kids Básico', weekday: 4, start_time: '16:00', end_time: '17:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Intermediário', weekday: 4, start_time: '17:00', end_time: '18:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Avançado', weekday: 4, start_time: '18:00', end_time: '19:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Gi Iniciante', weekday: 4, start_time: '19:00', end_time: '20:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Gi Avançado', weekday: 4, start_time: '20:00', end_time: '21:30', location_name: 'Tatame 1º Piso', require_emergency_contact: false },

    // Sexta-feira (5)
    { title: 'Gi Todos', weekday: 5, start_time: '06:00', end_time: '07:30', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Kids Básico', weekday: 5, start_time: '07:30', end_time: '08:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Intermediário', weekday: 5, start_time: '08:30', end_time: '09:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Avançado', weekday: 5, start_time: '09:30', end_time: '10:30', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Gi Todos', weekday: 5, start_time: '10:30', end_time: '12:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'No-Gi Todos', weekday: 5, start_time: '12:00', end_time: '13:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Kids Básico', weekday: 5, start_time: '16:00', end_time: '17:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Intermediário', weekday: 5, start_time: '17:00', end_time: '18:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Kids Avançado', weekday: 5, start_time: '18:00', end_time: '19:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Gi Iniciante', weekday: 5, start_time: '19:00', end_time: '20:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    { title: 'Gi Avançado', weekday: 5, start_time: '20:00', end_time: '21:30', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
    
    { title: 'No-Gi Drilling', weekday: 5, start_time: '18:30', end_time: '19:30', location_name: 'Tatame 2º Piso', require_emergency_contact: false },
    { title: 'No-Gi Todos', weekday: 5, start_time: '19:30', end_time: '21:00', location_name: 'Tatame 2º Piso', require_emergency_contact: false },

    // Sábado (6)
    { title: 'Kids Todos', weekday: 6, start_time: '09:00', end_time: '10:00', location_name: 'Tatame 1º Piso', require_emergency_contact: true },
    { title: 'Gi Todos', weekday: 6, start_time: '10:00', end_time: '12:00', location_name: 'Tatame 1º Piso', require_emergency_contact: false },
  ]

  for (const classData of classes) {
    const existing = await prisma.class.findFirst({
      where: {
        title: classData.title,
        weekday: classData.weekday,
        start_time: classData.start_time,
      },
    })

    if (!existing) {
      await prisma.class.create({ data: classData })
    }
  }

  console.log(`✅ ${classes.length} aulas criadas na grade`)

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
