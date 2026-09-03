import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as api from '../services/api.js';

function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function Emprestimos() {
  const { token } = useAuth();

  const [emprestimos, setEmprestimos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const dados = await api.listarMeusEmprestimos(token);
      setEmprestimos(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleDevolver(emprestimo) {
    setErro('');
    try {
      await api.devolverEmprestimo(emprestimo.id, token);
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="container">
      {erro && <div className="alert-error">{erro}</div>}

      <div className="table-wrapper">
        {carregando ? (
          <div className="loading-state">Carregando empréstimos...</div>
        ) : emprestimos.length === 0 ? (
          <div className="empty-state">
            Você ainda não tem empréstimos. Vá até a tela de Livros e clique em
            "Emprestar".
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Livro</th>
                <th>Empréstimo</th>
                <th>Devolução prevista</th>
                <th>Devolução real</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {emprestimos.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.book?.titulo}</td>
                  <td>{formatarData(emp.dataEmprestimo)}</td>
                  <td>{formatarData(emp.dataDevolucaoPrevista)}</td>
                  <td>{formatarData(emp.dataDevolucaoReal)}</td>
                  <td>{emp.status}</td>
                  <td className="actions">
                    {emp.status === 'ABERTO' && (
                      <button className="btn btn-secondary btn-small" onClick={() => handleDevolver(emp)}>
                        Devolver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
