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
  pending: 'bg-yellow-600 text-black',
  approved: 'bg-green-600 text-white',
  rejected: 'bg-red-600 text-white',
  expired: 'bg-gray-600 text-white',
};