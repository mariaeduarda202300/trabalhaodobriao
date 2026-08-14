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
