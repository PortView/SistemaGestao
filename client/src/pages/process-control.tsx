import { useState, useEffect } from "react";
import { ProcessCommandPanel } from "@/components/process/process-command-panel";
import { ProcessFilterPanel } from "@/components/process/process-filter-panel-new";
import { TableServicos } from "@/components/process/table-servicos";
import { TableFollowup } from "@/components/process/table-followup";
import { ProcessTabs } from "@/components/process/process-tabs";
import { SiscopUnidade, SiscopServico, SiscopCliente } from "@/lib/types";

export default function ProcessControlPage() {
  const [selectedClient, setSelectedClient] = useState<SiscopCliente | null>(
    null,
  );
  const [selectedUnit, setSelectedUnit] = useState<SiscopUnidade | null>(null);
  const [selectedService, setSelectedService] = useState<SiscopServico | null>(
    null,
  );
  const [selectedServicoCod, setSelectedServicoCod] = useState<number>(-1);
  const [codCoor, setCodCoor] = useState<number>(0);

  // Efeito para obter o código de coordenação (codcoor) do localStorage
  useEffect(() => {
    // Obter o usuário do localStorage
    const userJson = localStorage.getItem("siscop_user");
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        if (userData?.cod) {
          setCodCoor(userData.cod);
        }
      } catch (e) {
        console.error("Erro ao carregar dados do usuário:", e);
      }
    }
  }, []);

  // Efeito para inicializar os valores de localStorage se não existirem
  useEffect(() => {
    // Verificar se as variáveis já existem no localStorage
    if (!localStorage.getItem("v_codServ")) {
      localStorage.setItem("v_codServ", "-1");
    }
    if (!localStorage.getItem("v_status")) {
      localStorage.setItem("v_status", "ALL");
    }
    if (!localStorage.getItem("v_dtLimite")) {
      localStorage.setItem("v_dtLimite", "ALL");
    }
  }, []);

  // Handler para mudança de cliente
  const handleClientChange = (clientId: number) => {
    // Este é um mock - na implementação real, você buscaria o cliente completo
    setSelectedClient({
      codcli: clientId,
      fantasia: `Cliente ${clientId}`,
      lc_ufs: [],
    });

    // Quando o cliente muda, limpar a unidade selecionada
    setSelectedUnit(null);
  };

  // Handler para processar uma unidade selecionada
  const handleUnitChange = (unit: SiscopUnidade) => {
    console.log('ProcessControl: Unidade selecionada:', unit);
    setSelectedUnit(unit);

    // Quando a unidade muda, limpar o serviço selecionado
    setSelectedService(null);
    setSelectedServicoCod(-1);

    // Atualizar o localStorage com valores padrão para filtragem quando seleciona uma unidade
    localStorage.setItem("v_codServ", "-1");
    localStorage.setItem("v_status", "ALL");
    localStorage.setItem("v_dtLimite", "ALL");

    // Limpar as listas de valores únicos
    localStorage.setItem("v_codServ_list", JSON.stringify([]));
    localStorage.setItem("v_status_list", JSON.stringify([]));
    localStorage.setItem("v_dtLimite_list", JSON.stringify([]));

    console.log("LocalStorage atualizado com valores padrão após seleção de unidade");
    
    // Disparar evento personalizado para notificar que uma unidade foi selecionada
    try {
      const event = new CustomEvent("unit-selected");
      window.dispatchEvent(event);
    } catch (e) {
      console.error("Erro ao disparar evento unit-selected:", e);
    }
  };

  // Handler para processar a seleção de serviço
  const handleServicoSelect = (codServ: number) => {
    console.log('Serviço selecionado:', codServ);
    setSelectedServicoCod(codServ);

    // Atualizar o localStorage com o código do serviço selecionado
    localStorage.setItem("v_codServ", codServ.toString());
    console.log("LocalStorage v_codServ atualizado:", codServ);
  };

  return (
    // <div className="bg-zinc-400 dark:bg-zinc-800 text-foreground min-h-screen">
      <div className="bg-zinc-600 text-white min-h-screen">
      {/* Conteúdo principal que ocupa a largura total */}
      <div className="w-full mx-auto px-1 pb-1">
        <div className="text-xs font-light mb-1">Controle de Processos</div>

        {/* Layout responsivo condicional - usando classes para targetar exatamente 1920px */}
        <div className="hidden 2xl:block">
          {/* Layout para tela grande (1920px) - cards lado a lado */}
          <div>
            {/* Área superior: command panel + filter panel (lado a lado) com altura fixa de 150px */}
            <div className="flex justify-center gap-1 mb-1">
              <div className="w-[940px] h-[150px]"> {/* Added bg-card */}
                <ProcessCommandPanel
                  onClientChange={handleClientChange}
                  onUnitChange={handleUnitChange}
                />
              </div>
              <div className="w-[940px] h-[150px]"> {/* Added bg-card */}
                <ProcessFilterPanel />
              </div>
            </div>

            {/* Área do meio: serviços + tarefas (lado a lado) com altura fixa de 460px */}
            <div className="flex justify-center gap-1 mb-1">
              <div className="w-[940px] h-[460px] bg-card "> {/* Added bg-card */}
                <TableServicos
                  qcodCoor={codCoor}
                  qcontrato={selectedUnit?.contrato || null}
                  qUnidade={selectedUnit?.codend || null}
                  qConcluido={true}
                  qCodServ={-1}
                  qStatus="ALL"
                  qDtlimite="ALL"
                  onSelectServico={handleServicoSelect}
                />
              </div>
              <div className="w-[940px] h-[460px] bg-card"> {/* Added bg-card */}
                <TableFollowup codserv={selectedServicoCod} />
              </div>
            </div>

            {/* Área inferior: abas (largura total) com altura fixa de 400px */}
            <div className="w-full h-[400px] bg-card"> {/* Added bg-card */}
              <ProcessTabs
                selectedClient={selectedClient}
                selectedUnit={selectedUnit}
              />
            </div>
          </div>
        </div>

        {/* Layout para telas menores que 1920px - cards empilhados */}
        <div className="block 2xl:hidden">
          {/* Área superior: command panel + filter panel (empilhados) com altura fixa de 150px */}
          <div className="flex flex-col items-center gap-1 mb-1">
            <div className="w-full max-w-[940px] h-[150px] bg-card"> {/* Added bg-card */}
              <ProcessCommandPanel
                onClientChange={handleClientChange}
                onUnitChange={handleUnitChange}
              />
            </div>
            <div className="w-full max-w-[940px] h-[150px] bg-card"> {/* Added bg-card */}
              <ProcessFilterPanel />
            </div>
          </div>

          {/* Área do meio: serviços + tarefas (empilhados) com altura fixa de 460px */}
          <div className="flex flex-col items-center gap-1 mb-1">
            <div className="w-full max-w-[940px] h-[460px] bg-card"> {/* Added bg-card */}
              <TableServicos
                qcodCoor={codCoor}
                qcontrato={selectedUnit?.contrato || null}
                qUnidade={selectedUnit?.codend || null}
                qConcluido={false} // false = não concluído (conforme fluxograma)
                qCodServ={-1}
                qStatus="ALL"
                qDtlimite="ALL"
                onSelectServico={handleServicoSelect}
              />
            </div>
            <div className="w-full max-w-[940px] h-[460px] bg-card"> {/* Added bg-card */}
              <TableFollowup codserv={selectedServicoCod} />
            </div>
          </div>

          {/* Área inferior: abas (largura total) com altura fixa de 400px */}
          {/* <div className="w-full max-h[19100] h-[400px]"> */}
            <div className="w-full h-full bg-card"> {/* Added bg-card */}
            <ProcessTabs
              selectedClient={selectedClient}
              selectedUnit={selectedUnit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}