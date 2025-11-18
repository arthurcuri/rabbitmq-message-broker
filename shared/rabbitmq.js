const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const EXCHANGE_NAME = 'shopping_events';

class RabbitMQConnection {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        try {
            this.connection = await amqp.connect(RABBITMQ_URL);
            this.channel = await this.connection.createChannel();
            
            // Declarar exchange do tipo topic
            await this.channel.assertExchange(EXCHANGE_NAME, 'topic', {
                durable: true
            });
            
            console.log('✅ Conectado ao RabbitMQ');
            
            // Lidar com erros de conexão
            this.connection.on('error', (err) => {
                console.error('❌ Erro na conexão RabbitMQ:', err);
            });
            
            this.connection.on('close', () => {
                console.log('⚠️  Conexão RabbitMQ fechada');
            });
            
            return this.channel;
        } catch (error) {
            console.error('❌ Erro ao conectar ao RabbitMQ:', error);
            throw error;
        }
    }

    async publish(routingKey, message) {
        if (!this.channel) {
            throw new Error('Canal RabbitMQ não está conectado');
        }
        
        const messageBuffer = Buffer.from(JSON.stringify(message));
        
        this.channel.publish(
            EXCHANGE_NAME,
            routingKey,
            messageBuffer,
            {
                persistent: true,
                contentType: 'application/json',
                timestamp: Date.now()
            }
        );
        
        console.log(`📤 Mensagem publicada [${routingKey}]:`, message);
    }

    async consume(queueName, bindingKey, callback) {
        if (!this.channel) {
            throw new Error('Canal RabbitMQ não está conectado');
        }
        
        // Declarar fila
        await this.channel.assertQueue(queueName, {
            durable: true
        });
        
        // Vincular fila ao exchange
        await this.channel.bindQueue(queueName, EXCHANGE_NAME, bindingKey);
        
        // Configurar prefetch
        this.channel.prefetch(1);
        
        // Consumir mensagens
        this.channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    const routingKey = msg.fields.routingKey;
                    
                    console.log(`📥 Mensagem recebida [${routingKey}]:`, content);
                    
                    await callback(content, routingKey);
                    
                    // Acknowledge da mensagem
                    this.channel.ack(msg);
                } catch (error) {
                    console.error('❌ Erro ao processar mensagem:', error);
                    // Rejeitar mensagem (não reencaminhar)
                    this.channel.nack(msg, false, false);
                }
            }
        });
        
        console.log(`👂 Aguardando mensagens na fila '${queueName}' com binding key '${bindingKey}'...`);
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            console.log('🔌 Conexão RabbitMQ fechada');
        } catch (error) {
            console.error('❌ Erro ao fechar conexão RabbitMQ:', error);
        }
    }
}

module.exports = RabbitMQConnection;
