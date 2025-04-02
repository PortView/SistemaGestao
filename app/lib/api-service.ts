'use client';

import { SiscopCliente, SiscopConformidade, SiscopUnidadesResponse, SiscopUser } from './types';
import { 
  LOCAL_STORAGE_TOKEN_KEY,
  LOCAL_STORAGE_USER_KEY,
  LOCAL_STORAGE_CACHE_PREFIX,
  LOCAL_STORAGE_CLIENTES_KEY,
  API_BASE_URL,
  API_AUTH_URL,
  API_ME_URL,
  API_CLIENTES_URL,
  API_UNIDADES_URL,
  API_SERVICOS_URL,
  API_CONFORMIDADE_URL,
  USE_CORS_PROXY,
  CORS_PROXY_URL,
  CACHE_EXPIRATION 
} from './constants';


interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  skipCache?: boolean;
}

/**
 * Classe para lidar com requisições à API com suporte a bypass SSL e cache
 */
export class ApiService {
  /**
   * Faz uma requisição GET à API com suporte a cache
   */
  static async get<T>(url: string, options: FetchOptions = {}, cacheTime?: number): Promise<T> {
    // Tentar obter dados do cache para requisições GET, se não estiver pulando o cache
    if (typeof window !== 'undefined' && cacheTime && !options.skipCache) {
      const cachedData = this.getFromCache<T>(url);
      if (cachedData) {
        console.log(`Usando dados em cache para: ${url}`);
        return cachedData;
      }
    }
    
    const result = await this.request<T>('GET', url, null, options);
    
    // Salvar no cache se cacheTime estiver definido
    if (typeof window !== 'undefined' && cacheTime) {
      this.saveToCache(url, result, cacheTime);
    }
    
    return result;
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
   * Salva dados no cache com um tempo de expiração
   */
  static saveToCache<T>(key: string, data: T, expirationTime: number): void {
    if (typeof window === 'undefined') return;
    
    const cacheKey = `${LOCAL_STORAGE_CACHE_PREFIX}${key}`;
    const cacheData = {
      data,
      expiration: Date.now() + expirationTime
    };
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Erro ao salvar dados no cache:', error);
    }
  }

  /**
   * Obtém dados do cache se ainda forem válidos
   */
  static getFromCache<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    const cacheKey = `${LOCAL_STORAGE_CACHE_PREFIX}${key}`;
    const cachedItem = localStorage.getItem(cacheKey);
    
    if (!cachedItem) return null;
    
    try {
      const { data, expiration } = JSON.parse(cachedItem);
      
      // Retornar dados se ainda forem válidos
      if (Date.now() < expiration) {
        return data as T;
      }
      
      // Remover dados expirados
      localStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      console.warn('Erro ao ler dados do cache:', error);
      return null;
    }
  }

  /**
   * Aplica proxy CORS a uma URL se necessário
   */
  static applyCorsProxy(url: string): string {
    if (USE_CORS_PROXY && url.startsWith('http')) {
      return `${CORS_PROXY_URL}${encodeURIComponent(url)}`;
    }
    return url;
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
    // Construir URL completa e aplicar proxy CORS se necessário
    const baseUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    const fullUrl = this.applyCorsProxy(baseUrl);
    
    console.log(`API request to: ${fullUrl}`);
    
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
 * Função para buscar o perfil do usuário com cache
 */
export async function fetchUserProfile(): Promise<SiscopUser> {
  try {
    // Buscar do cache primeiro
    if (typeof window !== 'undefined') {
      const cachedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (cachedUser) {
        const userData = JSON.parse(cachedUser);
        console.log('Usando dados de usuário em cache');
        return userData;
      }
    }
    
    // Se não estiver em cache, buscar da API
    const userData = await ApiService.get<SiscopUser>(API_ME_URL);
    
    // Salvar no cache
    if (typeof window !== 'undefined' && userData) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userData));
    }
    
    return userData;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    throw error;
  }
}

