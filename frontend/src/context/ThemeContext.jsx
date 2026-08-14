import React, { createContext, useContext, useEffect, useState } from 'react';

// ==========================================================================
// TEMA CLARO / ESCURO
// ==========================================================================
// Guardamos a preferência de tema no localStorage para lembrar da escolha
// do usuário entre visitas. Se ele nunca escolheu nada, respeitamos a
// preferência do sistema operacional (prefers-color-scheme).

const ThemeContext = createContext(null);
const STORAGE_KEY = 'my_neon_theme';

function obterTemaInicial() {
  const salvo = localStorage.getItem(STORAGE_KEY);
  if (salvo === 'light' || salvo === 'dark') return salvo;

  const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefereEscuro ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(obterTemaInicial);

  // Sempre que o tema mudar, aplicamos o atributo data-theme na tag <html>.
  // É esse atributo que o CSS usa para saber qual paleta de cores exibir.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  function alternarTema() {
    setTema((atual) => (atual === 'dark' ? 'light' : 'dark'));
  }

  const value = { tema, alternarTema };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um <ThemeProvider>');
  }
  return context;
}
