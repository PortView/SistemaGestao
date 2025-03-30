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
    <Card className="bg-[#d0e0f0] border-none shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-end mb-4">
          <div className="flex items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="cnpj" className="text-xs font-medium">CNPJ</Label>
              <Select
                disabled={!selectedClient || cnpjs.length === 0}
                onValueChange={(value) => setCnpj(value)}
              >
                <SelectTrigger className="h-8 text-sm w-64">
                  <SelectValue placeholder="Selecione um CNPJ" />
                </SelectTrigger>
                <SelectContent>
                  {cnpjs.map((cnpj) => (
                    <SelectItem key={cnpj} value={cnpj}>
                      {cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="onlyForReport" 
                checked={onlyForReport}
                onCheckedChange={(checked) => setOnlyForReport(!!checked)}
              />
              <Label htmlFor="onlyForReport" className="text-sm">Somente marcados para relatório</Label>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-green-100 border-green-300 text-green-800 hover:bg-green-200">
              <Plus className="h-4 w-4 mr-1" />
              Inserir
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200">
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button variant="outline" size="sm" className="bg-red-100 border-red-300 text-red-800 hover:bg-red-200">
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border overflow-hidden max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-blue-600 sticky top-0">
              <TableRow>
                <TableHead className="text-white font-semibold text-xs w-10">Verif</TableHead>
                <TableHead className="text-white font-semibold text-xs w-10">Rel</TableHead>
                <TableHead className="text-white font-semibold text-xs w-10">Gest.Cli</TableHead>
                <TableHead className="text-white font-semibold text-xs w-10">Cód</TableHead>
                <TableHead className="text-white font-semibold text-xs">Descrição</TableHead>
                <TableHead className="text-white font-semibold text-xs">Documento</TableHead>
                <TableHead className="text-white font-semibold text-xs">Área</TableHead>
                <TableHead className="text-white font-semibold text-xs">Emissão</TableHead>
                <TableHead className="text-white font-semibold text-xs">Vencim.</TableHead>
                <TableHead className="text-white font-semibold text-xs">Renov.</TableHead>
                <TableHead className="text-white font-semibold text-xs">Periodicidade</TableHead>
                <TableHead className="text-white font-semibold text-xs w-10">Peso</TableHead>
                <TableHead className="text-white font-semibold text-xs">Atividade</TableHead>
                <TableHead className="text-white font-semibold text-xs">Obs.</TableHead>
                <TableHead className="text-white font-semibold text-xs">Dt.Prev.</TableHead>
                <TableHead className="text-white font-semibold text-xs">Grupo</TableHead>
                <TableHead className="text-white font-semibold text-xs">Compet.</TableHead>
                <TableHead className="text-white font-semibold text-xs">Doc.Orig</TableHead>
                <TableHead className="text-white font-semibold text-xs">Doc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedClient && (
                <TableRow>
                  <TableCell colSpan={19} className="text-center py-4 text-gray-500">
                    Selecione um cliente para visualizar os documentos de conformidade.
                  </TableCell>
                </TableRow>
              )}
              
              {selectedClient && !cnpj && (
                <TableRow>
                  <TableCell colSpan={19} className="text-center py-4 text-gray-500">
                    Selecione um CNPJ para visualizar os documentos de conformidade.
                  </TableCell>
                </TableRow>
              )}
              
              {selectedClient && cnpj && complianceDocuments.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={19} className="text-center py-4 text-gray-500">
                    Nenhum documento de conformidade encontrado.
                  </TableCell>
                </TableRow>
              )}
              
              {selectedClient && cnpj && isLoading && (
                <TableRow>
                  <TableCell colSpan={19} className="text-center py-4 text-gray-500">
                    Carregando documentos de conformidade...
                  </TableCell>
                </TableRow>
              )}
              
              {complianceDocuments.map((doc) => (
                <TableRow 
                  key={doc.cod}
                  className={`${doc.statusconform ? 'bg-green-50' : 'bg-red-50'} hover:bg-blue-50 text-xs`}
                >
                  <TableCell className="text-center py-1">
                    <Checkbox checked={doc.statusconform} />
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox checked={doc.frelatorio} />
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox checked={false} />
                  </TableCell>
                  <TableCell className="py-1">{doc.cod}</TableCell>
                  <TableCell className="py-1">{doc.descr}</TableCell>
                  <TableCell className="py-1">{doc.doc}</TableCell>
                  <TableCell className="py-1">Área</TableCell>
                  <TableCell className="py-1">{formatDate(new Date(doc.dt))}</TableCell>
                  <TableCell className="py-1">{doc.dtvenc ? formatDate(new Date(doc.dtvenc)) : ''}</TableCell>
                  <TableCell className="py-1">-</TableCell>
                  <TableCell className="py-1">{doc.periodocidade}</TableCell>
                  <TableCell className="py-1">{doc.graurisco}</TableCell>
                  <TableCell className="py-1">{doc.providencia}</TableCell>
                  <TableCell className="py-1">-</TableCell>
                  <TableCell className="py-1">-</TableCell>
                  <TableCell className="py-1">-</TableCell>
                  <TableCell className="py-1">-</TableCell>
                  <TableCell className="py-1">-</TableCell>
                  <TableCell className="py-1">-</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}