const prisma = require("../config/db");
const { validarReserva } = require("../utils/validations");

async function listReservas(req, res) {
  try {
    const reservas = await prisma.reserva.findMany({
      include: { book: true, user: { select: { id: true, username: true, email: true } } },
      orderBy: { dataReserva: "desc" },
    });
    res.json(reservas);
  } catch (err) {
    console.error("Erro ao listar reservas:", err);
    res.status(500).json({ error: "Error fetching reservas" });
  }
}

async function getMinhasReservas(req, res) {
  try {
    const reservas = await prisma.reserva.findMany({
      where: { userId: req.user.id },
      include: { book: true },
      orderBy: { dataReserva: "desc" },
    });
    res.json(reservas);
  } catch (err) {
    console.error("Erro ao listar minhas reservas:", err);
    res.status(500).json({ error: "Error fetching reservas" });
  }
}

async function getReservaById(req, res) {
  try {
    const reserva = await prisma.reserva.findUnique({
      where: { id: req.params.id },
      include: { book: true, user: { select: { id: true, username: true, email: true } } },
    });
    if (!reserva) {
      return res.status(404).json({ error: "Reserva not found" });
    }
    res.json(reserva);
  } catch (err) {
    console.error("Erro ao buscar reserva:", err);
    res.status(500).json({ error: "Error fetching reserva" });
  }
}

// POST /reservas — cria uma reserva para o usuário autenticado.
// Regra de negócio: um mesmo usuário não pode ter duas reservas
// ATIVAS para o mesmo livro.
async function createReserva(req, res) {
  const { bookId } = req.body;

  const erros = validarReserva({ bookId });
  if (erros.length > 0) {
    return res.status(400).json({ error: erros.join(" ") });
  }

  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const reservaExistente = await prisma.reserva.findFirst({
      where: { bookId, userId: req.user.id, status: "ATIVA" },
    });
    if (reservaExistente) {
      return res.status(400).json({ error: "Você já possui uma reserva ativa para este livro." });
    }

    const reserva = await prisma.reserva.create({
      data: { bookId, userId: req.user.id },
      include: { book: true },
    });
    res.status(201).json(reserva);
  } catch (err) {
    console.error("Erro ao criar reserva:", err);
    res.status(500).json({ error: "Error creating reserva" });
  }
}

// PUT /reservas/:id/cancelar
async function cancelarReserva(req, res) {
  try {
    const reserva = await prisma.reserva.findUnique({ where: { id: req.params.id } });
    if (!reserva) {
      return res.status(404).json({ error: "Reserva not found" });
    }
    if (reserva.userId !== req.user.id) {
      return res.status(403).json({ error: "Você não tem permissão para cancelar esta reserva." });
    }
    if (reserva.status !== "ATIVA") {
      return res.status(400).json({ error: "Esta reserva não está ativa." });
    }

    const atualizada = await prisma.reserva.update({
      where: { id: req.params.id },
      data: { status: "CANCELADA" },
    });
    res.json(atualizada);
  } catch (err) {
    console.error("Erro ao cancelar reserva:", err);
    res.status(500).json({ error: "Error updating reserva" });
  }
}

module.exports = {
  listReservas,
  getMinhasReservas,
  getReservaById,
  createReserva,
  cancelarReserva,
};
