import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { SiscopConformidade, SiscopCliente, SiscopUnidade } from '@/lib/types';
import { formatDate } from '@/lib/types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import TableConform from './table-conform';

interface ComplianceSectionProps {
  selectedClient: SiscopCliente | null;
  selectedUnit?: SiscopUnidade | null;
}

export function ComplianceSection({ selectedClient, selectedUnit }: ComplianceSectionProps) {
  const [cnpj, setCnpj] = useState<string | null>(null);
  const [onlyForReport, setOnlyForReport] = useState(false);
  
  // Fetch CNPJs for selected client
  const { data: cnpjs = [] } = useQuery<string[]>({
    queryKey: ['/api/clientes', selectedClient?.codcli, 'cnpjs'],
    enabled: !!selectedClient,
  });
  
  // Fetch compliance documents
  const { data: complianceDocuments = [], isLoading } = useQuery<SiscopConformidade[]>({
    queryKey: ['/api/conformidade', selectedClient?.codcli, cnpj, onlyForReport],
    enabled: !!selectedClient && !!cnpj,
  });
  
  return (
    <div className="bg-[#d0e0f0] border-none shadow-md w-full rounded-l-none">
      <CardContent className="p-2">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-4">
            <div className="flex flex-row items-center gap-1">
              <Label htmlFor="cnpj" className="text-xs text-black font-medium">CNPJ</Label>
              <Select
                disabled={!selectedClient || cnpjs.length === 0}
                onValueChange={(value) => setCnpj(value)}
              >
                <SelectTrigger className="h-7 text-xs w-52">
                  <SelectValue placeholder="Selecione um CNPJ" />
                </SelectTrigger>
                <SelectContent>
                  {cnpjs.map((cnpj) => (
                    <SelectItem key={cnpj} value={cnpj} className="text-xs">
                      {cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-1">
              <Checkbox 
                id="onlyForReport" 
                checked={onlyForReport}
                onCheckedChange={(checked) => setOnlyForReport(!!checked)}
                className="h-3 w-3"
              />
              <Label htmlFor="onlyForReport" className="text-xs text-black">Somente p/ relatório</Label>
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 py-0 px-2 bg-green-100 border-green-300 text-green-800 hover:bg-green-200 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Inserir
            </Button>
            <Button variant="outline" size="sm" className="h-7 py-0 px-2 bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200 text-xs">
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button variant="outline" size="sm" className="h-7 py-0 px-2 bg-red-100 border-red-300 text-red-800 hover:bg-red-200 text-xs">
              <Trash2 className="h-3 w-3 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
        
        <div className="rounded-l-none rounded-r-md border overflow-hidden">
          {!selectedUnit ? (
            <div className="flex items-center justify-center p-10">
              <p className="text-gray-500 text-sm">Selecione uma unidade para visualizar os documentos de conformidade.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <TableConform 
                codimov={selectedUnit?.codend || 0}
                web={false}
                relatorio={true}
                cnpj=""
                temcnpj={false}
              />
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
}