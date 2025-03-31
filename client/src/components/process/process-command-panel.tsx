import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SiscopCliente, SiscopUnidade } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { fetchClientes, fetchUnidades } from '@/lib/api-service';

interface ProcessCommandPanelProps {
  onClientChange?: (clientId: number) => void;
  onUnitChange?: (unit: SiscopUnidade) => void;
}

export function ProcessCommandPanel({ onClientChange, onUnitChange }: ProcessCommandPanelProps) {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SiscopUnidade | null>(null);
  
  // Obter o usuário do localStorage para pegar o codCoor
  const getUserFromStorage = (): { cod: number } | null => {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('siscop_user');
      if (userJson) {
        try {
          return JSON.parse(userJson);
        } catch (e) {
          console.error('Erro ao fazer parse do usuário do localStorage:', e);
        }
      }
    }
    return null;
  };
  
  const user = getUserFromStorage();
  const codCoor = user?.cod || 0;
  
  // Buscar clientes da API usando o codCoor do usuário
  const { data: clients = [], isLoading: isLoadingClients } = useQuery<SiscopCliente[]>({
    queryKey: ['siscop-clientes', codCoor],
    queryFn: async () => {
      if (!codCoor) {
        console.warn('codCoor não disponível, não é possível buscar clientes');
        return [];
      }
      console.log('Buscando clientes para codCoor:', codCoor);
      return await fetchClientes(codCoor);
    },
    enabled: !!codCoor,
  });

  // Determinar UFs disponíveis baseado no cliente selecionado
  const { data: ufs = [] } = useQuery<string[]>({
    queryKey: ['siscop-ufs', selectedClient],
    queryFn: async () => {
      const cliente = clients.find(c => c.codcli === selectedClient);
      if (!cliente || !cliente.lc_ufs) return [];
      
      // Extrair UFs únicas
      const uniqueUfs = Array.from(
        new Set(cliente.lc_ufs.map(u => u.uf))
      );
      console.log('UFs disponíveis para cliente', selectedClient, ':', uniqueUfs);
      return uniqueUfs;
    },
    enabled: !!selectedClient && clients.length > 0,
  });

  // Buscar unidades baseado no cliente e UF da API externa
  const { data: units = [], isLoading: isLoadingUnits } = useQuery<SiscopUnidade[]>({
    queryKey: ['siscop-unidades', selectedClient, selectedUF],
    queryFn: async () => {
      if (!selectedClient || !selectedUF) return [];
      
      console.log('Buscando unidades para cliente:', selectedClient, 'UF:', selectedUF);
      const params = { 
        codcli: selectedClient, 
        uf: selectedUF,
        pagina: 1,
        quantidade: 100
      };
      
      const response = await fetchUnidades(params);
      return response.folowups || [];
    },
    enabled: !!selectedClient && !!selectedUF,
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

  return (
    <Card className="bg-[#d0e0f0] border-none shadow-md">
      <CardContent className="p-2">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="space-y-1">
            <Select
              disabled={isLoadingClients}
              onValueChange={(value) => setSelectedClient(Number(value))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover fixed min-w-[8rem] overflow-hidden rounded-md border p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                {clients?.map((client) => (
                  <SelectItem key={client.codcli} value={client.codcli.toString()}>
                    {client.fantasia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Select
              disabled={!selectedClient || ufs.length === 0}
              onValueChange={(value) => setSelectedUF(value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {ufs.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Select
              disabled={!selectedUF || units.length === 0}
              onValueChange={(value) => {
                const unit = units.find(u => u.contrato + '-' + u.codend === value);
                if (unit) {
                  setSelectedUnit(unit);
                }
              }}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Unidade" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={`${unit.contrato}-${unit.codend}`} value={`${unit.contrato}-${unit.codend}`}>
                    {`${unit.contrato} - ${unit.cadimov?.uf} - ${unit.codend}`}
                  </SelectItem>
                ))}
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