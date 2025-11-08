# 🥋 GB Realengo - Check-in App

Sistema completo de check-in com geofencing para academias de Jiu-Jitsu. PWA production-ready com Next.js 15, TypeScript, Prisma, PostgreSQL e autenticação OTP.

## 🚀 Features

- ✅ Autenticação via OTP (magic link por e-mail) ou senha para admin
- ✅ Geofencing com raio configurável (padrão 20m)
- ✅ Janela de check-in configurável (15 min antes, 30 min depois)
- ✅ Validação de precisão do GPS (mínimo 50m)
- ✅ Sistema de faixas (adulto e kids) com regras de progressão
- ✅ Dashboard administrativo completo
- ✅ Import/export Excel e CSV
- ✅ Upload de avatar com processamento (sharp)
- ✅ Dados médicos e contatos de emergência
- ✅ PWA (Progressive Web App) instalável
- ✅ RBAC (Role-Based Access Control)
- ✅ Timezone correto (America/Sao_Paulo)
- ✅ Docker Compose (Postgres + Mailhog + MinIO)

## 📋 Requisitos

- Node.js 18+ 
- PostgreSQL 16+
- npm ou yarn
- Docker e Docker Compose (opcional, mas recomendado)

## 🛠️ Setup Rápido

### 1. Clone e instale dependências

```bash
cd gb-realengo-app
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gb_realengo
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua_secret_key_aqui

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="GB Realengo <noreply@gbrealengo.com>"

SCHOOL_LAT=-22.8941172
SCHOOL_LNG=-43.4420113
RADIUS_M=20
WINDOW_BEFORE_MIN=15
WINDOW_AFTER_MIN=30
MIN_ACCURACY_M=50
AUTO_APPROVE=false
TIMEZONE=America/Sao_Paulo

ADMIN_EMAIL=admin@gbrealengo.com
ADMIN_LOGIN_MODE=otp
# ADMIN_PASSWORD=TroqueNoPrimeiroLogin

FILES_PROVIDER=local
FILES_MAX_SIZE_MB=5

PROFILE_STUDENT_CAN_EDIT_MEDICAL=false
```

### 3. Inicie o banco de dados com Docker

```bash
docker-compose up -d
```

Isso iniciará:
- PostgreSQL na porta 5432
- Mailhog (SMTP dev) nas portas 1025 (SMTP) e 8025 (Web UI)
- MinIO (opcional) nas portas 9000 (API) e 9001 (Console)

### 4. Configure o banco de dados

```bash
# Gera o Prisma Client
npx prisma generate

# Executa as migrações
npx prisma db push

# Popula o banco com dados iniciais (regras de faixa, admin, grade de aulas)
npm run db:seed
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

## 📧 Testando com Mailhog

Para testar o envio de e-mails OTP em desenvolvimento:

1. Acesse http://localhost:8025 (Mailhog Web UI)
2. Solicite login via OTP no app
3. O e-mail aparecerá no Mailhog
4. Clique no link para fazer login

## 🔐 Login Admin

Por padrão, o admin usa OTP. Para testar:

1. Acesse http://localhost:3000/auth/login
2. Digite `admin@gbrealengo.com`
3. Clique em "Enviar Link de Acesso"
4. Abra o Mailhog e clique no link

**Modo senha (opcional):**

```env
ADMIN_LOGIN_MODE=password
ADMIN_PASSWORD=SuaSenhaSegura123
```

Depois re-execute `npm run db:seed` para criar o admin com senha.

## 📱 PWA (Progressive Web App)

O app é instalável como PWA. Para testar:

1. Abra o app no Chrome/Edge
2. Clique no ícone de instalação na barra de endereços
3. Ou vá em Menu > Instalar GB Realengo

## 📊 Estrutura do Projeto

```
gb-realengo-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Autenticação (OTP, password)
│   │   ├── profile/      # Perfil e avatar
│   │   ├── checkins/     # Check-ins
│   │   ├── classes/      # Aulas
│   │   └── admin/        # Rotas admin
│   ├── auth/             # Páginas de autenticação
│   ├── home/             # Home do aluno (check-in)
│   ├── profile/          # Perfil do usuário
│   └── admin/            # Dashboard admin
├── components/           # Componentes React
│   └── ui/              # Componentes UI (shadcn/ui)
├── lib/                 # Helpers e utils
│   ├── auth.ts          # Autenticação (JWT, OTP, bcrypt)
│   ├── geo.ts           # Geofencing (Haversine, validações)
│   ├── belt-utils.ts    # Sistema de faixas
│   ├── email.ts         # Envio de e-mails
│   ├── prisma.ts        # Prisma Client
│   └── utils.ts         # Utilidades gerais
├── prisma/
│   ├── schema.prisma    # Schema do banco
│   └── seed.ts          # Seed (dados iniciais)
├── public/
│   ├── manifest.json    # PWA manifest
│   └── sw.js           # Service Worker
├── docker-compose.yml   # Docker (Postgres, Mailhog, MinIO)
└── README.md
```

## 🎯 Fluxos Principais

### Fluxo do Aluno

1. **Cadastro**: `/auth/signup` - Nome, e-mail, data de nascimento, faixa
2. **Login OTP**: `/auth/login` - Solicita OTP por e-mail
3. **Verificação**: `/auth/verify?token=...` - Clica no link do e-mail
4. **Home**: `/home` - Vê aulas do dia e faz check-in
5. **Perfil**: `/profile` - Edita dados pessoais e avatar

### Fluxo Admin

1. **Login**: `/auth/login` - OTP ou senha
2. **Dashboard**: `/admin/dashboard` - 4 cards principais:
   - Presenças de Hoje (KPI + lista + export)
   - Usuários Cadastrados (atalho criar/listar)
   - Importar Alunos (download template + upload)
   - Relatórios (export vitalício/semana/mês/dia)
3. **Usuários**: `/admin/users` - Lista, busca, edita, exporta
4. **Import**: `/admin/import` - Upload de Excel/CSV

## 📚 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm start            # Inicia servidor de produção
npm run lint         # ESLint
npm run format       # Prettier
npm run typecheck    # TypeScript check
npm test             # Vitest
npm run test:e2e     # Playwright

npm run db:push      # Sincroniza schema com banco
npm run db:seed      # Popula banco com dados iniciais
npm run db:migrate   # Cria migration
npm run db:studio    # Abre Prisma Studio
```

