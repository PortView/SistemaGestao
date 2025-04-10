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
      <Card className="border-2 border-white shadow-md w-[940px] h-[150px] rounded-sm">
      <CardContent className="p-2 flex flex-col gap-2">
        {/* Row 1: Main filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="codserv" />
            <Label htmlFor="codserv" className="text-secondary-foreground text-xs font-semibold">Cód.Serv.</Label>
            <Select defaultValue="8">
              <SelectTrigger className="h-7 w-20 bg-select text-select-foreground border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="status" />
            <Label htmlFor="status" className="text-secondary-foreground text-xs font-semibold">Status</Label>
            <Select>
              <SelectTrigger className="h-7 w-40 bg-select text-select-foreground  border-border">
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
            <Label htmlFor="dtlimite" className="text-secondary-foreground text-xs font-semibold">Dt.Limite</Label>
            <Input type="date" className="h-7 w-36 bg-input text-secondary-foreground border-border [&::-webkit-calendar-picker-indicator]:text-secondary-foreground [&::-webkit-calendar-picker-indicator]:filter-[color:var(--secondary-foreground)]" defaultValue="2010-06-16" />
          </div>
        </div>

        {/* Row 2: Checkbox filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="servNaoConcluidos" />
            <Label htmlFor="servNaoConcluidos" className="text-secondary-foreground text-xs font-semibold">Só Serv. não Concluídos</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="novos" />
            <Label htmlFor="novos" className="text-secondary-foreground text-xs font-semibold">Novos</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="suspensos" />
            <Label htmlFor="suspensos" className="text-secondary-foreground text-xs font-semibold">Suspensos</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="semNota" />
            <Label htmlFor="semNota" className="text-secondary-foreground text-xs font-semibold">Sem Nota</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="pendencia" />
            <Label htmlFor="pendencia" className="text-secondary-foreground text-xs font-semibold">Pendência</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="docInternet" />
            <Label htmlFor="docInternet" className="text-secondary-foreground text-xs font-semibold">Doc.Internet</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="soOS" />
            <Label htmlFor="soOS" className="text-secondary-foreground text-xs font-semibold">Só O.S.</Label>
          </div>
        </div>

        {/* Row 3: Services and Tasks */}
        <div className="flex flex-row place-items-end gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-secondary-foreground text-xs font-semibold">Gerente Mauro.Luiz</Label>
          </div>

          <div className="flex items-center gap-1 ml-8">
            <div className="flex gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] font-light mb-0.2 tracking-tighter text-secondary-foreground">
                  H. tramit.
                </label>
                <Input className="h-7 w-20 bg-input text-input-foreground border-border" />
              </div>
              <div className="flex flex-col">
              <label className="text-[10px] font-light mb-0.2 tracking-tighter text-secondary-foreground">
                H. assess.
              </label>
              <Input className="h-7 w-20 bg-input text-input-foreground border-border" />
                </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] font-light mb-0.2 tracking-tighter text-secondary-foreground">
                  TE tramit.
                </label>
                <Input className="h-7 w-20 bg-input text-input-foreground border-border" />
              </div>
              <div className="flex flex-col">
              <label className="text-[10px] font-light mb-0.2 tracking-tighter text-secondary-foreground">
                TE assess.
              </label>
              <Input className="h-7 w-20 bg-input text-input-foreground border-border" />
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}