import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as api from '../services/api.js';
import ProductForm from '../components/ProductForm.jsx';

export default function Books() {
  const { token } = useAuth();

  // Lista de livros vinda do backend.
  const [livros, setLivros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [livroEmEdicao, setLivroEmEdicao] = useState(null);

  useEffect(() => {
    carregarLivros();
  }, []);

  async function carregarLivros() {
    setCarregando(true);
    setErro('');
    try {
      const dados = await api.listarLivrosPorDono(token);
      setLivros(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleSalvar(dadosDoFormulario) {
    setErro('');
    try {
      if (livroEmEdicao) {
        await api.atualizarLivro(livroEmEdicao.id, dadosDoFormulario, token);
      } else {
        await api.criarLivro(dadosDoFormulario, token);
      }
      setLivroEmEdicao(null);
      await carregarLivros();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleExcluir(livro) {
    const confirmou = window.confirm(
      `Excluir o livro "${livro.titulo}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmou) return;

    setErro('');
    try {
      await api.deletarLivro(livro.id, token);
      await carregarLivros();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleEmprestar(livro) {
    const dias = window.prompt('Em quantos dias o livro deve ser devolvido?', '7');
    if (dias === null) return;

    const dataDevolucaoPrevista = new Date(Date.now() + Number(dias) * 24 * 60 * 60 * 1000).toISOString();

    setErro('');
    try {
      await api.criarEmprestimo({ bookId: livro.id, dataDevolucaoPrevista }, token);
      await carregarLivros();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleReservar(livro) {
    setErro('');
    try {
      await api.criarReserva({ bookId: livro.id }, token);
      await carregarLivros();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="container">
      {erro && <div className="alert-error">{erro}</div>}

      <ProductForm
        produtoEmEdicao={livroEmEdicao}
        onSalvar={handleSalvar}
        onCancelar={() => setLivroEmEdicao(null)}
      />

      <div className="table-wrapper">
        {carregando ? (
          <div className="loading-state">Carregando livros...</div>
        ) : livros.length === 0 ? (
          <div className="empty-state">Nenhum livro cadastrado ainda.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor(es)</th>
                <th>ISBN</th>
                <th>Quantidade</th>
                <th>Disponível</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {livros.map((livro) => (
                <tr key={livro.id}>
                  <td>{livro.titulo}</td>
                  <td>{(livro.autores ?? []).map((a) => a.nome).join(', ') || '—'}</td>
                  <td>{livro.isbn}</td>
                  <td>{livro.quantidade}</td>
                  <td>{livro.disponivel ?? livro.quantidade}</td>
                  <td className="actions">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => setLivroEmEdicao(livro)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleExcluir(livro)}
                    >
                      Excluir
                    </button>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleEmprestar(livro)}
                    >
                      Emprestar
                    </button>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleReservar(livro)}
                    >
                      Reservar
                    </button>
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
