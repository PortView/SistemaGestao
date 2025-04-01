import { useState, useEffect, useMemo, useCallback } from 'react';
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
  // Estados principais
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SiscopUnidade | null>(null);
  const [manualUFSelection, setManualUFSelection] = useState<boolean>(false);
  
  // Estados para dados e operações
  const [codCoor, setCodCoor] = useState<number>(0);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [units, setUnits] = useState<SiscopUnidade[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [unitsError, setUnitsError] = useState<Error | null>(null);
  
  // Estados UI e filtragem
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [apiParams, setApiParams] = useState({
    token: null as string | null,
    codcoor: null as number | null,
    codcli: null as number | null,
    uf: null as string | null,
    page: 1
  });
  const [clientSearchTerm, setClientSearchTerm] = useState<string>('');
  const [ufSearchTerm, setUfSearchTerm] = useState<string>('');
  const [unitSearchTerm, setUnitSearchTerm] = useState<string>('');
  const [allUfs, setAllUfs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10; // Valor de exemplo, deve ser calculado com base no total de unidades
  
  // Carregar dados do usuário (uma única vez na inicialização)
  useEffect(() => {
    const loadUserData = () => {
      if (typeof window === 'undefined') return;
      
      // Obter token
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      setAuthToken(token);
      
      // Obter dados do usuário
      const userJson = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (!userJson) return;
      
      try {
        const userData = JSON.parse(userJson);
        if (userData?.cod) {
          console.log('Dados do usuário carregados:', userData.cod);
          setCodCoor(userData.cod);
        }
      } catch (e) {
        console.error('Erro ao carregar dados do usuário:', e);
      }
    };
    
    loadUserData();
  }, []);
  
  // Query para carregar clientes
  const { 
    data: clients = [], 
    isLoading: isLoadingClients 
  } = useQuery<SiscopCliente[]>({
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

      try {
        const clientData = await fetchClientes(codCoor);
        return clientData || [];
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        return [];
      }
    },
    enabled: !!codCoor && !!authToken,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  // UFs disponíveis para o cliente selecionado
  const ufs = useMemo(() => {
    if (!selectedClient) return [];
    const clientData = clients.find(c => c.codcli === selectedClient);
    return clientData?.lc_ufs?.map(u => u.uf) || [];
  }, [selectedClient, clients]);

  // Listas filtradas para os dropdowns
  const filteredClients = useMemo(() => {
    if (!clientSearchTerm.trim()) return clients;
    return clients.filter(client => 
      client.fantasia.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );
  }, [clients, clientSearchTerm]);

  const filteredUfs = useMemo(() => {
    if (!ufSearchTerm.trim()) return ufs;
    return ufs.filter(uf => 
      uf.toLowerCase().includes(ufSearchTerm.toLowerCase())
    );
  }, [ufs, ufSearchTerm]);

  const filteredUnits = useMemo(() => {
    if (!unitSearchTerm.trim()) return units;
    return units.filter(unit => {
      const unitStr = `${unit.contrato} - ${unit.cadimov?.uf || ''} - ${unit.cadimov?.tipo || ''}`;
      return unitStr.toLowerCase().includes(unitSearchTerm.toLowerCase());
    });
  }, [units, unitSearchTerm]);

  // Buscar unidades com base nos parâmetros atuais
  const fetchUnitsWithParams = useCallback(async (params: {
    codcoor: number, 
    codcli: number, 
    uf: string, 
    page: number
  }) => {
    if (!params.codcoor || !params.codcli || !params.uf) {
      console.error('Parâmetros incompletos para buscar unidades');
      return null;
    }
    
    setIsLoadingUnits(true);
    setUnitsError(null);
    
    try {
      console.log('Buscando unidades com parâmetros:', params);
      
      const response = await fetchUnidades(params);
      
      // Verificar se a resposta contém unidades
      if (!response?.folowups) {
        console.warn('Resposta da API não contém unidades');
        setUnits([]);
        return null;
      }
      
      console.log(`${response.folowups.length} unidades encontradas`);
      setUnits(response.folowups);
      
      if (response.folowups.length === 0) {
        toast({
          title: 'Nenhuma unidade encontrada',
          description: `Não há unidades para o cliente ${params.codcli} na UF ${params.uf}.`,
          variant: 'default',
        });
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
      setUnitsError(error as Error);
      toast({
        title: 'Erro ao buscar unidades',
        description: `${(error as Error).message || 'Erro desconhecido ao buscar unidades.'}`,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoadingUnits(false);
    }
  }, []);

  // Selecionar automaticamente a primeira unidade quando unidades são carregadas
  const selectFirstUnit = useCallback((response: any) => {
    if (!response?.folowups?.length) return;
    
    const firstUnit = response.folowups[0];
    console.log('Selecionando automaticamente a primeira unidade:', firstUnit);
    
    // Usar setTimeout para evitar múltiplos renders rápidos
    setTimeout(() => {
      setSelectedUnit(firstUnit);
    }, 50);
  }, []);

  // Função para recarregar unidades usando os parâmetros atuais
  const refetchUnits = useCallback(async () => {
    if (!codCoor || !selectedClient || !selectedUF) {
      toast({
        title: 'Parâmetros incompletos',
        description: 'Código do coordenador, cliente e UF são necessários para buscar unidades.',
        variant: 'destructive',
      });
      return;
    }
    
    const params = {
      codcoor: codCoor,
      codcli: selectedClient,
      uf: selectedUF,
      page: 1
    };
    
    const response = await fetchUnitsWithParams(params);
    if (response) {
      selectFirstUnit(response);
    }
  }, [codCoor, selectedClient, selectedUF, fetchUnitsWithParams, selectFirstUnit]);

  // Função para executar a requisição após confirmação do diálogo
  const handleConfirmApiCall = useCallback(() => {
    setIsVerifyDialogOpen(false);
    refetchUnits();
  }, [refetchUnits]);

  // Preparar e mostrar o diálogo de verificação de API
  const showParamsDialog = useCallback(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    
    const apiParamsObj = {
      token: token || 'não disponível',
      codcoor: Number(codCoor) || 0,
      codcli: Number(selectedClient) || 0, 
      uf: selectedUF || 'não disponível',
      page: 1
    };
    
    setApiParams(apiParamsObj);
    
    setTimeout(() => {
      setIsVerifyDialogOpen(true);
    }, 50);
  }, [codCoor, selectedClient, selectedUF]);

  // Efeito: quando o cliente muda, atualizar UF e carregar unidades
  useEffect(() => {
    if (!selectedClient) {
      setSelectedUF(null);
      setSelectedUnit(null);
      setUnits([]);
      return;
    }
    
    // Notificar componente pai
    if (onClientChange) {
      onClientChange(selectedClient);
    }
    
    // Reset de estados para evitar exibição de dados antigos
    setSelectedUnit(null);
    setUnits([]);
    
    // Se ainda não houve seleção manual, selecionar a primeira UF
    if (!manualUFSelection) {
      const clientData = clients.find(c => c.codcli === selectedClient);
      
      if (clientData?.lc_ufs?.length) {
        const firstUF = clientData.lc_ufs[0].uf;
        console.log('Selecionando automaticamente a primeira UF:', firstUF);
        setSelectedUF(firstUF);
        
        // Carregar unidades para a primeira UF
        if (codCoor) {
          const params = {
            codcoor: codCoor,
            codcli: selectedClient,
            uf: firstUF,
            page: 1
          };
          
          (async () => {
            const response = await fetchUnitsWithParams(params);
            if (response) {
              selectFirstUnit(response);
            }
          })();
        }
      }
    }
  }, [selectedClient, clients, manualUFSelection, onClientChange, codCoor, fetchUnitsWithParams, selectFirstUnit]);

  // Efeito: quando a UF muda manualmente, buscar unidades
  useEffect(() => {
    // Ignorar se for seleção automática da UF (já foi tratada no efeito do cliente)
    // ou se os parâmetros necessários não estiverem disponíveis
    if (!selectedUF || !selectedClient || !codCoor || !manualUFSelection) {
      return;
    }
    
    const params = {
      codcoor: codCoor,
      codcli: selectedClient,
      uf: selectedUF,
      page: 1
    };
    
    (async () => {
      const response = await fetchUnitsWithParams(params);
      if (response) {
        selectFirstUnit(response);
      }
    })();
  }, [selectedUF, selectedClient, codCoor, manualUFSelection, fetchUnitsWithParams, selectFirstUnit]);

  // Efeito: quando a unidade muda, notificar o componente pai
  useEffect(() => {
    if (!selectedUnit || !onUnitChange) return;
    
    // Usar debounce para evitar atualizações excessivas
    const timer = setTimeout(() => {
      onUnitChange(selectedUnit);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [selectedUnit, onUnitChange]);
  
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
              // A busca de unidades é processada pelo efeito quando selectedUF muda
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
                value={selectedUnit ? `${selectedUnit.contrato}-${selectedUnit.codend}` : undefined}
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