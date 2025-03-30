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
      {/* Header de navegação */}
      <div className="bg-blue-600 p-2 flex space-x-6 text-white">
        <div className="font-semibold px-4">Siscop</div>
        <div className="flex space-x-6">
          <a href="#" className="hover:bg-blue-700 px-2 py-1 rounded">Administração</a>
          <a href="#" className="hover:bg-blue-700 px-2 py-1 rounded">Cadastro</a>
          <a href="#" className="hover:bg-blue-700 px-2 py-1 rounded bg-blue-800">Gerência</a>
          <a href="#" className="hover:bg-blue-700 px-2 py-1 rounded">Técnico</a>
          <a href="#" className="hover:bg-blue-700 px-2 py-1 rounded">Consultas</a>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold mb-6">Controle de Processos</h1>
        
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