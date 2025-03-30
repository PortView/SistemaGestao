import { 
  users, type User, type InsertUser, 
  properties, type Property, type InsertProperty,
  documentTypes, type DocumentType, type InsertDocumentType,
  documents, type Document, type InsertDocument,
  notifications, type Notification, type InsertNotification,
  DocumentStatus 
} from "@shared/schema";
import fetch from "node-fetch";
import dotenv from "dotenv";
import https from "https";

// Carrega variáveis de ambiente
dotenv.config();

// Configuração para ignorar erros de certificado em ambiente de desenvolvimento
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// URLs das APIs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://amenirealestate.com.br:5601";
const API_AUTH_URL = process.env.NEXT_PUBLIC_API_AUTH_URL || `${API_BASE_URL}/login`;
const API_ME_URL = process.env.NEXT_PUBLIC_API_ME_URL || `${API_BASE_URL}/user/me`;
const API_CLIENTES_URL = process.env.NEXT_PUBLIC_API_CLIENTES_URL || `${API_BASE_URL}/ger-clientes/clientes`;
const API_UNIDADES_URL = process.env.NEXT_PUBLIC_API_UNIDADES_URL || `${API_BASE_URL}/ger-clientes/unidades`;
const API_SERVICOS_URL = process.env.NEXT_PUBLIC_API_SERVICOS_URL || `${API_BASE_URL}/ger-clientes/servicos`;
const API_CONFORMIDADE_URL = process.env.NEXT_PUBLIC_API_CONFORMIDADE_URL || `${API_BASE_URL}/ger-clientes/conformidades`;

