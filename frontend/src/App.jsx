import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import MouseFollower from './components/MouseFollower.jsx';
import RotaProtegida from './components/RotaProtegida.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Products from './pages/Products.jsx';
import Authors from './pages/Authors.jsx';
import Emprestimos from './pages/Emprestimos.jsx';
import Reservas from './pages/Reservas.jsx';

function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <h1> Biblioteca </h1>
      <nav className="topbar-nav">
        <NavLink to="/books">Livros</NavLink>
        <NavLink to="/authors">Autores</NavLink>
        <NavLink to="/emprestimos">Empréstimos</NavLink>
        <NavLink to="/reservas">Reservas</NavLink>
      </nav>
      <div className="topbar-user">
        <ThemeToggle />
        <span>Olá, {user?.username}</span>
        <button className="btn btn-secondary btn-small" onClick={logout}>
          Sair
        </button>
      </div>
    </header>
  );
}

function PaginaProtegida({ children }) {
  return (
    <RotaProtegida>
      <div className="app-shell">
        <Topbar />
        {children}
      </div>
    </RotaProtegida>
  );
}

function AppRoutes() {
  const { estaLogado } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <>
            <div className="theme-toggle-fixed">
              <ThemeToggle />
            </div>
            <Login />
          </>
        }
      />
      <Route
        path="/register"
        element={
          <>
            <div className="theme-toggle-fixed">
              <ThemeToggle />
            </div>
            <Register />
          </>
        }
      />

      <Route
        path="/books"
        element={
          <PaginaProtegida>
            <Products />
          </PaginaProtegida>
        }
      />

      <Route
        path="/authors"
        element={
          <PaginaProtegida>
            <Authors />
          </PaginaProtegida>
        }
      />

      <Route
        path="/emprestimos"
        element={
          <PaginaProtegida>
            <Emprestimos />
          </PaginaProtegida>
        }
      />

      <Route
        path="/reservas"
        element={
          <PaginaProtegida>
            <Reservas />
          </PaginaProtegida>
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
          {/* O ThemeToggle agora fica dentro da Topbar (páginas logadas) ou
              junto do Login/Register (páginas sem Topbar) — assim ele nunca
              fica flutuando por cima do botão "Sair". */}

          {/* Livro que segue o mouse (só aparece em telas com mouse de verdade). */}
          <MouseFollower />

          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
