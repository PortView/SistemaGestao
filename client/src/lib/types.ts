import { 
  User, 
  Document, 
  Property, 
  DocumentType, 
  Notification,
  DocumentStatus
} from "@shared/schema";

export interface DocumentWithRelations extends Document {
  property: Property;
  documentType: DocumentType;
}

export interface DashboardStats {
  documentCount: number;
  pendingCount: number;
  approvedCount: number;
  expiredCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DocumentFilters {
  type?: string;
  status?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface NotificationFilters {
  read?: boolean;
  limit?: number;
}

// Interfaces para API do Siscop
export interface SiscopUser {
  id: number;
  email: string;
  name: string;
  cod: number;
  tipo: string;
  mvvm: string;
  codcargo: number;
}

export interface SiscopCliente {
  codcli: number;
  fantasia: string;
  lc_ufs: { uf: string }[];
}

export interface SiscopUnidade {
  contrato: number;
  codend: number;
  cadimov: {
    tipo: string;
    uf: string;
  };
}

export interface SiscopUnidadesResponse {
  folowups: SiscopUnidade[];
  pagination: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    lastPage: number;
  };
}

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

export const documentStatusColors = {
  [DocumentStatus.PENDING]: "bg-red-100 text-red-800",
  [DocumentStatus.IN_ANALYSIS]: "bg-yellow-100 text-yellow-800",
  [DocumentStatus.APPROVED]: "bg-green-100 text-green-800",
  [DocumentStatus.EXPIRED]: "bg-red-100 text-red-800",
  [DocumentStatus.REJECTED]: "bg-red-100 text-red-800",
  [DocumentStatus.ARCHIVED]: "bg-gray-100 text-gray-800",
};

export const notificationIcons = {
  info: { icon: "info-circle", className: "bg-blue-100 text-blue-600" },
  warning: { icon: "exclamation", className: "bg-yellow-100 text-yellow-600" },
  success: { icon: "check", className: "bg-green-100 text-green-600" },
  error: { icon: "exclamation-triangle", className: "bg-red-100 text-red-600" },
};

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR");
};

export const getTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "Agora mesmo";
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Há ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Há ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `Há ${diffInDays} ${diffInDays === 1 ? "dia" : "dias"}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `Há ${diffInMonths} ${diffInMonths === 1 ? "mês" : "meses"}`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `Há ${diffInYears} ${diffInYears === 1 ? "ano" : "anos"}`;
};
