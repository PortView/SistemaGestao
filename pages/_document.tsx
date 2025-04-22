import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Documento personalizado do Next.js
 * Expõe as variáveis de ambiente para o código do cliente
 */
export default function Document() {
  // Criar um script que expõe as variáveis de ambiente para o cliente
  // Usando valores fixos para evitar problemas de hidratação
  const envScript = `
    window.ENV_NEXT_PUBLIC_API_BASE_URL = "https://amenirealestate.com.br:5601";
    window.ENV_NEXT_PUBLIC_API_AUTH_URL = "https://amenirealestate.com.br:5601/login";
    window.ENV_NEXT_PUBLIC_API_ME_URL = "https://amenirealestate.com.br:5601/user/me";
    window.ENV_NEXT_PUBLIC_API_CLIENTES_URL = "https://amenirealestate.com.br:5601/ger-clientes/clientes";
    window.ENV_NEXT_PUBLIC_API_UNIDADES_URL = "https://amenirealestate.com.br:5601/ger-clientes/unidades";
    window.ENV_NEXT_PUBLIC_API_SERVICOS_URL = "https://amenirealestate.com.br:5601/ger-clientes/servicos";
    window.ENV_NEXT_PUBLIC_API_CONFORMIDADE_URL = "https://amenirealestate.com.br:5601/ger-clientes/conformidades";
    window.ENV_NEXT_PUBLIC_API_FOLLOWUP_URL = "https://amenirealestate.com.br:5601/ger-clientes/tarefas";
    
    // Cache expiration
    window.ENV_NEXT_PUBLIC_CACHE_SHORT = "300000";
    window.ENV_NEXT_PUBLIC_CACHE_MEDIUM = "1800000";
    window.ENV_NEXT_PUBLIC_CACHE_LONG = "86400000";
  `;

  return (
    <Html lang="pt-BR">
      <Head />
      <body>
        {/* Expor variáveis de ambiente para o cliente */}
        <script
          dangerouslySetInnerHTML={{
            __html: envScript,
          }}
          suppressHydrationWarning
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
