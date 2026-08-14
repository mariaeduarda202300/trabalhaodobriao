
const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

router.post('/register', userController.registerUser);
router.post('/login', userController.doLogin);

// criar rotas de admin, remover usuarios, 
// listar usuários, etc. conforme necessário

module.exports = router;