const express = require('express');
const router = express.Router();
const authorController = require('../controllers/AuthorController');
const authenticateToken = require('../middlewares/auth');

router.get('/authors', authenticateToken, authorController.listAuthors);
router.get('/authors/:id', authenticateToken, authorController.getAuthorById);
router.post('/authors', authenticateToken, authorController.createAuthor);
router.put('/authors/:id', authenticateToken, authorController.updateAuthor);
router.delete('/authors/:id', authenticateToken, authorController.deleteAuthor);

module.exports = router;

// CURL exemplos
// curl -X GET http://localhost:3000/api/authors
// curl -X POST http://localhost:3000/api/authors -H "Content-Type: application/json" -d '{"nome":"J.R.R. Tolkien","nacionalidade":"Britânico"}'
