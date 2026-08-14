import React, { createContext, useContext, useState } from 'react';
import * as api from '../services/api';

// ==========================================================================
// CONTEXT API 
// ==========================================================================
// Vários componentes da aplicação precisam saber "o usuário está logado?"
// e "qual é o token JWT?" (a tela de produtos, a barra superior, as rotas
// protegidas, etc). Se fôssemos passar isso via props, teríamos que
// atravessar vários componentes só para levar essa informação adiante
// (isso é chamado de "prop drilling").
//
// O Context resolve isso: criamos um "contêiner" global (AuthContext),
// colocamos os dados de autenticação dentro dele UMA vez (no AuthProvider),
// e qualquer componente da árvore pode "puxar" esses dados diretamente,
// não importa o quão profundo ele esteja, usando o hook useAuth().

const AuthContext = createContext(null);

// Chave usada para guardar o token no localStorage do navegador.
// Guardamos no localStorage para que o usuário continue logado mesmo
// se recarregar a página (F5).
const STORAGE_KEY = 'my_neon_token';
const STORAGE_USER_KEY = 'my_neon_user';

export function AuthProvider({ children }) {
  // Inicializamos o estado já lendo o que estiver salvo no localStorage.
  // Assim, se o usuário der F5, ele continua logado.
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(() => {
    const salvo = localStorage.getItem(STORAGE_USER_KEY);
    return salvo ? JSON.parse(salvo) : null;
  });

  // ------------------------------------------------------------------
  // login: chama a API, e se der certo, guarda o token no estado E
  // no localStorage (para persistir entre recarregamentos de página).
  // ------------------------------------------------------------------
  async function login(username, password) {
    const data = await api.login({ username, password });
    // O backend retorna { token: "..." }
    setToken(data.token);
    localStorage.setItem(STORAGE_KEY, data.token);

    // O JWT foi assinado com { id, username, email }. Não precisamos
    // decodificar o token aqui; guardamos apenas o username que o
    // próprio usuário digitou, só para exibir na barra superior.
    const infoUsuario = { username };
    setUser(infoUsuario);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(infoUsuario));
  }

  // ------------------------------------------------------------------
  // registrar: apenas repassa para a API. Não faz login automático,
  // pois o backend não retorna token no cadastro — o aluno faz login
  // em seguida, na tela de Login.
  // ------------------------------------------------------------------
  async function registrar(email, username, password) {
    await api.registrar({ email, username, password });
  }

  // ------------------------------------------------------------------
  // logout: limpa tudo (estado + localStorage).
  // ------------------------------------------------------------------
  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  }

  // O "value" é o que fica disponível para quem usar useAuth().
  const value = {
    token,
    user,
    estaLogado: !!token, // !! transforma qualquer valor em booleano puro
    login,
    registrar,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook customizado: em vez de todo componente escrever
// useContext(AuthContext), eles simplesmente chamam useAuth().
// Isso também facilita dar um erro claro caso alguém use o hook
// fora do <AuthProvider>.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um <AuthProvider>');
  }
  return context;
}
