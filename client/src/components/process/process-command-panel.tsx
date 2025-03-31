import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SiscopCliente, SiscopUnidade } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { fetchClientes, fetchUnidades } from '@/lib/api-service';

interface ProcessCommandPanelProps {
  onClientChange?: (clientId: number) => void;
  onUnitChange?: (unit: SiscopUnidade) => void;
}

// Dados simulados para teste - apenas para garantir que o componente renderize
const mockClientes: SiscopCliente[] = [
  { 
    codcli: 1, 
    fantasia: "Cliente Teste 1", 
    lc_ufs: [{ uf: "SP" }, { uf: "RJ" }] 
  },
  { 
    codcli: 2, 
    fantasia: "Cliente Teste 2", 
    lc_ufs: [{ uf: "MG" }, { uf: "ES" }] 
  }
];

export function ProcessCommandPanel({ onClientChange, onUnitChange }: ProcessCommandPanelProps) {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SiscopUnidade | null>(null);
  
  // Código fixo do usuário Mauro
  const codCoor = 110;
  
  // Obter clientes da API (para debug usando dados mockados)
  const { data: clients = mockClientes, isLoading: isLoadingClients } = useQuery<SiscopCliente[]>({
    queryKey: ['siscop-clientes', codCoor],
    queryFn: async () => {
      console.log('Buscando clientes para codCoor:', codCoor);
      try {
        // Tentar buscar da API
        const clientData = await fetchClientes(codCoor);
        if (clientData && clientData.length > 0) {
          console.log('Dados de clientes retornados da API:', clientData);
          return clientData;
        }
        // Se não retornar dados ou lista vazia, usar mockados
        console.log('Usando dados mockados para clientes');
        return mockClientes;
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        return mockClientes;
      }
    },
    staleTime: 0,
  });

  // Determinar UFs disponíveis baseado no cliente selecionado
  const ufs = selectedClient ? 
    clients.find(c => c.codcli === selectedClient)?.lc_ufs.map(u => u.uf) || [] : 
    [];

  // Quando o cliente mudar, resetar UF e unidade
  useEffect(() => {
    setSelectedUF(null);
    setSelectedUnit(null);

    if (selectedClient && onClientChange) {
      onClientChange(selectedClient);
    }
  }, [selectedClient, onClientChange]);

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
              <SelectContent>
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
            <Select disabled={!selectedUF}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unidade-exemplo">
                  Unidade Exemplo
                </SelectItem>
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