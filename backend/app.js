const express = require('express');
const cors = require('cors');
const prisma = require('./config/db');
const productsRoutes = require('./routes/ProductsRoute');
const usersRoutes = require('./routes/UsersRoute');
const authorsRoutes = require('./routes/AuthorsRoute');
const perfilRoutes = require('./routes/PerfilRoute');
const emprestimosRoutes = require('./routes/EmprestimosRoute');
const reservasRoutes = require('./routes/ReservasRoute');
const relatoriosRoutes = require('./routes/RelatoriosRoute');

const app = express();

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

app.use('/api/', productsRoutes);
app.use('/api/', authorsRoutes);
app.use(usersRoutes);
app.use(perfilRoutes);
app.use(emprestimosRoutes);
app.use(reservasRoutes);
app.use(relatoriosRoutes);

// Rota de verificação: confirma se a API está no ar e se a conexão
// com o banco de dados (Neon/Postgres via Prisma) está funcionando.
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('❌ Erro ao conectar no banco:', err.message);
    res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

module.exports = app;
