'use client';

import { useEffect, useState } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Função para verificar o tamanho da tela
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Verificar na montagem do componente
    checkIfMobile();

    // Adicionar listener para quando o tamanho da tela mudar
    window.addEventListener('resize', checkIfMobile);

    // Limpar listener na desmontagem
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
}