/**
 * Função para buscar clientes com cache
 */
export async function fetchClientes(codCoor: number): Promise<SiscopCliente[]> {
  const cacheKey = `${LOCAL_STORAGE_CLIENTES_KEY}_${codCoor}`;
  const url = API_CLIENTES_URL ? 
    `${API_CLIENTES_URL}?codCoor=${codCoor}` : 
    `/ger-clientes/clientes?codCoor=${codCoor}`;

  try {
    // Buscar do cache primeiro
    if (typeof window !== 'undefined') {
      const cachedClientes = localStorage.getItem(cacheKey);
      if (cachedClientes) {
        const { data, expiration } = JSON.parse(cachedClientes);
        // Verificar se o cache ainda é válido
        if (Date.now() < expiration) {
          console.log('Usando dados de clientes em cache');
          return data;
        }
        // Remover cache expirado
        localStorage.removeItem(cacheKey);
      }
    }
    
    // Se não estiver em cache ou expirado, buscar da API
    // Usar a URL completa para aplicar o proxy CORS
    const clientesData = await ApiService.get<SiscopCliente[]>(url, {}, CACHE_EXPIRATION.MEDIUM);
    
    // Salvar no cache
    if (typeof window !== 'undefined' && clientesData) {
      const cacheData = {
        data: clientesData,
        expiration: Date.now() + CACHE_EXPIRATION.MEDIUM
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }
    
    return clientesData;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    // Em caso de falha, usar dados em cache mesmo que expirados
    if (typeof window !== 'undefined') {
      const cachedClientes = localStorage.getItem(cacheKey);
      if (cachedClientes) {
        const { data } = JSON.parse(cachedClientes);
        console.log('Usando dados de clientes em cache (fallback após erro)');
        return data;
      }
    }
    throw error;
  }
}

/**
 * Função para buscar unidades com cache
 */
export async function fetchUnidades(params: any, options: { skipCache?: boolean } = {}): Promise<SiscopUnidadesResponse> {
  const queryParams = new URLSearchParams();
  
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  }
  
  // Se skipCache for true, adicionar um timestamp como parâmetro na URL para forçar requisição nova
  if (options.skipCache) {
    queryParams.append('_timestamp', Date.now().toString());
    console.log('fetchUnidades - Forçando requisição nova com timestamp');
  }
  
  const queryString = queryParams.toString();
  const url = API_UNIDADES_URL ? 
    `${API_UNIDADES_URL}?${queryString}` : 
    `/ger-clientes/unidades?${queryString}`;
  
  // Passar a opção skipCache para o ApiService
  const apiOptions = options.skipCache ? { skipCache: true } : {};
  return ApiService.get<SiscopUnidadesResponse>(url, apiOptions, CACHE_EXPIRATION.SHORT);
}

/**
 * Função para buscar serviços com cache
 */
export async function fetchServicos(params: any): Promise<SiscopConformidade[]> {
  const queryParams = new URLSearchParams();
  
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  }
  
  const queryString = queryParams.toString();
  const url = API_SERVICOS_URL ? 
    `${API_SERVICOS_URL}?${queryString}` : 
    `/ger-clientes/servicos?${queryString}`;
  
  return ApiService.get<SiscopConformidade[]>(url, {}, CACHE_EXPIRATION.SHORT);
}

/**
 * Função para buscar conformidades com cache
 */
export async function fetchConformidades(params: any): Promise<SiscopConformidade[]> {
  const queryParams = new URLSearchParams();
  
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  }
  
  const queryString = queryParams.toString();
  const url = API_CONFORMIDADE_URL ? 
    `${API_CONFORMIDADE_URL}?${queryString}` : 
    `/ger-clientes/conformidades?${queryString}`;
  
  return ApiService.get<SiscopConformidade[]>(url, {}, CACHE_EXPIRATION.SHORT);
}