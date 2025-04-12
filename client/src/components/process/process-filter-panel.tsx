import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";

export function ProcessFilterPanel() {
  const [codServValue, setCodServValue] = useState("-1");
  const [statusValue, setStatusValue] = useState("ALL");
  const [dtLimiteValue, setDtLimiteValue] = useState("2001-01-01");
  
  // Estado para controlar a exibição dos campos
  const [showCodServ, setShowCodServ] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showDtLimite, setShowDtLimite] = useState(false);
  
  // Carregar valores do localStorage ao iniciar
  useEffect(() => {
    const storedCodServ = localStorage.getItem("v_codServ");
    const storedStatus = localStorage.getItem("v_status");
    const storedDtLimite = localStorage.getItem("v_dtLimite");
    
    if (storedCodServ) {
      setCodServValue(storedCodServ);
      setShowCodServ(storedCodServ !== "-1");
    }
    
    if (storedStatus) {
      setStatusValue(storedStatus);
      setShowStatus(storedStatus !== "ALL");
    }
    
    if (storedDtLimite) {
      setDtLimiteValue(storedDtLimite);
      setShowDtLimite(storedDtLimite !== "2001-01-01");
    }
  }, []);
  
  // Função para atualizar os filtros
  const handleApplyFilters = () => {
    localStorage.setItem("v_codServ", showCodServ ? codServValue : "-1");
    localStorage.setItem("v_status", showStatus ? statusValue : "ALL");
    localStorage.setItem("v_dtLimite", showDtLimite ? dtLimiteValue : "2001-01-01");
    
    console.log("Filtros aplicados:", {
      v_codServ: showCodServ ? codServValue : "-1",
      v_status: showStatus ? statusValue : "ALL",
      v_dtLimite: showDtLimite ? dtLimiteValue : "2001-01-01"
    });
    
    // Disparar um evento para notificar outras partes da aplicação
    window.dispatchEvent(new CustomEvent('filters-updated'));
  };
  
  // Função para limpar os filtros
  const handleResetFilters = () => {
    setCodServValue("-1");
    setStatusValue("ALL");
    setDtLimiteValue("2001-01-01");
    
    setShowCodServ(false);
    setShowStatus(false);
    setShowDtLimite(false);
    
    localStorage.setItem("v_codServ", "-1");
    localStorage.setItem("v_status", "ALL");
    localStorage.setItem("v_dtLimite", "2001-01-01");
    
    console.log("Filtros resetados");
    
    // Disparar um evento para notificar outras partes da aplicação
    window.dispatchEvent(new CustomEvent('filters-updated'));
  };

  return (
    <Card className="border-2 border-white shadow-md w-[940px] h-[150px] rounded-sm">
      <CardContent className="p-2 flex flex-col gap-2">
        {/* Row 1: Main filters */}
        <div className="flex items-center gap-4">
          <div className="flex w-[190px]">
            <div className="flex flex-row items-center gap-2">
              <Checkbox
                id="codserv"
                checked={showCodServ}
                onCheckedChange={(checked) => {
                  setShowCodServ(!!checked);
                }}
              />
              <Label
                htmlFor="codserv"
                className="text-secondary-foreground text-xs font-semibold"
              >
                Cód.Serv.
              </Label>
              <Input
                id="codserv-input"
                type="number"
                className={`h-7 w-[90px] bg-input text-input-foreground border-border ${!showCodServ ? 'opacity-50' : ''}`}
                value={codServValue}
                disabled={!showCodServ}
                onChange={(e) => setCodServValue(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox 
              id="status" 
              checked={showStatus}
              onCheckedChange={(checked) => {
                setShowStatus(!!checked);
              }}
            />
            <Label
              htmlFor="status"
              className="text-secondary-foreground text-xs font-semibold"
            >
              Status
            </Label>
            <Select
              value={statusValue}
              onValueChange={setStatusValue}
              disabled={!showStatus}
            >
              <SelectTrigger className={`h-7 w-40 bg-select text-select-foreground border-border ${!showStatus ? 'opacity-50' : ''}`}>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                <SelectItem value="SUSPENSO">Suspenso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox 
              id="dtlimite" 
              checked={showDtLimite}
              onCheckedChange={(checked) => {
                setShowDtLimite(!!checked);
              }}
            />
            <Label
              htmlFor="dtlimite"
              className="text-secondary-foreground text-xs font-semibold"
            >
              Dt.Limite
            </Label>

            <Input
              type="date"
              className={`h-7 w-36 bg-input text-input-foreground border-border [&::-webkit-calendar-picker-indicator]:text-input-foreground dark:[&::-webkit-calendar-picker-indicator]:invert ${!showDtLimite ? 'opacity-50' : ''}`}
              value={dtLimiteValue}
              disabled={!showDtLimite}
              onChange={(e) => setDtLimiteValue(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleApplyFilters}
              className="h-7 px-2 bg-blue-600 hover:bg-blue-700 text-white"
              title="Aplicar filtros"
            >
              <Search className="h-4 w-4 mr-1" />
              Aplicar
            </Button>
            
            <Button 
              onClick={handleResetFilters}
              className="h-7 px-2 bg-gray-500 hover:bg-gray-600 text-white"
              title="Limpar filtros"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
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
