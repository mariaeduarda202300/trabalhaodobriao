const prisma = require("../config/db");
const { validarAutor } = require("../utils/validations");

async function listAuthors(req, res) {
  try {
    const authors = await prisma.author.findMany();
    res.json(authors);
  } catch (err) {
    console.error("Erro ao listar autores:", err);
    res.status(500).json({ error: "Error fetching authors" });
  }
}

async function getAuthorById(req, res) {
  try {
    const author = await prisma.author.findUnique({
      where: { id: req.params.id },
      include: { books: { include: { book: true } } },
    });
    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }
    const { books, ...resto } = author;
    res.json({ ...resto, livros: books.map((b) => b.book) });
  } catch (err) {
    console.error("Erro ao buscar autor:", err);
    res.status(500).json({ error: "Error fetching author" });
  }
}

async function createAuthor(req, res) {
  const { nome, nacionalidade } = req.body;

  const erros = validarAutor({ nome });
  if (erros.length > 0) {
    return res.status(400).json({ error: erros.join(" ") });
  }

  try {
    const author = await prisma.author.create({
      data: {
        nome: nome.trim(),
        nacionalidade: nacionalidade ? nacionalidade.trim() : null,
      },
    });
    res.status(201).json(author);
  } catch (err) {
    console.error("Erro ao criar autor:", err);
    res.status(500).json({ error: "Error creating author" });
  }
}

async function updateAuthor(req, res) {
  const { nome, nacionalidade } = req.body;

  const erros = validarAutor({ nome });
  if (erros.length > 0) {
    return res.status(400).json({ error: erros.join(" ") });
  }

  try {
    const existente = await prisma.author.findUnique({ where: { id: req.params.id } });
    if (!existente) {
      return res.status(404).json({ error: "Author not found" });
    }

    const author = await prisma.author.update({
      where: { id: req.params.id },
      data: {
        nome: nome.trim(),
        nacionalidade: nacionalidade ? nacionalidade.trim() : null,
      },
    });
    res.json(author);
  } catch (err) {
    console.error("Erro ao atualizar autor:", err);
    res.status(500).json({ error: "Error updating author" });
  }
}

async function deleteAuthor(req, res) {
  try {
    const existente = await prisma.author.findUnique({ where: { id: req.params.id } });
    if (!existente) {
      return res.status(404).json({ error: "Author not found" });
    }

    await prisma.bookAuthor.deleteMany({ where: { authorId: req.params.id } });
    await prisma.author.delete({ where: { id: req.params.id } });
    res.json(existente);
  } catch (err) {
    console.error("Erro ao excluir autor:", err);
    res.status(500).json({ error: "Error deleting author" });
  }
}

module.exports = {
  listAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
