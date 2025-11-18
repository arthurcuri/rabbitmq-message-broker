const RabbitMQConnection = require('../shared/rabbitmq');

const QUEUE_NAME = 'analytics_queue';
const BINDING_KEY = 'list.checkout.#';

const rabbitmq = new RabbitMQConnection();

// Armazenamento simples de estatísticas
const stats = {
    totalCheckouts: 0,
    totalRevenue: 0,
    totalItems: 0,
    averageCartValue: 0,
    checkouts: []
};

async function processAnalytics(message, routingKey) {
    console.log('\n========================================');
    console.log('📊 ANALYTICS SERVICE');
    console.log('========================================');
    
    // Atualizar estatísticas
    stats.totalCheckouts++;
    stats.totalRevenue += message.estimatedTotal;
    stats.totalItems += message.totalItems;
    stats.averageCartValue = stats.totalRevenue / stats.totalCheckouts;
    
    stats.checkouts.push({
        listId: message.listId,
        userId: message.userId,
        total: message.estimatedTotal,
        items: message.totalItems,
        timestamp: message.completedAt
    });
    
    console.log(`📈 Calculando estatísticas para lista [${message.listId}]`);
    console.log(`💵 Total gasto: R$ ${message.estimatedTotal.toFixed(2)}`);
    console.log(`🛒 Itens comprados: ${message.purchasedItems}/${message.totalItems}`);
    console.log('\n📊 ESTATÍSTICAS GLOBAIS:');
    console.log(`   Total de checkouts: ${stats.totalCheckouts}`);
    console.log(`   Receita total: R$ ${stats.totalRevenue.toFixed(2)}`);
    console.log(`   Total de itens: ${stats.totalItems}`);
    console.log(`   Ticket médio: R$ ${stats.averageCartValue.toFixed(2)}`);
    console.log('========================================\n');
    
    // Simular atualização de dashboard
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('✅ Dashboard atualizado!\n');
}

async function start() {
    try {
        console.log('🚀 Iniciando Analytics Service...');
        await rabbitmq.connect();
        
        await rabbitmq.consume(QUEUE_NAME, BINDING_KEY, processAnalytics);
        
        console.log('✅ Analytics Service está rodando!');
        console.log(`👂 Escutando fila: ${QUEUE_NAME}`);
        console.log(`🔑 Binding key: ${BINDING_KEY}\n`);
    } catch (error) {
        console.error('❌ Erro ao iniciar Analytics Service:', error);
        process.exit(1);
    }
}

// Fechar conexão ao encerrar
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando Analytics Service...');
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log(`   Total de checkouts processados: ${stats.totalCheckouts}`);
    console.log(`   Receita total: R$ ${stats.totalRevenue.toFixed(2)}`);
    console.log(`   Ticket médio: R$ ${stats.averageCartValue.toFixed(2)}\n`);
    await rabbitmq.close();
    process.exit(0);
});

start();
