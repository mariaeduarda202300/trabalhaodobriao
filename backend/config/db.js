// config/db.js - VERSÃO CORRETA PARA O PRISMA v7
const { PrismaClient } = require('@prisma/client')
const { PrismaNeon } = require('@prisma/adapter-neon')
const dotenv = require('dotenv')

// Carrega as variáveis do .env
dotenv.config()

// 1. Pega a URL do ambiente
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ DATABASE_URL não encontrada no .env')
  process.exit(1) // Para a execução se não encontrar a URL
}else {
  console.log('✅ DATABASE_URL encontrada no .env')
  console.log(connectionString)
}


const adapter = new PrismaNeon({ connectionString })


// 4. Instancia o PrismaClient, passando SOMENTE o adaptador
//    (NÃO use 'datasources' ou outras propriedades de conexão aqui)
const prisma = new PrismaClient({ adapter })

// (Opcional) Teste rápido de conexão

module.exports = prisma