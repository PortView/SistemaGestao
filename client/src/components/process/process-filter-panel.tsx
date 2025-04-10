import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProcessFilterPanelProps {
  onFilterChange?: (filters: any) => void;
}

export function ProcessFilterPanel({
  onFilterChange,
}: ProcessFilterPanelProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await ApiService.get('/ger-clientes/servicos');
        setData(response || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        setData([]);
      }
    };

    fetchServices();
  }, []);
  return (
     <Card className="border-2 border-white shadow-md w-[940px] h-[150px] rounded-sm">
      <CardContent className="p-2 flex flex-col gap-2">
        {/* Row 1: Main filters */}
        <div className="flex items-center gap-4">
          <div className="flex w-[190px]">
            <div className="flex flex-row items-center gap-2">
              <Checkbox
                id="codserv"
                onCheckedChange={(checked) => {
                  const select = document.getElementById("codserv-select");
                  if (select) {
                    select.style.display = checked ? "block flex" : "none";
                  }
                }}
              />
              <Label
                htmlFor="codserv"
                className="text-secondary-foreground text-xs font-semibold"
              >
                Cód.Serv.
              </Label>
              <Select>
                <SelectTrigger
                  id="codserv-select"
                  className="h-7 w-[90px] bg-select text-select-foreground border-border"
                >
                  <SelectValue placeholder="Sele..." />
                </SelectTrigger>
                <SelectContent>
                  {data?.map(service => (
                    <SelectItem key={service.codServ} value={service.codServ.toString()}>
                      {service.codServ}
                    </SelectItem>
                  )).filter((item, index, self) => 
                    index === self.findIndex((t) => t.props.value === item.props.value)
                  )}
                </SelectContent>
              </Select>
            </div>
            
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox id="status" />
            <Label
              htmlFor="status"
              className="text-secondary-foreground text-xs font-semibold"
            >
              Status
            </Label>
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
            <Label
              htmlFor="dtlimite"
              className="text-secondary-foreground text-xs font-semibold"
            >
              Dt.Limite
            </Label>

            <Input
              type="date"
              className="h-7 w-36 bg-input text-input-foreground border-border [&::-webkit-calendar-picker-indicator]:text-input-foreground dark:[&::-webkit-calendar-picker-indicator]:invert"
              defaultValue="2010-06-16"
            />
          </div>
        </div>

        {/* Row 2: Checkbox filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="servNaoConcluidos" />
            <Label
              htmlFor="servNaoConcluidos"
              className="text-secondary-foreground text-xs font-semibold"
            >
              Só Serv. não Concluídos
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="novos" />
            <Label
              htmlFor="novos"
              className="text-secondary-foreground text-xs font-semibold"
            >
              Novos
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="suspensos" />
            <Label
              htmlFor="suspensos"
              className="text-secondary-foreground text-xs font-semibold"
            >
              Suspensos
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="semNota" />
            <Label
              htmlFor="semNota"
              className="text-secondary-foreground text-xs font-semibold"
            >
              Sem Nota
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="pendencia" />
            <Label
              htmlFor="pendencia"
              className="text-secondary-foreground text-xs font-semibold"
            >
              Pendência
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="docInternet" />
            <Label
              htmlFor="docInternet"
              className="text-secondary-foreground text-xs font-semibold"
            >
              Doc.Internet
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="soOS" />
            <Label
              htmlFor="soOS"
              className="text-secondary-foreground text-xs font-semibold"
            >
              Só O.S.
            </Label>
          </div>
        </div>

        {/* Row 3: Services and Tasks */}
        <div className="flex flex-row place-items-end gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-secondary-foreground text-xs font-semibold">
              Gerente Mauro.Luiz
            </Label>
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
