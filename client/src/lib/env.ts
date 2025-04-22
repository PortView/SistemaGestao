/**
 * Gerenciador de variáveis de ambiente
 * Fornece acesso consistente às variáveis de ambiente tanto no cliente quanto no servidor
 */

// API URLs
export const API_BASE_URL = 'https://amenirealestate.com.br:5601';
export const API_AUTH_URL = `${API_BASE_URL}/login`;
export const API_ME_URL = `${API_BASE_URL}/user/me`;
export const API_CLIENTES_URL = `${API_BASE_URL}/ger-clientes/clientes`;
export const API_UNIDADES_URL = `${API_BASE_URL}/ger-clientes/unidades`;
export const API_SERVICOS_URL = `${API_BASE_URL}/ger-clientes/servicos`;
export const API_CONFORMIDADE_URL = `${API_BASE_URL}/ger-clientes/conformidades`;
export const API_FOLLOWUP_URL = `${API_BASE_URL}/ger-clientes/tarefas`;

// Cache expiration (em milissegundos)
export const CACHE_EXPIRATION = {
  SHORT: 300000,   // 5 minutos
  MEDIUM: 1800000, // 30 minutos
  LONG: 86400000   // 24 horas
};

// Configurações de CORS
export const USE_CORS_PROXY = false;
export const CORS_PROXY_URL = 'https://corsproxy.io/?';

// Chaves para localStorage
export const LOCAL_STORAGE_TOKEN_KEY = 'siscop_token';
export const LOCAL_STORAGE_USER_KEY = 'siscop_user';
export const LOCAL_STORAGE_CACHE_PREFIX = 'siscop_cache_';

// Credenciais de teste (apenas para desenvolvimento)
export const TEST_USER_EMAIL = 'mauro@ameni.com.br';
export const TEST_USER_PASSWORD = '';
