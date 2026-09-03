import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as api from '../services/api.js';

function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function Reservas() {
  const { token } = useAuth();

  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const dados = await api.listarMinhasReservas(token);
      setReservas(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleCancelar(reserva) {
    setErro('');
    try {
      await api.cancelarReserva(reserva.id, token);
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
          <div className="loading-state">Carregando reservas...</div>
        ) : reservas.length === 0 ? (
          <div className="empty-state">
            Você ainda não tem reservas. Vá até a tela de Livros e clique em
            "Reservar".
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Livro</th>
                <th>Data da reserva</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>{reserva.book?.titulo}</td>
                  <td>{formatarData(reserva.dataReserva)}</td>
                  <td>{reserva.status}</td>
                  <td className="actions">
                    {reserva.status === 'ATIVA' && (
                      <button className="btn btn-danger btn-small" onClick={() => handleCancelar(reserva)}>
                        Cancelar
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
