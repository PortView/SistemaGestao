'use client';

import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, User, Bell, Shield, Database } from 'lucide-react';

/**
 * Página de configurações do sistema
 * Permite configurar preferências do usuário, tema, notificações e outras opções
 */
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      
      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span className="hidden md:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Conta</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden md:inline">Avançado</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Aba de Aparência */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência do sistema de acordo com suas preferências.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tema</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    variant={theme === 'light' ? 'default' : 'outline'} 
                    className="flex flex-col items-center justify-center h-24"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-6 w-6 mb-2" />
                    <span>Claro</span>
                  </Button>
                  <Button 
                    variant={theme === 'dark' ? 'default' : 'outline'} 
                    className="flex flex-col items-center justify-center h-24"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-6 w-6 mb-2" />
                    <span>Escuro</span>
                  </Button>
                  <Button 
                    variant={theme === 'system' ? 'default' : 'outline'} 
                    className="flex flex-col items-center justify-center h-24"
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="h-6 w-6 mb-2" />
                    <span>Sistema</span>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Densidade</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="density-compact">Interface compacta</Label>
                  <Switch id="density-compact" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Animações</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduce-animations">Reduzir animações</Label>
                  <Switch id="reduce-animations" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Conta */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Conta</CardTitle>
              <CardDescription>
                Gerencie suas informações de conta e preferências de perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <div className="mt-1 text-muted-foreground">João Silva</div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="mt-1 text-muted-foreground">joao.silva@exemplo.com</div>
                  </div>
                  <div>
                    <Label htmlFor="role">Cargo</Label>
                    <div className="mt-1 text-muted-foreground">Coordenador</div>
                  </div>
                  <div>
                    <Label htmlFor="department">Departamento</Label>
                    <div className="mt-1 text-muted-foreground">Operações</div>
                  </div>
                </div>
                <Button variant="outline">Editar Informações</Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Idioma e Região</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="language">Idioma do sistema</Label>
                  <div className="text-muted-foreground">Português (Brasil)</div>
                </div>
                <Button variant="outline">Alterar Idioma</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure como e quando deseja receber notificações do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificações por Email</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-tasks">Tarefas atribuídas</Label>
                    <Switch id="email-tasks" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-documents">Documentos pendentes</Label>
                    <Switch id="email-documents" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-deadlines">Prazos próximos</Label>
                    <Switch id="email-deadlines" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificações no Sistema</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-tasks">Tarefas atribuídas</Label>
                    <Switch id="system-tasks" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-documents">Documentos pendentes</Label>
                    <Switch id="system-documents" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-deadlines">Prazos próximos</Label>
                    <Switch id="system-deadlines" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Segurança */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie as configurações de segurança da sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Senha</h3>
                <Button variant="outline">Alterar Senha</Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Autenticação de Dois Fatores</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor">Ativar autenticação de dois fatores</Label>
                  <Switch id="two-factor" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sessões Ativas</h3>
                <div className="rounded-md border p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Windows - Chrome</p>
                      <p className="text-sm text-muted-foreground">São Paulo, Brasil - Atual</p>
                    </div>
                    <Button variant="ghost" size="sm">Esta sessão</Button>
                  </div>
                </div>
                <Button variant="outline">Encerrar Outras Sessões</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba Avançado */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Configure opções avançadas do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Cache e Armazenamento</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="cache">Limpar cache automaticamente</Label>
                  <Switch id="cache" />
                </div>
                <Button variant="outline">Limpar Cache Agora</Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Exportação de Dados</h3>
                <Button variant="outline">Exportar Meus Dados</Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Modo Desenvolvedor</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="developer-mode">Ativar modo desenvolvedor</Label>
                  <Switch id="developer-mode" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
