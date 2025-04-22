'use client';

import React, { useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import App from '../client/src/App';
// Importar estilos globais do Tailwind
import '../app/globals.css';
// Importar estilos específicos do projeto
import '../client/src/index.css';

/**
 * Componente de entrada principal do Next.js
 * Carrega o App original do projeto
 */
function MyApp({ Component, pageProps }: AppProps) {
  // Estado para controlar se estamos no cliente
  const [isClient, setIsClient] = useState(false);

  // Efeito para definir isClient como true após a montagem do componente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Se não estamos no cliente, renderizar um div vazio para evitar erros de hidratação
  if (!isClient) {
    return <div suppressHydrationWarning></div>;
  }
  
  // Renderizar o App original que usa Wouter para roteamento
  return <App />;
}

export default MyApp;
