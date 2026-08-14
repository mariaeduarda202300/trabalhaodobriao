import React, { useEffect, useState } from 'react';
import CubeButton from './CubeButton.jsx';

// ==========================================================================
// FORMULÁRIO DE LIVRO — reutilizável para CRIAR e para EDITAR
// ==========================================================================
// Este componente funciona como um formulário único: ele cria e edita
// livros dependendo da prop "produtoEmEdicao".
export default function ProductForm({ produtoEmEdicao, onSalvar, onCancelar }) {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');

  useEffect(() => {
    if (produtoEmEdicao) {
      setTitulo(produtoEmEdicao.titulo ?? '');
      setAutor(produtoEmEdicao.autor ?? '');
      setIsbn(produtoEmEdicao.isbn ?? '');
      setDescricao(produtoEmEdicao.descricao ?? '');
      setQuantidade(String(produtoEmEdicao.quantidade ?? ''));
    } else {
      setTitulo('');
      setAutor('');
      setIsbn('');
      setDescricao('');
      setQuantidade('');
    }
  }, [produtoEmEdicao]);

  function handleSubmit(event) {
    event.preventDefault();

    onSalvar({
      titulo,
      autor,
      isbn,
      descricao,
      quantidade: parseInt(quantidade, 10),
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
            <label htmlFor="autor">Autor</label>
            <input
              id="autor"
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Ex: J.R.R. Tolkien"
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
