import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CubeButton from '../components/CubeButton.jsx';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const { registrar } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await registrar(email, username, password);
      setSucesso(true);

      // Damos um pequeno tempo para o usuário ler a mensagem de sucesso
      // antes de mandá-lo para a tela de login.
      setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      // O backend responde 400 com { error: "User already exists" }
      // quando o username/email já está cadastrado.
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Criar conta</h2>

        {erro && <div className="alert-error">{erro}</div>}
        {sucesso && (
          <div className="alert-error" style={{ color: '#16a394', backgroundColor: '#e6f7f4', borderColor: '#bfe8e0' }}>
            Cadastro realizado! Redirecionando para o login...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>

          <CubeButton
            type="submit"
            disabled={carregando}
            front={carregando ? 'Enviando...' : 'Enviar'}
            back={carregando ? 'enviando...' : 'enviar'}
            right="submeter"
            left="submeter"
            className="btn-primary-cube"
          />
        </form>

        <p className="auth-switch">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
