'use client';

import { QueryClient } from '@tanstack/react-query';

/**
 * Verifica e lança um erro se a resposta não for bem-sucedida
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const contentType = res.headers.get('content-type');
    let errorMessage = `Erro ${res.status}: ${res.statusText}`;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const data = await res.json();
        errorMessage = data.message || errorMessage;
      } catch (e) {
        console.error('Erro ao analisar resposta de erro:', e);
      }
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Função para fazer requisições à API
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  extraOptions: RequestInit = {}
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(extraOptions.headers || {}),
    },
    ...extraOptions,
  };
  
  // Adiciona o token de autenticação se existir
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  // Adiciona o corpo da requisição se não for GET
  if (method !== 'GET' && data) {
    options.body = JSON.stringify(data);
  }
  
  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  
  return res;
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
  return async ({ queryKey }: { queryKey: string[] }): Promise<T | undefined> => {
    try {
      const res = await apiRequest('GET', queryKey[0]);
      
      if (res.status === 204) {
        return undefined;
      }
      
      return await res.json();
    } catch (error: any) {
      // Se for erro 401 e o comportamento for returnNull, retorna null
      if (error.message.includes('401') && options.on401 === 'returnNull') {
        return undefined;
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
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});