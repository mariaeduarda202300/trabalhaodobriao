import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// ==========================================================================
// ROTA PROTEGIDA
// ==========================================================================
// Este componente funciona como um "porteiro": ele recebe a tela que
// queremos proteger (via prop "children") e só a exibe se o usuário
// estiver logado. Caso contrário, redireciona para /login.
//
// Isso espelha, no frontend, o que o middleware authenticateToken faz
// no backend: barra o acesso de quem não tem um token válido.
export default function RotaProtegida({ children }) {
  const { estaLogado } = useAuth();

  if (!estaLogado) {
    // <Navigate> redireciona o usuário sem precisar de um clique.
    // "replace" evita que o usuário volte para a tela protegida
    // usando o botão "voltar" do navegador.
    return <Navigate to="/login" replace />;
  }

  return children;
}
