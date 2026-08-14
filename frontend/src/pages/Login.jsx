import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CubeButton from '../components/CubeButton.jsx';

export default function Login() {
  // useState cria uma "variável de estado": sempre que ela muda,
  // o React redesenha (re-renderiza) o componente na tela.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate(); // permite mudar de tela via código

  // Função chamada quando o formulário é enviado (botão "Entrar" ou Enter).
  async function handleSubmit(event) {
    event.preventDefault(); // impede o recarregamento padrão da página

    setErro('');
    setCarregando(true);

    try {
      await login(username, password);
      // Se o login der certo, mandamos o usuário para a tela de livros.
      navigate('/books');
    } catch (err) {
      // O AuthContext repassa a mensagem de erro vinda do backend
      // (ex: "Invalid credentials").
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Entrar</h2>

        {/* Só mostramos o bloco de erro se houver uma mensagem de erro */}
        {erro && <div className="alert-error">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
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
            />
          </div>

          <CubeButton
            type="submit"
            disabled={carregando}
            front={carregando ? 'Entrando...' : 'Enviar'}
            back={carregando ? 'entrando...' : 'enviar'}
            right="submeter"
            left="submeter"
            className="btn-primary-cube"
          />
        </form>

        <p className="auth-switch">
          Ainda não tem conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
