import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SiscopCliente, SiscopUnidade } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

interface ProcessCommandPanelProps {
  onClientChange?: (clientId: number) => void;
  onUnitChange?: (unit: SiscopUnidade) => void;
}

export function ProcessCommandPanel({ onClientChange, onUnitChange }: ProcessCommandPanelProps) {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SiscopUnidade | null>(null);

  // Fetch clients
  const { data: clients, isLoading: isLoadingClients } = useQuery<SiscopCliente[]>({
    queryKey: ['/api/clientes'],
    enabled: true,
  });

  // Fetch UFs based on selected client
  const { data: ufs = [] } = useQuery<string[]>({
    queryKey: ['/api/clientes', selectedClient, 'ufs'],
    enabled: !!selectedClient,
  });

  // Fetch units based on selected client and UF
  const { data: units = [] } = useQuery<SiscopUnidade[]>({
    queryKey: ['/api/unidades', selectedClient, selectedUF],
    enabled: !!selectedClient && !!selectedUF,
  });

  // When client changes, reset UF and unit
  useEffect(() => {
    setSelectedUF(null);
    setSelectedUnit(null);

    if (selectedClient && onClientChange) {
      onClientChange(selectedClient);
    }
  }, [selectedClient, onClientChange]);

  // When unit changes, notify parent
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
            {/* <Label htmlFor="client" className="text-xs font-medium">Cliente</Label> */}
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
            {/* <Label htmlFor="uf" className="text-xs font-medium">UF</Label> */}
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
            {/* <Label htmlFor="unit" className="text-xs font-medium">Unidade</Label> */}
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