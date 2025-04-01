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
      {/* Conteúdo principal que ocupa a largura total na resolução 1920px */}
      <div className="w-full mx-auto px-2 pb-2 overflow-y-auto">
        <div className="text-xs font-light mb-1">Controle de Processos</div>

        {/* Layout responsivo condicional - usando classes para targetar exatamente 1920px */}
        <div className="hidden 2xl:block">
          {/* Layout para tela grande (1920px) - cards lado a lado */}
          <div>
            {/* Área superior: command panel + filter panel (lado a lado) */}
            <div className="flex justify-center gap-2 mb-2">
              <div className="w-[940px] h-[150px]">
                <ProcessCommandPanel
                  onClientChange={handleClientChange}
                  onUnitChange={setSelectedUnit}
                />
              </div>
              <div className="w-[940px] h-[150px]">
                <ProcessFilterPanel />
              </div>
            </div>

            {/* Área do meio: serviços + tarefas (lado a lado) */}
            <div className="flex justify-center gap-2 mb-2">
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

            {/* Área inferior: abas (largura total) */}
            <div className="w-full h-[460px] overflow-auto">
              <ProcessTabs selectedClient={selectedClient} />
            </div>
          </div>
        </div>

        {/* Layout para telas menores que 1920px - cards empilhados */}
        <div className="block 2xl:hidden">
          {/* Área superior: command panel + filter panel (empilhados) */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-full max-w-[940px] h-[150px]">
              <ProcessCommandPanel
                onClientChange={handleClientChange}
                onUnitChange={setSelectedUnit}
              />
            </div>
            <div className="w-full max-w-[940px] h-[150px]">
              <ProcessFilterPanel />
            </div>
          </div>

          {/* Área do meio: serviços + tarefas (empilhados) */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-full max-w-[940px] h-[460px] overflow-auto">
              <ServicesGrid
                selectedUnit={selectedUnit}
                onServiceSelect={setSelectedService}
              />
            </div>
            <div className="w-full max-w-[940px] h-[460px] overflow-auto">
              <TasksGrid selectedService={selectedService} />
            </div>
          </div>

          {/* Área inferior: abas (largura total) */}
          <div className="w-full h-[460px] overflow-auto">
            <ProcessTabs selectedClient={selectedClient} />
          </div>
        </div>
      </div>
    </div>
  );
}
