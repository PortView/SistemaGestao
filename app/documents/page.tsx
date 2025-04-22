'use client';

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Search, Plus, FileText } from 'lucide-react';
import Link from 'next/link';

/**
 * Página de listagem de documentos
 * Permite visualizar, pesquisar e adicionar novos documentos
 */
export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dados simulados para demonstração
  const documents = [
    { id: 1, title: 'Contrato de Locação', status: 'approved', date: '2025-04-15' },
    { id: 2, title: 'Certidão de Matrícula', status: 'pending', date: '2025-04-10' },
    { id: 3, title: 'Laudo de Avaliação', status: 'rejected', date: '2025-04-05' },
    { id: 4, title: 'Relatório de Vistoria', status: 'approved', date: '2025-03-28' },
    { id: 5, title: 'Contrato de Compra e Venda', status: 'expiring_soon', date: '2025-03-20' },
  ];
  
  // Filtrar documentos com base no termo de pesquisa
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Função para obter a classe de cor com base no status
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'expiring_soon':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800/40 dark:text-slate-400';
    }
  };
  
  // Função para obter o texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      case 'expiring_soon': return 'Expirando em breve';
      default: return 'Desconhecido';
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Documentos</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button asChild>
            <Link href="/document/upload">
              <Plus className="h-4 w-4 mr-2" />
              Novo Documento
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <Link href={`/documento/${doc.id}`} key={doc.id}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(doc.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(doc.status)}`}>
                      {getStatusText(doc.status)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">Nenhum documento encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
