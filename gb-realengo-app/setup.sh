#!/bin/bash

echo "🥋 GB Realengo - Setup Automático"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "📦 Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando. Inicie o Docker Desktop e tente novamente.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker está rodando${NC}"
echo ""

# Start Docker Compose
echo "🐳 Iniciando serviços Docker (Postgres, Mailhog, MinIO)..."
docker-compose up -d

echo "⏳ Aguardando Postgres inicializar (30 segundos)..."
sleep 30

# Check if postgres is ready
echo "🔍 Verificando conexão com Postgres..."
until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "⏳ Aguardando Postgres..."
    sleep 2
done
echo -e "${GREEN}✅ Postgres pronto${NC}"
echo ""

# Install dependencies
echo "📦 Instalando dependências..."
npm install

# Generate Prisma Client
echo "🔧 Gerando Prisma Client..."
npx prisma generate

# Push database schema
echo "🗄️  Criando tabelas no banco..."
npx prisma db push --accept-data-loss

# Seed database
echo "🌱 Populando banco com dados iniciais..."
npm run db:seed

echo ""
echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
echo ""
echo "🚀 Para iniciar o servidor:"
echo -e "${YELLOW}   npm run dev${NC}"
echo ""
echo "🌐 URLs importantes:"
echo "   - App:     http://localhost:3000"
echo "   - Mailhog: http://localhost:8025"
echo "   - MinIO:   http://localhost:9001"
echo ""
echo "🔐 Credenciais Admin:"
echo "   - Email: admin@gbrealengo.com"
echo "   - Método: OTP (magic link via e-mail)"
echo ""
echo "📧 Para ver os e-mails OTP, acesse: http://localhost:8025"
echo ""
