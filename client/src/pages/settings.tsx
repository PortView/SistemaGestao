import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Bell, Shield, Key } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil");
  
  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="flex-1 relative pb-8 z-0 overflow-y-auto">
      {/* Page header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Configurações</h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button onClick={handleSave}>
                <Save className="-ml-1 mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full bg-white p-0 border-b border-gray-200">
              <div className="flex overflow-x-auto">
                <TabsTrigger 
                  value="perfil" 
                  className="flex items-center py-3 px-4 border-b-2 border-transparent text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary"
                >
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger 
                  value="notificacoes" 
                  className="flex items-center py-3 px-4 border-b-2 border-transparent text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notificações
                </TabsTrigger>
                <TabsTrigger 
                  value="seguranca" 
                  className="flex items-center py-3 px-4 border-b-2 border-transparent text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Segurança
                </TabsTrigger>
              </div>
            </TabsList>
            
            <TabsContent value="perfil" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Perfil</CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais. Estas informações serão exibidas publicamente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" defaultValue="Ana Silva" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Cargo</Label>
                      <Input id="role" defaultValue="Administradora" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="ana.silva@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" defaultValue="(11) 98765-4321" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Preferências do Sistema</CardTitle>
                  <CardDescription>
                    Personalize sua experiência com o sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Tema Escuro</h4>
                      <p className="text-sm text-muted-foreground">
                        Habilitar modo escuro para reduzir o cansaço visual.
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Visualização Compacta</h4>
                      <p className="text-sm text-muted-foreground">
                        Usar visualização compacta para mostrar mais conteúdo.
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notificacoes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências de Notificação</CardTitle>
                  <CardDescription>
                    Escolha quais notificações você deseja receber e como recebê-las.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-4">Email</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium">Documentos próximos da expiração</h5>
                          <p className="text-sm text-muted-foreground">
                            Receba alertas quando seus documentos estiverem próximos da data de expiração.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium">Documentos aprovados</h5>
                          <p className="text-sm text-muted-foreground">
                            Receba notificações quando um documento for aprovado.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium">Atualizações de status</h5>
                          <p className="text-sm text-muted-foreground">
                            Seja notificado quando houver mudanças no status dos documentos.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-4">Sistema</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium">Notificações no navegador</h5>
                          <p className="text-sm text-muted-foreground">
                            Exibir notificações do navegador para alertas importantes.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium">Som de notificações</h5>
                          <p className="text-sm text-muted-foreground">
                            Reproduzir um som quando uma nova notificação for recebida.
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="seguranca" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                  <CardDescription>
                    Atualize sua senha para manter sua conta segura.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Senha Atual</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <Button type="submit" className="mt-2">
                    <Key className="h-4 w-4 mr-2" />
                    Atualizar Senha
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sessões Ativas</CardTitle>
                  <CardDescription>
                    Gerencie todas as sessões em que você está conectado.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Este dispositivo</h4>
                        <p className="text-sm text-muted-foreground">
                          Windows • Chrome • São Paulo, Brasil
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ativo agora
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">Encerrar</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Smartphone</h4>
                        <p className="text-sm text-muted-foreground">
                          iOS • Safari • São Paulo, Brasil
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ativo há 2 horas
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">Encerrar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
