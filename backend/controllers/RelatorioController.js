const prisma = require("../config/db");

// GET /relatorios/livros-com-emprestimos
// Consulta avançada exigida pelo trabalho: combina products (livros),
// book_authors + authors (autores do livro), users (dono do cadastro)
// e emprestimos + users (quem pegou emprestado) em uma única consulta,
// usando include/select aninhado do Prisma (mais de 3 tabelas).
async function livrosComEmprestimos(req, res) {
  try {
    const books = await prisma.book.findMany({
      include: {
        user: { select: { id: true, username: true } },
        authors: { include: { author: true } },
        emprestimos: {
          include: { user: { select: { id: true, username: true, email: true } } },
          orderBy: { dataEmprestimo: "desc" },
        },
        reservas: {
          where: { status: "ATIVA" },
          include: { user: { select: { id: true, username: true } } },
        },
      },
    });

    const relatorio = books.map((book) => {
      const emprestimosAbertos = book.emprestimos.filter((e) => e.status === "ABERTO").length;
      return {
        id: book.id,
        titulo: book.titulo,
        isbn: book.isbn,
        quantidade: book.quantidade,
        disponivel: book.quantidade - emprestimosAbertos,
        cadastradoPor: book.user.username,
        autores: book.authors.map((ba) => ba.author),
        emprestimos: book.emprestimos.map((e) => ({
          id: e.id,
          status: e.status,
          dataEmprestimo: e.dataEmprestimo,
          dataDevolucaoPrevista: e.dataDevolucaoPrevista,
          dataDevolucaoReal: e.dataDevolucaoReal,
          usuario: e.user.username,
        })),
        reservasAtivas: book.reservas.map((r) => ({ id: r.id, usuario: r.user.username, dataReserva: r.dataReserva })),
      };
    });

    res.json(relatorio);
  } catch (err) {
    console.error("Erro ao gerar relatório:", err);
    res.status(500).json({ error: "Error generating relatorio" });
  }
}

module.exports = {
  livrosComEmprestimos,
};
