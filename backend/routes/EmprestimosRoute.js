const express = require('express');
const router = express.Router();
const emprestimoController = require('../controllers/EmprestimoController');
const authenticateToken = require('../middlewares/auth');

router.get('/emprestimos', authenticateToken, emprestimoController.listEmprestimos);
router.get('/me/emprestimos', authenticateToken, emprestimoController.getMeusEmprestimos);
router.get('/emprestimos/:id', authenticateToken, emprestimoController.getEmprestimoById);
router.post('/emprestimos', authenticateToken, emprestimoController.createEmprestimo);
router.put('/emprestimos/:id/devolver', authenticateToken, emprestimoController.devolverEmprestimo);

module.exports = router;

// CURL exemplos
// curl -X POST http://localhost:3000/emprestimos -H "Authorization: Bearer TOKEN" -d '{"bookId":"...","dataDevolucaoPrevista":"2026-09-20"}'
// curl -X PUT http://localhost:3000/emprestimos/ID/devolver -H "Authorization: Bearer TOKEN"
