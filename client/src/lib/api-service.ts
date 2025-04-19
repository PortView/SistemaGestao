// Utilizamos o AbortController nativo do navegador
// import { AbortController } from 'node-abort-controller';
import { SiscopCliente, SiscopConformidade, SiscopUnidadesResponse, SiscopUser } from './types';

interface ApiServiceOptions {
  headers?: Record<string, string>;
  skipCache?: boolean;
  signal?: AbortSignal;
}

export class ApiService {
  private static requestTimeouts: Record<string, NodeJS.Timeout> = {};

  // Método principal para fazer requisições HTTP
  static async request<T>(url: string, options: RequestInit & ApiServiceOptions = {}): Promise<T> {
    const { headers = {}, skipCache = false, signal, ...rest } = options;

    // Headers padrão
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers
    };

    // Adicionar Authorization se existir
    if (headers.Authorization) {
      console.log('ApiService.request - Token adicionado ao header de autenticação (parcialmente obscurecido)', 
        headers.Authorization.substring(0, 12) + '...');
    }

    // Configurações completas para o fetch
    const fetchOptions: RequestInit = {
      ...rest,
      headers: defaultHeaders,
      signal,
    };

    // Imprimir informações sobre a requisição
    console.log('ApiService.request - Iniciando fetch para', url, 'com opções:', {
      method: fetchOptions.method || 'GET',
      headersKeys: Object.keys(defaultHeaders),
      useProxy: false
    });

    // Máximo de 3 tentativas com espera entre elas
    let lastError: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Fazer a requisição
        const response = await fetch(url, fetchOptions);

        console.log('ApiService.request - Resposta recebida de', url + ':', {
          status: response.status,
          statusText: response.statusText
        });

        // Verificar se a resposta foi bem-sucedida
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
        }

        // Verificar se o content-type é JSON
        const contentType = response.headers.get('Content-Type');
        console.log('ApiService.request - Content-Type da resposta:', contentType);

        // Processar a resposta como JSON ou texto, dependendo do content-type
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
          console.log('ApiService.request - Dados JSON recebidos:', 
            Array.isArray(data) ? `Array com ${data.length} itens` : `Objeto com ${Object.keys(data).length} campos`);
        } else {
          data = await response.text();
          console.log('ApiService.request - Dados texto recebidos (tamanho):', data.length);
        }

        return data as T;
      } catch (error: any) {
        lastError = error;
        console.error(`Erro no fetch para ${url}:`, error);

        // Se for o último retry ou o sinal foi abortado, não retent
        if (attempt === 3 || error.name === 'AbortError') {
          console.log(`ApiService.request - Tentativa ${attempt} falhou:`, error);
          break;
        }

        // Esperar antes da próxima tentativa (espera exponencial)
        const waitTime = 2000; // 2 segundos
        console.log(`ApiService.request - Aguardando ${waitTime / 1000} segundos antes da próxima tentativa`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    console.log(`ApiService.request - Todas as ${3} tentativas falharam`);
    console.log('ApiService.request - Erro completo na requisição à API:', lastError);
    throw lastError || new Error('Falha na requisição após múltiplas tentativas');
  }

  // Método simplificado para requisições GET
  static async get<T>(url: string, options: ApiServiceOptions = {}): Promise<T> {
    console.log('ApiService.get - Iniciando requisição para:', url);
    console.log('ApiService.get - Opções recebidas:', options);

    const { headers = {}, ...rest } = options;

    // Verificar se existe um token no headers.Authorization
    if (headers.Authorization) {
      const token = headers.Authorization.replace('Bearer ', '');
      console.log('ApiService.get - Token encontrado:', token.substring(0, 10) + '...');
    }

    console.log('ApiService.get - Enviando requisição para servidor:', url);
    console.log('API request to:', url);

    try {
      // Cria um controller para abortar a requisição se necessário
      const controller = new AbortController();
      const { signal } = controller;

      // Configura um timeout para abortar a requisição após 30 segundos
      const timeoutId = setTimeout(() => {
        console.log('ApiService.get - Timeout! Abortando requisição...');
        controller.abort();
      }, 30000);

      // Armazena o timeout para poder cancelá-lo depois
      this.requestTimeouts[url] = timeoutId;

      // Adiciona o signal às opções
      const requestOptions = {
        method: 'GET',
        headers,
        signal,
        ...rest
      };

      // Faz a requisição
      const response = await this.request<T>(url, requestOptions);

      // Limpa o timeout se a requisição foi bem-sucedida
      clearTimeout(timeoutId);
      delete this.requestTimeouts[url];

      console.log('ApiService.get - Resposta recebida para', url + ':', response);
      return response;
    } catch (error) {
      console.error('ApiService.get - Erro na requisição para', url + ':', error);
      throw error;
    }
  }

  // Cancela qualquer requisição pendente para a URL especificada
  static cancelRequest(url: string): void {
    if (this.requestTimeouts[url]) {
      clearTimeout(this.requestTimeouts[url]);
      delete this.requestTimeouts[url];
      console.log('ApiService - Requisição cancelada para:', url);
    }
  }

  // Método simplificado para requisições POST
  static async post<T>(url: string, data: any, options: ApiServiceOptions = {}): Promise<T> {
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    };

    return this.request<T>(url, requestOptions);
  }

  // Método simplificado para requisições PUT
  static async put<T>(url: string, data: any, options: ApiServiceOptions = {}): Promise<T> {
    const requestOptions = {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    };

    return this.request<T>(url, requestOptions);
  }

  // Método simplificado para requisições DELETE
  static async delete<T>(url: string, options: ApiServiceOptions = {}): Promise<T> {
    const requestOptions = {
      method: 'DELETE',
      ...options
    };

    return this.request<T>(url, requestOptions);
  }
}


