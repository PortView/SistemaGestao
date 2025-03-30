import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProcessFilterPanelProps {
  onFilterChange?: (filters: any) => void;
}

export function ProcessFilterPanel({ onFilterChange }: ProcessFilterPanelProps) {
  const [filters, setFilters] = useState({
    codServ: true,
    status: true,
    dtLimite: true,
    servNaoConcluidos: true,
    novos: false,
    suspensos: false,
    semNota: false,
    pendencia: false,
    dicInternet: false,
    soOS: false,
  });

  const handleFilterChange = (filterName: string, value: boolean) => {
    const updatedFilters = { ...filters, [filterName]: value };
    setFilters(updatedFilters);
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  return (
    <Card className="bg-[#d0e0f0] border-none shadow-md">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="codServ" 
                checked={filters.codServ}
                onCheckedChange={(checked) => 
                  handleFilterChange('codServ', checked as boolean)
                }
              />
              <Label htmlFor="codServ" className="text-sm">Cód Serv</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="status" 
                checked={filters.status}
                onCheckedChange={(checked) => 
                  handleFilterChange('status', checked as boolean)
                }
              />
              <Label htmlFor="status" className="text-sm">Status</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dtLimite" 
                checked={filters.dtLimite}
                onCheckedChange={(checked) => 
                  handleFilterChange('dtLimite', checked as boolean)
                }
              />
              <Label htmlFor="dtLimite" className="text-sm">Dt.Limite</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="servNaoConcluidos" 
                checked={filters.servNaoConcluidos}
                onCheckedChange={(checked) => 
                  handleFilterChange('servNaoConcluidos', checked as boolean)
                }
              />
              <Label htmlFor="servNaoConcluidos" className="text-sm">Só Serv. não Concluídos</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="novos" 
                checked={filters.novos}
                onCheckedChange={(checked) => 
                  handleFilterChange('novos', checked as boolean)
                }
              />
              <Label htmlFor="novos" className="text-sm">Novos</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="suspensos" 
                checked={filters.suspensos}
                onCheckedChange={(checked) => 
                  handleFilterChange('suspensos', checked as boolean)
                }
              />
              <Label htmlFor="suspensos" className="text-sm">Suspensos</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="semNota" 
                checked={filters.semNota}
                onCheckedChange={(checked) => 
                  handleFilterChange('semNota', checked as boolean)
                }
              />
              <Label htmlFor="semNota" className="text-sm">Sem Nota</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="pendencia" 
                checked={filters.pendencia}
                onCheckedChange={(checked) => 
                  handleFilterChange('pendencia', checked as boolean)
                }
              />
              <Label htmlFor="pendencia" className="text-sm">Pendência</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dicInternet" 
                checked={filters.dicInternet}
                onCheckedChange={(checked) => 
                  handleFilterChange('dicInternet', checked as boolean)
                }
              />
              <Label htmlFor="dicInternet" className="text-sm">Dic. Internet</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="soOS" 
                checked={filters.soOS}
                onCheckedChange={(checked) => 
                  handleFilterChange('soOS', checked as boolean)
                }
              />
              <Label htmlFor="soOS" className="text-sm">Só O.S.</Label>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mt-4">
          <div className="space-y-1">
            <Label htmlFor="gerente" className="text-xs font-medium">Gerente</Label>
            <Input id="gerente" className="h-8 text-sm" placeholder="Gerente" />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="servico" className="text-xs font-medium">Serviço</Label>
            <Input id="servico" className="h-8 text-sm" placeholder="Serviço" />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="hTramit" className="text-xs font-medium">H. Tramit</Label>
            <Input id="hTramit" className="h-8 text-sm" placeholder="H. Tramit" />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="hAssoc" className="text-xs font-medium">H. Assoc</Label>
            <Input id="hAssoc" className="h-8 text-sm" placeholder="H. Assoc" />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="tarefas" className="text-xs font-medium">Tarefas</Label>
            <Input id="tarefas" className="h-8 text-sm" placeholder="Tarefas" />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="teTramit" className="text-xs font-medium">TE tramit</Label>
            <Input id="teTramit" className="h-8 text-sm" placeholder="TE tramit" />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="teAssoc" className="text-xs font-medium">TE assoc</Label>
            <Input id="teAssoc" className="h-8 text-sm" placeholder="TE assoc" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}