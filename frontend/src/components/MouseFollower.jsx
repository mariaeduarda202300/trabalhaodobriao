import React, { useEffect, useRef } from 'react';
import livroSvg from '../img/mouse.svg';

// ==========================================================================
// LIVRO QUE SEGUE O MOUSE
// ==========================================================================
// Um ícone de livro (img/mouse.svg) que acompanha o cursor a uma certa
// distância, com um pequeno atraso/suavização (efeito de "rastro").
// O cursor padrão do sistema continua normal — o livro é só um elemento
// decorativo extra, sempre um pouco abaixo e à direita do ponteiro.
//
// Detalhes que garantem que funcione bem em qualquer tipo de tela:
// - pointer-events: none -> o livro nunca atrapalha cliques/toques.
// - matchMedia('(pointer: fine)') -> só ativa em dispositivos com mouse de
//   verdade (desktop). Em celular/tablet (toque) o componente não renderiza
//   nada, pois não faz sentido nesses dispositivos.
// - requestAnimationFrame + interpolação (lerp) -> movimento suave em
//   qualquer taxa de atualização de tela.
// - prefers-reduced-motion -> respeita quem pede menos animação.
export default function MouseFollower() {
  const elRef = useRef(null);
  const alvo = useRef({ x: -100, y: -100 });
  const atual = useRef({ x: -100, y: -100 });
  const frameId = useRef(null);

  // Distância que o livro fica do cursor (em px).
  const OFFSET_X = 42;
  const OFFSET_Y = 46;

  useEffect(() => {
    const temMouseDeVerdade = window.matchMedia('(pointer: fine)').matches;
    if (!temMouseDeVerdade) return undefined;

    const prefereMenosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function handleMouseMove(event) {
      alvo.current.x = event.clientX + OFFSET_X;
      alvo.current.y = event.clientY + OFFSET_Y;
    }

    function animar() {
      // "lerp": aproxima a posição atual da posição alvo aos poucos,
      // criando a sensação de que o livro está "um pouco distante" e
      // vem chegando, em vez de grudar instantaneamente no cursor.
      const suavizacao = 0.12;
      atual.current.x += (alvo.current.x - atual.current.x) * suavizacao;
      atual.current.y += (alvo.current.y - atual.current.y) * suavizacao;

      if (elRef.current) {
        elRef.current.style.transform = `translate(${atual.current.x}px, ${atual.current.y}px)`;
      }

      frameId.current = requestAnimationFrame(animar);
    }

    window.addEventListener('mousemove', handleMouseMove);

    if (prefereMenosMovimento) {
      // Sem animação: só reposiciona direto no mousemove.
      const posicionarDireto = (event) => {
        if (elRef.current) {
          elRef.current.style.transform = `translate(${event.clientX + OFFSET_X}px, ${event.clientY + OFFSET_Y}px)`;
        }
      };
      window.addEventListener('mousemove', posicionarDireto);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousemove', posicionarDireto);
      };
    }

    frameId.current = requestAnimationFrame(animar);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, []);

  return (
    <img
      ref={elRef}
      src={livroSvg}
      alt=""
      aria-hidden="true"
      className="mouse-follower"
    />
  );
}
