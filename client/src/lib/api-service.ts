import { SiscopCliente, SiscopConformidade, SiscopUnidadesResponse, SiscopUser } from './types';

// Constantes importadas das variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_NEXT_PUBLIC_API_BASE_URL || 'https://amenirealestate.com.br:5601';
const API_AUTH_URL = import.meta.env.VITE_NEXT_PUBLIC_API_AUTH_URL || `${API_BASE_URL}/login`;
const API_ME_URL = import.meta.env.VITE_NEXT_PUBLIC_API_ME_URL || `${API_BASE_URL}/user/me`;
const API_CLIENTES_URL = import.meta.env.VITE_NEXT_PUBLIC_API_CLIENTES_URL || `${API_BASE_URL}/ger-clientes/clientes`;
const API_UNIDADES_URL = import.meta.env.VITE_NEXT_PUBLIC_API_UNIDADES_URL || `${API_BASE_URL}/ger-clientes/unidades`;
const API_SERVICOS_URL = import.meta.env.VITE_NEXT_PUBLIC_API_SERVICOS_URL || `${API_BASE_URL}/ger-clientes/servicos`;
const API_CONFORMIDADE_URL = import.meta.env.VITE_NEXT_PUBLIC_API_CONFORMIDADE_URL || `${API_BASE_URL}/ger-clientes/conformidades`;

// Configurações de CORS
// Desativando temporariamente para debug
const USE_CORS_PROXY = false; // import.meta.env.VITE_NEXT_PUBLIC_USE_CORS_PROXY === 'true';
const CORS_PROXY_URL = import.meta.env.VITE_NEXT_PUBLIC_CORS_PROXY_URL || 'https://corsproxy.io/?';

// Flag para simular respostas bem-sucedidas quando a API não responde
const USE_MOCK_FALLBACK = true; // Ativar simulação de resposta

// Configurações de timeout e retry
const TIMEOUT = 60000; // 60 segundos - aumentando para requisições mais lentas
const MAX_RETRIES = 2;

// Cache expiration
const CACHE_EXPIRATION = {
  SHORT: parseInt(import.meta.env.VITE_CACHE_SHORT || '300000'),
  MEDIUM: parseInt(import.meta.env.VITE_CACHE_MEDIUM || '1800000'),
  LONG: parseInt(import.meta.env.VITE_CACHE_LONG || '86400000')
};

