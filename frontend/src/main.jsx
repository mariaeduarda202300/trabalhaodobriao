import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Este é o "ponto de entrada" da aplicação React.
// O método createRoot conecta nosso componente <App /> à div#root
// que existe no arquivo index.html.
//
// React.StrictMode é uma ferramenta de desenvolvimento que ajuda a
// encontrar problemas comuns (ela roda alguns códigos duas vezes de
// propósito, só em modo de desenvolvimento, para expor efeitos colaterais
// mal escritos). Ela não afeta a versão final (build) da aplicação.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
