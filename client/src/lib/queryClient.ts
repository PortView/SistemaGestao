import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { LOCAL_STORAGE_TOKEN_KEY } from "./constants";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Adiciona opções para contornar problemas de SSL em ambiente de desenvolvimento
  const options = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    // No ambiente React, problemas de SSL são gerenciados pelo navegador
    // então não é necessário adicionar opções adicionais aqui
  };
  
  const res = await fetch(url, options);

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Adiciona opções para contornar problemas de SSL em ambiente de desenvolvimento
    const options = {
      headers,
      // No ambiente React, problemas de SSL são gerenciados pelo navegador
      // então não é necessário adicionar opções adicionais aqui
    };
    
    const res = await fetch(queryKey[0] as string, options);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