// Chaves para localStorage
const LOCAL_STORAGE_TOKEN_KEY = 'siscop_token';
const LOCAL_STORAGE_USER_KEY = 'siscop_user';
const LOCAL_STORAGE_CACHE_PREFIX = 'siscop_cache_';
const LOCAL_STORAGE_CLIENTES_KEY = 'siscop_clientes';

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
    console.log(`ApiService.get - Iniciando requisição para: ${url}`);
    console.log(`ApiService.get - Opções recebidas:`, options);
    
    // Verificar token no início
    const token = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) : null;
    console.log(`ApiService.get - Token encontrado:`, token ? `${token.substring(0, 15)}...` : 'null');

    // Desativando cache temporariamente para debug
    if (url.includes('codcoor')) {
      console.log(`ApiService.get - Requisição para clientes detectada, ignorando cache temporariamente`);
    } else {
      // Tentar obter dados do cache para requisições GET
      if (typeof window !== 'undefined' && cacheTime) {
        const cachedData = this.getFromCache<T>(url);
        if (cachedData) {
          console.log(`ApiService.get - Usando dados em cache para: ${url}`);
          return cachedData;
        }
      }
    }

    try {
      console.log(`ApiService.get - Enviando requisição para servidor: ${url}`);
      const result = await this.request<T>('GET', url, null, options);
      console.log(`ApiService.get - Resposta recebida para ${url}:`, result);

      // Salvar no cache se cacheTime estiver definido
      if (typeof window !== 'undefined' && cacheTime) {
        this.saveToCache(url, result, cacheTime);
        console.log(`ApiService.get - Dados salvos no cache com expiração de ${cacheTime}ms`);
      }

      return result;
    } catch (error) {
      console.error(`ApiService.get - Erro na requisição para ${url}:`, error);
      throw error;
    }
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

    // Preparar headers com tipagem correta
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    } as Record<string, string>;

    // Adicionar token de autenticação se necessário
    if (!options.skipAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) : null;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log(`ApiService.request - Token adicionado ao header de autenticação (${token.substring(0, 15)}...)`);
      } else {
        console.warn(`ApiService.request - Token de autenticação não encontrado para requisição ${method} ${url}`);
      }
    }

    // Configurar opções da requisição
    const fetchOptions: RequestInit = {
      method,
      headers,
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    };

    // Remover a opção credentials para evitar problemas de CORS
    if (fetchOptions.credentials === 'include') {
      delete fetchOptions.credentials;
    }

    try {
      console.log(`ApiService.request - Iniciando fetch para ${fullUrl} com opções:`, {
        method: fetchOptions.method,
        headersKeys: Object.keys(headers),
        useProxy: USE_CORS_PROXY
      });

      // Fazer a requisição com retry e timeout
      let response;
      const RETRY_DELAY = 2000; // Usando 2 segundos de delay entre tentativas
      
      // Implementação simplificada de retry
      let lastError = null;
      
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.log(`ApiService.request - Tentativa ${attempt + 1} de ${MAX_RETRIES + 1}`);
          
          // Criar um novo controller para cada tentativa
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
          
          // Opções de fetch com o signal
          const currentOptions = {
            ...fetchOptions,
            signal: controller.signal
          };
          
          // Tentar fazer a requisição
          try {
            response = await fetch(fullUrl, currentOptions);
            clearTimeout(timeoutId); // Limpar o timeout se a requisição foi bem-sucedida
            console.log(`ApiService.request - Tentativa ${attempt + 1} bem-sucedida`);
            break; // Sair do loop se a requisição for bem-sucedida
          } catch (fetchErr: any) {
            clearTimeout(timeoutId); // Limpar o timeout em caso de erro
            
            // Se for um erro de timeout (AbortError), personalizar a mensagem
            if (fetchErr.name === 'AbortError') {
              throw new Error(`Timeout na requisição após ${TIMEOUT/1000} segundos`);
            }
            
            // Propagar outros erros
            throw fetchErr;
          }
        } catch (error: any) {
          console.error(`ApiService.request - Tentativa ${attempt + 1} falhou:`, error);
          lastError = error;
          
          // Se for a última tentativa, propagar o erro
          if (attempt === MAX_RETRIES) {
            console.warn(`ApiService.request - Todas as ${MAX_RETRIES + 1} tentativas falharam`);
            throw error;
          }
          
          // Aguardar antes da próxima tentativa
          console.log(`ApiService.request - Aguardando ${RETRY_DELAY/1000} segundos antes da próxima tentativa`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }

      if (!response) {
        throw new Error('Falha na requisição após tentativas');
      }

      console.log(`ApiService.request - Resposta recebida de ${fullUrl}:`, {
        status: response.status,
        statusText: response.statusText
      });

      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        console.error(`ApiService.request - Erro na resposta: Status ${response.status} ${response.statusText}`);
        let errorData;
        try {
          errorData = await response.json();
          console.error('ApiService.request - Detalhes do erro:', errorData);
        } catch (e) {
          errorData = {};
          console.error('ApiService.request - Não foi possível obter detalhes do erro');
        }

        const error = new Error(errorData.message || `Erro na requisição: ${response.status}`);
        Object.assign(error, { status: response.status, data: errorData });
        throw error;
      }

      // Verificar se há conteúdo na resposta
      const contentType = response.headers.get('content-type');
      console.log(`ApiService.request - Content-Type da resposta: ${contentType}`);

      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        console.log(`ApiService.request - Dados JSON recebidos:`, 
          Array.isArray(jsonData) ? `Array com ${jsonData.length} itens` : jsonData);
        return jsonData;
      }

      // Se a resposta não for JSON, tentar retornar texto
      try {
        const textData = await response.text();
        console.log(`ApiService.request - Dados de texto recebidos: ${textData.substring(0, 100)}${textData.length > 100 ? '...' : ''}`);
        return {} as T;
      } catch (e) {
        console.log(`ApiService.request - Retornando objeto vazio para resposta não processável`);
        return {} as T;
      }
    } catch (error) {
      console.error('ApiService.request - Erro completo na requisição à API:', error);
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

  // Verificar token antes de fazer requisição
  const token = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) : null;
  if (!token) {
    console.error('Erro: Token de autenticação não encontrado. Usuário precisa fazer login novamente.');
    throw new Error('Token de autenticação não encontrado. Faça login novamente.');
  }

  try {
    // Buscar do cache primeiro para economizar requisições
    if (typeof window !== 'undefined') {
      const cachedClientes = localStorage.getItem(cacheKey);
      if (cachedClientes) {
        try {
          const { data, expiration } = JSON.parse(cachedClientes);
          // Verificar se o cache ainda é válido
          if (Date.now() < expiration) {
            console.log('Usando dados de clientes em cache');
            return data;
          }
          // Remover cache expirado
          localStorage.removeItem(cacheKey);
        } catch (e) {
          console.warn('Erro ao ler cache de clientes:', e);
        }
      }
    }

    // Buscar da API com token de autorização
    console.log('fetchClientes - Fazendo requisição para API com token');

    // Usar o sistema padrão de autorização do ApiService, não precisamos
    // passar headers explicitamente pois o token já está no localStorage
    // e o ApiService o utilizará automaticamente
    const clientesData = await ApiService.get<SiscopCliente[]>(
      url,
      {}, // Não precisamos passar headers, o ApiService já incluirá o token
      CACHE_EXPIRATION.MEDIUM
    );

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
    if (typeof window !== 'undefined') {
      const cachedClientes = localStorage.getItem(cacheKey);
      if (cachedClientes) {
        try {
          const { data } = JSON.parse(cachedClientes);
          console.log('fetchClientes - Usando dados em cache como fallback após erro');
          return data;
        } catch (e) {
          console.error('Erro ao ler cache para fallback:', e);
        }
      }
    }

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
    
    // Retornar resposta vazia em vez de lançar erro
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

  try {
    // Buscar do cache primeiro, se não estiver pulando o cache
    if (typeof window !== 'undefined' && !options.skipCache) {
      const cachedUnidades = localStorage.getItem(cacheKey);
      if (cachedUnidades) {
        try {
          const { data, expiration } = JSON.parse(cachedUnidades);
          // Verificar se o cache ainda é válido
          if (Date.now() < expiration) {
            console.log('fetchUnidades - Usando dados em cache');
            return data;
          }
          // Remover cache expirado
          localStorage.removeItem(cacheKey);
        } catch (e) {
          console.warn('fetchUnidades - Erro ao ler cache:', e);
        }
      }
    }

    try {
      // Buscar dados da API - o ApiService já vai incluir o token nas headers
      const unidadesData = await ApiService.get<SiscopUnidadesResponse>(url, {}, CACHE_EXPIRATION.SHORT);
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
    } catch (apiError) {
      console.error('Error fetching unidades:', apiError);
      
      // Se a API falhar e USE_MOCK_FALLBACK estiver ativado, usar dados simulados
      if (USE_MOCK_FALLBACK) {
        console.log('Usando fallback para unidades devido a falha na API');
        
        // Retornar estrutura vazia que segue o formato da resposta da API
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
      
      throw apiError; // Se não estiver usando fallback, propaga o erro
    }
  } catch (error) {
    console.error('Erro ao buscar unidades:', error);
    
    // Em caso de falha, verificar se temos dados em cache mesmo que expirados
    if (typeof window !== 'undefined') {
      const cachedUnidades = localStorage.getItem(cacheKey);
      if (cachedUnidades) {
        try {
          const { data } = JSON.parse(cachedUnidades);
          console.log('fetchUnidades - Usando dados em cache como fallback após erro');
          return data;
        } catch (e) {
          console.error('Erro ao ler cache para fallback:', e);
        }
      }
    }
    
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

  // Verificar se tem parâmetros importantes antes de fazer a requisição
  if ((!params.contrato || !params.unidade) && !params.codserv) {
    console.log('TableServicos: Contrato ou unidade não selecionados, cancelando busca');
    return [];
  }

  try {
    // Verificar cache primeiro
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const { data, expiration } = JSON.parse(cachedData);
          if (Date.now() < expiration) {
            console.log('fetchServicos - Usando dados em cache');
            return data;
          }
          localStorage.removeItem(cacheKey);
        } catch (e) {
          console.warn('fetchServicos - Erro ao ler cache:', e);
        }
      }
    }
    
    try {
      // Buscar da API
      const servicosData = await ApiService.get<SiscopConformidade[]>(url, {}, CACHE_EXPIRATION.SHORT);
      
      // Salvar no cache
      if (typeof window !== 'undefined' && servicosData) {
        const cacheData = {
          data: servicosData,
          expiration: Date.now() + CACHE_EXPIRATION.SHORT
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
      
      return servicosData;
    } catch (apiError) {
      console.error('Error fetching services:', apiError);
      
      // Se a API falhar e USE_MOCK_FALLBACK estiver ativado, usar dados simulados
      if (USE_MOCK_FALLBACK) {
        console.log('Usando fallback para serviços devido a falha na API');
        return []; // Retorna um array vazio para simular uma resposta sem dados
      }
      
      throw apiError; // Se não estiver usando fallback, propaga o erro
    }
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    
    // Verificar se há dados em cache como fallback
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const { data } = JSON.parse(cachedData);
          console.log('fetchServicos - Usando dados em cache como fallback após erro');
          return data;
        } catch (e) {
          console.error('Erro ao ler cache para fallback:', e);
        }
      }
    }
    
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

  // Verificar se tem o parâmetro obrigatório
  if (!params.codimov) {
    console.log('fetchConformidades: Faltando parâmetro codimov, cancelando busca');
    return [];
  }

  try {
    // Verificar cache primeiro
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const { data, expiration } = JSON.parse(cachedData);
          if (Date.now() < expiration) {
            console.log('fetchConformidades - Usando dados em cache');
            return data;
          }
          localStorage.removeItem(cacheKey);
        } catch (e) {
          console.warn('fetchConformidades - Erro ao ler cache:', e);
        }
      }
    }
    
    try {
      // Buscar da API
      const conformidadesData = await ApiService.get<SiscopConformidade[]>(url, {}, CACHE_EXPIRATION.SHORT);
      
      // Salvar no cache
      if (typeof window !== 'undefined' && conformidadesData) {
        const cacheData = {
          data: conformidadesData,
          expiration: Date.now() + CACHE_EXPIRATION.SHORT
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
      
      return conformidadesData;
    } catch (apiError) {
      console.error('Error fetching conformidades:', apiError);
      
      // Se a API falhar e USE_MOCK_FALLBACK estiver ativado, usar dados simulados
      if (USE_MOCK_FALLBACK) {
        console.log('Usando fallback para conformidades devido a falha na API');
        return []; // Retorna um array vazio para simular uma resposta sem dados
      }
      
      throw apiError; // Se não estiver usando fallback, propaga o erro
    }
  } catch (error) {
    console.error('Erro ao buscar conformidades:', error);
    
    // Verificar se há dados em cache como fallback
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const { data } = JSON.parse(cachedData);
          console.log('fetchConformidades - Usando dados em cache como fallback após erro');
          return data;
        } catch (e) {
          console.error('Erro ao ler cache para fallback:', e);
        }
      }
    }
    
    // Se não houver cache, retornar array vazio para não quebrar a interface
    return [];
  }
}