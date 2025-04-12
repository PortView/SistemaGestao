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
  
  // Estados para armazenar as listas de valores únicos
  const [codServOptions, setCodServOptions] = useState<number[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [dtLimiteOptions, setDtLimiteOptions] = useState<string[]>([]);
  
  // Função para atualizar um filtro e disparar evento de atualização
  const updateFilter = (key: string, value: string) => {
    localStorage.setItem(key, value);
    window.dispatchEvent(new CustomEvent('filters-updated'));
  };
  
  // Handler para mudança no filtro de serviço
  const handleCodServChange = (value: string) => {
    setCodServValue(value);
    updateFilter("v_codServ", value);
  };
  
  // Handler para mudança no filtro de status
  const handleStatusChange = (value: string) => {
    setStatusValue(value);
    updateFilter("v_status", value);
  };
  
  // Handler para mudança no filtro de data limite
  const handleDtLimiteChange = (value: string) => {
    setDtLimiteValue(value);
    updateFilter("v_dtLimite", value);
  };
  
  // Efeito para carregar os valores do localStorage
  useEffect(() => {
    try {
      // Carregar valores dos filtros selecionados
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
      
      // Carregar listas de opções
      const codServListStr = localStorage.getItem("v_codServ_list");
      if (codServListStr) {
        const codServList = JSON.parse(codServListStr);
        if (Array.isArray(codServList)) {
          setCodServOptions(codServList);
          console.log("Lista de códigos de serviço carregada:", codServList);
        }
      }
      
      const statusListStr = localStorage.getItem("v_status_list");
      if (statusListStr) {
        const statusList = JSON.parse(statusListStr);
        if (Array.isArray(statusList)) {
          setStatusOptions(statusList);
          console.log("Lista de status carregada:", statusList);
        }
      }
      
      const dtLimiteListStr = localStorage.getItem("v_dtLimite_list");
      if (dtLimiteListStr) {
        const dtLimiteList = JSON.parse(dtLimiteListStr);
        if (Array.isArray(dtLimiteList)) {
          // Converter formato ISO para YYYY-MM-DD para o input date
          const formattedDates = dtLimiteList.map(date => {
            if (date) {
              const d = new Date(date);
              return d.toISOString().split('T')[0];
            }
            return '';
          }).filter(Boolean);
          
          setDtLimiteOptions(formattedDates);
          console.log("Lista de datas limite carregada:", formattedDates);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error);
    }
  }, []);

  return (
    <Card className="border-2 border-white shadow-md w-[940px] h-[150px] rounded-sm">
      <CardContent className="p-2 flex flex-col gap-2">
        {/* Row 1: Main filters */}
        <div className="flex items-center gap-4">
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
            <Select
              value={codServValue}
              onValueChange={handleCodServChange}
              disabled={!showCodServ}
            >
              <SelectTrigger
                className={`h-7 w-[100px] bg-select text-select-foreground border-border ${!showCodServ ? "opacity-50" : ""}`}
              >
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1">Todos</SelectItem>
                {codServOptions.map((codServ) => (
                  <SelectItem key={codServ} value={String(codServ)}>
                    {codServ}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              onValueChange={handleStatusChange}
              disabled={!showStatus}
            >
              <SelectTrigger
                className={`h-7 w-[200px] bg-select text-select-foreground border-border ${!showStatus ? "opacity-50" : ""}`}
              >
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="DTLimite"
              checked={showDtLimite}
              onCheckedChange={(checked) => {
                setShowDtLimite(!!checked);
              }}
            />
            <Label
              htmlFor="DTLimite"
              className="text-secondary-foreground text-xs font-semibold"
            >
              Dt.Limite
            </Label>
            <Select
              value={dtLimiteValue}
              onValueChange={handleDtLimiteChange}
              disabled={!showDtLimite}
            >
              <SelectTrigger
                className={`h-7 w-[150px] bg-select text-select-foreground border-border ${!showDtLimite ? "opacity-50" : ""}`}
              >
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2001-01-01">Todas</SelectItem>
                {dtLimiteOptions.map((date) => {
                  const formattedDate = new Date(date).toLocaleDateString('pt-BR');
                  return (
                    <SelectItem key={date} value={date}>
                      {formattedDate}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
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
