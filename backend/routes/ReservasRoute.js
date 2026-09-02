const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/ReservaController');
const authenticateToken = require('../middlewares/auth');

router.get('/reservas', authenticateToken, reservaController.listReservas);
router.get('/me/reservas', authenticateToken, reservaController.getMinhasReservas);
router.get('/reservas/:id', authenticateToken, reservaController.getReservaById);
router.post('/reservas', authenticateToken, reservaController.createReserva);
router.put('/reservas/:id/cancelar', authenticateToken, reservaController.cancelarReserva);

module.exports = router;

// CURL exemplos
// curl -X POST http://localhost:3000/reservas -H "Authorization: Bearer TOKEN" -d '{"bookId":"..."}'
// curl -X PUT http://localhost:3000/reservas/ID/cancelar -H "Authorization: Bearer TOKEN"
