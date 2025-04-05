import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProcessFilterPanelProps {
  onFilterChange?: (filters: any) => void;
}

export function ProcessFilterPanel({ onFilterChange }: ProcessFilterPanelProps) {
  return (
    <Card className="bg-card/20 backdrop-blur shadow-md w-full h-[150px]">
      <CardContent className="p-2 space-y-2">
        {/* Row 1: Main filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="codserv" />
            <Label htmlFor="codserv" className="text-xs">Cód.Serv.</Label>
            <Select defaultValue="8">
              <SelectTrigger className="h-7 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="status" />
            <Label htmlFor="status" className="text-xs">Status</Label>
            <Select>
              <SelectTrigger className="h-7 w-40">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="dtlimite" />
            <Label htmlFor="dtlimite" className="text-xs">Dt.Limite</Label>
            <Input type="date" className="h-7 w-32" defaultValue="2010-06-16" />
          </div>
        </div>

        {/* Row 2: Checkbox filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="servNaoConcluidos" />
            <Label htmlFor="servNaoConcluidos" className="text-xs">Só Serv. não Concluídos</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="novos" />
            <Label htmlFor="novos" className="text-xs">Novos</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="suspensos" />
            <Label htmlFor="suspensos" className="text-xs">Suspensos</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="semNota" />
            <Label htmlFor="semNota" className="text-xs">Sem Nota</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="pendencia" />
            <Label htmlFor="pendencia" className="text-xs">Pendência</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="docInternet" />
            <Label htmlFor="docInternet" className="text-xs">Doc.Internet</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="soOS" />
            <Label htmlFor="soOS" className="text-xs">Só O.S.</Label>
          </div>
        </div>

        {/* Row 3: Services and Tasks */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Gerente</Label>
            <Input value="Mauro.Luiz" className="h-7 w-24" readOnly />
          </div>

          <div className="flex items-center gap-1">
            <Label className="text-xs">Serviço</Label>
            <div className="flex gap-2">
              <Label className="text-xs">H.Tramit</Label>
              <Input className="h-7 w-20" />
              <Label className="text-xs">H.Assoc.</Label>
              <Input className="h-7 w-20" />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Label className="text-xs">Tarefas</Label>
            <div className="flex gap-2">
              <Label className="text-xs">TE tramit.</Label>
              <Input className="h-7 w-20" />
              <Label className="text-xs">TE assoc.</Label>
              <Input className="h-7 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}