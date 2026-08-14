import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

// Botão pequeno, tipo "pílula", que troca entre os ícones de sol e lua.
// aria-label garante que leitores de tela anunciem a ação corretamente.
export default function ThemeToggle() {
  const { tema, alternarTema } = useTheme();
  const escuro = tema === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={alternarTema}
      aria-label={escuro ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={escuro ? 'Tema claro' : 'Tema escuro'}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-thumb">
          {escuro ? (
            // Lua
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            // Sol
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}
