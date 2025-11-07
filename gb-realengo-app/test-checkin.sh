#!/bin/bash

echo "🧪 Script de Teste - GB Realengo Check-in"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:3000"

echo -e "${BLUE}📝 Este script demonstra como testar a API via curl${NC}"
echo ""

# 1. Criar usuário de teste
echo "1️⃣  Criando usuário de teste..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Teste",
    "email": "joao.teste@exemplo.com",
    "date_of_birth": "1995-05-15",
    "belt_level": "Branca (Adulto)"
  }')

echo "$SIGNUP_RESPONSE" | jq '.' 2>/dev/null || echo "$SIGNUP_RESPONSE"
echo ""

# 2. Solicitar OTP
echo "2️⃣  Solicitando OTP..."
OTP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/otp/request" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.teste@exemplo.com"
  }')

echo "$OTP_RESPONSE" | jq '.' 2>/dev/null || echo "$OTP_RESPONSE"
echo ""

echo -e "${YELLOW}📧 Acesse http://localhost:8025 para ver o e-mail com o link de login${NC}"
echo ""

# 3. Listar classes
echo "3️⃣  Listando aulas disponíveis..."
CLASSES_RESPONSE=$(curl -s "$BASE_URL/api/classes")
echo "$CLASSES_RESPONSE" | jq '.today | .[] | {id, title, start_time, location_name}' 2>/dev/null || echo "$CLASSES_RESPONSE"
echo ""

# Instruções para check-in
echo -e "${BLUE}4️⃣  Para fazer check-in:${NC}"
echo ""
echo "Após fazer login via web, você pode testar o check-in via API:"
echo ""
echo 'curl -X POST "http://localhost:3000/api/checkins" \'
echo '  -H "Content-Type: application/json" \'
echo '  -H "Cookie: session=SEU_TOKEN_AQUI" \'
echo '  -d '"'"'{
    "class_id": "ID_DA_AULA",
    "lat": -22.8941172,
    "lng": -43.4420113,
    "accuracy": 15
  }'"'"
echo ""

echo -e "${GREEN}✅ Testes básicos concluídos!${NC}"
echo ""
echo "💡 Dicas:"
echo "   - Use jq para formatar JSON: sudo apt install jq"
echo "   - Veja os e-mails em: http://localhost:8025"
echo "   - Explore a API no navegador após login"
echo ""
