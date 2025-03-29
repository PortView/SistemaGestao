import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  avatarUrl: text("avatar_url"),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  registrationNumber: text("registration_number"),
});

export const documentTypes = pgTable("document_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  documentNumber: text("document_number").notNull(),
  documentTypeId: integer("document_type_id").notNull(),
  propertyId: integer("property_id").notNull(),
  status: text("status").notNull(), // pendente, em_analise, aprovado, expirado, rejeitado, arquivado
  issueDate: timestamp("issue_date").notNull(),
  expirationDate: timestamp("expiration_date"),
  fileUrl: text("file_url"),
  notes: text("notes"),
  metadata: json("metadata"),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  documentId: integer("document_id"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  type: text("type").notNull(), // info, warning, success, error
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertPropertySchema = createInsertSchema(properties).omit({ id: true });
export const insertDocumentTypeSchema = createInsertSchema(documentTypes).omit({ id: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertDocumentType = z.infer<typeof insertDocumentTypeSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type DocumentType = typeof documentTypes.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

// Document Status Enum
export const DocumentStatus = {
  PENDING: "pendente",
  IN_ANALYSIS: "em_analise",
  APPROVED: "aprovado",
  EXPIRED: "expirado",
  REJECTED: "rejeitado",
  ARCHIVED: "arquivado",
} as const;

// Notification Type Enum
export const NotificationType = {
  INFO: "info",
  WARNING: "warning",
  SUCCESS: "success",
  ERROR: "error",
} as const;

// Status mapping
export const statusLabels: Record<string, string> = {
  [DocumentStatus.PENDING]: "Pendente",
  [DocumentStatus.IN_ANALYSIS]: "Em análise",
  [DocumentStatus.APPROVED]: "Aprovado",
  [DocumentStatus.EXPIRED]: "Expirado",
  [DocumentStatus.REJECTED]: "Rejeitado",
  [DocumentStatus.ARCHIVED]: "Arquivado",
};

export const statusClasses: Record<string, string> = {
  [DocumentStatus.PENDING]: "bg-red-100 text-red-800",
  [DocumentStatus.IN_ANALYSIS]: "bg-yellow-100 text-yellow-800",
  [DocumentStatus.APPROVED]: "bg-green-100 text-green-800",
  [DocumentStatus.EXPIRED]: "bg-red-100 text-red-800",
  [DocumentStatus.REJECTED]: "bg-red-100 text-red-800",
  [DocumentStatus.ARCHIVED]: "bg-gray-100 text-gray-800",
};
