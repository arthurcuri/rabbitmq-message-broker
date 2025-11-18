const axios = require('axios');

const API_GATEWAY = 'http://localhost:3000';

async function testCheckout() {
    try {
        console.log('🧪 TESTE DE CHECKOUT COM RABBITMQ\n');
        
        // 1. Login
        console.log('1️⃣  Fazendo login...');
        const loginResponse = await axios.post(`${API_GATEWAY}/auth/login`, {
            email: 'user1@example.com',
            password: 'password123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login realizado com sucesso!\n');
        
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        
        // 2. Criar uma lista
        console.log('2️⃣  Criando lista de compras...');
        const listResponse = await axios.post(`${API_GATEWAY}/lists`, {
            name: 'Compras do Mês',
            description: 'Lista de compras para teste de mensageria'
        }, { headers });
        
        const listId = listResponse.data.id;
        console.log(`✅ Lista criada: ${listId}\n`);
        
        // 3. Adicionar itens à lista
        console.log('3️⃣  Adicionando itens à lista...');
        await axios.post(`${API_GATEWAY}/lists/${listId}/items`, {
            itemId: 'item1',
            itemName: 'Arroz',
            quantity: 2,
            unit: 'kg',
            estimatedPrice: 15.90
        }, { headers });
        
        await axios.post(`${API_GATEWAY}/lists/${listId}/items`, {
            itemId: 'item2',
            itemName: 'Feijão',
            quantity: 1,
            unit: 'kg',
            estimatedPrice: 8.50
        }, { headers });
        
        await axios.post(`${API_GATEWAY}/lists/${listId}/items`, {
            itemId: 'item3',
            itemName: 'Café',
            quantity: 1,
            unit: 'pacote',
            estimatedPrice: 12.00
        }, { headers });
        
        console.log('✅ Itens adicionados!\n');
        
        // 4. Fazer checkout
        console.log('4️⃣  Fazendo checkout da lista...');
        const checkoutResponse = await axios.post(
            `${API_GATEWAY}/lists/${listId}/checkout`,
            {},
            { headers }
        );
        
        console.log('✅ Checkout realizado!');
        console.log(`📝 Status: ${checkoutResponse.status} - ${checkoutResponse.statusText}`);
        console.log(`📦 Resposta:`, checkoutResponse.data);
        console.log('\n🎉 SUCESSO! Aguarde os consumers processarem a mensagem...\n');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
    }
}

// Aguardar um pouco para garantir que os serviços iniciaram
setTimeout(testCheckout, 2000);
