const prisma = require("../config/db");
const { validarPerfil } = require("../utils/validations");

// GET /me/perfil — retorna o perfil (1:1) do usuário autenticado.
async function getMeuPerfil(req, res) {
  try {
    const perfil = await prisma.perfil.findUnique({ where: { userId: req.user.id } });
    if (!perfil) {
      return res.status(404).json({ error: "Perfil não encontrado." });
    }
    res.json(perfil);
  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    res.status(500).json({ error: "Error fetching perfil" });
  }
}

// POST /me/perfil — cria o perfil do usuário autenticado.
// Regra de negócio: um usuário não pode ter dois perfis (relação 1:1).
async function createPerfil(req, res) {
  const { nomeCompleto, telefone, endereco } = req.body;

  const erros = validarPerfil({ nomeCompleto });
  if (erros.length > 0) {
    return res.status(400).json({ error: erros.join(" ") });
  }

  try {
    const jaExiste = await prisma.perfil.findUnique({ where: { userId: req.user.id } });
    if (jaExiste) {
      return res.status(400).json({ error: "Usuário já possui um perfil cadastrado." });
    }

    const perfil = await prisma.perfil.create({
      data: {
        nomeCompleto: nomeCompleto.trim(),
        telefone: telefone ? telefone.trim() : null,
        endereco: endereco ? endereco.trim() : null,
        userId: req.user.id,
      },
    });
    res.status(201).json(perfil);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Usuário já possui um perfil cadastrado." });
    }
    console.error("Erro ao criar perfil:", err);
    res.status(500).json({ error: "Error creating perfil" });
  }
}

// PUT /me/perfil — atualiza o perfil do usuário autenticado.
async function updatePerfil(req, res) {
  const { nomeCompleto, telefone, endereco } = req.body;

  const erros = validarPerfil({ nomeCompleto });
  if (erros.length > 0) {
    return res.status(400).json({ error: erros.join(" ") });
  }

  try {
    const existente = await prisma.perfil.findUnique({ where: { userId: req.user.id } });
    if (!existente) {
      return res.status(404).json({ error: "Perfil não encontrado." });
    }

    const perfil = await prisma.perfil.update({
      where: { userId: req.user.id },
      data: {
        nomeCompleto: nomeCompleto.trim(),
        telefone: telefone ? telefone.trim() : null,
        endereco: endereco ? endereco.trim() : null,
      },
    });
    res.json(perfil);
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    res.status(500).json({ error: "Error updating perfil" });
  }
}

module.exports = {
  getMeuPerfil,
  createPerfil,
  updatePerfil,
};
