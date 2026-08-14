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

function validarLivro({ titulo, autor, isbn, descricao, quantidade }) {
  const erros = [];

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
    erros.push('Título é obrigatório.');
  }
  if (!autor || typeof autor !== 'string' || autor.trim().length === 0) {
    erros.push('Autor é obrigatório.');
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

  return erros;
}

module.exports = {
  validarRegistroUsuario,
  validarLogin,
  validarLivro,
};