// Interface de armazenamento
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Métodos para o usuário atual
  getCurrentUser(): Promise<User | undefined>;
  
  // Métodos para estatísticas
  getDocumentStats(): Promise<any>;
  
  // Métodos para tipos de documentos
  getAllDocumentTypes(): Promise<DocumentType[]>;
  
  // Métodos para propriedades
  getAllProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  
  // Métodos para documentos
  getDocuments(filters: any, options: any): Promise<any>;
  getDocument(id: number): Promise<any>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, data: any): Promise<Document | undefined>;
  
  // Métodos para notificações
  getNotifications(filters: any, options: any): Promise<any>;
  updateNotification(id: number, data: any): Promise<Notification | undefined>;
  markAllNotificationsAsRead(): Promise<void>;
  
  // Autenticação com API externa
  authenticate(email: string, password: string): Promise<string | null>;
  getUserProfile(token: string): Promise<any>;
  getClientes(token: string, codCoor: number): Promise<any[]>;
  getUnidades(token: string, params: any): Promise<any>;
  getServicos(token: string, params: any): Promise<any[]>;
  getConformidades(token: string, params: any): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private documentTypes: Map<number, DocumentType>;
  private documents: Map<number, Document>;
  private notifications: Map<number, Notification>;
  
  private userId: number = 1;
  private propertyId: number = 1;
  private documentTypeId: number = 1;
  private documentId: number = 1;
  private notificationId: number = 1;
  
  private currentUser: User | undefined;
  private accessToken: string | null = null;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.documentTypes = new Map();
    this.documents = new Map();
    this.notifications = new Map();
    
    // Inicializa com alguns dados
    this.initializeMockData();
  }

  private initializeMockData() {
    // Usuário de teste
    const user: User = {
      id: this.userId++,
      username: "admin",
      password: "admin123",
      name: "Administrador",
      role: "admin",
      avatarUrl: null
    };
    this.users.set(user.id, user);
    this.currentUser = user;
    
    // Tipos de documentos
    const types = [
      { name: "Alvará de Funcionamento", description: "Autorização para o funcionamento do estabelecimento" },
      { name: "Licença Ambiental", description: "Documento que atesta conformidade com normas ambientais" },
      { name: "Habite-se", description: "Certifica que o imóvel foi construído seguindo as leis de zoneamento e construção" },
      { name: "AVCB", description: "Auto de Vistoria do Corpo de Bombeiros" },
      { name: "Projeto Aprovado", description: "Planta do imóvel aprovada pela prefeitura" },
    ];
    
    types.forEach(type => {
      const docType: DocumentType = {
        id: this.documentTypeId++,
        ...type
      };
      this.documentTypes.set(docType.id, docType);
    });
    
    // Propriedades
    const propertiesData = [
      { 
        name: "Edifício Comercial Central", 
        address: "Av. Paulista, 1000", 
        city: "São Paulo", 
        state: "SP", 
        zipCode: "01310-100", 
        registrationNumber: "SP-12345"
      },
      { 
        name: "Shopping Vila Mariana", 
        address: "Rua Domingos de Moraes, 2500", 
        city: "São Paulo", 
        state: "SP", 
        zipCode: "04035-000", 
        registrationNumber: "SP-54321"
      },
      { 
        name: "Centro Empresarial Berrini", 
        address: "Av. Engenheiro Luís Carlos Berrini, 500", 
        city: "São Paulo", 
        state: "SP", 
        zipCode: "04571-010", 
        registrationNumber: "SP-98765"
      }
    ];
    
    propertiesData.forEach(propData => {
      const property: Property = {
        id: this.propertyId++,
        ...propData
      };
      this.properties.set(property.id, property);
    });
    
    // Documentos
    const documentsData = [
      {
        title: "Alvará de Funcionamento 2024",
        documentNumber: "ALV-2024-0001",
        documentTypeId: 1,
        propertyId: 1,
        status: DocumentStatus.APPROVED,
        issueDate: new Date("2024-01-15"),
        expirationDate: new Date("2025-01-15"),
        fileUrl: "/docs/alvara_2024.pdf",
        notes: "Renovação realizada com sucesso",
        metadata: {}
      },
      {
        title: "Licença Ambiental 2023",
        documentNumber: "LA-2023-0123",
        documentTypeId: 2,
        propertyId: 1,
        status: DocumentStatus.EXPIRED,
        issueDate: new Date("2023-03-10"),
        expirationDate: new Date("2024-03-10"),
        fileUrl: "/docs/licenca_ambiental_2023.pdf",
        notes: "Necessita renovação urgente",
        metadata: {}
      },
      {
        title: "AVCB Shopping Vila Mariana",
        documentNumber: "AVCB-2024-0045",
        documentTypeId: 4,
        propertyId: 2,
        status: DocumentStatus.PENDING,
        issueDate: new Date("2024-02-20"),
        expirationDate: new Date("2025-02-20"),
        fileUrl: "/docs/avcb_shopping.pdf",
        notes: "Aguardando aprovação final do Corpo de Bombeiros",
        metadata: {}
      }
    ];
    
    documentsData.forEach(docData => {
      const document: Document = {
        id: this.documentId++,
        ...docData
      };
      this.documents.set(document.id, document);
    });
    
    // Notificações
    const notificationsData = [
      {
        userId: 1,
        title: "Documento prestes a vencer",
        message: "A Licença Ambiental 2023 vencerá em 30 dias.",
        documentId: 2,
        isRead: false,
        createdAt: new Date("2024-02-10"),
        type: "warning"
      },
      {
        userId: 1,
        title: "Documento aprovado",
        message: "O Alvará de Funcionamento 2024 foi aprovado com sucesso.",
        documentId: 1,
        isRead: true,
        createdAt: new Date("2024-01-15"),
        type: "success"
      },
      {
        userId: 1,
        title: "Novo documento pendente",
        message: "AVCB Shopping Vila Mariana foi adicionado e está aguardando análise.",
        documentId: 3,
        isRead: false,
        createdAt: new Date("2024-02-21"),
        type: "info"
      }
    ];
    
    notificationsData.forEach(notifData => {
      const notification: Notification = {
        id: this.notificationId++,
        ...notifData
      };
      this.notifications.set(notification.id, notification);
    });
  }

  // Implementação dos métodos de usuário
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, avatarUrl: insertUser.avatarUrl || null };
    this.users.set(id, user);
    return user;
  }
  
  async getCurrentUser(): Promise<User | undefined> {
    return this.currentUser;
  }
  
  // Implementação dos métodos de estatísticas
  async getDocumentStats(): Promise<any> {
    const allDocuments = Array.from(this.documents.values());
    
    return {
      documentCount: allDocuments.length,
      pendingCount: allDocuments.filter(doc => doc.status === DocumentStatus.PENDING).length,
      approvedCount: allDocuments.filter(doc => doc.status === DocumentStatus.APPROVED).length,
      expiredCount: allDocuments.filter(doc => doc.status === DocumentStatus.EXPIRED).length
    };
  }
  
  // Implementação dos métodos de tipos de documentos
  async getAllDocumentTypes(): Promise<DocumentType[]> {
    return Array.from(this.documentTypes.values());
  }
  
  // Implementação dos métodos de propriedades
  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }
  
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }
  
  // Implementação dos métodos de documentos
  async getDocuments(filters: any, options: any): Promise<any> {
    let documents = Array.from(this.documents.values());
    
    // Filtragem
    if (filters.documentTypeId) {
      documents = documents.filter(doc => doc.documentTypeId === filters.documentTypeId);
    }
    
    if (filters.status) {
      documents = documents.filter(doc => doc.status === filters.status);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      documents = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchLower) || 
        doc.documentNumber.toLowerCase().includes(searchLower)
      );
    }
    
    // Ordenação
    if (options.sort === 'recent') {
      documents.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    } else if (options.sort === 'oldest') {
      documents.sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
    }
    
    // Paginação
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedDocuments = documents.slice(startIndex, endIndex);
    
    // Enriquece os documentos com suas relações
    const documentsWithRelations = paginatedDocuments.map(doc => {
      const documentType = this.documentTypes.get(doc.documentTypeId);
      const property = this.properties.get(doc.propertyId);
      
      return {
        ...doc,
        documentType,
        property
      };
    });
    
    return {
      data: documentsWithRelations,
      meta: {
        total: documents.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(documents.length / limit)
      }
    };
  }
  
  async getDocument(id: number): Promise<any> {
    const document = this.documents.get(id);
    
    if (!document) {
      return undefined;
    }
    
    const documentType = this.documentTypes.get(document.documentTypeId);
    const property = this.properties.get(document.propertyId);
    
    return {
      ...document,
      documentType,
      property
    };
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentId++;
    const document: Document = { ...insertDocument, id };
    this.documents.set(id, document);
    
    // Cria uma notificação para o novo documento
    const notification: Notification = {
      id: this.notificationId++,
      userId: 1, // Usuário atual
      title: 'Novo documento adicionado',
      message: `${document.title} foi adicionado ao sistema.`,
      documentId: document.id,
      isRead: false,
      createdAt: new Date(),
      type: 'info'
    };
    
    this.notifications.set(notification.id, notification);
    
    return document;
  }
  
  async updateDocument(id: number, data: any): Promise<Document | undefined> {
    const document = this.documents.get(id);
    
    if (!document) {
      return undefined;
    }
    
    const updatedDocument: Document = { ...document, ...data };
    this.documents.set(id, updatedDocument);
    
    // Cria uma notificação para a atualização do documento
    if (data.status && data.status !== document.status) {
      let title = '';
      let type = 'info';
      
      switch(data.status) {
        case DocumentStatus.APPROVED:
          title = 'Documento aprovado';
          type = 'success';
          break;
        case DocumentStatus.REJECTED:
          title = 'Documento rejeitado';
          type = 'error';
          break;
        case DocumentStatus.EXPIRED:
          title = 'Documento expirado';
          type = 'warning';
          break;
        default:
          title = 'Status do documento atualizado';
      }
      
      const notification: Notification = {
        id: this.notificationId++,
        userId: 1, // Usuário atual
        title,
        message: `${document.title} teve seu status atualizado para ${data.status}.`,
        documentId: document.id,
        isRead: false,
        createdAt: new Date(),
        type
      };
      
      this.notifications.set(notification.id, notification);
    }
    
    return updatedDocument;
  }
  
  // Implementação dos métodos de notificações
  async getNotifications(filters: any, options: any): Promise<any> {
    let notifications = Array.from(this.notifications.values());
    
    // Filtragem
    if (filters.isRead !== undefined) {
      notifications = notifications.filter(notif => notif.isRead === filters.isRead);
    }
    
    // Ordenação por data (mais recentes primeiro)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Paginação
    const limit = options.limit || 10;
    notifications = notifications.slice(0, limit);
    
    return {
      data: notifications,
      meta: {
        total: notifications.length,
        limit
      }
    };
  }
  
  async updateNotification(id: number, data: any): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    
    if (!notification) {
      return undefined;
    }
    
    const updatedNotification: Notification = { ...notification, ...data };
    this.notifications.set(id, updatedNotification);
    
    return updatedNotification;
  }
  
  async markAllNotificationsAsRead(): Promise<void> {
    for (const notification of this.notifications.values()) {
      notification.isRead = true;
    }
  }
  
  // Métodos para integração com API externa
  async authenticate(email: string, password: string): Promise<string | null> {
    try {
      // Em ambiente de desenvolvimento, vamos permitir login com qualquer credencial
      // Isso é apenas uma solução temporária para permitir testes sem depender da API externa
      if (process.env.NODE_ENV !== 'production') {
        console.log('Modo de desenvolvimento: simulando autenticação bem-sucedida');
        this.accessToken = 'dev-token-123456';
        
        // Simula usuário atual
        this.currentUser = {
          id: 999,
          username: email,
          name: "Usuário de Teste",
          password: "**********",
          role: "user",
          tipo: "Analista Técnico",
          avatarUrl: null
        };
        
        return this.accessToken;
      }
      
      // Em produção, usa a API real
      const response = await fetch(API_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        agent: httpsAgent // Ignora erros de certificado
      });
      
      if (!response.ok) {
        throw new Error(`Erro na autenticação: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Erro ao autenticar:', error);
      
      // Em ambiente de desenvolvimento, permitir autenticação mesmo com erro
      if (process.env.NODE_ENV !== 'production') {
        console.log('Modo de desenvolvimento: simulando autenticação após erro');
        this.accessToken = 'dev-token-emergency';
        
        // Simula usuário atual
        this.currentUser = {
          id: 999,
          username: email,
          name: "Usuário de Teste",
          password: "**********",
          role: "user",
          tipo: "Analista Técnico",
          avatarUrl: null
        };
        
        return this.accessToken;
      }
      
      return null;
    }
  }
  
  async getUserProfile(token: string): Promise<any> {
    try {
      // Em ambiente de desenvolvimento, retorna o usuário atual simulado
      if (process.env.NODE_ENV !== 'production') {
        console.log('Modo de desenvolvimento: retornando perfil simulado');
        return this.currentUser;
      }

      const response = await fetch(API_ME_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        agent: httpsAgent // Ignora erros de certificado
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar perfil: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      
      // Em ambiente de desenvolvimento, retorna o usuário atual simulado mesmo com erro
      if (process.env.NODE_ENV !== 'production' && this.currentUser) {
        console.log('Modo de desenvolvimento: retornando perfil simulado após erro');
        return this.currentUser;
      }
      
      return null;
    }
  }
  
  async getClientes(token: string, codCoor: number): Promise<any[]> {
    try {
      const response = await fetch(`${API_CLIENTES_URL}?codcoor=${codCoor}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar clientes: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  }
  
  async getUnidades(token: string, params: any): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      
      const response = await fetch(`${API_UNIDADES_URL}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar unidades: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
      return { folowups: [], pagination: { totalItems: 0, currentPage: 1, itemsPerPage: 0, lastPage: 1 } };
    }
  }
  
  async getServicos(token: string, params: any): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      
      const response = await fetch(`${API_SERVICOS_URL}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar serviços: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
  }
  
  async getConformidades(token: string, params: any): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      
      const response = await fetch(`${API_CONFORMIDADE_URL}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar conformidades: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar conformidades:', error);
      return [];
    }
  }
}

export const storage = new MemStorage();
