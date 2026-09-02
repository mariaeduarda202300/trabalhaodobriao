const prisma = require("../config/db");
const { validarEmprestimo } = require("../utils/validations");

async function listEmprestimos(req, res) {
  try {
    const emprestimos = await prisma.emprestimo.findMany({
      include: { book: true, user: { select: { id: true, username: true, email: true } } },
      orderBy: { dataEmprestimo: "desc" },
    });
    res.json(emprestimos);
  } catch (err) {
    console.error("Erro ao listar empréstimos:", err);
    res.status(500).json({ error: "Error fetching emprestimos" });
  }
}

async function getMeusEmprestimos(req, res) {
  try {
    const emprestimos = await prisma.emprestimo.findMany({
      where: { userId: req.user.id },
      include: { book: true },
      orderBy: { dataEmprestimo: "desc" },
    });
    res.json(emprestimos);
  } catch (err) {
    console.error("Erro ao listar meus empréstimos:", err);
    res.status(500).json({ error: "Error fetching emprestimos" });
  }
}

async function getEmprestimoById(req, res) {
  try {
    const emprestimo = await prisma.emprestimo.findUnique({
      where: { id: req.params.id },
      include: { book: true, user: { select: { id: true, username: true, email: true } } },
    });
    if (!emprestimo) {
      return res.status(404).json({ error: "Emprestimo not found" });
    }
    res.json(emprestimo);
  } catch (err) {
    console.error("Erro ao buscar empréstimo:", err);
    res.status(500).json({ error: "Error fetching emprestimo" });
  }
}

// POST /emprestimos — cria um empréstimo para o usuário autenticado.
// Regra de negócio: não permite empréstimo se não houver exemplares
// disponíveis (quantidade cadastrada - empréstimos em aberto <= 0).
async function createEmprestimo(req, res) {
  const { bookId, dataDevolucaoPrevista } = req.body;

  const erros = validarEmprestimo({ bookId, dataDevolucaoPrevista });
  if (erros.length > 0) {
    return res.status(400).json({ error: erros.join(" ") });
  }

  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const emprestimosAbertos = await prisma.emprestimo.count({
      where: { bookId, status: "ABERTO" },
    });
    const disponivel = book.quantidade - emprestimosAbertos;
    if (disponivel <= 0) {
      return res.status(400).json({ error: "Não há exemplares disponíveis para empréstimo deste livro." });
    }

    const emprestimo = await prisma.emprestimo.create({
      data: {
        bookId,
        userId: req.user.id,
        dataDevolucaoPrevista: new Date(dataDevolucaoPrevista),
      },
      include: { book: true },
    });
    res.status(201).json(emprestimo);
  } catch (err) {
    console.error("Erro ao criar empréstimo:", err);
    res.status(500).json({ error: "Error creating emprestimo" });
  }
}

// PUT /emprestimos/:id/devolver — marca o empréstimo como devolvido.
async function devolverEmprestimo(req, res) {
  try {
    const emprestimo = await prisma.emprestimo.findUnique({ where: { id: req.params.id } });
    if (!emprestimo) {
      return res.status(404).json({ error: "Emprestimo not found" });
    }
    if (emprestimo.userId !== req.user.id) {
      return res.status(403).json({ error: "Você não tem permissão para devolver este empréstimo." });
    }
    if (emprestimo.status === "DEVOLVIDO") {
      return res.status(400).json({ error: "Este empréstimo já foi devolvido." });
    }

    const atualizado = await prisma.emprestimo.update({
      where: { id: req.params.id },
      data: { status: "DEVOLVIDO", dataDevolucaoReal: new Date() },
    });
    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao devolver empréstimo:", err);
    res.status(500).json({ error: "Error updating emprestimo" });
  }
}

module.exports = {
  listEmprestimos,
  getMeusEmprestimos,
  getEmprestimoById,
  createEmprestimo,
  devolverEmprestimo,
};
