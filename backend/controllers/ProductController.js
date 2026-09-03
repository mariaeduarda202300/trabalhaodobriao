const prisma = require("../config/db");
const { validarLivro } = require("../utils/validations");

// Inclui os autores (via tabela de junção book_authors) em toda consulta de livro.
const includeAutores = {
  authors: {
    include: { author: true },
  },
};

// Achata book.authors (formato [{ author: {...} }]) em book.autores ([{...}]),
// e calcula quantos exemplares estão disponíveis agora (quantidade total
// menos empréstimos em aberto), para facilitar o consumo pelo frontend.
function formatarLivro(book) {
  const { authors, emprestimos, ...resto } = book;
  return {
    ...resto,
    autores: (authors || []).map((ba) => ba.author),
    ...(emprestimos !== undefined && {
      disponivel: resto.quantidade - emprestimos.filter((e) => e.status === "ABERTO").length,
    }),
  };
}

async function listBooks(req, res) {
  try {
    const books = await prisma.book.findMany({
      include: { ...includeAutores, emprestimos: true },
    });
    res.json(books.map(formatarLivro));
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
      include: { ...includeAutores, emprestimos: true },
    });
    res.json(books.map(formatarLivro));
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
      include: { ...includeAutores, emprestimos: true },
    });
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(formatarLivro(book));
  } catch (err) {
    console.error("Erro ao buscar livro:", err);
    res.status(500).json({ error: "Error fetching book" });
  }
}

async function createBook(req, res) {
  const { titulo, isbn, descricao, quantidade, authorIds } = req.body;

  const erros = validarLivro({ titulo, isbn, descricao, quantidade, authorIds });
  if (erros.length > 0) {
    return res.status(400).json({ error: erros.join(" ") });
  }

  try {
    const book = await prisma.book.create({
      data: {
        titulo: titulo.trim(),
        isbn: isbn.trim(),
        descricao: descricao.trim(),
        quantidade: Number(quantidade),
        userId: req.user.id,
        ...(authorIds &&
          authorIds.length > 0 && {
            authors: {
              create: authorIds.map((authorId) => ({ authorId })),
            },
          }),
      },
      include: includeAutores,
    });
    res.status(201).json(formatarLivro(book));
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "ISBN já cadastrado." });
    }
    if (err.code === "P2003" || err.code === "P2025") {
      return res.status(400).json({ error: "Um dos autores informados não existe." });
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

    // Regra de negócio: não permite excluir um livro que tenha
    // empréstimos em aberto ou reservas ativas.
    const [emprestimoAberto, reservaAtiva] = await Promise.all([
      prisma.emprestimo.findFirst({ where: { bookId: book.id, status: "ABERTO" } }),
      prisma.reserva.findFirst({ where: { bookId: book.id, status: "ATIVA" } }),
    ]);
    if (emprestimoAberto) {
      return res.status(400).json({ error: "Não é possível excluir: há empréstimos em aberto para este livro." });
    }
    if (reservaAtiva) {
      return res.status(400).json({ error: "Não é possível excluir: há reservas ativas para este livro." });
    }

    await prisma.bookAuthor.deleteMany({ where: { bookId: book.id } });
    await prisma.book.delete({ where: { id: req.params.id } });
    res.json(book);
  } catch (err) {
    console.error("Erro ao excluir livro:", err);
    res.status(500).json({ error: "Error deleting book" });
  }
}

async function updateBook(req, res) {
  const { titulo, isbn, descricao, quantidade, authorIds } = req.body;

  const erros = validarLivro({ titulo, isbn, descricao, quantidade, authorIds });
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

    if (authorIds !== undefined) {
      // Substitui completamente o conjunto de autores do livro.
      await prisma.bookAuthor.deleteMany({ where: { bookId: req.params.id } });
    }

    const book = await prisma.book.update({
      where: {
        id: req.params.id,
      },
      data: {
        titulo: titulo.trim(),
        isbn: isbn.trim(),
        descricao: descricao.trim(),
        quantidade: Number(quantidade),
        ...(authorIds !== undefined &&
          authorIds.length > 0 && {
            authors: {
              create: authorIds.map((authorId) => ({ authorId })),
            },
          }),
      },
      include: includeAutores,
    });
    res.json(formatarLivro(book));
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "ISBN já cadastrado." });
    }
    if (err.code === "P2003" || err.code === "P2025") {
      return res.status(400).json({ error: "Um dos autores informados não existe." });
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
