# ![RabbitMQ](../RabbitMQ.png) Lista de Compras - Microsserviços com RabbitMQ

Sistema de microsserviços de Lista de Compras com mensageria assíncrona implementada usando RabbitMQ para desacoplar operações críticas do fluxo principal.

## Funcionalidades

- **Gerenciamento de Usuários**: Registro e autenticação com JWT
- **Listas de Compras**: Criação e gerenciamento de listas
- **Itens e Produtos**: Controle de produtos e itens nas listas
- **Checkout Assíncrono**: Finalização de compras com processamento em background
- **Notificações**: Envio automático de comprovantes por email (simulado)
- **Analytics**: Cálculo de estatísticas de vendas em tempo real

## Arquitetura de Mensageria

O sistema utiliza RabbitMQ para processamento assíncrono de eventos de checkout:

- **Exchange**: `shopping_events` (tipo: topic)
- **Routing Key**: `list.checkout.completed`
- **Consumer A (Notification Service)**: Envia comprovantes para usuários
- **Consumer B (Analytics Service)**: Calcula estatísticas e métricas

### Fluxo de Mensageria

1. Cliente faz checkout da lista via API
2. List Service retorna **202 Accepted** imediatamente
3. Mensagem publicada no exchange `shopping_events`
4. Consumers processam mensagem de forma independente
5. Logs aparecem nos terminais dos consumers

## Tecnologias Utilizadas

- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **RabbitMQ**: Message broker
- **amqplib**: Cliente RabbitMQ para Node.js
- **JWT**: Autenticação por tokens
- **Docker**: Containerização do RabbitMQ

## Estrutura da Aplicação

```
RabbitMQ/
├── api-gateway/           # Gateway de entrada (porta 3000)
├── services/
│   ├── user-service/      # Gerenciamento de usuários (porta 3001)
│   ├── list-service/      # Gerenciamento de listas (porta 3002)
│   └── product-service/   # Gerenciamento de produtos (porta 3003)
├── consumers/
│   ├── notification-service.js  # Consumer A - Notificações
│   └── analytics-service.js     # Consumer B - Analytics
├── shared/
│   ├── rabbitmq.js        # Módulo compartilhado RabbitMQ
│   ├── JsonDatabase.js    # Database em JSON
│   └── serviceRegistry.js # Registro de serviços
├── scripts/
│   ├── start-services.sh  # Inicia microsserviços
│   ├── start-consumers.sh # Inicia consumers
│   └── test-checkout-manual.sh # Teste de checkout
└── database/              # Dados persistidos
```

## Pré-requisitos

- Node.js (versão 14 ou superior)
- Docker e Docker Compose
- npm ou yarn
- Git

## Instalação e Execução

### 1. Iniciar RabbitMQ

```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

Acesse o Management UI em: http://localhost:15672 (guest/guest)

### 2. Instalar Dependências

```bash
cd RabbitMQ
npm install
```

### 3. Executar o Sistema

**Terminal 1 - Serviços:**
```bash
./start-services.sh
```

**Terminal 2 - Consumers:**
```bash
./start-consumers.sh
```

**Terminal 3 - Teste de Checkout:**
```bash
./test-checkout-manual.sh
```

## Demonstração

### Roteiro de Demonstração

1. **Setup**: Abra o RabbitMQ Management (http://localhost:15672)
2. **Disparo**: Execute o script de teste `./test-checkout-manual.sh`
3. **Evidências**:
   - API responde com **202 Accepted** rapidamente
   - Terminal dos Consumers mostra logs de processamento
   - RabbitMQ Management exibe gráficos de mensagens

### Logs Esperados

**Notification Service:**
```
Enviando comprovante da lista [ID] para o usuário [EMAIL]
```

**Analytics Service:**
```
Total de checkouts: 1
Total gasto: R$ 36.40
```

## Endpoints da API

### Autenticação
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login

### Listas
- `POST /lists` - Criar lista
- `GET /lists` - Listar todas
- `POST /lists/:id/items` - Adicionar item
- `POST /lists/:id/checkout` - Finalizar compra (202 Accepted)

## Comandos Úteis

```bash
# Verificar status do RabbitMQ
docker ps | grep rabbitmq

# Ver logs dos consumers
tail -f /tmp/consumers.log

# Limpar portas ocupadas
lsof -ti:3000,3001,3002,3003 | xargs kill -9

# Parar RabbitMQ
docker stop rabbitmq
docker rm rabbitmq
```

## Verificação no RabbitMQ Management

Acesse http://localhost:15672 e verifique:

- **Connections**: 3 conexões ativas (1 producer + 2 consumers)
- **Exchanges**: `shopping_events` com mensagens publicadas
- **Queues**: `notification_queue` e `analytics_queue` com mensagens processadas

## Desenvolvimento

```bash
# Iniciar apenas os serviços
npm run start

# Iniciar apenas os consumers
npm run start:consumers

# Executar consumer específico
npm run start:notification
npm run start:analytics
```
