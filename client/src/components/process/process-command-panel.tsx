import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SiscopCliente, SiscopUnidade } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { fetchClientes, fetchUnidades } from '@/lib/api-service';
import { LOCAL_STORAGE_TOKEN_KEY } from '@/lib/constants';

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
      const userJson = localStorage.getItem('siscop_user');
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

  // Buscar unidades da API quando cliente e UF estiverem selecionados
  const { data: units = [], isLoading: isLoadingUnits, error: unitsError } = useQuery<SiscopUnidade[]>({
    queryKey: ['siscop-unidades', selectedClient, selectedUF, authToken],
    queryFn: async () => {
      if (!selectedClient || !selectedUF || !authToken) {
        console.warn('Cliente, UF ou token não disponíveis para buscar unidades');
        return [];
      }
      
      console.log('Buscando unidades para cliente:', selectedClient, 'UF:', selectedUF);
      const params = { 
        codcli: selectedClient, 
        uf: selectedUF,
        pagina: 1,
        quantidade: 100
      };
      
      try {
        const response = await fetchUnidades(params);
        console.log('Dados de unidades recebidos:', response);
        return response.folowups || [];
      } catch (error) {
        console.error('Erro ao buscar unidades:', error);
        throw error;
      }
    },
    enabled: !!selectedClient && !!selectedUF && !!authToken,
  });

  // Quando o cliente mudar, resetar UF e unidade
  useEffect(() => {
    setSelectedUF(null);
    setSelectedUnit(null);

    if (selectedClient && onClientChange) {
      onClientChange(selectedClient);
    }
  }, [selectedClient, onClientChange]);

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
    if (!unitSearchTerm.trim()) return units;
    
    return units.filter(unit => {
      const unitStr = `${unit.contrato} - ${unit.cadimov?.uf || ''} - ${unit.codend}`;
      return unitStr.toLowerCase().includes(unitSearchTerm.toLowerCase());
    });
  }, [units, unitSearchTerm]);

  return (
    <Card className="bg-[#d0e0f0] border-none shadow-md w-[940px] h-[150px]">
      <CardContent className="p-2">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="space-y-1">
            <Select
              disabled={isLoadingClients}
              onValueChange={(value) => setSelectedClient(Number(value))}
            >
              <SelectTrigger className="h-8 text-sm w-[380px]">
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
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    Nenhum cliente encontrado
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Select
              disabled={!selectedClient || ufs.length === 0}
              onValueChange={(value) => setSelectedUF(value)}
            >
              <SelectTrigger className="h-8 text-sm w-[280px]">
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent className="z-50 fixed w-[280px] max-h-[var(--radix-select-content-available-height)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
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
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    Nenhuma UF encontrada
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Select
              disabled={!selectedUF || isLoadingUnits || units.length === 0}
              onValueChange={(value) => {
                const unit = units.find(u => u.contrato + '-' + u.codend === value);
                if (unit) {
                  setSelectedUnit(unit);
                }
              }}
            >
              <SelectTrigger className="h-8 text-sm w-[260px]">
                <SelectValue placeholder="Unidade" />
              </SelectTrigger>
              <SelectContent className="z-50 fixed w-[260px] max-h-[var(--radix-select-content-available-height)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
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
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    Nenhuma unidade encontrada
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            Editar
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            Contratos
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            Custos
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            Adi. Compra
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            Edit. Tarefas
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            Histórico
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
            Finalizado
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}