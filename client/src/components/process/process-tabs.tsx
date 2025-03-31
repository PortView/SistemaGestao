import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceSection } from './compliance-section';
import { SiscopCliente } from '@/lib/types';

interface ProcessTabsProps {
  selectedClient: SiscopCliente | null;
}

export function ProcessTabs({ selectedClient }: ProcessTabsProps) {
  return (
    <Tabs defaultValue="conformidade" className="w-full h-[460px]">
      <TabsList className="bg-blue-600 text-white">
        <TabsTrigger 
          value="conformidade" 
          className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs"
        >
          Conformidade
        </TabsTrigger>
        <TabsTrigger 
          value="servicos" 
          className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs"
        >
          Serviços
        </TabsTrigger>
        <TabsTrigger 
          value="outros" 
          className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs"
        >
          Outros
        </TabsTrigger>
        <TabsTrigger 
          value="prazos" 
          className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs"
        >
          Prazos
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="conformidade" className="mt-2 h-[425px] overflow-auto">
        <ComplianceSection selectedClient={selectedClient} />
      </TabsContent>
      
      <TabsContent value="servicos" className="mt-2 h-[425px] overflow-auto">
        <div className="bg-[#d0e0f0] p-4 rounded-md h-full">
          <p className="text-center text-gray-500 text-xs">Conteúdo da aba Serviços em desenvolvimento</p>
        </div>
      </TabsContent>
      
      <TabsContent value="outros" className="mt-2 h-[425px] overflow-auto">
        <div className="bg-[#d0e0f0] p-4 rounded-md h-full">
          <p className="text-center text-gray-500 text-xs">Conteúdo da aba Outros em desenvolvimento</p>
        </div>
      </TabsContent>
      
      <TabsContent value="prazos" className="mt-2 h-[425px] overflow-auto">
        <div className="bg-[#d0e0f0] p-4 rounded-md h-full">
          <p className="text-center text-gray-500 text-xs">Conteúdo da aba Prazos em desenvolvimento</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}