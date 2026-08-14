// ==========================================================================
// CAMADA DE API
// ==========================================================================
// Este arquivo concentra TODAS as chamadas fetch() para o backend.
//
// Por que fazer isso, em vez de chamar fetch() direto dentro dos componentes?
// 1) Se a URL do backend mudar, só mudamos em um lugar (BASE_URL).
// 2) Se precisarmos mudar como o token é enviado, só mexemos aqui.
// 3) Os componentes React ficam mais limpos, só chamando funções como
//    api.listarProdutos() em vez de escrever fetch(...) toda hora.

// URL base do backend Express (ajuste se o servidor rodar em outra porta/host)
const BASE_URL = 'http://localhost:3000';

// -----------------------------------------------------------------------
// Função auxiliar genérica: monta a requisição, adiciona o token JWT
// (quando existir) no cabeçalho Authorization, e já trata a resposta.
// -----------------------------------------------------------------------
async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Se recebemos um token (usuário logado), enviamos no formato
  // "Bearer <token>", que é o padrão esperado pelo middleware
  // authenticateToken do backend.
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // O backend sempre responde em JSON (mesmo em erros), então tentamos
  // converter. Se por algum motivo não for JSON, tratamos como erro genérico.
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // Usamos a mensagem de erro que o backend enviou (ex: "Invalid credentials"),
    // ou uma mensagem padrão caso o backend não tenha enviado nada.
    const mensagem = data?.error || 'Ocorreu um erro na requisição.';
    throw new Error(mensagem);
  }

  return data;
}

// -----------------------------------------------------------------------
// Endpoints de autenticação (UsersRoute.js -> /register e /login)
// Repare que essas rotas NÃO usam o prefixo /api, conforme o server.js:
//   app.use(usersRoutes);           -> /register, /login
//   app.use('/api/', productsRoutes) -> /api/products, /api/welcome, etc.
// -----------------------------------------------------------------------
export function registrar({ email, username, password }) {
  return request('/register', {
    method: 'POST',
    body: { email, username, password },
  });
}

export function login({ username, password }) {
  return request('/login', {
    method: 'POST',
    body: { username, password },
  });
}

// -----------------------------------------------------------------------
// Endpoints de produtos (ProductsRoute.js -> protegidos por JWT)
// Todas essas funções recebem "token" porque o backend exige o cabeçalho
// Authorization em todas as rotas de produto.
// -----------------------------------------------------------------------
export function listarProdutosporDono(token) {
  return request('/api/me/products', { token });
}

export function buscarProdutoPorId(id, token) {
  return request(`/api/products/${id}`, { token });
}

export function criarProduto({ descricao, preco, quantidade }, token) {
  return request('/api/products', {
    method: 'POST',
    body: { descricao, preco, quantidade },
    token,
  });
}

export function atualizarProduto(id, { descricao, preco, quantidade }, token) {
  return request(`/api/products/${id}`, {
    method: 'PUT',
    body: { descricao, preco, quantidade },
    token,
  });
}

export function deletarProduto(id, token) {
  return request(`/api/products/${id}`, {
    method: 'DELETE',
    token,
  });
}