// Constantes importadas das variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_NEXT_PUBLIC_API_BASE_URL || 'https://amenirealestate.com.br:5601';
const API_AUTH_URL = `${API_BASE_URL}/login`;
const API_ME_URL = `${API_BASE_URL}/user/me`;
const API_CLIENTES_URL = `${API_BASE_URL}/ger-clientes/clientes`;
const API_UNIDADES_URL = `${API_BASE_URL}/ger-clientes/unidades`;
const API_SERVICOS_URL = `${API_BASE_URL}/ger-clientes/servicos`;
const API_CONFORMIDADE_URL = `${API_BASE_URL}/ger-clientes/conformidades`;

// Chaves para localStorage
const LOCAL_STORAGE_TOKEN_KEY = 'siscop_token';
const LOCAL_STORAGE_USER_KEY = 'siscop_user';
const LOCAL_STORAGE_CACHE_PREFIX = 'siscop_cache_';
const LOCAL_STORAGE_CLIENTES_KEY = 'siscop_clientes';

// Cache expiration (values should be retrieved from environment variables if possible)
const CACHE_EXPIRATION = {
  SHORT: 300000, // 5 minutes
  MEDIUM: 1800000, // 30 minutes
  LONG: 86400000 // 24 hours
};

/**
 * Função para autenticar um usuário
 */
