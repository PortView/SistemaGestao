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
      <div className="bg-[#d0e0f0] border-none shadow-md w-[940px] h-[150px] rounded-sm">
      <CardContent className="p-2 space-y-1">
        {/* Row 1: Main filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="codserv" />
            <Label htmlFor="codserv" className="text-xs text-slate-800 font-semibold">Cód.Serv.</Label>
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
            <Label htmlFor="status" className="text-xs text-slate-800 font-semibold">Status</Label>
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
            <Label htmlFor="dtlimite" className="text-xs text-slate-800 font-semibold">Dt.Limite</Label>
            <Input type="date" className="h-7 w-32" defaultValue="2010-06-16" />
          </div>
        </div>

        {/* Row 2: Checkbox filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="servNaoConcluidos" />
            <Label htmlFor="servNaoConcluidos" className="text-xs text-slate-800 font-semibold">Só Serv. não Concluídos</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="novos" />
            <Label htmlFor="novos" className="text-xs text-slate-800 font-semibold">Novos</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="suspensos" />
            <Label htmlFor="suspensos" className="text-xs text-slate-800 font-semibold">Suspensos</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="semNota" />
            <Label htmlFor="semNota" className="text-xs text-slate-800 font-semibold">Sem Nota</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="pendencia" />
            <Label htmlFor="pendencia" className="text-xs text-slate-800 font-semibold">Pendência</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="docInternet" />
            <Label htmlFor="docInternet" className="text-xs text-slate-800 font-semibold">Doc.Internet</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="soOS" />
            <Label htmlFor="soOS" className="text-xs text-slate-800 font-semibold">Só O.S.</Label>
          </div>
        </div>

        {/* Row 3: Services and Tasks */}
        <div className="flex flex-row place-items-end gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-800 font-semibold">Gerente Mauro.Luiz</Label>
          </div>

          <div className="flex items-center gap-1 ml-8">
            <div className="flex gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] font-light text-gray-600 mb-0.5 tracking-tighter">
                  H. tramit.
                </label>
                <Input className="h-7 w-20" />
              </div>
              <div className="flex flex-col">
              <label className="text-[10px] font-light text-gray-600 mb-0.5 tracking-tighter">
                H. assess.
              </label>
              <Input className="h-7 w-20" />
                </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] font-light text-gray-600 mb-0.5 tracking-tighter">
                  TE tramit.
                </label>
                <Input className="h-7 w-20" />
              </div>
              <div className="flex flex-col">
              <label className="text-[10px] font-light text-gray-600 mb-0.5 tracking-tighter">
                TE assess.
              </label>
              <Input className="h-7 w-20" />
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}