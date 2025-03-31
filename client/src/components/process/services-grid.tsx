import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { SiscopServico, SiscopUnidade } from '@/lib/types';
import { formatDate } from '@/lib/types';

interface ServicesGridProps {
  selectedUnit: SiscopUnidade | null;
  onServiceSelect?: (service: SiscopServico) => void;
}

export function ServicesGrid({ selectedUnit, onServiceSelect }: ServicesGridProps) {
  const [selectedService, setSelectedService] = useState<SiscopServico | null>(null);
  
  // Reset selected service when unit changes
  useEffect(() => {
    setSelectedService(null);
  }, [selectedUnit]);
  
  // Fetch services for selected unit
  const { data: services = [], isLoading } = useQuery<SiscopServico[]>({
    queryKey: ['/api/servicos', selectedUnit?.contrato, selectedUnit?.codend],
    enabled: !!selectedUnit,
  });
  
  const handleServiceClick = (service: SiscopServico) => {
    setSelectedService(service);
    if (onServiceSelect) {
      onServiceSelect(service);
    }
  };
  
  return (
    <Card className="bg-[#d0e0f0] border-none shadow-md w-full h-full">
      <CardContent className="p-2">
        <div className="rounded-md border overflow-hidden h-[445px]">
          <Table>
            <TableHeader className="bg-blue-600 sticky top-0">
              <TableRow>
                <TableHead className="text-white font-semibold text-xs py-1 w-12">Cód Ser</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1">Desc. Serv</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-8">Pr</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-8">Pd</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-8">Pr</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-8">At</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-8">Ex</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-8">Ar</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-8">Cp</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-20">Status</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-20">Dt.Limite</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-20">Val.Serv</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-4 text-gray-500">
                    Nenhum serviço encontrado para esta unidade.
                  </TableCell>
                </TableRow>
              )}
              
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-4 text-gray-500">
                    Carregando serviços...
                  </TableCell>
                </TableRow>
              )}
              
              {services.map((service) => (
                <TableRow 
                  key={`${service.codccontra}-${service.codServ}`}
                  className={`${
                    selectedService?.codccontra === service.codccontra && 
                    selectedService?.codServ === service.codServ ? 
                    'bg-blue-100' : 
                    service.concluido ? 'bg-gray-100' : ''
                  } hover:bg-blue-50 cursor-pointer`}
                  onClick={() => handleServiceClick(service)}
                >
                  <TableCell className="text-xs font-medium py-1">{service.codServ}</TableCell>
                  <TableCell className="text-xs py-1">{service.descserv}</TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox checked={false} className="h-3 w-3" />
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox checked={false} className="h-3 w-3" />
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox checked={false} className="h-3 w-3" />
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox checked={false} className="h-3 w-3" />
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox checked={false} className="h-3 w-3" />
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox checked={false} className="h-3 w-3" />
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox checked={false} className="h-3 w-3" />
                  </TableCell>
                  <TableCell className="py-1">
                    <Badge 
                      variant={service.concluido ? "outline" : service.pendente ? "destructive" : "default"}
                      className="text-[10px] py-0 px-1"
                    >
                      {service.concluido ? "Concluído" : service.pendente ? "Pendente" : "Em andamento"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs py-1">{formatDate(new Date(service.dtLimite))}</TableCell>
                  <TableCell className="text-xs py-1">{service.valserv}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}