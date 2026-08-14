const app = require('./app');
const port = process.env.PORT || 3000;

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
  console.error('❌ Erro não capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  process.exit(1);
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
