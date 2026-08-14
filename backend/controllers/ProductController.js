const prisma = require("../config/db");
const { validarLivro } = require("../utils/validations");

async function listBooks(req, res) {
  try {
    const books = await prisma.book.findMany();
    res.json(books);
  } catch (err) {
    console.error("Erro ao listar livros:", err);
    res.status(500).json({ error: "Error fetching books" });
  }
}

async function getBooksByOwner(req, res) {
  try {
    const books = await prisma.book.findMany({
      where: {
        userId: req.user.id,
      },
    });
    res.json(books);
  } catch (err) {
    console.error("Erro ao listar livros do usuário:", err);
    res.status(500).json({ error: "Error fetching books" });
  }
}

async function getBookById(req, res) {
  try {
    const book = await prisma.book.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
  } catch (err) {
    console.error("Erro ao buscar livro:", err);
    res.status(500).json({ error: "Error fetching book" });
  }
}

async function createBook(req, res) {
  const { titulo, autor, isbn, descricao, quantidade } = req.body;

  const erros = validarLivro({ titulo, autor, isbn, descricao, quantidade });
  if (erros.length > 0) {
    return res.status(400).json({ error: erros.join(" ") });
  }

  try {
    const book = await prisma.book.create({
      data: {
        titulo: titulo.trim(),
        autor: autor.trim(),
        isbn: isbn.trim(),
        descricao: descricao.trim(),
        quantidade: Number(quantidade),
        userId: req.user.id,
      },
    });
    res.status(201).json(book);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "ISBN já cadastrado." });
    }
    console.error("Erro ao criar livro:", err);
    res.status(500).json({ error: "Error creating book" });
  }
}

async function deleteBook(req, res) {
  try {
    // Só permite excluir livros que pertencem ao usuário autenticado.
    const book = await prisma.book.findUnique({ where: { id: req.params.id } });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    if (book.userId !== req.user.id) {
      return res.status(403).json({ error: "Você não tem permissão para excluir este livro." });
    }

    await prisma.book.delete({ where: { id: req.params.id } });
    res.json(book);
  } catch (err) {
    console.error("Erro ao excluir livro:", err);
    res.status(500).json({ error: "Error deleting book" });
  }
}

async function updateBook(req, res) {
  const { titulo, autor, isbn, descricao, quantidade } = req.body;

  const erros = validarLivro({ titulo, autor, isbn, descricao, quantidade });
  if (erros.length > 0) {
    return res.status(400).json({ error: erros.join(" ") });
  }

  try {
    // Só permite atualizar livros que pertencem ao usuário autenticado.
    const bookExistente = await prisma.book.findUnique({ where: { id: req.params.id } });

    if (!bookExistente) {
      return res.status(404).json({ error: "Book not found" });
    }
    if (bookExistente.userId !== req.user.id) {
      return res.status(403).json({ error: "Você não tem permissão para editar este livro." });
    }

    const book = await prisma.book.update({
      where: {
        id: req.params.id,
      },
      data: {
        titulo: titulo.trim(),
        autor: autor.trim(),
        isbn: isbn.trim(),
        descricao: descricao.trim(),
        quantidade: Number(quantidade),
      },
    });
    res.json(book);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "ISBN já cadastrado." });
    }
    console.error("Erro ao atualizar livro:", err);
    res.status(500).json({ error: "Error updating book" });
  }
}

module.exports = {
  listBooks,
  getBooksByOwner,
  getBookById,
  createBook,
  deleteBook,
  updateBook,
};
