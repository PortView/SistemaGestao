'use client';

import { SiscopCliente, SiscopConformidade, SiscopUnidadesResponse, SiscopUser } from './types';

/**
 * Constantes para URLs da API
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.siscop.com.br';
const API_AUTH_URL = process.env.NEXT_PUBLIC_API_AUTH_URL || '/auth/login';
const API_ME_URL = process.env.NEXT_PUBLIC_API_ME_URL || '/auth/me';

const LOCAL_STORAGE_TOKEN_KEY = 'siscop_token';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Classe para lidar com requisições à API com suporte a bypass SSL
 */
export class ApiService {
  /**
   * Faz uma requisição GET à API
   */
  static async get<T>(url: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>('GET', url, null, options);
  }

  /**
   * Faz uma requisição POST à API
   */
  static async post<T>(url: string, data: any, options: FetchOptions = {}): Promise<T> {
    return this.request<T>('POST', url, data, options);
  }

  /**
   * Faz uma requisição PUT à API
   */
  static async put<T>(url: string, data: any, options: FetchOptions = {}): Promise<T> {
    return this.request<T>('PUT', url, data, options);
  }

  /**
   * Faz uma requisição DELETE à API
   */
  static async delete<T>(url: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>('DELETE', url, null, options);
  }

  /**
   * Método principal para fazer requisições à API
   */
  private static async request<T>(
    method: string,
    url: string,
    data: any = null,
    options: FetchOptions = {}
  ): Promise<T> {
    // Construir URL completa
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    // Preparar headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };
    
    // Adicionar token de autenticação se necessário
    if (!options.skipAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) : null;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Configurar opções da requisição
    const fetchOptions: RequestInit = {
      method,
      headers,
      credentials: 'include',
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    };
    
    try {
      // Fazer a requisição
      const response = await fetch(fullUrl, fetchOptions);
      
      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `Erro na requisição: ${response.status}`);
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }
      
      // Verificar se há conteúdo na resposta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return {} as T;
    } catch (error) {
      console.error('Erro na requisição à API:', error);
      throw error;
    }
  }
}

/**
 * Função para autenticar um usuário
 */
export async function authenticateUser(email: string, password: string): Promise<{ access_token: string }> {
  return ApiService.post<{ access_token: string }>(
    API_AUTH_URL,
    { email, password },
    { skipAuth: true }
  );
}

/**
 * Função para buscar o perfil do usuário
 */
export async function fetchUserProfile(): Promise<SiscopUser> {
  return ApiService.get<SiscopUser>(API_ME_URL);
}

/**
 * Função para buscar clientes
 */
export async function fetchClientes(codCoor: number): Promise<SiscopCliente[]> {
  return ApiService.get<SiscopCliente[]>(`/clientes?codCoor=${codCoor}`);
}

/**
 * Função para buscar unidades
 */
export async function fetchUnidades(params: any): Promise<SiscopUnidadesResponse> {
  const queryParams = new URLSearchParams();
  
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  }
  
  return ApiService.get<SiscopUnidadesResponse>(`/unidades?${queryParams.toString()}`);
}

/**
 * Função para buscar serviços
 */
export async function fetchServicos(params: any): Promise<SiscopConformidade[]> {
  const queryParams = new URLSearchParams();
  
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  }
  
  return ApiService.get<SiscopConformidade[]>(`/servicos?${queryParams.toString()}`);
}

/**
 * Função para buscar conformidades
 */
export async function fetchConformidades(params: any): Promise<SiscopConformidade[]> {
  const queryParams = new URLSearchParams();
  
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  }
  
  return ApiService.get<SiscopConformidade[]>(`/conformidades?${queryParams.toString()}`);
}