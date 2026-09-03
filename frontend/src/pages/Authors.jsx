import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as api from '../services/api.js';
import CubeButton from '../components/CubeButton.jsx';

export default function Authors() {
  const { token } = useAuth();

  const [autores, setAutores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [nome, setNome] = useState('');
  const [nacionalidade, setNacionalidade] = useState('');
  const [autorEmEdicao, setAutorEmEdicao] = useState(null);

  useEffect(() => {
    carregarAutores();
  }, []);

  async function carregarAutores() {
    setCarregando(true);
    setErro('');
    try {
      const dados = await api.listarAutores(token);
      setAutores(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  function iniciarEdicao(autor) {
    setAutorEmEdicao(autor);
    setNome(autor.nome);
    setNacionalidade(autor.nacionalidade ?? '');
  }

  function limparFormulario() {
    setAutorEmEdicao(null);
    setNome('');
    setNacionalidade('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    try {
      if (autorEmEdicao) {
        await api.atualizarAutor(autorEmEdicao.id, { nome, nacionalidade }, token);
      } else {
        await api.criarAutor({ nome, nacionalidade }, token);
      }
      limparFormulario();
      await carregarAutores();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleExcluir(autor) {
    const confirmou = window.confirm(`Excluir o autor "${autor.nome}"?`);
    if (!confirmou) return;

    setErro('');
    try {
      await api.deletarAutor(autor.id, token);
      await carregarAutores();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <div className="container">
      {erro && <div className="alert-error">{erro}</div>}

      <div className="card">
        <h2>{autorEmEdicao ? 'Editar autor' : 'Novo autor'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: J.R.R. Tolkien"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="nacionalidade">Nacionalidade</label>
              <input
                id="nacionalidade"
                type="text"
                value={nacionalidade}
                onChange={(e) => setNacionalidade(e.target.value)}
                placeholder="Ex: Britânico"
              />
            </div>
          </div>

          <div className="form-actions">
            <CubeButton
              type="submit"
              front={autorEmEdicao ? 'Salvar' : 'Enviar'}
              back={autorEmEdicao ? 'salvar' : 'enviar'}
              right="submeter"
              left="submeter"
              className="btn-primary-cube btn-primary-cube--auto"
            />
            {autorEmEdicao && (
              <button type="button" className="btn btn-secondary" onClick={limparFormulario}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-wrapper">
        {carregando ? (
          <div className="loading-state">Carregando autores...</div>
        ) : autores.length === 0 ? (
          <div className="empty-state">Nenhum autor cadastrado ainda.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Nacionalidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {autores.map((autor) => (
                <tr key={autor.id}>
                  <td>{autor.nome}</td>
                  <td>{autor.nacionalidade || '—'}</td>
                  <td className="actions">
                    <button className="btn btn-secondary btn-small" onClick={() => iniciarEdicao(autor)}>
                      Editar
                    </button>
                    <button className="btn btn-danger btn-small" onClick={() => handleExcluir(autor)}>
                      Excluir
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
