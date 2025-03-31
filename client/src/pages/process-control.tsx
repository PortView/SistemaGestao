import { useState } from "react";
import { ProcessCommandPanel } from "@/components/process/process-command-panel";
import { ProcessFilterPanel } from "@/components/process/process-filter-panel";
import { ServicesGrid } from "@/components/process/services-grid";
import { TasksGrid } from "@/components/process/tasks-grid";
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

  // Handler para mudança de cliente
  const handleClientChange = (clientId: number) => {
    // Este é um mock - na implementação real, você buscaria o cliente completo
    setSelectedClient({
      codcli: clientId,
      fantasia: `Cliente ${clientId}`,
      lc_ufs: [],
    });
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Conteúdo principal com largura total de 1920px e scroll vertical */}
      <div className="max-w-[1920px] mx-auto px-2 pb-2 overflow-y-auto">
        <div className="text-xs font-light mb-1">Controle de Processos</div>

        {/* Área superior: command panel + filter panel (blocos com 940px de largura, 150px de altura) */}
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          <ProcessCommandPanel
            onClientChange={handleClientChange}
            onUnitChange={setSelectedUnit}
          />
          <div className="w-[940px] h-[150px]">
            <ProcessFilterPanel />
          </div>
        </div>

        {/* Área do meio: serviços + tarefas (blocos com 940px de largura, 460px de altura) */}
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          <div className="w-[940px] h-[460px] overflow-auto">
            <ServicesGrid
              selectedUnit={selectedUnit}
              onServiceSelect={setSelectedService}
            />
          </div>
          <div className="w-[940px] h-[460px] overflow-auto">
            <TasksGrid selectedService={selectedService} />
          </div>
        </div>

        {/* Área inferior: abas (bloco com largura total, 460px de altura) */}
        <div className="w-full h-[460px] overflow-auto">
          <ProcessTabs selectedClient={selectedClient} />
        </div>
      </div>
    </div>
  );
}
