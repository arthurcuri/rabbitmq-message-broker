const RabbitMQConnection = require('../shared/rabbitmq');

const QUEUE_NAME = 'notification_queue';
const BINDING_KEY = 'list.checkout.#';

const rabbitmq = new RabbitMQConnection();

async function processNotification(message, routingKey) {
    console.log('\n========================================');
    console.log('📧 NOTIFICATION SERVICE');
    console.log('========================================');
    console.log(`📩 Enviando comprovante da lista [${message.listId}] para o usuário [${message.userEmail}]`);
    console.log(`📝 Lista: ${message.listName}`);
    console.log(`📊 Total de itens: ${message.totalItems}`);
    console.log(`💰 Valor estimado: R$ ${message.estimatedTotal.toFixed(2)}`);
    console.log(`⏰ Finalizada em: ${message.completedAt}`);
    console.log('========================================\n');
    
    // Simular envio de email
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('✅ Email enviado com sucesso!\n');
}

async function start() {
    try {
        console.log('🚀 Iniciando Notification Service...');
        await rabbitmq.connect();
        
        await rabbitmq.consume(QUEUE_NAME, BINDING_KEY, processNotification);
        
        console.log('✅ Notification Service está rodando!');
        console.log(`👂 Escutando fila: ${QUEUE_NAME}`);
        console.log(`🔑 Binding key: ${BINDING_KEY}\n`);
    } catch (error) {
        console.error('❌ Erro ao iniciar Notification Service:', error);
        process.exit(1);
    }
}

// Fechar conexão ao encerrar
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando Notification Service...');
    await rabbitmq.close();
    process.exit(0);
});

start();
