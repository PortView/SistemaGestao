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

  // Estado para bypass manual dos dados de unidades
  const [bypassUnits, setBypassUnits] = useState(false);
  const [manualUnits, setManualUnits] = useState<SiscopUnidade[]>([]);

  // Gerar unidades de teste quando necessário
  useEffect(() => {
    if (bypassUnits && selectedClient && selectedUF) {
      // Criar 5 unidades de teste baseadas no cliente e UF selecionados
      const testUnits: SiscopUnidade[] = Array.from({ length: 5 }).map((_, index) => ({
        contrato: selectedClient + index + 1, // Convertido para número
        codend: 100 + index, // Número
        cadimov: {
          tipo: "COMERCIAL",
          uf: selectedUF
        }
      }));
      
      setManualUnits(testUnits);
      console.log('Unidades geradas manualmente para desenvolvimento:', testUnits);
      
      // Notificar usuário
      toast({
        title: 'Modo de desenvolvimento ativado',
        description: 'Utilizando unidades de teste para continuar o desenvolvimento.',
        variant: 'default',
      });
    }
  }, [bypassUnits, selectedClient, selectedUF]);

  // Buscar unidades da API quando cliente e UF estiverem selecionados
  const { 
    data: apiUnits = [], 
    isLoading: isLoadingUnits, 
    error: unitsError,
    refetch: refetchUnits
  } = useQuery<SiscopUnidade[]>({
    queryKey: ['siscop-unidades', codCoor, selectedClient, selectedUF, authToken],
    queryFn: async () => {
      if (!codCoor || !selectedClient || !selectedUF || !authToken) {
        console.warn('Código de coordenador, cliente, UF ou token não disponíveis para buscar unidades');
        return [];
      }
      
      console.log('Buscando unidades para codCoor:', codCoor, 'cliente:', selectedClient, 'UF:', selectedUF);
      const params = { 
        codcoor: codCoor,
        codcli: selectedClient, 
        uf: selectedUF,
        pagina: 1, // API espera pagina (não page)
        quantidade: 100
      };
      
      try {
        const response = await fetchUnidades(params);
        console.log('Dados de unidades recebidos:', response);
        return response.folowups || [];
      } catch (error) {
        console.error('Erro ao buscar unidades:', error);
        toast({
          title: 'Erro ao carregar unidades',
          description: 'Não foi possível carregar as unidades. Tente novamente mais tarde.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    enabled: !!codCoor && !!selectedClient && !!selectedUF && !!authToken && !bypassUnits,
    retry: 1, // Tentar 1 vez além da tentativa inicial
    retryDelay: 2000, // Aguardar 2 segundos antes de tentar novamente
  });
  
  // Combinar unidades da API ou geradas manualmente
  const units = bypassUnits ? manualUnits : apiUnits;

  // Quando o cliente mudar, selecionar a primeira UF disponível e resetar unidade
  useEffect(() => {
    setSelectedUnit(null);

    if (selectedClient && onClientChange) {
      onClientChange(selectedClient);
      
      // Selecionar automaticamente a primeira UF disponível
      const clientData = clients.find(c => c.codcli === selectedClient);
      if (clientData && clientData.lc_ufs && clientData.lc_ufs.length > 0) {
        const firstUF = clientData.lc_ufs[0].uf;
        console.log('Selecionando automaticamente a primeira UF:', firstUF);
        setSelectedUF(firstUF);
      } else {
        setSelectedUF(null);
      }
    }
  }, [selectedClient, onClientChange, clients]);

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
      const unitStr = `${unit.contrato} - ${unit.cadimov?.uf || ''} - ${unit.codend}`;
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
            onValueChange={(value) => setSelectedClient(Number(value))}
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
          
          {/* UF */}
          <Select
            disabled={!selectedClient || ufs.length === 0}
            onValueChange={(value) => setSelectedUF(value)}
            value={selectedUF || undefined}
          >
            <SelectTrigger className="h-8 text-xs w-[100px] border-slate-200">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent className="z-50 fixed w-[100px] max-h-[var(--radix-select-content-available-height)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
                  onClick={() => setBypassUnits(!bypassUnits)}
                >
                  {bypassUnits ? "Desativar bypass" : "Usar dados de desenvolvimento"}
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
                        {`${unit.contrato} - ${unit.cadimov?.uf || ''} - ${unit.codend}`}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      Nenhuma unidade encontrada
                    </div>
                  )}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
                onClick={() => setBypassUnits(!bypassUnits)}
              >
                {bypassUnits ? "Usar API" : "Dados de dev"}
              </Button>
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
    </Card>
  );
}