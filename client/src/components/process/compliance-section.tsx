import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { SiscopConformidade, SiscopCliente } from '@/lib/types';
import { formatDate } from '@/lib/types';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface ComplianceSectionProps {
  selectedClient: SiscopCliente | null;
}

export function ComplianceSection({ selectedClient }: ComplianceSectionProps) {
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
    <Card className="bg-[#d0e0f0] border-none shadow-md w-full h-full">
      <CardContent className="p-2">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-end gap-2">
            <div className="space-y-0.5">
              <Label htmlFor="cnpj" className="text-xs font-medium">CNPJ</Label>
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
              <Label htmlFor="onlyForReport" className="text-xs">Somente p/ relatório</Label>
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
        
        <div className="rounded-md border overflow-hidden h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-blue-600 sticky top-0">
              <TableRow>
                <TableHead className="text-white font-semibold text-[10px] py-1 w-8">Verif</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1 w-8">Rel</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1 w-8">G.Cli</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1 w-8">Cód</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Descrição</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Documento</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Área</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Emissão</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Vencim.</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Renov.</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Period.</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1 w-8">Peso</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Ativ.</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Obs.</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Dt.Prev</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Grupo</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Comp.</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Doc.Ori</TableHead>
                <TableHead className="text-white font-semibold text-[10px] py-1">Doc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedClient && (
                <TableRow>
                  <TableCell colSpan={19} className="text-center py-2 text-gray-500 text-xs">
                    Selecione um cliente para visualizar os documentos de conformidade.
                  </TableCell>
                </TableRow>
              )}
              
              {selectedClient && !cnpj && (
                <TableRow>
                  <TableCell colSpan={19} className="text-center py-2 text-gray-500 text-xs">
                    Selecione um CNPJ para visualizar os documentos de conformidade.
                  </TableCell>
                </TableRow>
              )}
              
              {selectedClient && cnpj && complianceDocuments.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={19} className="text-center py-2 text-gray-500 text-xs">
                    Nenhum documento de conformidade encontrado.
                  </TableCell>
                </TableRow>
              )}
              
              {selectedClient && cnpj && isLoading && (
                <TableRow>
                  <TableCell colSpan={19} className="text-center py-2 text-gray-500 text-xs">
                    Carregando documentos de conformidade...
                  </TableCell>
                </TableRow>
              )}
              
              {complianceDocuments.map((doc) => (
                <TableRow 
                  key={doc.cod}
                  className={`${doc.statusconform ? 'bg-green-50' : 'bg-red-50'} hover:bg-blue-50 text-[10px]`}
                >
                  <TableCell className="text-center py-0.5">
                    <Checkbox checked={doc.statusconform} className="h-3 w-3" />
                  </TableCell>
                  <TableCell className="text-center py-0.5">
                    <Checkbox checked={doc.frelatorio} className="h-3 w-3" />
                  </TableCell>
                  <TableCell className="text-center py-0.5">
                    <Checkbox checked={false} className="h-3 w-3" />
                  </TableCell>
                  <TableCell className="py-0.5">{doc.cod}</TableCell>
                  <TableCell className="py-0.5">{doc.descr}</TableCell>
                  <TableCell className="py-0.5">{doc.doc}</TableCell>
                  <TableCell className="py-0.5">Área</TableCell>
                  <TableCell className="py-0.5">{formatDate(new Date(doc.dt))}</TableCell>
                  <TableCell className="py-0.5">{doc.dtvenc ? formatDate(new Date(doc.dtvenc)) : ''}</TableCell>
                  <TableCell className="py-0.5">-</TableCell>
                  <TableCell className="py-0.5">{doc.periodocidade}</TableCell>
                  <TableCell className="py-0.5">{doc.graurisco}</TableCell>
                  <TableCell className="py-0.5">{doc.providencia}</TableCell>
                  <TableCell className="py-0.5">-</TableCell>
                  <TableCell className="py-0.5">-</TableCell>
                  <TableCell className="py-0.5">-</TableCell>
                  <TableCell className="py-0.5">-</TableCell>
                  <TableCell className="py-0.5">-</TableCell>
                  <TableCell className="py-0.5">-</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}