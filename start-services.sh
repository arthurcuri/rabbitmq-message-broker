#!/bin/bash

echo "Limpando portas..."
lsof -ti:3000,3001,3002,3003 | xargs kill -9 2>/dev/null
sleep 1

echo ""
echo "Iniciando serviços..."
echo ""
cd /home/ak/Downloads/Roteiro\ 05/RabbitMQ
npm run start
