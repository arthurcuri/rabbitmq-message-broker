# 🚀 GUIA RÁPIDO - Testar Mensageria RabbitMQ

## ✅ PRÉ-REQUISITOS
- RabbitMQ rodando (docker): `docker ps | grep rabbitmq`
- Se não estiver rodando: `docker start rabbitmq`

## 📺 ABRIR RABBITMQ MANAGEMENT
Abra no navegador: **http://localhost:15672**
- Usuário: `guest`
- Senha: `guest`

---

## 🎬 EXECUTAR EM 3 TERMINAIS

### **TERMINAL 1 - Serviços** (User, List, Product, Gateway)
```bash
cd /home/ak/Downloads/Roteiro\ 05/RabbitMQ
./start-services.sh
```

**Aguarde até ver:**
- ✅ `API Gateway iniciado na porta 3000`
- ✅ `User Service iniciado na porta 3001`
- ✅ `list-service running on port 3002`
- ✅ `✅ Conectado ao RabbitMQ`

---

### **TERMINAL 2 - Consumers** (Notification + Analytics)
```bash
cd /home/ak/Downloads/Roteiro\ 05/RabbitMQ
./start-consumers.sh
```

**Aguarde até ver:**
- ✅ `Notification Service está rodando!`
- ✅ `Analytics Service está rodando!`
- 👂 `Aguardando mensagens na fila...`

---

### **TERMINAL 3 - Teste de Checkout**
```bash
cd /home/ak/Downloads/Roteiro\ 05/RabbitMQ
./test-checkout-manual.sh
```

**O que vai acontecer:**
1. ✅ Registra usuário de teste
2. ✅ Faz login e obtém token
3. ✅ Cria uma lista
4. ✅ Adiciona 3 itens (Arroz, Feijão, Café)
5. 🚀 **Faz CHECKOUT** (retorna 202 Accepted)

---

## 👀 O QUE OBSERVAR

### No **TERMINAL 2** (Consumers):
Você verá os logs aparecerem **instantaneamente**:

```
📧 NOTIFICATION SERVICE
📩 Enviando comprovante da lista [xxx] para o usuário [teste_xxx@example.com]
✅ Email enviado com sucesso!

📊 ANALYTICS SERVICE
💵 Total gasto: R$ 36.40
📊 ESTATÍSTICAS GLOBAIS:
   Total de checkouts: 1
✅ Dashboard atualizado!
```

### No **RabbitMQ Management** (http://localhost:15672):

#### Aba "Connections"
- Deve mostrar **3 conexões ativas**

#### Aba "Exchanges"
- Clique em `shopping_events`
- Veja a seção **"Message rates"**
- Verá o gráfico mostrando mensagem publicada

#### Aba "Queues"
- `notification_queue` - Total: 0 (já foi processada)
- `analytics_queue` - Total: 0 (já foi processada)
- Clique em cada uma e veja o gráfico **"Message rates"**

---

## 🔄 RODAR OUTRO TESTE

Simplesmente execute novamente:
```bash
./test-checkout-manual.sh
```

Cada vez cria um novo usuário, lista e faz checkout!

---

## 🛑 PARAR TUDO

Nos terminais 1 e 2, pressione: **Ctrl + C**

---

## ✅ CHECKLIST DE SUCESSO

- [ ] RabbitMQ Management aberto
- [ ] Terminal 1: Serviços rodando (4 serviços)
- [ ] Terminal 2: Consumers aguardando mensagens
- [ ] Terminal 3: Checkout retornou 202 Accepted
- [ ] Terminal 2: Logs dos consumers apareceram
- [ ] RabbitMQ Management: Exchange e Queues criados
- [ ] RabbitMQ Management: Gráficos mostrando atividade