## 🗄️ Banco de Dados

### Principais Tabelas

- **User**: Usuários (alunos, professores, admin)
- **Class**: Grade de aulas
- **Checkin**: Check-ins realizados
- **BeltRule**: Regras de progressão (adulto)
- **BeltRuleKids**: Regras de progressão (kids)
- **OtpToken**: Tokens de autenticação OTP
- **ImportJob / ImportError**: Controle de importações

### Roles

- `student`: Aluno padrão
- `teacher`: Professor (acesso limitado)
- `admin`: Administrador completo

## 🔧 Configurações Avançadas

### Geofencing

Ajuste no `.env`:

```env
SCHOOL_LAT=-22.8941172    # Latitude da academia
SCHOOL_LNG=-43.4420113    # Longitude da academia
RADIUS_M=20               # Raio em metros
MIN_ACCURACY_M=50         # Precisão mínima do GPS
```

### Janela de Check-in

```env
WINDOW_BEFORE_MIN=15   # Minutos antes da aula
WINDOW_AFTER_MIN=30    # Minutos depois da aula
```

### Auto-aprovação

```env
AUTO_APPROVE=true   # Check-ins aprovados automaticamente
```

### Edição de Dados Médicos

```env
PROFILE_STUDENT_CAN_EDIT_MEDICAL=true   # Alunos podem editar seus próprios dados médicos
```

## 📤 Import/Export

### Importar Alunos

1. Baixe o template: `/api/admin/import/users/template?format=xlsx`
2. Preencha os dados:
   - `name` (obrigatório)
   - `email` (obrigatório, chave única)
   - `phone`
   - `date_of_birth` (obrigatório)
   - `belt_level` (obrigatório)
   - `belt_started_at` (opcional)
3. Faça upload via dashboard admin

### Exportar Relatórios

Endpoints disponíveis:

- `/api/admin/reports/attendance/export?format=xlsx&period=day&date=2024-01-15`
- `/api/admin/reports/attendance/export?format=csv&period=week&date=2024-01-15`
- `/api/admin/reports/attendance/export?format=xlsx&period=month&date=2024-01-15`
- `/api/admin/reports/attendance/export?format=xlsx&period=all`

Dados exportados:
- Nome, Email, Telefone
- Faixa, Belt Core, É Kids
- Data Nascimento, Início da Faixa
- Presenças: Semana, Mês, Ano, Total
- Último Check-in

## 🐛 Troubleshooting

### Erro de conexão com Postgres

Certifique-se de que o Docker está rodando:

```bash
docker-compose ps
```

### E-mails não chegam

Verifique o Mailhog: http://localhost:8025

### GPS não funciona

- No Chrome, acesse `chrome://flags` e habilite "Insecure origins treated as secure" com `http://localhost:3000`
- Ou use HTTPS em produção

### Erro de autenticação

Limpe os cookies e faça login novamente.

## 🚀 Deploy em Produção

### Vercel (recomendado para Next.js)

1. Configure PostgreSQL externo (ex: Supabase, Railway, Neon)
2. Configure SMTP externo (ex: SendGrid, Mailgun)
3. Configure variáveis de ambiente na Vercel
4. Deploy: `vercel --prod`

### Docker

```bash
docker build -t gb-realengo-app .
docker run -p 3000:3000 --env-file .env gb-realengo-app
```

## 📝 Critérios de Aceitação (Checklist)

- ✅ Geofence 20m com Haversine
- ✅ Janela check-in (15 min antes, 30 min depois)
- ✅ Precisão mínima GPS (50m)
- ✅ Bloqueio duplicidade (1 check-in/dia/aula)
- ✅ Cadastro 4 campos (nome, email, data nascimento, faixa)
- ✅ Derivação automática belt_core e is_kids
- ✅ Progressão adulto (mín/rec/ideal)
- ✅ Progressão preta anual
- ✅ Dashboard Admin com 4 cards
- ✅ Hoje/Semana/Mês/Ano (métricas)
- ✅ Lista de hoje com filtros
- ✅ Top 20 por período
- ✅ Import XLSX/CSV (upsert por email)
- ✅ Export vitalício/semana/mês/dia
- ✅ Landing Admin pós-login
- ✅ Perfil: edição + avatar (crop/compress) + troca email
- ✅ Saúde: visibilidade/edição por RBAC
- ✅ Kids: validação contato emergência
- ✅ PWA instalável
- ✅ Timezone America/Sao_Paulo

## 📄 Licença

MIT

## 👥 Contato

Para suporte ou dúvidas, entre em contato com a equipe GB Realengo.

---

Desenvolvido com ❤️ para GB Realengo
