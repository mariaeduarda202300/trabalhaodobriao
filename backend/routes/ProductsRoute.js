// crie rotas dos livros com o authenticateToken para proteger as rotas
const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const authenticateToken = require('../middlewares/auth');


// Rota para criar um novo livro (protegida)
router.post('/books', authenticateToken, productController.createBook);

// Rota para listar todos os livros (protegida)
router.get('/books', authenticateToken, productController.listBooks);

// Rota para listar livros do usuário logado (protegida)
router.get('/me/books', authenticateToken, productController.getBooksByOwner);

// Rota para obter detalhes de um livro específico (protegida)
router.get('/books/:id', authenticateToken, productController.getBookById);

// Rota para atualizar um livro existente (protegida)
router.put('/books/:id', authenticateToken, productController.updateBook);

// Rota para deletar um livro (protegida)
router.delete('/books/:id', authenticateToken, productController.deleteBook);

module.exports = router;

// CURL exemplos
// curl -X GET http://localhost:3000/api/books
// curl -X GET http://localhost:3000/api/me/books 
// curl -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{"titulo":"Livro 1","autor":"Autor","isbn":"1234567890","descricao":"Descrição","quantidade":3}'
// curl -X PUT http://localhost:3000/api/books/1 -H "Content-Type: application/json" -d '{"titulo":"Livro 1 atualizado","autor":"Autor","isbn":"1234567890","descricao":"Nova descrição","quantidade":5}'
// curl -X DELETE http://localhost:3000/api/books/1