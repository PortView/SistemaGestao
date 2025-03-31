/**
 * Tipos do usuário SISCOP
 */
export interface SiscopUser {
  id: number;
  email: string;
  name: string;
  cod: number;
  tipo: string; // ADM, TEC, COR, etc.
  mvvm: string;
  codcargo: number;
}

/**
 * Tipos relacionados a clientes
 */
export interface SiscopCliente {
  codcli: number;
  fantasia: string;
  lc_ufs: { uf: string }[];
}

/**
 * Tipos relacionados a unidades
 */
export interface SiscopUnidade {
  contrato: number;
  codend: number;
  cadimov: {
    tipo: string;
    uf: string;
  };
}

/**
 * Resposta da API de unidades com paginação
 */
export interface SiscopUnidadesResponse {
  folowups: SiscopUnidade[];
  pagination: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    lastPage: number;
  };
}

/**
 * Tipos relacionados a serviços
 */
export interface SiscopServico {
  codccontra: number;
  contrato: number;
  codend: number;
  tipo: string;
  descserv: string;
  codServ: number;
  dtLimite: string;
  dt_limiteS: string;
  concluido: boolean;
  pendente: boolean;
  obsServ: string;
  valserv: string;
  valameni: string;
}

/**
 * Tipos relacionados a conformidade
 */
export interface SiscopConformidade {
  cod: number;
  codimov: number;
  descr: string;
  doc: string;
  dt: string;
  dtvenc: string | null;
  periodocidade: string;
  graurisco: string;
  providencia: string;
  frelatorio: boolean;
  statusconform: boolean;
}

/**
 * Cores para diferentes status de documentos
 */
export const documentStatusColors = {
  pendente: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  atrasado: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800'
  },
  concluido: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800'
  },
  emAndamento: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  baixaPrioridade: {
    bg: 'bg-slate-100 dark:bg-slate-800/40',
    text: 'text-slate-800 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700'
  },
  mediaPrioridade: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-800 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800'
  },
  altaPrioridade: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800'
  }
};