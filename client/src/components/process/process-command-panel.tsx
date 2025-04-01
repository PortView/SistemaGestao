import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SiscopCliente, SiscopUnidade } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { fetchClientes, fetchUnidades } from '@/lib/api-service';
import { LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_USER_KEY } from '@/lib/constants';
import { FileText, Edit, AlertCircle, DollarSign, ShoppingCart, ClipboardList, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ApiParamDialog } from '@/components/api-param-dialog';

interface ProcessCommandPanelProps {
  onClientChange?: (clientId: number) => void;
  onUnitChange?: (unit: SiscopUnidade) => void;
}

export function ProcessCommandPanel({ onClientChange, onUnitChange }: ProcessCommandPanelProps) {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SiscopUnidade | null>(null);
  
  // Código do usuário obtido de localStorage durante getUserData
  const [codCoor, setCodCoor] = useState<number>(0);
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  // Carregar token e dados do usuário do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Obter token
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      setAuthToken(token);
      
      // Obter dados do usuário
      const userJson = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (userJson) {
        try {
          const userData = JSON.parse(userJson);
          if (userData && userData.cod) {
            console.log('Dados do usuário carregados:', userData.cod);
            setCodCoor(userData.cod);
          }
        } catch (e) {
          console.error('Erro ao carregar dados do usuário:', e);
        }
      }
    }
  }, []);
  
  // Obter clientes da API Externa usando token e codCoor
  const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useQuery<SiscopCliente[]>({
    queryKey: ['siscop-clientes', codCoor],
    queryFn: async () => {
      if (!codCoor) {
        console.warn('codCoor não disponível, não é possível buscar clientes');
        return [];
      }
      
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (!token) {
        console.warn('Token de autenticação não disponível, não é possível buscar clientes');
        return [];
      }

      console.log('Buscando clientes com token:', token);
      
      console.log('Buscando clientes para codCoor:', codCoor);
      try {
        console.log('Iniciando busca de clientes para codCoor:', codCoor);
        const clientData = await fetchClientes(codCoor);
        console.log('Quantidade de clientes recebidos:', clientData?.length || 0);
        console.log('Dados completos recebidos da API:', clientData);
        return clientData;
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        throw error;
      }
    },
    enabled: !!codCoor && !!authToken,
    staleTime: 0,
  });

  // Determinar UFs disponíveis baseado no cliente selecionado
  const ufs = selectedClient ? 
    clients.find(c => c.codcli === selectedClient)?.lc_ufs.map(u => u.uf) || [] : 
    [];

  // Estado para controle do diálogo de verificação de parâmetros API
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [apiParams, setApiParams] = useState({
    token: null as string | null,
    codcoor: null as number | null,
    codcli: null as number | null,
    uf: null as string | null,
    page: 1
  });
  
  // Função para preparar chamada da API com diálogo de verificação
  const showParamsDialog = () => {
    // Busca o token diretamente do localStorage para garantir valor atualizado
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    
    // Debug do estado atual de UFs
    console.log('Lista de UFs disponíveis:', ufs);
    console.log('Cliente selecionado:', selectedClient);
    console.log('Cliente encontrado:', clients.find(c => c.codcli === selectedClient));
    
    // Log detalhado dos parâmetros
    console.log('VERIFICANDO PARÂMETROS PARA API (valores brutos):', {
      token: token ? `${token.substring(0, 15)}...` : 'sem token',
      codCoor: typeof codCoor === 'number' ? codCoor : 'inválido',
      selectedClient: typeof selectedClient === 'number' ? selectedClient : 'inválido',
      selectedUF: typeof selectedUF === 'string' ? selectedUF : 'inválido'
    });
    
    // Forçar valores numéricos para os campos que precisam ser números
    const codCoorNum = Number(codCoor) || 0;
    const selectedClientNum = Number(selectedClient) || 0;
    
    // Criando objeto de parâmetros com conversões explícitas
    const apiParamsObj = {
      token: token || 'não disponível',
      codcoor: codCoorNum,
      codcli: selectedClientNum, 
      uf: selectedUF || 'não disponível',
      page: 1
    };
    
    // Log do objeto final que será enviado
    console.log('PARÂMETROS FINAIS (após conversão):', JSON.stringify(apiParamsObj, null, 2));
    
    // Atualiza o estado com os novos parâmetros
    setApiParams(apiParamsObj);
    
    // Garante que o diálogo será aberto após o estado ser atualizado
    setTimeout(() => {
      setIsVerifyDialogOpen(true);
    }, 50);
  };
  
  // Estado para as unidades
  const [units, setUnits] = useState<SiscopUnidade[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [unitsError, setUnitsError] = useState<Error | null>(null);
  
  // Função para buscar unidades usando os parâmetros do diálogo
  const refetchUnits = async () => {
    if (!codCoor || !selectedClient || !selectedUF) {
      console.error('Parâmetros incompletos para buscar unidades');
      toast({
        title: 'Parâmetros incompletos',
        description: 'Código do coordenador, cliente e UF são necessários para buscar unidades.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoadingUnits(true);
    setUnitsError(null);
    
    try {
      // Configurar os parâmetros exatamente como no exemplo fornecido
      const params = {
        codcoor: codCoor,
        codcli: selectedClient,
        uf: selectedUF,
        page: 1  // Conforme o exemplo, a API espera 'page' e não 'pagina'
      };
      
      console.log('Buscando unidades com parâmetros:', params);
      
      // Chamar a API usando a função fetchUnidades
      const response = await fetchUnidades(params);
      console.log('Resposta da API de unidades:', response);
      
      // Verificar se a resposta contém unidades
      if (response && response.folowups) {
        console.log(`${response.folowups.length} unidades encontradas`);
        setUnits(response.folowups);
        
        if (response.folowups.length === 0) {
          toast({
            title: 'Nenhuma unidade encontrada',
            description: `Não há unidades para o cliente ${selectedClient} na UF ${selectedUF}.`,
            variant: 'default',
          });
        } else {
          toast({
            title: 'Unidades carregadas',
            description: `${response.folowups.length} unidades encontradas.`,
            variant: 'default',
          });
        }
      } else {
        console.warn('Resposta da API não contém unidades');
        setUnits([]);
        toast({
          title: 'Dados incompletos',
          description: 'A resposta da API não contém dados de unidades.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
      setUnitsError(error as Error);
      toast({
        title: 'Erro ao buscar unidades',
        description: `${(error as Error).message || 'Erro desconhecido ao buscar unidades.'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUnits(false);
    }
  };
  
  // Função para executar a requisição após confirmação do diálogo
  const handleConfirmApiCall = () => {
    setIsVerifyDialogOpen(false);
    refetchUnits();
  };

  // Flag para controlar se a UF já foi selecionada manualmente
  const [manualUFSelection, setManualUFSelection] = useState<boolean>(false);
  
  // Quando o cliente mudar, notificar o componente pai e resetar unidade
  useEffect(() => {
    // Resetar unidade selecionada quando cliente mudar
    setSelectedUnit(null);
    
    // Quando cliente for selecionado inicialmente, notificar o componente pai
    if (selectedClient && onClientChange) {
      onClientChange(selectedClient);
      
      // Verificar se tem cliente selecionado e se ainda não houve seleção manual de UF
      // Ou se está mudando para um cliente diferente (o que deve resetar a flag de seleção manual)
      const clientData = clients.find(c => c.codcli === selectedClient);
      
      if (clientData && clientData.lc_ufs && clientData.lc_ufs.length > 0) {
        // Selecionar automaticamente a primeira UF disponível apenas se não 
        // houve seleção manual ainda para este cliente
        if (!manualUFSelection) {
          const firstUF = clientData.lc_ufs[0].uf;
          console.log('Selecionando automaticamente a primeira UF:', firstUF);
          setSelectedUF(firstUF);
          
          // Também buscar unidades automaticamente quando ocorrer a seleção automática de UF
          if (firstUF && selectedClient && codCoor) {
            setIsLoadingUnits(true);
            
            // Configurar os parâmetros para a API
            const params = {
              codcoor: codCoor,
              codcli: selectedClient,
              uf: firstUF,
              page: 1
            };
            
            console.log('Buscando unidades automaticamente após seleção automática de UF:', params);
            
            // Chamar a API para buscar unidades
            fetchUnidades(params)
              .then(response => {
                console.log('Resposta da API de unidades (seleção automática):', response);
                
                if (response && response.folowups) {
                  console.log(`${response.folowups.length} unidades encontradas`);
                  setUnits(response.folowups);
                  
                  if (response.folowups.length === 0) {
                    toast({
                      title: 'Nenhuma unidade encontrada',
                      description: `Não há unidades para o cliente ${selectedClient} na UF ${firstUF}.`,
                      variant: 'default',
                    });
                  } else {
                    toast({
                      title: 'Unidades carregadas',
                      description: `${response.folowups.length} unidades encontradas.`,
                      variant: 'default',
                    });
                  }
                }
              })
              .catch(error => {
                console.error('Erro ao buscar unidades (seleção automática):', error);
                setUnitsError(error as Error);
                toast({
                  title: 'Erro ao buscar unidades',
                  description: `${(error as Error).message || 'Erro desconhecido ao buscar unidades.'}`,
                  variant: 'destructive',
                });
              })
              .finally(() => {
                setIsLoadingUnits(false);
              });
          }
        }
      } else {
        // Se não houver UFs disponíveis, limpar a seleção
        setSelectedUF(null);
      }
    } else {
      // Se não houver cliente selecionado, limpar a UF
      setSelectedUF(null);
    }
  }, [selectedClient, onClientChange, clients, manualUFSelection]);

  // Quando a unidade mudar, notificar o componente pai
  useEffect(() => {
    if (selectedUnit && onUnitChange) {
      onUnitChange(selectedUnit);
    }
  }, [selectedUnit, onUnitChange]);

  // Função para filtrar itens no dropdown com base na pesquisa
  const [clientSearchTerm, setClientSearchTerm] = useState<string>('');
  const [ufSearchTerm, setUfSearchTerm] = useState<string>('');
  const [unitSearchTerm, setUnitSearchTerm] = useState<string>('');
  
  // Lista de clientes filtrada com base na pesquisa
  const filteredClients = useMemo(() => {
    if (!clientSearchTerm.trim()) return clients;
    return clients.filter(client => 
      client.fantasia.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );
  }, [clients, clientSearchTerm]);

  // Lista de UFs filtrada com base na pesquisa
  const filteredUfs = useMemo(() => {
    if (!ufSearchTerm.trim()) return ufs;
    return ufs.filter(uf => 
      uf.toLowerCase().includes(ufSearchTerm.toLowerCase())
    );
  }, [ufs, ufSearchTerm]);

  // Lista de unidades filtrada com base na pesquisa
  const filteredUnits = useMemo(() => {
    if (!unitSearchTerm.trim()) return units as SiscopUnidade[];
    
    return (units as SiscopUnidade[]).filter((unit: SiscopUnidade) => {
      const unitStr = `${unit.contrato} - ${unit.cadimov?.uf || ''} - ${unit.cadimov?.tipo || ''}`;
      return unitStr.toLowerCase().includes(unitSearchTerm.toLowerCase());
    });
  }, [units, unitSearchTerm]);

  // Estado para "Todas UFs"
  const [allUfs, setAllUfs] = useState(false);
  
  // Estado para controle de página
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10; // Valor de exemplo, deve ser calculado com base no total de unidades
  
  return (
    <Card className="bg-[#d0e0f0] border-none shadow-md w-[940px] h-[150px]">
      <CardContent className="p-1 flex flex-col gap-1">
        {/* Primeira linha: Cliente, UF, Todas UFs, Planilhas, Contratos */}
        <div className="flex items-center gap-2">
          {/* Cliente */}
          <Select
            disabled={isLoadingClients}
            onValueChange={(value) => {
              setSelectedClient(Number(value));
              // Reset manual UF selection flag ao mudar de cliente
              setManualUFSelection(false);
            }}
          >
            <SelectTrigger className="h-8 text-xs w-[380px] border-slate-200">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent className="z-50 fixed w-[380px] max-h-[var(--radix-select-content-available-height)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
              <div className="px-2 py-2">
                <Input
                  placeholder="Buscar cliente..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  className="h-8 mb-2"
                />
              </div>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <SelectItem key={client.codcli} value={client.codcli.toString()}>
                    {client.fantasia}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  Nenhum cliente encontrado
                </div>
              )}
            </SelectContent>
          </Select>
          
          {/* UF - Dropdown com seleção real */}
          <Select
            disabled={!selectedClient || ufs.length === 0}
            value={selectedUF || undefined}
            onValueChange={(value) => {
              console.log('UF selecionada manualmente:', value);
              setSelectedUF(value);
              setManualUFSelection(true);
              
              // Buscar unidades automaticamente quando a UF for selecionada
              if (value && selectedClient && codCoor) {
                setIsLoadingUnits(true);
                
                // Configurar os parâmetros para a API
                const params = {
                  codcoor: codCoor,
                  codcli: selectedClient,
                  uf: value,
                  page: 1
                };
                
                console.log('Buscando unidades automaticamente após seleção de UF:', params);
                
                // Chamar a API para buscar unidades
                fetchUnidades(params)
                  .then(response => {
                    console.log('Resposta da API de unidades:', response);
                    
                    if (response && response.folowups) {
                      console.log(`${response.folowups.length} unidades encontradas`);
                      setUnits(response.folowups);
                      
                      if (response.folowups.length === 0) {
                        toast({
                          title: 'Nenhuma unidade encontrada',
                          description: `Não há unidades para o cliente ${selectedClient} na UF ${value}.`,
                          variant: 'default',
                        });
                      } else {
                        toast({
                          title: 'Unidades carregadas',
                          description: `${response.folowups.length} unidades encontradas.`,
                          variant: 'default',
                        });
                      }
                    }
                  })
                  .catch(error => {
                    console.error('Erro ao buscar unidades:', error);
                    setUnitsError(error as Error);
                    toast({
                      title: 'Erro ao buscar unidades',
                      description: `${(error as Error).message || 'Erro desconhecido ao buscar unidades.'}`,
                      variant: 'destructive',
                    });
                  })
                  .finally(() => {
                    setIsLoadingUnits(false);
                  });
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs w-[100px] border-slate-200">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <div className="px-2 py-2">
                <Input
                  placeholder="Buscar UF..."
                  value={ufSearchTerm}
                  onChange={(e) => setUfSearchTerm(e.target.value)}
                  className="h-8 mb-2"
                />
              </div>
              {filteredUfs.length > 0 ? (
                filteredUfs.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  Nenhuma UF encontrada
                </div>
              )}
            </SelectContent>
          </Select>
          
          {/* Checkbox Todas UFs */}
          <div className="flex items-center bg-white h-8 px-2 rounded border border-slate-200">
            <Checkbox 
              id="todas-ufs" 
              checked={allUfs}
              onCheckedChange={(checked) => setAllUfs(!!checked)}
              className="mr-1"
            />
            <Label htmlFor="todas-ufs" className="text-xs">Todas UFs</Label>
          </div>
          
          {/* Botão Planilhas */}
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200"
          >
            <FileText className="h-4 w-4 mr-1" />
            Planilhas
          </Button>
          
          {/* Botão Contrato */}
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200"
          >
            Contr: 03119
          </Button>
        </div>
        
        {/* Segunda linha: Unidades e Paginação */}
        <div className="flex items-center gap-2">
          <Label htmlFor="unidades" className="text-slate-800 text-xs font-semibold">Unidades</Label>
          {unitsError ? (
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-xs">Erro ao carregar unidades</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200"
                  onClick={() => refetchUnits()}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Select
                disabled={!selectedUF || isLoadingUnits || (units as SiscopUnidade[]).length === 0}
                onValueChange={(value) => {
                  const unit = (units as SiscopUnidade[]).find((u: SiscopUnidade) => u.contrato + '-' + u.codend === value);
                  if (unit) {
                    setSelectedUnit(unit);
                  }
                }}
              >
                <SelectTrigger id="unidades" className="h-8 text-xs w-[380px] border-slate-200">
                  {isLoadingUnits ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Unidades" />
                  )}
                </SelectTrigger>
                <SelectContent className="z-50 fixed w-[380px] max-h-[var(--radix-select-content-available-height)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                  <div className="px-2 py-2">
                    <Input
                      placeholder="Buscar unidade..."
                      value={unitSearchTerm}
                      onChange={(e) => setUnitSearchTerm(e.target.value)}
                      className="h-8 mb-2"
                    />
                  </div>
                  {filteredUnits.length > 0 ? (
                    filteredUnits.map((unit) => (
                      <SelectItem key={`${unit.contrato}-${unit.codend}`} value={`${unit.contrato}-${unit.codend}`}>
                        {`${unit.contrato} - ${unit.cadimov?.uf || ''} - ${unit.cadimov?.tipo || ''}`}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      Nenhuma unidade encontrada
                    </div>
                  )}
                </SelectContent>
              </Select>
              
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 bg-green-100 border-green-300 text-green-800 hover:bg-green-200"
                  onClick={showParamsDialog}
                >
                  Verificar parâmetros
                </Button>
              </div>
            </div>
          )}
          
          {/* Paginação */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7 bg-gray-100 border-gray-300 p-0">
              <span className="text-xs">≪</span>
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-gray-100 border-gray-300 p-0">
              <span className="text-xs">＜</span>
            </Button>
            <div className="bg-white rounded h-7 px-2 flex items-center text-xs border border-slate-200">
              <span>{currentPage}</span>
              <span className="mx-1">/</span>
              <span>{totalPages}</span>
            </div>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-blue-100 border-blue-300 text-blue-800 p-0">
              <span className="text-xs">＞</span>
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 bg-blue-100 border-blue-300 text-blue-800 p-0">
              <span className="text-xs">≫</span>
            </Button>
          </div>
        </div>
        
        {/* Terceira linha: 7 botões com ícones */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8 bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button variant="outline" size="sm" className="h-8 bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            <AlertCircle className="h-4 w-4 mr-1" />
            Ocorrências
          </Button>
          <Button variant="outline" size="sm" className="h-8 bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            <DollarSign className="h-4 w-4 mr-1" />
            Custos
          </Button>
          <Button variant="outline" size="sm" className="h-8 bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            <ShoppingCart className="h-4 w-4 mr-1" />
            Ord.Compra
          </Button>
          <Button variant="outline" size="sm" className="h-8 bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            <ClipboardList className="h-4 w-4 mr-1" />
            Edit.Tarefas
          </Button>
          <Button variant="outline" size="sm" className="h-8 bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            <Trash2 className="h-4 w-4 mr-1" />
            Rescisão
          </Button>
          <Button variant="outline" size="sm" className="h-8 bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Pendenciar
          </Button>
        </div>
      </CardContent>
      
      {/* Diálogo de verificação de parâmetros da API */}
      <ApiParamDialog 
        isOpen={isVerifyDialogOpen}
        onClose={() => setIsVerifyDialogOpen(false)}
        onConfirm={handleConfirmApiCall}
        params={apiParams}
      />
    </Card>
  );
}