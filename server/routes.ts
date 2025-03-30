import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertDocumentSchema, 
  insertUserSchema, 
  insertPropertySchema, 
  insertDocumentTypeSchema,
  insertNotificationSchema,
  DocumentStatus
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler helper
  const handleError = (res: any, error: any) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    console.error(error);
    return res.status(500).json({ error: error.message || "Erro interno do servidor" });
  };

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
      }
      
      // Tenta autenticar com a API externa
      const token = await storage.authenticate(email, password);
      
      if (!token) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }
      
      return res.json({ access_token: token });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Current user endpoint
  app.get("/api/me", async (req, res) => {
    try {
      // Get the token from the Authorization header
      const authHeader = req.headers.authorization;
      
      // Lógica para ambiente de desenvolvimento
      if (process.env.NODE_ENV !== 'production') {
        const token = authHeader && authHeader.startsWith('Bearer ') 
          ? authHeader.substring(7) // Remove 'Bearer ' do início
          : null;
          
        // Se houver token em desenvolvimento, busca perfil simulado
        if (token) {
          const userProfile = await storage.getUserProfile(token);
          if (userProfile) {
            console.log('Modo de desenvolvimento: retornando perfil de usuário do token');
            return res.json(userProfile);
          }
        }
        
        // Se não houver token ou perfil, usa o usuário atual
        const user = await storage.getCurrentUser();
        if (user) {
          console.log('Modo de desenvolvimento: retornando usuário atual');
          return res.json(user);
        }
        
        return res.status(401).json({ error: "Não autenticado" });
      }
      
      // Lógica para ambiente de produção
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Não autenticado" });
      }
      
      const token = authHeader.substring(7); // Remove 'Bearer ' do início
      const userProfile = await storage.getUserProfile(token);
      
      if (!userProfile) {
        return res.status(401).json({ error: "Token inválido ou expirado" });
      }
      
      return res.json(userProfile);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDocumentStats();
      return res.json(stats);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Document types
  app.get("/api/document-types", async (req, res) => {
    try {
      const documentTypes = await storage.getAllDocumentTypes();
      return res.json(documentTypes);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Properties
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      return res.json(properties);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ error: "Propriedade não encontrada" });
      }
      
      return res.json(property);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Documents
  app.get("/api/documents", async (req, res) => {
    try {
      const { type, status, sort = "recent", search, page = 1, limit = 10 } = req.query;
      
      const filters: Record<string, any> = {};
      
      if (type && typeof type === 'string') {
        filters.documentTypeId = parseInt(type);
      }
      
      if (status && typeof status === 'string') {
        filters.status = status;
      }
      
      if (search && typeof search === 'string') {
        filters.search = search;
      }
      
      const documents = await storage.getDocuments(filters, {
        sort: sort as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      
      return res.json(documents);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: "Documento não encontrado" });
      }
      
      return res.json(document);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const data = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(data);
      return res.status(201).json(document);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const data = insertDocumentSchema.partial().parse(req.body);
      const document = await storage.updateDocument(id, data);
      if (!document) {
        return res.status(404).json({ error: "Documento não encontrado" });
      }
      
      return res.json(document);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const { read, limit = 10 } = req.query;
      
      const filters: Record<string, any> = {};
      
      if (read !== undefined) {
        filters.isRead = read === 'true';
      }
      
      const notifications = await storage.getNotifications(filters, {
        limit: parseInt(limit as string)
      });
      
      return res.json(notifications);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      
      const { isRead } = req.body;
      if (isRead === undefined) {
        return res.status(400).json({ error: "Campo isRead é obrigatório" });
      }
      
      const notification = await storage.updateNotification(id, { isRead });
      if (!notification) {
        return res.status(404).json({ error: "Notificação não encontrada" });
      }
      
      return res.json(notification);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/mark-all-read", async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead();
      return res.status(200).json({ success: true });
    } catch (error) {
      handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
