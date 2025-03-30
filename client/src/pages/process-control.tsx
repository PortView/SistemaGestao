import { useState } from 'react';
import { ProcessCommandPanel } from '@/components/process/process-command-panel';
import { ProcessFilterPanel } from '@/components/process/process-filter-panel';
import { ServicesGrid } from '@/components/process/services-grid';
import { TasksGrid } from '@/components/process/tasks-grid';
import { ProcessTabs } from '@/components/process/process-tabs';
import { SiscopUnidade, SiscopServico, SiscopCliente } from '@/lib/types';

export default function ProcessControlPage() {
  const [selectedClient, setSelectedClient] = useState<SiscopCliente | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SiscopUnidade | null>(null);
  const [selectedService, setSelectedService] = useState<SiscopServico | null>(null);
  
  // Handler para mudança de cliente
  const handleClientChange = (clientId: number) => {
    // Este é um mock - na implementação real, você buscaria o cliente completo
    setSelectedClient({ codcli: clientId, fantasia: `Cliente ${clientId}`, lc_ufs: [] });
  };
  
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 pt-8 pb-6 space-y-3">
        <h1 className="text-lg font-medium mb-2">Controle de Processos</h1>
        
        {/* Área superior: command panel + filter panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProcessCommandPanel 
            onClientChange={handleClientChange}
            onUnitChange={setSelectedUnit}
          />
          <ProcessFilterPanel />
        </div>
        
        {/* Área do meio: serviços + tarefas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ServicesGrid 
            selectedUnit={selectedUnit}
            onServiceSelect={setSelectedService}
          />
          <TasksGrid selectedService={selectedService} />
        </div>
        
        {/* Área inferior: abas */}
        <div>
          <ProcessTabs selectedClient={selectedClient} />
        </div>
      </div>
    </div>
  );
}