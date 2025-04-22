'use client';

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Search, Filter, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

/**
 * Página de controle de processos
 * Permite visualizar e gerenciar os processos em andamento
 */
export default function ProcessControlPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dados simulados para demonstração
  const processes = [
    { id: 1, title: 'Regularização de Matrícula', client: 'Empresa ABC', status: 'pending', deadline: '2025-05-15', priority: 'high' },
    { id: 2, title: 'Averbação de Construção', client: 'João Silva', status: 'in_progress', deadline: '2025-05-10', priority: 'medium' },
    { id: 3, title: 'Retificação de Área', client: 'Maria Oliveira', status: 'completed', deadline: '2025-04-30', priority: 'low' },
    { id: 4, title: 'Usucapião Extrajudicial', client: 'Construtora XYZ', status: 'pending', deadline: '2025-06-20', priority: 'high' },
    { id: 5, title: 'Incorporação Imobiliária', client: 'Imobiliária Central', status: 'in_progress', deadline: '2025-05-25', priority: 'medium' },
    { id: 6, title: 'Registro de Loteamento', client: 'Urbanizadora Cidade Nova', status: 'delayed', deadline: '2025-04-10', priority: 'high' },
  ];
  
  // Filtrar processos com base no termo de pesquisa e status selecionado
  const filteredProcesses = processes.filter(process => {
    const matchesSearch = 
      process.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : process.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Função para obter a classe de cor com base na prioridade
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800/40 dark:text-slate-400';
    }
  };
  
  // Função para obter o texto da prioridade
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Desconhecida';
    }
  };
  
  // Função para obter o ícone e a classe de cor com base no status
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          icon: <Clock className="h-4 w-4 mr-2" />, 
          text: 'Pendente',
          class: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'in_progress':
        return { 
          icon: <Clock className="h-4 w-4 mr-2" />, 
          text: 'Em Andamento',
          class: 'text-blue-600 dark:text-blue-400'
        };
      case 'completed':
        return { 
          icon: <CheckCircle className="h-4 w-4 mr-2" />, 
          text: 'Concluído',
          class: 'text-green-600 dark:text-green-400'
        };
      case 'delayed':
        return { 
          icon: <AlertCircle className="h-4 w-4 mr-2" />, 
          text: 'Atrasado',
          class: 'text-red-600 dark:text-red-400'
        };
      default:
        return { 
          icon: <Clock className="h-4 w-4 mr-2" />, 
          text: 'Desconhecido',
          class: 'text-slate-600 dark:text-slate-400'
        };
    }
  };
  
  // Verificar se um prazo está vencido
  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Controle de Processos</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar processos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar por Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                Pendentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('in_progress')}>
                Em Andamento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                Concluídos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('delayed')}>
                Atrasados
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Lista de Processos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Processo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcesses.length > 0 ? (
                filteredProcesses.map((process) => {
                  const statusInfo = getStatusInfo(process.status);
                  const deadlinePassed = isDeadlinePassed(process.deadline);
                  
                  return (
                    <TableRow key={process.id}>
                      <TableCell className="font-medium">{process.title}</TableCell>
                      <TableCell>{process.client}</TableCell>
                      <TableCell>
                        <div className={`flex items-center ${statusInfo.class}`}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </div>
                      </TableCell>
                      <TableCell className={deadlinePassed ? 'text-red-600 dark:text-red-400' : ''}>
                        {new Date(process.deadline).toLocaleDateString('pt-BR')}
                        {deadlinePassed && ' (Vencido)'}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityClass(process.priority)}`}>
                          {getPriorityText(process.priority)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <p className="text-muted-foreground">Nenhum processo encontrado.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
