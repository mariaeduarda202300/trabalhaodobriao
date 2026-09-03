const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/RelatorioController');
const authenticateToken = require('../middlewares/auth');

router.get('/relatorios/livros-com-emprestimos', authenticateToken, relatorioController.livrosComEmprestimos);

module.exports = router;

// CURL exemplo
// curl -X GET http://localhost:3000/relatorios/livros-com-emprestimos -H "Authorization: Bearer TOKEN"
