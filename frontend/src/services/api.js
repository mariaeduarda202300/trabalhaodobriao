import axios from 'axios';

// URL base do backend
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ------------------------------------------------------------------
// Interceptor:
// Antes de toda requisição, se existir um token,
// ele é colocado automaticamente no Authorization.
// ------------------------------------------------------------------
api.interceptors.request.use((config) => {

  const token = config.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ------------------------------------------------------------------
// Tratamento único de erros.
// ------------------------------------------------------------------
async function request(config) {
  try {
    const response = await api(config);

    return response.data;

  } catch (error) {

    const mensagem =
      error.response?.data?.error ||
      'Erro ao comunicar com o servidor.';

    throw new Error(mensagem);
  }
}

// ===============================================================
// LOGIN / CADASTRO
// ===============================================================

export function registrar({ email, username, password }) {

  return request({

    url: '/register',

    method: 'POST',

    data: { email, username, password },

  });

}

export function login({ username, password }) {

  return request({

    url: '/login',

    method: 'POST',

    data: { username, password },

  });

}

// ===============================================================
// LIVROS
// ===============================================================
// Atenção: as rotas de livros no backend vivem sob /api (ver
// server.js -> app.use('/api/', productsRoutes) e ProductsRoute.js).

export function listarLivros(token) {

  return request({

    url: '/api/books',

    token,

  });

}

export function listarLivrosPorDono(token) {

  return request({

    url: '/api/me/books',

    token,

  });

}

export function buscarLivroPorId(id, token) {

  return request({

    url: `/api/books/${id}`,

    token,

  });

}

export function criarLivro(livro, token) {

  return request({

    url: '/api/books',

    method: 'POST',

    data: livro,

    token,

  });

}

export function atualizarLivro(id, livro, token) {

  return request({

    url: `/api/books/${id}`,

    method: 'PUT',

    data: livro,

    token,

  });

}

export function deletarLivro(id, token) {

  return request({

    url: `/api/books/${id}`,

    method: 'DELETE',

    token,

  });

}

// ===============================================================
// AUTORES
// ===============================================================

export function listarAutores(token) {
  return request({ url: '/api/authors', token });
}

export function criarAutor(autor, token) {
  return request({ url: '/api/authors', method: 'POST', data: autor, token });
}

export function atualizarAutor(id, autor, token) {
  return request({ url: `/api/authors/${id}`, method: 'PUT', data: autor, token });
}

export function deletarAutor(id, token) {
  return request({ url: `/api/authors/${id}`, method: 'DELETE', token });
}

// ===============================================================
// PERFIL (1:1 com o usuário)
// ===============================================================

export function buscarMeuPerfil(token) {
  return request({ url: '/me/perfil', token });
}

export function criarPerfil(perfil, token) {
  return request({ url: '/me/perfil', method: 'POST', data: perfil, token });
}

export function atualizarPerfil(perfil, token) {
  return request({ url: '/me/perfil', method: 'PUT', data: perfil, token });
}

// ===============================================================
// EMPRÉSTIMOS
// ===============================================================

export function listarMeusEmprestimos(token) {
  return request({ url: '/me/emprestimos', token });
}

export function criarEmprestimo({ bookId, dataDevolucaoPrevista }, token) {
  return request({
    url: '/emprestimos',
    method: 'POST',
    data: { bookId, dataDevolucaoPrevista },
    token,
  });
}

export function devolverEmprestimo(id, token) {
  return request({ url: `/emprestimos/${id}/devolver`, method: 'PUT', token });
}

// ===============================================================
// RESERVAS
// ===============================================================

export function listarMinhasReservas(token) {
  return request({ url: '/me/reservas', token });
}

export function criarReserva({ bookId }, token) {
  return request({ url: '/reservas', method: 'POST', data: { bookId }, token });
}

export function cancelarReserva(id, token) {
  return request({ url: `/reservas/${id}/cancelar`, method: 'PUT', token });
}

// ===============================================================
// RELATÓRIO (consulta avançada)
// ===============================================================

export function relatorioLivrosComEmprestimos(token) {
  return request({ url: '/relatorios/livros-com-emprestimos', token });
}
