import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, ServerCrash, RefreshCw, Database, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function ApiTesterPage() {
  const [tokenInfo, setTokenInfo] = useState<{ exists: boolean, value: string | null }>({ exists: false, value: null });
  const [userInfo, setUserInfo] = useState<{ exists: boolean, value: any | null }>({ exists: false, value: null });
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Verificar token ao carregar
  useEffect(() => {
    checkToken();
  }, []);

  // Verificar token no localStorage
  const checkToken = () => {
    const token = localStorage.getItem('siscop_token');
    setTokenInfo({
      exists: !!token,
      value: token
    });

    const user = localStorage.getItem('siscop_user');
    try {
      setUserInfo({
        exists: !!user,
        value: user ? JSON.parse(user) : null
      });
    } catch (e) {
      setUserInfo({
        exists: !!user,
        value: { error: 'Erro ao fazer parse dos dados' }
      });
    }
  };

  // Testar API de clientes
  const testClientesApi = async () => {
    setLoading(true);
    setErrorMessage(null);
    setApiResponse(null);

    // Obter codCoor do usuário
    let codCoor = 0;
    if (userInfo.exists && userInfo.value && userInfo.value.cod) {
      codCoor = userInfo.value.cod;
    }

    try {
      if (!tokenInfo.exists || !tokenInfo.value) {
        throw new Error('Token não encontrado. Por favor, faça login novamente.');
      }

      if (!codCoor) {
        throw new Error('Código do coordenador não encontrado nos dados do usuário.');
      }

      // Usar a URL da API definida nas variáveis de ambiente
      const baseApiUrl = import.meta.env.VITE_NEXT_PUBLIC_API_CLIENTES_URL || 
                        `${import.meta.env.VITE_NEXT_PUBLIC_API_BASE_URL}/ger-clientes/clientes`;
      
      const apiUrl = `${baseApiUrl}?codcoor=${codCoor}`;
      
      console.log('Testando API de clientes:', apiUrl);
      console.log('Parâmetros: codcoor =', codCoor);
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenInfo.value}`
      };

      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setApiResponse(data);
      console.log('Resposta da API:', data);
      
      toast({
        title: "Sucesso",
        description: `Recebidos ${Array.isArray(data) ? data.length : 'dados'} da API de clientes`,
        variant: "default",
      });
    } catch (error) {
      console.error('Erro no teste da API:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
      
      toast({
        title: "Erro ao obter clientes",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [email, setEmail] = useState<string>(import.meta.env.VITE_TEST_USER_EMAIL || 'mauro@ameni.com.br');
  const [password, setPassword] = useState<string>('');
  const { toast } = useToast();

  // Testar autenticação
  const testLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    setApiResponse(null);

    try {
      // Usar a URL da API definida nas variáveis de ambiente
      const apiUrl = import.meta.env.VITE_NEXT_PUBLIC_API_AUTH_URL || `${import.meta.env.VITE_NEXT_PUBLIC_API_BASE_URL}/login`;
      
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      console.log('Testando login em:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error(`Erro na autenticação: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Salvar token e atualizar estado
      if (data.access_token) {
        localStorage.setItem('siscop_token', data.access_token);
        toast({
          title: "Sucesso",
          description: "Token salvo com sucesso no localStorage",
          variant: "default",
        });
        checkToken();
      }
      
      setApiResponse(data);
      console.log('Resposta da API de login:', data);
    } catch (error) {
      console.error('Erro no teste de login:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
      
      toast({
        title: "Erro de autenticação",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Testar obtenção de perfil
  const testProfile = async () => {
    setLoading(true);
    setErrorMessage(null);
    setApiResponse(null);

    try {
      if (!tokenInfo.exists || !tokenInfo.value) {
        throw new Error('Token não encontrado. Por favor, faça login novamente.');
      }

      // Usar a URL da API definida nas variáveis de ambiente
      const apiUrl = import.meta.env.VITE_NEXT_PUBLIC_API_ME_URL || `${import.meta.env.VITE_NEXT_PUBLIC_API_BASE_URL}/user/me`;
      
      console.log('Testando API de perfil:', apiUrl);
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenInfo.value}`
      };

      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Salvar dados do usuário
      if (data) {
        localStorage.setItem('siscop_user', JSON.stringify(data));
        toast({
          title: "Sucesso",
          description: "Dados do usuário salvos com sucesso no localStorage",
          variant: "default",
        });
        checkToken();
      }
      
      setApiResponse(data);
      console.log('Resposta da API de perfil:', data);
    } catch (error) {
      console.error('Erro no teste de perfil:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
      
      toast({
        title: "Erro ao obter perfil",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar dados de autenticação
  const clearAuthData = () => {
    localStorage.removeItem('siscop_token');
    localStorage.removeItem('siscop_user');
    checkToken();
    toast({
      title: "Dados limpos",
      description: "Token e dados de usuário foram removidos",
      variant: "default",
    });
  };

  // Obter dados das variáveis de ambiente
  const [envInfo, setEnvInfo] = useState({
    base: import.meta.env.VITE_NEXT_PUBLIC_API_BASE_URL || 'Não definida',
    auth: import.meta.env.VITE_NEXT_PUBLIC_API_AUTH_URL || 'Não definida',
    me: import.meta.env.VITE_NEXT_PUBLIC_API_ME_URL || 'Não definida',
    clientes: import.meta.env.VITE_NEXT_PUBLIC_API_CLIENTES_URL || 'Não definida',
    conformidade: import.meta.env.VITE_NEXT_PUBLIC_API_CONFORMIDADE_URL || 'Não definida',
    useCorsProxy: import.meta.env.VITE_NEXT_PUBLIC_USE_CORS_PROXY || 'false',
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Verificação de API</h1>
        <Badge variant="outline" className="px-3 py-1">
          v1.0.0
        </Badge>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Status da Autenticação
          </CardTitle>
          <CardDescription>
            Verifique se o token e dados do usuário estão presentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Token de Acesso:</h3>
                <Badge variant={tokenInfo.exists ? "outline" : "destructive"} className={tokenInfo.exists ? "bg-green-500 text-white" : ""}>
                  {tokenInfo.exists ? "Presente" : "Ausente"}
                </Badge>
              </div>
              
              {tokenInfo.exists && (
                <div className="bg-gray-100 p-3 rounded-md">
                  <p className="text-xs font-mono break-all">
                    <span className="font-semibold">Bearer</span> {tokenInfo.value?.substring(0, 30)}...
                  </p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={clearAuthData}
                disabled={!tokenInfo.exists && !userInfo.exists}
              >
                Limpar Dados de Autenticação
              </Button>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Dados do usuário:</h3>
              {userInfo.exists && userInfo.value ? (
                <div className="bg-gray-100 p-3 rounded-md space-y-2">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    <p className="text-sm"><span className="font-semibold">ID:</span> {userInfo.value.id}</p>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    <p className="text-sm"><span className="font-semibold">Nome:</span> {userInfo.value.name}</p>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    <p className="text-sm"><span className="font-semibold">Email:</span> {userInfo.value.email}</p>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    <p className="text-sm"><span className="font-semibold">Código:</span> {userInfo.value.cod}</p>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    <p className="text-sm"><span className="font-semibold">Tipo:</span> {userInfo.value.tipo}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md">
                  <p className="text-gray-500">Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Configurações de API
          </CardTitle>
          <CardDescription>
            Endpoints configurados para conexão com o backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4 items-center">
              <span className="font-semibold">API Base:</span>
              <span className="col-span-3 text-sm font-mono bg-gray-100 p-2 rounded">{envInfo.base}</span>
            </div>
            <div className="grid grid-cols-4 gap-4 items-center">
              <span className="font-semibold">Auth URL:</span>
              <span className="col-span-3 text-sm font-mono bg-gray-100 p-2 rounded">{envInfo.auth}</span>
            </div>
            <div className="grid grid-cols-4 gap-4 items-center">
              <span className="font-semibold">Profile URL:</span>
              <span className="col-span-3 text-sm font-mono bg-gray-100 p-2 rounded">{envInfo.me}</span>
            </div>
            <div className="grid grid-cols-4 gap-4 items-center">
              <span className="font-semibold">Clientes URL:</span>
              <span className="col-span-3 text-sm font-mono bg-gray-100 p-2 rounded">{envInfo.clientes}</span>
            </div>
            <div className="grid grid-cols-4 gap-4 items-center">
              <span className="font-semibold">CORS Proxy:</span>
              <span className="col-span-3">
                <Badge variant={envInfo.useCorsProxy === 'true' ? "outline" : "secondary"}>
                  {envInfo.useCorsProxy === 'true' ? "Ativado" : "Desativado"}
                </Badge>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Teste de APIs
          </CardTitle>
          <CardDescription>
            Verifique a funcionalidade dos endpoints da API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button onClick={testLogin} disabled={loading} className="w-full">
                  {loading ? 'Processando...' : 'Testar Login'}
                </Button>
                <p className="text-xs text-gray-500">
                  Testa a API de login e salva o token de autenticação para outras requisições
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="profile">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="text-sm font-medium mb-2">Informações</h3>
                  <p className="text-xs text-gray-600">
                    Este teste obtém os dados do perfil do usuário usando o token de autenticação.
                    Os dados serão salvos no localStorage para uso em outras partes da aplicação.
                  </p>
                </div>
                
                <Button 
                  onClick={testProfile} 
                  disabled={loading || !tokenInfo.exists} 
                  className="w-full"
                  variant={!tokenInfo.exists ? "outline" : "default"}
                >
                  {loading ? 'Processando...' : 'Obter Dados do Perfil'}
                </Button>
                
                {!tokenInfo.exists && (
                  <div className="flex items-center gap-2 text-amber-600 text-xs mt-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>É necessário efetuar login primeiro</span>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="clientes">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="text-sm font-medium mb-2">Informações</h3>
                  <p className="text-xs text-gray-600">
                    Este teste obtém a lista de clientes usando o token de autenticação e o código do coordenador (codcoor)
                    presente nos dados do usuário.
                  </p>
                </div>
                
                <Button 
                  onClick={testClientesApi} 
                  disabled={loading || !tokenInfo.exists || !userInfo.exists} 
                  className="w-full"
                  variant={(!tokenInfo.exists || !userInfo.exists) ? "outline" : "default"}
                >
                  {loading ? 'Processando...' : 'Obter Lista de Clientes'}
                </Button>
                
                {!tokenInfo.exists && (
                  <div className="flex items-center gap-2 text-amber-600 text-xs mt-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>É necessário efetuar login primeiro</span>
                  </div>
                )}
                
                {tokenInfo.exists && !userInfo.exists && (
                  <div className="flex items-center gap-2 text-amber-600 text-xs mt-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>É necessário obter os dados do perfil primeiro</span>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator className="my-6" />
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <ServerCrash className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-red-700">Erro na Requisição</h3>
              </div>
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          )}
          
          {apiResponse && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-green-700">Resposta da API</h3>
              </div>
              <pre className="bg-gray-50 border border-gray-200 p-4 rounded-md overflow-auto max-h-96 text-sm">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}