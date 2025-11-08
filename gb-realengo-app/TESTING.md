# 🧪 Guia Completo de Testes - GB Realengo

## 🚀 Opção 1: Setup Automático (Recomendado)

Execute o script de setup que configura tudo automaticamente:

```bash
cd /workspace/gb-realengo-app
./setup.sh
```

O script vai:
- ✅ Verificar Docker
- ✅ Iniciar Postgres, Mailhog e MinIO
- ✅ Instalar dependências
- ✅ Configurar banco de dados
- ✅ Popular com dados iniciais

Depois execute:
```bash
npm run dev
```

## 📝 Opção 2: Setup Manual

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar Docker
docker-compose up -d

# 3. Aguardar Postgres inicializar
sleep 30

# 4. Configurar banco
npx prisma generate
npx prisma db push
npm run db:seed

# 5. Iniciar servidor
npm run dev
```

---

## 🧪 Cenários de Teste Completos

### 1️⃣ Teste de Login Admin (Via Interface Web)

**Passo a passo:**

1. Acesse: http://localhost:3000

2. Você será redirecionado para `/auth/login`

3. Digite o e-mail: `admin@gbrealengo.com`

4. Clique em **"Enviar Link de Acesso"**

5. Abra outra aba: http://localhost:8025 (Mailhog)

6. Você verá um e-mail com título "Seu link de acesso - GB Realengo"

7. Clique no botão **"Acessar Plataforma"** no e-mail

8. Você será autenticado e redirecionado para `/admin/dashboard`

**Resultado esperado:**
- Dashboard com 4 cards
- Presenças de Hoje: 0 (ainda não há check-ins)
- Usuários Cadastrados: 1 (o admin)

---

### 2️⃣ Teste de Cadastro de Aluno

**Passo a passo:**

1. Abra uma aba anônima/privativa (ou faça logout)

2. Acesse: http://localhost:3000/auth/signup

3. Preencha o formulário:
   ```
   Nome: João Silva
   E-mail: joao@teste.com
   Data de Nascimento: 15/05/1995
   Faixa: Branca (Adulto)
   ```

4. Clique em **"Criar Cadastro"**

5. Será redirecionado para `/auth/login`

6. Digite: `joao@teste.com`

7. Clique em "Enviar Link de Acesso"

8. Acesse Mailhog: http://localhost:8025

9. Clique no link do e-mail

10. Será redirecionado para `/home` (home do aluno)

**Resultado esperado:**
- Tela com "Status da Localização"
- Lista de "Aulas de Hoje"
- Solicitação de permissão de GPS

---

### 3️⃣ Teste de Check-in (GPS Fake)

**Importante:** O check-in só funciona se você estiver dentro do raio de 20m da academia.

**Opção A: Ajustar coordenadas para sua localização atual**

1. Descubra sua localização atual:
   - Acesse: https://www.google.com/maps
   - Clique direito em sua localização
   - Copie as coordenadas (ex: -22.123456, -43.654321)

2. Edite o arquivo `.env`:
   ```env
   SCHOOL_LAT=-22.123456  # Sua latitude
   SCHOOL_LNG=-43.654321  # Sua longitude
   RADIUS_M=500           # Aumente o raio para facilitar teste
   ```

3. Reinicie o servidor:
   ```bash
   # Ctrl+C para parar
   npm run dev
   ```

4. Acesse `/home` logado como aluno

5. Permita acesso à localização

6. Clique em **"Fazer Check-in"** em uma das aulas

**Opção B: Usar extensão de GPS Fake (Chrome)**

1. Instale: "Manual Geolocation" ou "Location Guard"

2. Configure coordenadas:
   ```
   Latitude: -22.8941172
   Longitude: -43.4420113
   ```

3. Ative a extensão

4. Recarregue a página `/home`

5. Clique em "Fazer Check-in"

**Resultado esperado:**
- ✅ "Check-in realizado com sucesso!"
- Ou mensagens de erro claras:
  - "GPS desativado"
  - "Fora do raio permitido"
  - "Fora da janela de check-in"

---

### 4️⃣ Teste de Validações de Check-in

**Teste 1: Duplicidade**
1. Faça check-in em uma aula
2. Tente fazer check-in novamente na mesma aula
3. **Resultado:** Erro "Você já fez check-in nesta aula hoje"

**Teste 2: Fora da Janela**
1. Tente fazer check-in em uma aula que não está na janela (15min antes - 30min depois)
2. **Resultado:** Erro "Fora da janela de check-in"

**Teste 3: GPS com Precisão Ruim**
1. Se sua extensão GPS permite, configure accuracy > 50m
2. **Resultado:** Erro "GPS com precisão insuficiente"

**Teste 4: Fora do Raio**
1. Configure GPS longe das coordenadas da escola
2. **Resultado:** Erro "Você está fora do raio permitido"

---

### 5️⃣ Teste de Perfil e Avatar

**Passo a passo:**

1. Logado como aluno, clique em **"Perfil"** no header

2. Você verá:
   - Avatar placeholder (ícone de usuário)
   - Nome, faixa, data de início
   - Tabs: "Dados Pessoais" e "Saúde e Segurança"

3. **Teste Upload de Avatar:**
   - Clique no ícone de câmera no avatar
   - Selecione uma imagem
   - Aguarde upload
   - Avatar deve aparecer

4. **Teste Edição de Dados:**
   - Altere telefone: (21) 99999-9999
   - Clique em "Salvar Alterações"
   - Veja toast de sucesso

5. **Teste Dados Médicos:**
   - Vá na tab "Saúde e Segurança"
   - Preencha contato de emergência:
     ```
     Nome: Maria Silva
     Telefone: (21) 98888-8888
     ```
   - Se `PROFILE_STUDENT_CAN_EDIT_MEDICAL=false`, campos estarão bloqueados

---

### 6️⃣ Teste de Dashboard Admin

**Passo a passo:**

1. Login como admin

2. Dashboard deve mostrar 4 cards:

**Card 1: Presenças de Hoje**
- KPI com número de check-ins
- Lista dos últimos check-ins
- Botão "Exportar Dia (Excel)"
- Clique para baixar XLSX com check-ins de hoje

**Card 2: Usuários Cadastrados**
- Total de usuários
- Botão "Ver Todos os Usuários"
- Botão "Criar Novo Aluno"

**Card 3: Importar Alunos**
- Botões para baixar template (XLSX/CSV)
- Botão "Fazer Upload"

**Card 4: Relatórios**
- Botões: Hoje, Semana, Mês, Vitalício
- Cada um exporta Excel com dados agregados

---

### 7️⃣ Teste de Import/Export

**Test Import:**

1. Dashboard Admin → Card "Importar Alunos"

2. Clique em **"Baixar Modelo (XLSX)"**

3. Abra o arquivo Excel

4. Preencha com dados de teste:
   ```
   Nome                Email               Telefone      Data Nasc.   Faixa
   Pedro Santos        pedro@teste.com     21999999999   1990-01-15   Azul 1º Grau (Adulto)
   Ana Costa           ana@teste.com       21988888888   2010-05-20   Cinza (Criança)
   Carlos Oliveira     carlos@teste.com    21977777777   1985-12-10   Roxa 2º Grau (Adulto)
   ```

5. Salve o arquivo

6. Clique em **"Fazer Upload"** (você precisará criar esta página ou fazer via API)

**Via API:**
```bash
curl -X POST "http://localhost:3000/api/admin/import/users" \
  -H "Cookie: session=SEU_TOKEN" \
  -F "file=@alunos.xlsx"
