import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import MouseFollower from './components/MouseFollower.jsx';
import RotaProtegida from './components/RotaProtegida.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Products from './pages/Products.jsx';

function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <h1> Biblioteca </h1>
      <div className="topbar-user">
        <span>Olá, {user?.username}</span>
        <button className="btn btn-secondary btn-small" onClick={logout}>
          Sair
        </button>
      </div>
    </header>
  );
}

function AppRoutes() {
  const { estaLogado } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/books"
        element={
          <RotaProtegida>
            <div className="app-shell">
              <Topbar />
              <Products />
            </div>
          </RotaProtegida>
        }
      />

      <Route
        path="*"
        element={<Navigate to={estaLogado ? '/books' : '/login'} replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {/* Fixo no canto superior direito: funciona em qualquer página
              (login, registro ou livros), sem depender da Topbar. */}
          <div className="theme-toggle-fixed">
            <ThemeToggle />
          </div>

          {/* Livro que segue o mouse (só aparece em telas com mouse de verdade). */}
          <MouseFollower />

          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
