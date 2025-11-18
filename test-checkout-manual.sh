#!/bin/bash

echo "🧪 TESTE DE CHECKOUT COM RABBITMQ"
echo ""

echo "1️⃣  Registrando usuário de teste..."
TS=$(date +%s)
EMAIL="teste_${TS}@example.com"

REGISTER=$(curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"username\": \"teste_${TS}\",
    \"password\": \"test1234\",
    \"firstName\": \"Teste\",
    \"lastName\": \"Checkout\"
  }")

echo "✅ Usuário registrado"
echo ""

echo "2️⃣  Obtendo token..."
TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro ao obter token. Resposta: $REGISTER"
  exit 1
fi

echo "✅ Token obtido"
echo ""

echo "3️⃣  Criando lista..."
CREATE_LIST=$(curl -s -X POST http://localhost:3002/lists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Lista de Teste Checkout",
    "description": "Teste de mensageria RabbitMQ"
  }')

LIST_ID=$(echo $CREATE_LIST | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$LIST_ID" ]; then
  echo "❌ Erro ao criar lista. Resposta: $CREATE_LIST"
  exit 1
fi

echo "✅ Lista criada: $LIST_ID"
echo ""

echo "4️⃣  Adicionando itens..."
curl -s -X POST "http://localhost:3002/lists/${LIST_ID}/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "itemId": "i1",
    "itemName": "Arroz",
    "quantity": 2,
    "unit": "kg",
    "estimatedPrice": 15.90
  }' > /dev/null

curl -s -X POST "http://localhost:3002/lists/${LIST_ID}/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "itemId": "i2",
    "itemName": "Feijão",
    "quantity": 1,
    "unit": "kg",
    "estimatedPrice": 8.50
  }' > /dev/null

curl -s -X POST "http://localhost:3002/lists/${LIST_ID}/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "itemId": "i3",
    "itemName": "Café",
    "quantity": 1,
    "unit": "pacote",
    "estimatedPrice": 12.00
  }' > /dev/null

echo "✅ Itens adicionados"
echo ""

echo "5️⃣  🚀 FAZENDO CHECKOUT (deve retornar 202 Accepted)..."
echo ""
CHECKOUT=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "http://localhost:3002/lists/${LIST_ID}/checkout" \
  -H "Authorization: Bearer $TOKEN")

echo "$CHECKOUT"
echo ""
echo "🎉 SUCESSO!"
echo ""
echo "👀 AGORA VERIFIQUE:"
echo "   1. Terminal dos CONSUMERS - deve mostrar logs de processamento"
echo "   2. RabbitMQ Management (http://localhost:15672)"
echo "      - Aba Queues: notification_queue e analytics_queue"
echo "      - Aba Exchanges: shopping_events"
echo ""
