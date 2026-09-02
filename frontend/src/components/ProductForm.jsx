import React, { useEffect, useState } from 'react';
import CubeButton from './CubeButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import * as api from '../services/api.js';

// ==========================================================================
// FORMULÁRIO DE LIVRO — reutilizável para CRIAR e para EDITAR
// ==========================================================================
// Este componente funciona como um formulário único: ele cria e edita
// livros dependendo da prop "produtoEmEdicao".
//
// O campo "autor" (texto livre) virou uma relação N:N com a entidade
// Author: um livro pode ter vários autores, e um autor pode assinar
// vários livros. Por isso aqui usamos uma lista de checkboxes em vez de
// um <input> de texto.
export default function ProductForm({ produtoEmEdicao, onSalvar, onCancelar }) {
  const { token } = useAuth();

  const [titulo, setTitulo] = useState('');
  const [isbn, setIsbn] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [authorIds, setAuthorIds] = useState([]);

  const [autoresDisponiveis, setAutoresDisponiveis] = useState([]);
  const [erroAutores, setErroAutores] = useState('');

  useEffect(() => {
    async function carregarAutores() {
      try {
        const dados = await api.listarAutores(token);
        setAutoresDisponiveis(dados);
      } catch (err) {
        setErroAutores(err.message);
      }
    }
    carregarAutores();
  }, [token]);

  useEffect(() => {
    if (produtoEmEdicao) {
      setTitulo(produtoEmEdicao.titulo ?? '');
      setIsbn(produtoEmEdicao.isbn ?? '');
      setDescricao(produtoEmEdicao.descricao ?? '');
      setQuantidade(String(produtoEmEdicao.quantidade ?? ''));
      setAuthorIds((produtoEmEdicao.autores ?? []).map((a) => a.id));
    } else {
      setTitulo('');
      setIsbn('');
      setDescricao('');
      setQuantidade('');
      setAuthorIds([]);
    }
  }, [produtoEmEdicao]);

  function alternarAutor(id) {
    setAuthorIds((atual) =>
      atual.includes(id) ? atual.filter((a) => a !== id) : [...atual, id]
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSalvar({
      titulo,
      isbn,
      descricao,
      quantidade: parseInt(quantidade, 10),
      authorIds,
    });
  }

  const modoEdicao = !!produtoEmEdicao;

  return (
    <div className="card">
      <h2>{modoEdicao ? 'Editar livro' : 'Novo livro'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: O Senhor dos Anéis"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="isbn">ISBN</label>
            <input
              id="isbn"
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Ex: 9780261103573"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <input
              id="descricao"
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Livro de fantasia épica"
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantidade">Quantidade</label>
            <input
              id="quantidade"
              type="number"
              min="0"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Autores</label>
          {erroAutores && <div className="alert-error">{erroAutores}</div>}
          {autoresDisponiveis.length === 0 ? (
            <p>
              Nenhum autor cadastrado ainda. Cadastre autores na tela{' '}
              <strong>Autores</strong> antes de vincular a um livro.
            </p>
          ) : (
            <div className="checkbox-list">
              {autoresDisponiveis.map((autor) => (
                <label key={autor.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={authorIds.includes(autor.id)}
                    onChange={() => alternarAutor(autor.id)}
                  />
                  {autor.nome}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <CubeButton
            type="submit"
            front={modoEdicao ? 'Salvar' : 'Enviar'}
            back={modoEdicao ? 'salvar' : 'enviar'}
            right="submeter"
            left="submeter"
            className="btn-primary-cube btn-primary-cube--auto"
          />

          {modoEdicao && (
            <button type="button" className="btn btn-secondary" onClick={onCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
