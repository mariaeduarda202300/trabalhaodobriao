import React from 'react';

// ==========================================================================
// BOTÃO CUBO 3D
// ==========================================================================
// Efeito visual: um "cubo" com 4 faces (frente, direita, trás, esquerda)
// que gira em Y ao passar o mouse (hover) — ou ao tocar/focar, para
// funcionar também em celular/tablet e via teclado.
//
// A largura do cubo é controlada por UMA única variável CSS (--cube-w).
// Como o translateZ() das faces laterais é calculado a partir dessa mesma
// variável (calc(var(--cube-w) / 2)), o cubo se mantém "fechado" (sem
// gaps) em qualquer tamanho de tela — inclusive quando --cube-w usa
// clamp()/vw no CSS. Isso é o que torna o componente responsivo.
export default function CubeButton({
  front = 'Enviar',
  right = 'submeter',
  back = 'enviar',
  left = 'submeter',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`cube-btn ${className}`.trim()}
    >
      <span className="cube-scene">
        <span className="cube">
          <span className="cube-face cube-front">{front}</span>
          <span className="cube-face cube-right">{right}</span>
          <span className="cube-face cube-back">{back}</span>
          <span className="cube-face cube-left">{left}</span>
        </span>
      </span>
    </button>
  );
}
