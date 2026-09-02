const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/PerfilController');
const authenticateToken = require('../middlewares/auth');

router.get('/me/perfil', authenticateToken, perfilController.getMeuPerfil);
router.post('/me/perfil', authenticateToken, perfilController.createPerfil);
router.put('/me/perfil', authenticateToken, perfilController.updatePerfil);

module.exports = router;

// CURL exemplos
// curl -X POST http://localhost:3000/me/perfil -H "Authorization: Bearer TOKEN" -d '{"nomeCompleto":"Maria Silva","telefone":"53999990000"}'
