import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { FileText, Edit, AlertCircle, DollarSign, ShoppingCart, ClipboardList, Trash2, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ApiParamDialog } from '@/components/api-param-dialog';

interface ProcessCommandPanelProps {
  onClientChange?: (clientId: number) => void;
  onUnitChange?: (unit: SiscopUnidade) => void;
}

export function ProcessCommandPanel({ onClientChange, onUnitChange }: ProcessCommandPanelProps) {
  // Referências para controle de processamento
  const isProcessingClientChange = useRef(false);
  const isProcessingUfChange = useRef(false);
  const lastFetchedParams = useRef<{ codcli?: number, uf?: string } | null>(null);
  
  // Estados principais
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SiscopUnidade | null>(null);
  const [manualUFSelection, setManualUFSelection] = useState<boolean>(false);
  
  // Estados para dados e operações
  const [codCoor, setCodCoor] = useState<number>(0);
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [shouldShowPagination, setShouldShowPagination] = useState(false);
  
  // Carregar dados do usuário uma única vez e inicializar estados
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Ao carregar a página, o checkbox deve estar unchecked e desabilitado
    setAllUfs(false);
    
    // Limpar todos os estados iniciais
    setSelectedClient(null);
    setSelectedUF(null);
    setSelectedUnit(null);
    setUnits([]);
    
    try {
      // Obter token
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      
      // Obter dados do usuário
      const userJson = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (!userJson) return;
      
      const userData = JSON.parse(userJson);
      if (userData?.cod) {
        setCodCoor(userData.cod);
      }
    } catch (e) {
      console.error('Erro ao carregar dados do usuário:', e);
    }
  }, []);
  
  // Query para carregar clientes (com cache e retry)
  const { 
    data: clients = [], 
    isLoading: isLoadingClients 
  } = useQuery<SiscopCliente[]>({
    queryKey: ['siscop-clientes', codCoor],
    queryFn: async () => {
      if (!codCoor) return [];
      
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (!token) return [];

      try {
        return await fetchClientes(codCoor) || [];
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        return [];
      }
    },
    enabled: !!codCoor,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 1,                 // Tentar novamente apenas uma vez em caso de falha
  });

  // UFs disponíveis para o cliente selecionado
  const ufs = useMemo(() => {
    if (!selectedClient) return [];
    const clientData = clients.find(c => c.codcli === selectedClient);
    return clientData?.lc_ufs?.map(u => u.uf) || [];
  }, [selectedClient, clients]);

  // Listas filtradas para os dropdowns (filtragem ocorre apenas após 3 caracteres)
  const filteredClients = useMemo(() => {
    const trimmedTerm = clientSearchTerm.trim();
    // Retornar todos os clientes se o termo de busca for vazio ou tiver menos de 3 caracteres
    if (!trimmedTerm || trimmedTerm.length < 3) return clients;
    // Aplicar filtro apenas se tiver 3 ou mais caracteres
    return clients.filter(client => 
      client.fantasia.toLowerCase().includes(trimmedTerm.toLowerCase())
    );
  }, [clients, clientSearchTerm]);

  const filteredUfs = useMemo(() => {
    const trimmedTerm = ufSearchTerm.trim();
    // Retornar todas as UFs se o termo de busca for vazio ou tiver menos de 3 caracteres
    if (!trimmedTerm || trimmedTerm.length < 3) return ufs;
    // Aplicar filtro apenas se tiver 3 ou mais caracteres
    return ufs.filter(uf => 
      uf.toLowerCase().includes(trimmedTerm.toLowerCase())
    );
  }, [ufs, ufSearchTerm]);

  const filteredUnits = useMemo(() => {
    const trimmedTerm = unitSearchTerm.trim();
    // Retornar todas as unidades se o termo de busca for vazio ou tiver menos de 3 caracteres
    if (!trimmedTerm || trimmedTerm.length < 3) return units;
    // Aplicar filtro apenas se tiver 3 ou mais caracteres
    return units.filter(unit => {
      const unitStr = `${unit.contrato} - ${unit.cadimov?.uf || ''} - ${unit.cadimov?.tipo || ''}`;
      return unitStr.toLowerCase().includes(trimmedTerm.toLowerCase());
    });
  }, [units, unitSearchTerm]);

  // Função interna para limpar o cache de unidades
  const clearUnitsCacheInternal = (client: number, uf: string, coorCode: number) => {
    if (!client || !uf || !coorCode) return;
    
    // Limpar chave específica do localStorage
    const cacheKey = `units_${coorCode}_${client}_${uf}_1`;
    console.log(`Limpando cache para ${cacheKey}`);
    localStorage.removeItem(cacheKey);
  };
  
  // Função para limpar o cache de unidades (versão com hook)
  const clearUnitsCache = useCallback((client: number, uf: string) => {
    clearUnitsCacheInternal(client, uf, codCoor);
  }, [codCoor]);

  // Função memoizada para carregar unidades com validação de parâmetros duplicados
  const fetchUnitsIfNeeded = useCallback(async (
    codcli: number, 
    uf: string,
    processingRef: React.MutableRefObject<boolean>,
    shouldForceRefresh = true // Agora por padrão sempre forçamos refresh
  ) => {
    // Se já estiver processando, evitamos requisições duplicadas
    if (processingRef.current) {
      return null;
    }
    
    // Verificar se é uma mudança real de cliente/UF ou se é apenas um recarregamento
    const isParameterChange = 
      lastFetchedParams.current?.codcli !== codcli || 
      lastFetchedParams.current?.uf !== uf;
    
    // Sempre limpar cache quando mudar cliente ou UF
    if (isParameterChange && codCoor) {
      clearUnitsCacheInternal(codcli, uf, codCoor);
    }
    
    // Marcar como em processamento
    processingRef.current = true;
    
    // Limpar unidades enquanto carrega novos dados
    setUnits([]);
    
    // Atualizar parâmetros da última busca
    lastFetchedParams.current = { codcli, uf };
    
    if (!codCoor) {
      processingRef.current = false;
      return null;
    }
    
    setIsLoadingUnits(true);
    setUnitsError(null);
    
    try {
      const params = { codcoor: codCoor, codcli, uf, page: 1 };
      
      console.log(`Buscando unidades para cliente ${codcli} e UF ${uf}`);
      
      // Sempre forçar recarga de dados (sem usar cache) para garantir dados atualizados
      // Independente se é troca de cliente, UF ou não
      const options = { skipCache: true };
      const response = await fetchUnidades(params, options);
      
      if (!response?.folowups) {
        setUnits([]);
        processingRef.current = false;
        setSelectedUnit(null); // Garantir que nenhuma unidade esteja selecionada se não houver dados
        return null;
      }
      
      // Atualizar unidades
      setUnits(response.folowups);
      
      // Atualizar informações de paginação
      if (response.pagination) {
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.lastPage);
        setTotalItems(response.pagination.totalItems);
        
        // Mostrar paginação apenas se houver mais de 100 itens
        setShouldShowPagination(response.pagination.totalItems > 100);
      } else {
        // Reset paginação se não houver dados de paginação
        setCurrentPage(1);
        setTotalPages(1);
        setTotalItems(0);
        setShouldShowPagination(false);
      }
      
      // Verificar se há unidades
      if (response.folowups.length === 0) {
        toast({
          title: 'Nenhuma unidade encontrada',
          description: `Não há unidades para este cliente na UF ${uf}.`,
          variant: 'default',
        });
        processingRef.current = false;
        setSelectedUnit(null); // Garantir que nenhuma unidade esteja selecionada
        return null;
      }
      
      // Selecionar primeira unidade com timeout para evitar renders excessivos
      if (response.folowups.length > 0) {
        const firstUnit = response.folowups[0];
        setTimeout(() => {
          setSelectedUnit(firstUnit);
          processingRef.current = false;
        }, 100);
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
      processingRef.current = false;
      setSelectedUnit(null); // Garantir que nenhuma unidade esteja selecionada em caso de erro
      return null;
    } finally {
      setIsLoadingUnits(false);
    }
  }, [codCoor]);

  // Handler para recarregar unidades manualmente (botão "Tentar novamente")
  const refetchUnits = useCallback(() => {
    if (!selectedClient || !selectedUF) {
      toast({
        title: 'Parâmetros incompletos',
        description: 'Cliente e UF são necessários para buscar unidades.',
        variant: 'destructive',
      });
      return;
    }
    
    fetchUnitsIfNeeded(selectedClient, selectedUF, isProcessingUfChange, true);
  }, [selectedClient, selectedUF, fetchUnitsIfNeeded]);
  
  // Função para carregar unidades com paginação
  const loadPagedUnits = useCallback((pageNumber: number) => {
    if (!selectedClient || !codCoor) return;
    
    // Se não houver UF selecionada e o checkbox Todas UFs estiver desmarcado, não fazer nada
    if (!selectedUF && !allUfs) return;
    
    // Determinar a UF a ser usada
    const ufParam = allUfs ? "ZZ" : selectedUF;
    
    if (!ufParam) return;
    
    setIsLoadingUnits(true);
    
    const params = {
      codcoor: codCoor,
      codcli: selectedClient,
      uf: ufParam,
      page: pageNumber
    };
    
    // Força o refresh do cache
    fetchUnidades(params, { skipCache: true })
      .then(response => {
        if (response?.folowups) {
          setUnits(response.folowups);
          
          // Atualizar informações de paginação
          if (response.pagination) {
            setCurrentPage(response.pagination.currentPage);
            setTotalPages(response.pagination.lastPage);
            setTotalItems(response.pagination.totalItems);
            
            // Mostrar paginação apenas se houver mais de 100 itens
            setShouldShowPagination(response.pagination.totalItems > 100);
          }
          
          if (response.folowups.length > 0) {
            // Selecionar primeira unidade
            setTimeout(() => {
              setSelectedUnit(response.folowups[0]);
            }, 100);
          }
        }
      })
      .catch(error => {
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
  }, [selectedClient, selectedUF, allUfs, codCoor]);

  // Handler para o diálogo de API
  const showParamsDialog = useCallback(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    
    setApiParams({
      token: token || 'não disponível',
      codcoor: Number(codCoor) || 0,
      codcli: Number(selectedClient) || 0, 
      uf: selectedUF || 'não disponível',
      page: 1
    });
    
    setIsVerifyDialogOpen(true);
  }, [codCoor, selectedClient, selectedUF]);

  const handleConfirmApiCall = useCallback(() => {
    setIsVerifyDialogOpen(false);
    refetchUnits();
  }, [refetchUnits]);

  // Manipulador de alteração de cliente
  const handleClientChange = useCallback((codcli: number) => {
    // Limpar cache do cliente/UF anterior se existir
    if (selectedClient && selectedUF) {
      clearUnitsCache(selectedClient, selectedUF);
    }
    
    // Definir o novo cliente
    setSelectedClient(codcli);
    
    // Forçar remoção da seleção manual de UF para permitir seleção automática
    setManualUFSelection(false);
    
    // Limpar seleções atuais
    setSelectedUnit(null);
    setUnits([]);
    
    // Encontrar a primeira UF do novo cliente selecionado e defini-la imediatamente
    const clientData = clients.find(c => c.codcli === codcli);
    if (clientData?.lc_ufs?.length) {
      const firstClientUF = clientData.lc_ufs[0].uf;
      console.log(`Cliente alterado para ${codcli}, definindo primeira UF: ${firstClientUF}`);
      setSelectedUF(firstClientUF);
    } else {
      // Se o cliente não tiver UFs, limpar a UF selecionada
      setSelectedUF(null);
    }
    
    // Notificar o componente pai
    if (onClientChange) {
      onClientChange(codcli);
    }
  }, [onClientChange, selectedClient, selectedUF, clearUnitsCache, clients]);

  // Manipulador de alteração de UF
  const handleUFChange = useCallback((uf: string) => {
    // Limpar cache do cliente/UF anterior se existir
    if (selectedClient && selectedUF) {
      clearUnitsCache(selectedClient, selectedUF);
    }
    
    // Limpar possível cache para a nova combinação cliente/UF
    if (selectedClient && uf) {
      clearUnitsCache(selectedClient, uf);
    }
    
    setSelectedUF(uf);
    setManualUFSelection(true);
    setSelectedUnit(null);
    setUnits([]); // Limpar unidades ao mudar a UF
    setIsLoadingUnits(true); // Mostrar estado de carregamento
  }, [selectedClient, selectedUF, clearUnitsCache]);

  // Removemos o efeito de selecionar UF automaticamente,
  // pois isso agora é feito diretamente no handleClientChange
  // para evitar condições de corrida e garantir a ordem correta das operações

  // Efeito: carregar unidades quando UF e cliente estiverem definidos
  useEffect(() => {
    if (!selectedClient || !selectedUF) return;
    
    // Limpar cache atual antes de buscar novas unidades
    clearUnitsCache(selectedClient, selectedUF);
    
    // Use a referência apropriada dependendo se foi mudança manual de UF ou automática
    const processingRef = manualUFSelection ? isProcessingUfChange : isProcessingClientChange;
    
    fetchUnitsIfNeeded(selectedClient, selectedUF, processingRef);
  }, [selectedClient, selectedUF, manualUFSelection, fetchUnitsIfNeeded, clearUnitsCache]);

  // Efeito: quando a unidade muda, notificar o componente pai
  useEffect(() => {
    if (!selectedUnit || !onUnitChange) return;
    
    const timer = setTimeout(() => {
      onUnitChange(selectedUnit);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [selectedUnit, onUnitChange]);
  
  return (
      <div className="bg-[#d0e0f0] border-none shadow-md w-[940px] h-[150px] rounded-sm">
      <CardContent className="p-1 flex flex-col gap-1">
        {/* Primeira linha: Cliente, UF, Todas UFs, Planilhas, Contratos */}
        <div className="flex items-center gap-2">
          {/* Cliente */}
          <Select
            disabled={isLoadingClients}
            onValueChange={(value) => {
              // Usar a função handleClientChange para garantir consistência
              handleClientChange(Number(value));
            }}
          >
            <SelectTrigger className="h-8 text-xs w-[380px] border-slate-200">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent className="z-50 fixed w-[380px] max-h-[var(--radix-select-content-available-height)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
              <div className="px-2 py-2">
                <Input
                  placeholder="Buscar cliente... (min. 3 letras)"
                  value={clientSearchTerm}
                  onChange={(e) => {
                    // Manter a referência ao input atual
                    const inputElement = e.target;
                    setClientSearchTerm(e.target.value);
                    
                    // Manter o foco no input após atualizar o valor
                    setTimeout(() => {
                      if (inputElement) {
                        inputElement.focus();
                      }
                    }, 0);
                  }}
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
            disabled={!selectedClient || ufs.length === 0 || allUfs}
            value={selectedUF || undefined}
            onValueChange={(value) => {
              console.log('UF selecionada manualmente:', value);
              handleUFChange(value);
            }}
          >
            <SelectTrigger className="h-8 text-xs w-[100px] border-slate-200">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <div className="px-2 py-2">
                <Input
                  placeholder="Buscar UF... (min. 3 letras)"
                  value={ufSearchTerm}
                  onChange={(e) => {
                    // Manter a referência ao input atual
                    const inputElement = e.target;
                    setUfSearchTerm(e.target.value);
                    
                    // Manter o foco no input após atualizar o valor
                    setTimeout(() => {
                      if (inputElement) {
                        inputElement.focus();
                      }
                    }, 0);
                  }}
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
          <div className="flex items-center h-8 px-2 rounded border border-slate-200">
            <Checkbox 
              id="todas-ufs" 
              checked={allUfs}
              disabled={!selectedClient} 
              onCheckedChange={(checked) => {
                const isChecked = !!checked;
                setAllUfs(isChecked);
                
                // Se marcado, buscar unidades com UF="ZZ", senão usar o UF selecionado
                if (isChecked) {
                  // Buscar todas as UFs com parâmetro especial "ZZ"
                  if (selectedClient && codCoor) {
                    // Use a referência apropriada para controle de processamento
                    const params = {
                      codcoor: codCoor,
                      codcli: selectedClient,
                      uf: "ZZ", // Código especial para todas as UFs
                      page: 1
                    };
                    
                    setIsLoadingUnits(true);
                    // Forçar requisição nova ao mudar o filtro para todas UFs
                    fetchUnidades(params, { skipCache: true })
                      .then(response => {
                        if (response?.folowups) {
                          setUnits(response.folowups);
                          
                          // Atualizar informações de paginação
                          if (response.pagination) {
                            setCurrentPage(response.pagination.currentPage);
                            setTotalPages(response.pagination.lastPage);
                            setTotalItems(response.pagination.totalItems);
                            
                            // Mostrar paginação apenas se houver mais de 100 itens
                            setShouldShowPagination(response.pagination.totalItems > 100);
                          } else {
                            setCurrentPage(1);
                            setTotalPages(1);
                            setTotalItems(0);
                            setShouldShowPagination(false);
                          }
                          
                          if (response.folowups.length > 0) {
                            // Selecionar primeira unidade
                            setTimeout(() => {
                              setSelectedUnit(response.folowups[0]);
                            }, 100);
                          }
                        }
                      })
                      .catch(error => {
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
                } else if (selectedClient && selectedUF && codCoor) {
                  // Ao desmarcar, voltar a usar o UF selecionado e buscar unidades normalmente
                  const params = {
                    codcoor: codCoor,
                    codcli: selectedClient,
                    uf: selectedUF,
                    page: 1
                  };
                  
                  setIsLoadingUnits(true);
                  // Forçar requisição nova ao desmarcar "Todas UFs"
                  fetchUnidades(params, { skipCache: true })
                    .then(response => {
                      if (response?.folowups) {
                        setUnits(response.folowups);
                        
                        // Atualizar informações de paginação
                        if (response.pagination) {
                          setCurrentPage(response.pagination.currentPage);
                          setTotalPages(response.pagination.lastPage);
                          setTotalItems(response.pagination.totalItems);
                          
                          // Mostrar paginação apenas se houver mais de 100 itens
                          setShouldShowPagination(response.pagination.totalItems > 100);
                        } else {
                          setCurrentPage(1);
                          setTotalPages(1);
                          setTotalItems(0);
                          setShouldShowPagination(false);
                        }
                        
                        if (response.folowups.length > 0) {
                          // Selecionar primeira unidade
                          setTimeout(() => {
                            setSelectedUnit(response.folowups[0]);
                          }, 100);
                        }
                      }
                    })
                    .catch(error => {
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
              className="mr-1"
            />
            <Label htmlFor="todas-ufs" className="text-xs text-blue-800">Todas UFs</Label>
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
        <div className="flex items-center gap-1">
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
                disabled={((!selectedUF && !allUfs) || isLoadingUnits || (units as SiscopUnidade[]).length === 0)}
                value={selectedUnit ? `${selectedUnit.contrato}-${selectedUnit.codend}` : undefined}
                onValueChange={(value) => {
                  const unit = (units as SiscopUnidade[]).find((u: SiscopUnidade) => u.contrato + '-' + u.codend === value);
                  if (unit) {
                    setSelectedUnit(unit);
                  }
                }}
              >
                <SelectTrigger id="unidades" className="h-8 text-xs w-[450px] border-slate-200">
                  {isLoadingUnits ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Unidades" />
                  )}
                </SelectTrigger>
                <SelectContent className="z-50 fixed w-[510px] max-h-[var(--radix-select-content-available-height)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md text-xs">
                  <div className="px-2 py-2">
                    <Input
                      placeholder="Buscar unidade... (min. 3 letras)"
                      value={unitSearchTerm}
                      onChange={(e) => {
                        // Manter a referência ao input atual
                        const inputElement = e.target;
                        setUnitSearchTerm(e.target.value);
                        
                        // Manter o foco no input após atualizar o valor
                        setTimeout(() => {
                          if (inputElement) {
                            inputElement.focus();
                          }
                        }, 0);
                      }}
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
              
              {/* <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 bg-green-100 border-green-300 text-green-800 hover:bg-green-200"
                  onClick={showParamsDialog}
                >
                  Verificar parâmetros
                </Button>
              </div> */}
            </div>
          )}
          
          {/* Paginação - Visível apenas quando há mais de 100 itens */}
          {shouldShowPagination && (
            <div className="flex items-center gap-[2px] ml-2">
              {/* Primeira página */}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 bg-blue-700 border-blue-600 text-white p-0 hover:bg-blue-800"
                disabled={currentPage === 1 || isLoadingUnits}
                onClick={() => loadPagedUnits(1)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              {/* Página anterior */}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 bg-blue-700 border-blue-600 text-white p-0 hover:bg-blue-800"
                disabled={currentPage === 1 || isLoadingUnits}
                onClick={() => loadPagedUnits(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Exibição da página atual e total */}
              <div className="bg-blue-900 rounded h-8 px-3 flex items-center text-sm font-medium text-white border border-blue-600">
                <span>{currentPage}</span>
                <span className="mx-1">/</span>
                <span>{totalPages}</span>
              </div>
              
              {/* Próxima página */}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 bg-blue-700 border-blue-600 text-white p-0 hover:bg-blue-800"
                disabled={currentPage === totalPages || isLoadingUnits}
                onClick={() => loadPagedUnits(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {/* Última página */}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 bg-blue-700 border-blue-600 text-white p-0 hover:bg-blue-800"
                disabled={currentPage === totalPages || isLoadingUnits}
                onClick={() => loadPagedUnits(totalPages)}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
              
              {/* Input para ir para uma página específica */}
              <Input
                type="number"
                min={1}
                max={totalPages}
                className="h-8 w-26 text-sm text-center bg-blue-900 border-blue-600 text-white placeholder-blue-300"
                placeholder="Pg"
                disabled={isLoadingUnits}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget;
                    const page = parseInt(input.value);
                    if (!isNaN(page) && page >= 1 && page <= totalPages) {
                      loadPagedUnits(page);
                      // Limpar o input após navegar
                      input.value = '';
                    } else {
                      toast({
                        title: 'Página inválida',
                        description: `Informe um número entre 1 e ${totalPages}`,
                        variant: 'destructive',
                      });
                    }
                  }
                }}
              />
            </div>
          )}
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
    </div>
  );
}