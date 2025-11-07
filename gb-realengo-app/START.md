# 🚀 COMO INICIAR O GB REALENGO APP

## Comandos Rápidos

### Setup Automático (RECOMENDADO)
```bash
cd /workspace/gb-realengo-app
./setup.sh
npm run dev
```

### Setup Manual
```bash
# 1. Instalar
npm install

# 2. Docker
docker-compose up -d
sleep 30

# 3. Banco
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Iniciar
npm run dev
```

## URLs

- **App**: http://localhost:3000
- **Mailhog**: http://localhost:8025 (para ver e-mails OTP)
- **Prisma Studio**: `npm run db:studio`

## Login

**Admin:**
- Email: admin@gbrealengo.com
- Método: OTP (veja o link no Mailhog)

**Criar Aluno:**
- Acesse: http://localhost:3000/auth/signup

## Testar Check-in

1. Para testar localmente, edite `.env`:
```env
SCHOOL_LAT=-22.sua-latitude
SCHOOL_LNG=-43.sua-longitude
RADIUS_M=500  # Aumente o raio
```

2. Ou use extensão de GPS fake no Chrome

3. Recarregue a página

## Problemas?

Veja `TESTING.md` e `QUICKSTART.md` para guias completos.

**Limpar tudo:**
```bash
docker-compose down -v
rm -rf node_modules
npm install
./setup.sh
```