```

7. Veja resultado:
   ```json
   {
     "total": 3,
     "success": 3,
     "errors": 0
   }
   ```

**Test Export:**

1. Dashboard → Card "Relatórios"

2. Clique em **"Exportar Semana"**

3. Arquivo XLSX será baixado

4. Abra e verifique colunas:
   - Nome, Email, Telefone
   - Faixa, Belt Core, É Kids
   - Presenças: Semana, Mês, Ano, Total
   - Último Check-in

---

### 8️⃣ Teste de PWA (Progressive Web App)

**No Chrome/Edge:**

1. Acesse http://localhost:3000

2. Faça login

3. Procure ícone de "Instalar" (+) na barra de endereços

4. Clique para instalar

5. App será instalado como aplicativo standalone

6. Teste abrir sem navegador

7. Teste offline (Service Worker deve cachear recursos)

---

## 🔧 Ferramentas de Debug

### Prisma Studio (Ver banco de dados)

```bash
npm run db:studio
```

Acesse: http://localhost:5555

- Veja/edite usuários
- Veja check-ins
- Veja classes
- Veja regras de faixa

### Mailhog (Ver e-mails enviados)

Acesse: http://localhost:8025

- Todos os e-mails aparecem aqui
- Clique para ver HTML/texto
- Clique nos links OTP

### Docker Logs

```bash
# Ver logs do Postgres
docker-compose logs postgres

# Ver logs do Mailhog
docker-compose logs mailhog

# Ver todos os logs
docker-compose logs -f
```

### Next.js Logs

No terminal onde rodou `npm run dev`:
- Veja requests HTTP
- Veja erros de API
- Veja queries Prisma

---

## 🧪 Testes Automatizados

### Testes Unitários (Vitest)

```bash
npm test
```

Testa:
- Funções de geofencing (Haversine, raio, etc)
- Funções de faixas (derivação, validação)
- Utilitários

### Testes E2E (Playwright)

```bash
npm run test:e2e
```

Testa fluxos completos no navegador:
- Login
- Cadastro
- Check-in
- Dashboard admin

---

## 📊 Métricas e Analytics

### Ver estatísticas via API

```bash
# Presenças de hoje
curl "http://localhost:3000/api/admin/metrics/attendance?scope=day&date=2024-01-15"

# Presenças da semana
curl "http://localhost:3000/api/admin/metrics/attendance?scope=week&date=2024-01-15"

