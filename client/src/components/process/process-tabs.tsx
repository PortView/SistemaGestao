import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceSection } from './compliance-section';
import { SiscopCliente, SiscopUnidade } from '@/lib/types';

interface ProcessTabsProps {
  selectedClient: SiscopCliente | null;
  selectedUnit?: SiscopUnidade | null;
}

export function ProcessTabs({ selectedClient, selectedUnit }: ProcessTabsProps) {
  return (
    <div className="w-full flex mx-auto h-full">
      {/* Tabs na vertical seguindo o exemplo da imagem */}
      <Tabs defaultValue="conformidade" orientation="vertical" className="flex w-full h-[calc(100vh-180px)]">
        <TabsList className="bg-[#d0e0f0] text-gray-600 h-full flex flex-col shrink-0 rounded-r-none">
          <TabsTrigger 
            value="conformidade" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 px-2 py-6 h-24 w-10 rounded-r-none"
          >
            <div className="-rotate-90 origin-center whitespace-nowrap text-xs">Conformidade</div>
          </TabsTrigger>
          <TabsTrigger 
            value="desenhos" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 px-2 py-6 h-24 w-10 rounded-r-none"
          >
            <div className="-rotate-90 origin-center whitespace-nowrap text-xs">Desenhos</div>
          </TabsTrigger>
          <TabsTrigger 
            value="detalhe" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 px-2 py-6 h-24 w-10 rounded-r-none"
          >
            <div className="-rotate-90 origin-center whitespace-nowrap text-xs">Detalhe</div>
          </TabsTrigger>
          <TabsTrigger 
            value="caract" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 px-2 py-6 h-24 w-10 rounded-r-none"
          >
            <div className="-rotate-90 origin-center whitespace-nowrap text-xs">Caract.</div>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-x-auto h-full">
          <TabsContent value="conformidade" className="mt-0 h-full">
            <div className="bg-white rounded-l-none rounded-r-md overflow-x-auto h-full">
              <ComplianceSection selectedClient={selectedClient} selectedUnit={selectedUnit} />
            </div>
          </TabsContent>
          
          <TabsContent value="desenhos" className="mt-0 h-full">
            <div className="bg-[#d0e0f0] p-4 rounded-l-none rounded-r-md h-full">
              <p className="text-center text-gray-500 text-xs">Desenhos em desenvolvimento</p>
            </div>
          </TabsContent>
          
          <TabsContent value="detalhe" className="mt-0 h-full">
            <div className="bg-[#d0e0f0] p-4 rounded-l-none rounded-r-md h-full">
              <p className="text-center text-gray-500 text-xs">Detalhes em desenvolvimento</p>
            </div>
          </TabsContent>
          
          <TabsContent value="caract" className="mt-0 h-full">
            <div className="bg-[#d0e0f0] p-4 rounded-l-none rounded-r-md h-full">
              <p className="text-center text-gray-500 text-xs">Características em desenvolvimento</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}