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
    <Card className="bg-[#d0e0f0] border-none shadow-md">
      <CardContent className="p-4">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-blue-600">
              <TableRow>
                <TableHead className="text-white font-semibold text-sm w-16">Cód Ser</TableHead>
                <TableHead className="text-white font-semibold text-sm">Desc. Serv</TableHead>
                <TableHead className="text-white font-semibold text-sm w-10">Pr</TableHead>
                <TableHead className="text-white font-semibold text-sm w-10">Pd</TableHead>
                <TableHead className="text-white font-semibold text-sm w-10">Pr</TableHead>
                <TableHead className="text-white font-semibold text-sm w-10">At</TableHead>
                <TableHead className="text-white font-semibold text-sm w-10">Ex</TableHead>
                <TableHead className="text-white font-semibold text-sm w-10">Ar</TableHead>
                <TableHead className="text-white font-semibold text-sm w-10">Cp</TableHead>
                <TableHead className="text-white font-semibold text-sm w-24">Status</TableHead>
                <TableHead className="text-white font-semibold text-sm w-24">Dt.Limite</TableHead>
                <TableHead className="text-white font-semibold text-sm w-24">Val.Serv</TableHead>
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
                  <TableCell className="text-sm font-medium">{service.codServ}</TableCell>
                  <TableCell className="text-sm">{service.descserv}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={false} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={false} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={false} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={false} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={false} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={false} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={false} />
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={service.concluido ? "outline" : service.pendente ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {service.concluido ? "Concluído" : service.pendente ? "Pendente" : "Em andamento"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(new Date(service.dtLimite))}</TableCell>
                  <TableCell className="text-sm">{service.valserv}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}