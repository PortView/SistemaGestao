import { useState, useEffect } from "react";
import { ProcessCommandPanel } from "@/components/process/process-command-panel";
import { ProcessFilterPanel } from "@/components/process/process-filter-panel";
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
    setSelectedUnit(unit);
    // Quando a unidade muda, limpar o serviço selecionado
    setSelectedService(null);
    setSelectedServicoCod(-1);
  };
  
  // Handler para processar a seleção de serviço
  const handleServicoSelect = (codServ: number) => {
    setSelectedServicoCod(codServ);
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Conteúdo principal que ocupa a largura total */}
      <div className="w-full mx-auto px-2 pb-2">
        <div className="text-xs font-light mb-1">Controle de Processos</div>

        {/* Layout responsivo condicional - usando classes para targetar exatamente 1920px */}
        <div className="hidden 2xl:block">
          {/* Layout para tela grande (1920px) - cards lado a lado */}
          <div>
            {/* Área superior: command panel + filter panel (lado a lado) */}
            <div className="flex justify-center gap-2 mb-2">
              <div className="w-[940px]">
                <ProcessCommandPanel
                  onClientChange={handleClientChange}
                  onUnitChange={handleUnitChange}
                />
              </div>
              <div className="w-[940px]">
                <ProcessFilterPanel />
              </div>
            </div>

            {/* Área do meio: serviços + tarefas (lado a lado) */}
            <div className="flex justify-center gap-2 mb-2">
              <div className="w-[940px]">
                <TableServicos
                  qcodCoor={codCoor}
                  qcontrato={selectedUnit?.contrato || null}
                  qUnidade={selectedUnit?.codend || null}
                  qConcluido={true}
                  qCodServ={-1}
                  qStatus="ALL"
                  qDtlimite="2001-01-01"
                  onSelectServico={handleServicoSelect}
                />
              </div>
              <div className="w-[940px]">
                <TableFollowup codserv={selectedServicoCod} />
              </div>
            </div>

            {/* Área inferior: abas (largura total) */}
            <div className="w-full">
              <ProcessTabs
                selectedClient={selectedClient}
                selectedUnit={selectedUnit}
              />
            </div>
          </div>
        </div>

        {/* Layout para telas menores que 1920px - cards empilhados */}
        <div className="block 2xl:hidden">
          {/* Área superior: command panel + filter panel (empilhados) */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-full max-w-[940px]">
              <ProcessCommandPanel
                onClientChange={handleClientChange}
                onUnitChange={handleUnitChange}
              />
            </div>
            <div className="w-full max-w-[940px]">
              <ProcessFilterPanel />
            </div>
          </div>

          {/* Área do meio: serviços + tarefas (empilhados) */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-full max-w-[940px]">
              <TableServicos
                qcodCoor={codCoor}
                qcontrato={selectedUnit?.contrato || null}
                qUnidade={selectedUnit?.codend || null}
                qConcluido={true}
                qCodServ={-1}
                qStatus="ALL"
                qDtlimite="2001-01-01"
                onSelectServico={handleServicoSelect}
              />
            </div>
            <div className="w-full max-w-[940px]">
              <TableFollowup codserv={selectedServicoCod} />
            </div>
          </div>

          {/* Área inferior: abas (largura total) */}
          <div className=" w-full">
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
