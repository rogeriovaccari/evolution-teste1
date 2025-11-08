# 🚀 Quickstart - GB Realengo

## Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

## Instalação Rápida

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar banco de dados (Docker)
```bash
docker-compose up -d
```

Aguarde ~30 segundos para o Postgres inicializar completamente.

### 3. Configurar banco de dados
```bash
# Gerar Prisma Client
npx prisma generate

# Criar tabelas
npx prisma db push

# Popular com dados iniciais (admin, faixas, aulas)
npm run db:seed
```

### 4. Iniciar servidor de desenvolvimento
```bash
npm run dev
```

Acesse: **http://localhost:3000**

## 🧪 Testando o App

### Login como Admin
1. Acesse http://localhost:3000/auth/login
2. Digite: `admin@gbrealengo.com`
3. Clique em "Enviar Link de Acesso"
4. Abra o Mailhog: http://localhost:8025
5. Clique no link do e-mail recebido
6. Você será redirecionado para `/admin/dashboard`

### Criar um Aluno
1. Acesse http://localhost:3000/auth/signup
2. Preencha:
   - Nome: João Silva
   - E-mail: joao@teste.com
   - Data de Nascimento: 1995-05-15
   - Faixa: Branca (Adulto)
3. Clique em "Criar Cadastro"
4. Faça login como fez com o admin

### Testar Check-in
1. Login como aluno (joao@teste.com)
2. Na home, permita acesso à localização
3. **IMPORTANTE**: O GPS precisa estar dentro de 20m da academia
   - Coordenadas configuradas: -22.8941172, -43.4420113
   - Para testar localmente, você pode:
     - Usar extensão de GPS fake no Chrome
     - Ou ajustar as coordenadas no `.env` para sua localização atual

4. Clique em "Fazer Check-in" na aula desejada

### Dashboard Admin
1. Login como admin
2. Veja os 4 cards:
   - Presenças de Hoje
   - Usuários Cadastrados
   - Importar Alunos
   - Relatórios
3. Teste exportar Excel/CSV
4. Teste importar alunos via template

## 🔧 URLs Úteis

- **App**: http://localhost:3000
- **Mailhog** (e-mails): http://localhost:8025
- **MinIO** (S3 local): http://localhost:9001
- **Prisma Studio**: `npm run db:studio`

## 🐛 Troubleshooting

### Erro de conexão com banco
```bash
# Verifique se o Docker está rodando
docker-compose ps

# Reinicie o Postgres
docker-compose restart postgres
```

### E-mails não chegam
- Verifique o Mailhog em http://localhost:8025
- Todos os e-mails aparecem lá instantaneamente

### GPS não funciona
- Chrome: Settings > Site Settings > Location > Permitir
- Ou ajuste SCHOOL_LAT e SCHOOL_LNG no .env para sua localização

### "Fora do raio permitido"
Opção 1: Usar extensão Manual Geolocation no Chrome
Opção 2: Alterar no `.env`:
```env
SCHOOL_LAT=-22.sua-latitude-aqui
SCHOOL_LNG=-43.sua-longitude-aqui
RADIUS_M=1000  # Aumentar raio temporariamente
```

### Limpar tudo e recomeçar
```bash
docker-compose down -v
rm -rf node_modules
npm install
docker-compose up -d
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## 📱 Testar PWA
1. Abra no Chrome/Edge
2. Procure ícone de "Instalar" na barra de endereços
3. Ou: Menu > Instalar GB Realengo
4. O app será instalado como aplicativo standalone

## 🎯 Cenários de Teste

### 1. Fluxo Completo do Aluno
- Cadastro → Login OTP → Home → Check-in → Perfil

### 2. Fluxo Admin
- Login → Dashboard → Criar usuário → Importar Excel → Exportar relatórios

### 3. Validações de Check-in
- GPS desligado (deve dar erro)
- Fora do raio (deve dar erro)
- Fora da janela de horário (deve dar erro)
- Duplicidade (fazer 2x no mesmo dia - deve dar erro)
- Kids sem contato de emergência (deve dar erro)

### 4. Upload de Avatar
- Perfil → Upload foto → Ver preview → Salvar

### 5. Import/Export
- Dashboard → Baixar template
- Preencher Excel com 5 alunos
- Upload → Ver resultado
- Exportar relatório

## 🔐 Credenciais Padrão

**Admin:**
- E-mail: admin@gbrealengo.com
- Método: OTP (magic link)

**Alunos:**
- Criar via signup ou importar via Excel

## ⚙️ Configurações Úteis

### Aprovar check-ins automaticamente
No `.env`:
```env
AUTO_APPROVE=true
```

### Alunos podem editar dados médicos
No `.env`:
```env
PROFILE_STUDENT_CAN_EDIT_MEDICAL=true
```

### Aumentar janela de check-in
No `.env`:
```env
WINDOW_BEFORE_MIN=60  # 1 hora antes
WINDOW_AFTER_MIN=120  # 2 horas depois
```
