// utils/validations.js
// Funções puras de validação, sem dependência do Express nem do Prisma.
// Isso facilita reaproveitar a lógica e testá-la isoladamente.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarRegistroUsuario({ email, username, password }) {
  const erros = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    erros.push('E-mail inválido.');
  }
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    erros.push('Usuário deve ter pelo menos 3 caracteres.');
  }
  if (!password || typeof password !== 'string' || password.length < 4) {
    erros.push('Senha deve ter pelo menos 4 caracteres.');
  }

  return erros;
}

function validarLogin({ username, password }) {
  const erros = [];

  if (!username || typeof username !== 'string') {
    erros.push('Usuário é obrigatório.');
  }
  if (!password || typeof password !== 'string') {
    erros.push('Senha é obrigatória.');
  }

  return erros;
}

function validarLivro({ titulo, isbn, descricao, quantidade, authorIds }) {
  const erros = [];

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
    erros.push('Título é obrigatório.');
  }
  if (!isbn || typeof isbn !== 'string' || isbn.trim().length === 0) {
    erros.push('ISBN é obrigatório.');
  }
  if (!descricao || typeof descricao !== 'string' || descricao.trim().length === 0) {
    erros.push('Descrição é obrigatória.');
  }

  const quantidadeNum = Number(quantidade);
  if (
    quantidade === undefined ||
    quantidade === null ||
    quantidade === '' ||
    !Number.isInteger(quantidadeNum) ||
    quantidadeNum < 0
  ) {
    erros.push('Quantidade deve ser um número inteiro maior ou igual a zero.');
  }

  if (
    authorIds !== undefined &&
    (!Array.isArray(authorIds) || authorIds.some((id) => typeof id !== 'string' || id.trim().length === 0))
  ) {
    erros.push('authorIds deve ser uma lista de ids de autores.');
  }

  return erros;
}

function validarAutor({ nome }) {
  const erros = [];

  if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
    erros.push('Nome do autor é obrigatório.');
  }

  return erros;
}

function validarPerfil({ nomeCompleto }) {
  const erros = [];

  if (!nomeCompleto || typeof nomeCompleto !== 'string' || nomeCompleto.trim().length === 0) {
    erros.push('Nome completo é obrigatório.');
  }

  return erros;
}

function validarEmprestimo({ bookId, dataDevolucaoPrevista }) {
  const erros = [];

  if (!bookId || typeof bookId !== 'string' || bookId.trim().length === 0) {
    erros.push('bookId é obrigatório.');
  }

  if (!dataDevolucaoPrevista || Number.isNaN(Date.parse(dataDevolucaoPrevista))) {
    erros.push('dataDevolucaoPrevista é obrigatória e deve ser uma data válida.');
  }

  return erros;
}

function validarReserva({ bookId }) {
  const erros = [];

  if (!bookId || typeof bookId !== 'string' || bookId.trim().length === 0) {
    erros.push('bookId é obrigatório.');
  }

  return erros;
}

module.exports = {
  validarRegistroUsuario,
  validarLogin,
  validarLivro,
  validarAutor,
  validarPerfil,
  validarEmprestimo,
  validarReserva,
};
