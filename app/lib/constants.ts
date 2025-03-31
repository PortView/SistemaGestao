/**
 * Chaves de armazenamento no localStorage
 */
export const LOCAL_STORAGE_TOKEN_KEY = 'siscop_token';
export const LOCAL_STORAGE_USER_KEY = 'siscop_user';
export const LOCAL_STORAGE_CACHE_PREFIX = 'siscop_cache_';
export const LOCAL_STORAGE_CLIENTES_KEY = 'siscop_clientes';

/**
 * URLs da API
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.siscop.com.br';
export const API_AUTH_URL = process.env.NEXT_PUBLIC_API_AUTH_URL || `${API_BASE_URL}/auth/login`;
export const API_ME_URL = process.env.NEXT_PUBLIC_API_ME_URL || `${API_BASE_URL}/auth/me`;
export const API_CLIENTES_URL = process.env.NEXT_PUBLIC_API_CLIENTES_URL || null;
export const API_UNIDADES_URL = process.env.NEXT_PUBLIC_API_UNIDADES_URL || null;
export const API_SERVICOS_URL = process.env.NEXT_PUBLIC_API_SERVICOS_URL || null;
export const API_CONFORMIDADE_URL = process.env.NEXT_PUBLIC_API_CONFORMIDADE_URL || null;

/**
 * Configurações de CORS
 */
export const USE_CORS_PROXY = process.env.NEXT_PUBLIC_USE_CORS_PROXY === 'true';
export const CORS_PROXY_URL = process.env.NEXT_PUBLIC_CORS_PROXY_URL || 'https://corsproxy.io/?';

/**
 * Tempos de expiração do cache (em milissegundos)
 */
export const CACHE_EXPIRATION = {
  SHORT: 5 * 60 * 1000, // 5 minutos
  MEDIUM: 30 * 60 * 1000, // 30 minutos
  LONG: 24 * 60 * 60 * 1000, // 24 horas
};

/**
 * Status de documento
 */
export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  EXPIRING_SOON: 'expiring_soon',
};

/**
 * Tipos de notificação
 */
export const NOTIFICATION_TYPE = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
};

/**
 * Limites de upload
 */
export const UPLOAD_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  ACCEPTED_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
};