# Filtrar por localização
curl "http://localhost:3000/api/admin/metrics/attendance?scope=day&location=1º%20Piso"

# Filtrar por kids
curl "http://localhost:3000/api/admin/metrics/attendance?scope=week&is_kids=true"
```

### Listar usuários via API

```bash
# Todos os usuários (página 1)
curl "http://localhost:3000/api/admin/users?page=1&page_size=10"

# Buscar por nome
curl "http://localhost:3000/api/admin/users?q=João"

# Filtrar por faixa
curl "http://localhost:3000/api/admin/users?belt_core=azul"

# Filtrar kids
curl "http://localhost:3000/api/admin/users?is_kids=true"
```

---

## 🐛 Troubleshooting Comum

### Erro: "Cannot connect to database"

```bash
# Verifique se Postgres está rodando
docker-compose ps

# Reinicie
docker-compose restart postgres

# Aguarde 10 segundos
sleep 10

# Teste conexão
docker-compose exec postgres psql -U postgres -c "SELECT 1"
```

### Erro: "Prisma Client not generated"

```bash
npx prisma generate
```

### Erro: "Table does not exist"

```bash
npx prisma db push --accept-data-loss
npm run db:seed
```

### E-mails não chegam no Mailhog

```bash
# Verifique se Mailhog está rodando
curl http://localhost:8025

# Reinicie
docker-compose restart mailhog
```

### GPS não funciona no navegador

**Chrome:**
1. Settings → Privacy and security → Site settings
2. Location → Permitir
3. Recarregue a página

**Firefox:**
1. about:preferences#privacy
2. Permissions → Location → Settings
3. Allow para localhost

### "Fora do raio permitido" mesmo estando perto

**Solução temporária:** Aumentar raio no `.env`

```env
RADIUS_M=1000  # 1km para facilitar testes
```

Ou usar coordenadas de teste:

```env
SCHOOL_LAT=-22.8941172
SCHOOL_LNG=-43.4420113
```

---

## 📋 Checklist de Testes

Use este checklist para garantir que tudo funciona:

### Autenticação
- [ ] Cadastro de novo usuário
- [ ] Login OTP (aluno)
- [ ] Login OTP (admin)
- [ ] Login senha (admin, se habilitado)
- [ ] E-mails chegam no Mailhog
- [ ] Links OTP funcionam
- [ ] Sessão persiste (cookie)
- [ ] Logout funciona

### Check-in
- [ ] GPS solicita permissão
- [ ] Status GPS aparece corretamente
- [ ] Check-in dentro do raio funciona
- [ ] Check-in fora do raio é bloqueado
- [ ] Check-in fora da janela é bloqueado
- [ ] Duplicidade é bloqueada
- [ ] Kids sem contato de emergência é bloqueado
- [ ] Mensagens de erro são claras

### Perfil
- [ ] Visualizar dados pessoais
- [ ] Editar nome, telefone, data de nascimento
- [ ] Upload de avatar
- [ ] Avatar aparece após upload
- [ ] Remover avatar
- [ ] Ver dados médicos
- [ ] Editar dados médicos (se permitido)
- [ ] Contato de emergência para kids

### Admin Dashboard
- [ ] 4 cards aparecem
- [ ] Presenças de hoje (KPI correto)
- [ ] Lista de check-ins de hoje
- [ ] Export Excel funciona
- [ ] Total de usuários correto
- [ ] Links para outras páginas funcionam

### Import/Export
- [ ] Download template XLSX
- [ ] Download template CSV
- [ ] Import XLSX com sucesso
- [ ] Import CSV com sucesso
- [ ] Erros de import são reportados
- [ ] Export relatório dia
- [ ] Export relatório semana
- [ ] Export relatório mês
- [ ] Export relatório vitalício
- [ ] Dados exportados estão corretos

### PWA
- [ ] Manifest carrega
- [ ] Service Worker registra
- [ ] Ícone de instalação aparece
- [ ] Instalação funciona
- [ ] App abre standalone
- [ ] Cache funciona offline

### API
- [ ] Rotas públicas acessíveis
- [ ] Rotas protegidas bloqueadas sem auth
- [ ] Admin routes bloqueadas para não-admin
- [ ] Respostas JSON corretas
- [ ] Erros retornam mensagens claras

---

## 🎯 Próximos Passos

Depois de testar localmente, considere:

1. **Deploy em staging:**
   - Vercel + Supabase (Postgres)
   - Configurar SMTP real (SendGrid)
   - Testar em dispositivos móveis reais

2. **Testes de carga:**
   - Simular 100+ check-ins simultâneos
   - Testar import de 1000+ alunos

3. **Segurança:**
   - Audit de dependências: `npm audit`
   - Scan de vulnerabilidades
   - Teste de penetração

4. **Monitoramento:**
   - Configurar Sentry para erros
   - Analytics com Vercel Analytics
   - Logs com Datadog ou similar

---

Pronto! Agora você tem um guia completo para testar todas as funcionalidades do GB Realengo App! 🥋
