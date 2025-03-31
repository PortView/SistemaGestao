'use client';

import { QueryClient } from '@tanstack/react-query';

/**
 * Verifica e lança um erro se a resposta não for bem-sucedida
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => {
      return { message: 'Erro desconhecido' };
    });
    
    const errorMessage = errorData.message || `Erro ${res.status}: ${res.statusText}`;
    throw new Error(errorMessage);
  }
}

/**
 * Função para fazer requisições à API
 */
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  body?: any,
  extraOptions: RequestInit = {}
) {
  // Desativa verificação SSL para APIs que usam certificados auto-assinados
  const agent = new (require('https').Agent)({
    rejectUnauthorized: false
  });

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...extraOptions.headers,
    },
    agent,
    ...extraOptions,
  };

  // Adiciona o corpo da requisição para métodos não-GET
  if (method !== 'GET' && body) {
    options.body = JSON.stringify(body);
  }

  // Se temos um token de acesso no localStorage, adiciona ao cabeçalho
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && options.headers) {
      (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, options);
  await throwIfResNotOk(response);
  return response;
}

/**
 * Comportamento para tratamento de erros 401 (não autorizado)
 */
type UnauthorizedBehavior = 'returnNull' | 'throw';

/**
 * Função para criar queryFn padronizada
 */
export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}) => {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T | null> => {
    const [url] = queryKey;
    try {
      const res = await apiRequest('GET', url);
      return await res.json();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('401') &&
        options.on401 === 'returnNull'
      ) {
        return null;
      }
      throw error;
    }
  };
};

/**
 * Cliente de consulta configurado com opções padrão
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
  },
});