export async function authenticateUser(email: string, password: string): Promise<{ access_token: string }> {
  return ApiService.post<{ access_token: string }>(
    API_AUTH_URL,
    { email, password },
    { skipAuth: true } // skipAuth is not used in the new ApiService
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
export async function fetchClientes(codcoor: number): Promise<SiscopCliente[]> {
  // Validação do parâmetro codcoor
  if (!codcoor) {
    console.error('Erro: codcoor é obrigatório para buscar clientes.');
    throw new Error('codcoor é obrigatório para buscar clientes');
  }

  console.log('fetchClientes - Iniciando com codcoor:', codcoor);

  const cacheKey = `${LOCAL_STORAGE_CLIENTES_KEY}_${codcoor}`;
  const url = `${API_CLIENTES_URL}?codcoor=${codcoor}`;

  console.log('fetchClientes - URL completa:', url);

  // Verificar token antes de fazer requisição (this part needs to be revised to utilize the new ApiService)
  const token = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) : null;
  if (!token) {
    console.error('Erro: Token de autenticação não encontrado. Usuário precisa fazer login novamente.');
    throw new Error('Token de autenticação não encontrado. Faça login novamente.');
  }

  try {
    // Buscar do cache primeiro para economizar requisições
    let cachedClientes: SiscopCliente[] | null = null;
    if (typeof window !== 'undefined') {
      const cachedClientesString = localStorage.getItem(cacheKey);
      if (cachedClientesString) {
        try {
          const cachedData = JSON.parse(cachedClientesString);
          // Verificar se o cache ainda é válido
          if (Date.now() < cachedData.expiration) {
            cachedClientes = cachedData.data;
            console.log('Usando dados de clientes em cache');
          } else {
            // Remover cache expirado
            localStorage.removeItem(cacheKey);
          }
        } catch (e) {
          console.warn('Erro ao ler cache de clientes:', e);
        }
      }
    }

    if (cachedClientes) return cachedClientes;

    // Buscar da API com token de autorização
    console.log('fetchClientes - Fazendo requisição para API com token');

    const headers = { Authorization: `Bearer ${token}` };
    const clientesData = await ApiService.get<SiscopCliente[]>(url, { headers });


    console.log('fetchClientes - Dados recebidos da API:', clientesData);

    // Salvar no cache
    if (typeof window !== 'undefined' && clientesData) {
      const cacheData = {
        data: clientesData,
        expiration: Date.now() + CACHE_EXPIRATION.MEDIUM
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('fetchClientes - Dados salvos no cache');
    }

    return clientesData;
  } catch (error) {
    console.error('Erro detalhado ao buscar clientes:', error);

    // Em caso de falha, usar dados em cache mesmo que expirados
    if (typeof window !== 'undefined' && cachedClientes) return cachedClientes; // Use cached data if available


    // Se não há dados em cache, propagar o erro para tratamento adequado
    throw error;
  }
}

/**
 * Função para buscar unidades com cache
 */
export async function fetchUnidades(params: any, options: { skipCache?: boolean } = {}): Promise<SiscopUnidadesResponse> {
  // Validação dos parâmetros essenciais (usando exatamente os nomes dos parâmetros do exemplo)
  if (!params.codcoor || !params.codcli || !params.uf) {
    console.error('Erro: Parâmetros codcoor, codcli e uf são obrigatórios para buscar unidades');
    throw new Error('Parâmetros codcoor, codcli e uf são obrigatórios para buscar unidades');
  }

  console.log('fetchUnidades - Iniciando com params:', params);

  // Construir URL exatamente como no exemplo:
  // https://amenirealestate.com.br:5601/ger-clientes/unidades?codcoor=110&codcli=1448&uf=SP&page=1
  // Se skipCache for true, adicionar timestamp para forçar requisição nova
  let url = `${API_UNIDADES_URL}?codcoor=${params.codcoor}&codcli=${params.codcli}&uf=${params.uf}&page=${params.page || 1}`;

  if (options.skipCache) {
    url += `&_timestamp=${Date.now()}`;
    console.log('fetchUnidades - Forçando requisição nova com timestamp');
  }

  // Chave de cache usando os mesmos parâmetros
  const cacheKey = `units_${params.codcoor}_${params.codcli}_${params.uf}_${params.page || 1}`;

  console.log('fetchUnidades - URL completa:', url);
  console.log('fetchUnidades - Cache key:', cacheKey);

  // Verificar token antes de fazer requisição
  const token = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) : null;
  console.log('fetchUnidades - Token encontrado:', token ? `${token.substring(0, 15)}...` : 'null');

  if (!token) {
    console.error('Erro: Token de autenticação não encontrado. Usuário precisa fazer login novamente.');
    throw new Error('Token de autenticação não encontrado. Faça login novamente.');
  }

  try {
    // Buscar do cache primeiro, se não estiver pulando o cache
    let cachedUnidades: SiscopUnidadesResponse | null = null;
    if (typeof window !== 'undefined' && !options.skipCache) {
      const cachedUnidadesString = localStorage.getItem(cacheKey);
      if (cachedUnidadesString) {
        try {
          const cachedData = JSON.parse(cachedUnidadesString);
          // Verificar se o cache ainda é válido
          if (Date.now() < cachedData.expiration) {
            cachedUnidades = cachedData.data;
            console.log('fetchUnidades - Usando dados em cache');
          } else {
            // Remover cache expirado
            localStorage.removeItem(cacheKey);
          }
        } catch (e) {
          console.warn('fetchUnidades - Erro ao ler cache:', e);
        }
      }
    }

    if (cachedUnidades) return cachedUnidades;

    // Buscar dados da API - o ApiService já vai incluir o token nas headers
    const headers = { Authorization: `Bearer ${token}` };
    const unidadesData = await ApiService.get<SiscopUnidadesResponse>(url, { headers });

    console.log('fetchUnidades - Dados recebidos da API:', unidadesData);

    // Salvar no cache
    if (typeof window !== 'undefined' && unidadesData) {
      const cacheData = {
        data: unidadesData,
        expiration: Date.now() + CACHE_EXPIRATION.SHORT
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('fetchUnidades - Dados salvos no cache');
    }

    return unidadesData;
  } catch (error) {
    console.error('Erro ao buscar unidades:', error);

    // Em caso de falha, verificar se temos dados em cache mesmo que expirados
    if (typeof window !== 'undefined' && cachedUnidades) return cachedUnidades; // Return cached data if available

    // Se não há dados em cache, retornar uma resposta vazia para evitar quebra da interface
    console.log('fetchUnidades - Retornando estrutura vazia após erro');
    return {
      folowups: [],
      pagination: {
        totalItems: 0,
        currentPage: 1,
        itemsPerPage: 10,
        lastPage: 1
      }
    };
  }
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
  const url = `${API_SERVICOS_URL}?${queryString}`;
  const cacheKey = `services_${JSON.stringify(params)}`;

  try {
    // Verificar cache primeiro
    let cachedData: SiscopConformidade[] | null = null;
    if (typeof window !== 'undefined') {
      const cachedDataString = localStorage.getItem(cacheKey);
      if (cachedDataString) {
        try {
          const cachedDataObj = JSON.parse(cachedDataString);
          if (Date.now() < cachedDataObj.expiration) {
            cachedData = cachedDataObj.data;
            console.log('fetchServicos - Usando dados em cache');
          } else {
            localStorage.removeItem(cacheKey);
          }
        } catch (e) {
          console.warn('fetchServicos - Erro ao ler cache:', e);
        }
      }
    }

    if (cachedData) return cachedData;

    // Buscar da API
    const token = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const servicosData = await ApiService.get<SiscopConformidade[]>(url, { headers });

    // Salvar no cache
    if (typeof window !== 'undefined' && servicosData) {
      const cacheData = {
        data: servicosData,
        expiration: Date.now() + CACHE_EXPIRATION.SHORT
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }

    return servicosData;
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);

    // Verificar se há dados em cache como fallback
    if (typeof window !== 'undefined' && cachedData) return cachedData; // Return cached data if available

    // Se não houver cache, retornar array vazio para não quebrar a interface
    return [];
  }
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
  const url = `${API_CONFORMIDADE_URL}?${queryString}`;
  const cacheKey = `conformidades_${JSON.stringify(params)}`;

  try {
    // Verificar cache primeiro
    let cachedData: SiscopConformidade[] | null = null;
    if (typeof window !== 'undefined') {
      const cachedDataString = localStorage.getItem(cacheKey);
      if (cachedDataString) {
        try {
          const cachedDataObj = JSON.parse(cachedDataString);
          if (Date.now() < cachedDataObj.expiration) {
            cachedData = cachedDataObj.data;
            console.log('fetchConformidades - Usando dados em cache');
          } else {
            localStorage.removeItem(cacheKey);
          }
        } catch (e) {
          console.warn('fetchConformidades - Erro ao ler cache:', e);
        }
      }
    }

    if (cachedData) return cachedData;

    // Buscar da API
    const token = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const conformidadesData = await ApiService.get<SiscopConformidade[]>(url, { headers });

    // Salvar no cache
    if (typeof window !== 'undefined' && conformidadesData) {
      const cacheData = {
        data: conformidadesData,
        expiration: Date.now() + CACHE_EXPIRATION.SHORT
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }

    return conformidadesData;
  } catch (error) {
    console.error('Erro ao buscar conformidades:', error);

    // Verificar se há dados em cache como fallback
    if (typeof window !== 'undefined' && cachedData) return cachedData; // Return cached data if available

    // Se não houver cache, retornar array vazio para não quebrar a interface
    return [];
  }
}