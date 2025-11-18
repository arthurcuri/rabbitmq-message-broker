# 🚀 PASSO A PASSO MANUAL - RabbitMQ + Consumers

## ✅ PRÉ-REQUISITO

1. **Abra o RabbitMQ Management no navegador:**
   ```
   http://localhost:15672
   Login: guest
   Senha: guest
   ```
   Deixe essa aba aberta durante todo o processo!

---

## 📍 PASSO 1 - Iniciar Serviços Principais

Abra um **TERMINAL 1**:

```bash
cd /home/ak/Downloads/Roteiro\ 05/RabbitMQ

# Limpar processos antigos (se tiver)
pkill -f node || true

# Iniciar todos os serviços
npm run start
```

**Aguarde até ver:**
- `User Service iniciado na porta 3001`
- `list-service running on port 3002` com `✅ Conectado ao RabbitMQ`
- `API Gateway iniciado na porta 3000`

**✅ Confirme no RabbitMQ Management:**
- Aba "Connections": Deve ter 1 conexão (list-service)
- Aba "Exchanges": Deve ter `shopping_events` (tipo: topic)

---

## 📍 PASSO 2 - Iniciar Consumer de Notificações

Abra um **TERMINAL 2**:

```bash
cd /home/ak/Downloads/Roteiro\ 05/RabbitMQ
npm run start:notification
```

**Aguarde até ver:**
```
✅ Conectado ao RabbitMQ
👂 Aguardando mensagens na fila 'notification_queue'
✅ Notification Service está rodando!
```

**✅ Confirme no RabbitMQ Management:**
- Aba "Connections": Agora deve ter 2 conexões
- Aba "Queues": Deve aparecer `notification_queue`
- Clique na fila → Aba "Bindings" → Deve ter binding com `shopping_events` e routing key `list.checkout.#`

---

## 📍 PASSO 3 - Iniciar Consumer de Analytics

Abra um **TERMINAL 3**:

```bash
cd /home/ak/Downloads/Roteiro\ 05/RabbitMQ
npm run start:analytics
```

**Aguarde até ver:**
```
✅ Conectado ao RabbitMQ
👂 Aguardando mensagens na fila 'analytics_queue'
✅ Analytics Service está rodando!
```

**✅ Confirme no RabbitMQ Management:**
- Aba "Connections": Agora deve ter 3 conexões
- Aba "Queues": Deve aparecer `analytics_queue`

---

## 📍 PASSO 4 - Testar Publicação de Mensagem

Abra um **TERMINAL 4**:

```bash
cd /home/ak/Downloads/Roteiro\ 05/RabbitMQ
node test-rabbitmq-simple.js
```

---

## 🎯 O QUE VOCÊ DEVE VER

### No Terminal 4 (teste):
```
🔌 Conectando ao RabbitMQ...
✅ Conectado!

📤 Publicando mensagem de teste...
✅ Mensagem publicada com sucesso!
```

### No Terminal 2 (Notification Service):
```
========================================
📧 NOTIFICATION SERVICE
========================================
📩 Enviando comprovante da lista [test-123] para o usuário [teste@example.com]
📝 Lista: Lista de Teste RabbitMQ
✅ Email enviado com sucesso!
```

### No Terminal 3 (Analytics Service):
```
========================================
📊 ANALYTICS SERVICE
========================================
📈 Calculando estatísticas para lista [test-123]
💵 Total gasto: R$ 125.50
📊 ESTATÍSTICAS GLOBAIS:
   Total de checkouts: 1
   Receita total: R$ 125.50
✅ Dashboard atualizado!
```

### No RabbitMQ Management:

#### Aba "Queues":
- Clique em `notification_queue`
- Na seção "Overview" → "Message rates"
- Você verá gráfico mostrando mensagens entrando e saindo
- Total messages: 0 (porque foram consumidas)

#### Aba "Exchanges":
- Clique em `shopping_events`
- Vá em "Overview"
- Seção "Message rates" → Você verá pico no gráfico "publish"

---

## 🔄 PASSO 5 - Testar Checkout Completo (Opcional)

Se quiser testar o fluxo completo com autenticação:

No **TERMINAL 4**:

```bash
cd /home/ak/Downloads/Roteiro\ 05/RabbitMQ
node scripts/test-checkout-direct.js
```

Isso vai:
1. Criar um usuário
2. Fazer login
3. Criar uma lista de compras
4. Adicionar itens
5. Fazer checkout (publicar no RabbitMQ)
6. Consumers processam automaticamente

---

## 📊 COMO VERIFICAR NO RABBITMQ MANAGEMENT

### Verificar Conexões:
1. Aba "Connections"
2. Deve mostrar 3 conexões ativas

### Verificar Filas:
1. Aba "Queues"
2. Clique em `notification_queue` ou `analytics_queue`
3. Veja gráfico "Queued messages"
4. Total: 0 (mensagens já foram consumidas)

### Verificar Exchange:
1. Aba "Exchanges"
2. Clique em `shopping_events`
3. Veja gráfico "Message rates in/out"
4. Você verá picos quando publicar mensagens

### Verificar Bindings:
1. Aba "Exchanges" → `shopping_events`
2. Role para baixo até "Bindings"
3. Deve mostrar:
   - `notification_queue` com routing key `list.checkout.#`
   - `analytics_queue` com routing key `list.checkout.#`

---

## 🛑 PARAR TUDO

Quando terminar, pressione `Ctrl+C` em cada terminal (1, 2, 3).

OU execute:
```bash
pkill -f node
```

---

## ❌ TROUBLESHOOTING

### "Porta já em uso"
```bash
pkill -f node
# Aguarde 2 segundos e tente novamente
```

### "Não conecta no RabbitMQ"
```bash
# Verificar se está rodando
docker ps | grep rabbitmq

# Se não estiver, iniciar
docker start rabbitmq

# Ou criar novo
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### "Consumers não aparecem"
- Verifique se os consumers mostram "✅ Conectado ao RabbitMQ"
- Verifique aba "Connections" no RabbitMQ Management
- Reinicie os consumers (Ctrl+C e rode novamente)

---

## ✅ CHECKLIST DE SUCESSO

- [ ] RabbitMQ Management aberto (localhost:15672)
- [ ] Terminal 1: Serviços rodando
- [ ] Terminal 2: Notification Service rodando e conectado
- [ ] Terminal 3: Analytics Service rodando e conectado
- [ ] RabbitMQ Management mostra 3 conexões
- [ ] Aba "Queues" mostra 2 filas
- [ ] Aba "Exchanges" mostra `shopping_events`
- [ ] Terminal 4: Teste executado com sucesso
- [ ] Consumers processaram e mostraram logs
- [ ] Gráficos atualizaram no RabbitMQ Management
