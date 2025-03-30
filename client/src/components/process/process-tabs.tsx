import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceSection } from './compliance-section';
import { SiscopCliente } from '@/lib/types';

interface ProcessTabsProps {
  selectedClient: SiscopCliente | null;
}

export function ProcessTabs({ selectedClient }: ProcessTabsProps) {
  return (
    <Tabs defaultValue="conformidade" className="w-full">
      <TabsList className="bg-blue-600 text-white">
        <TabsTrigger 
          value="conformidade" 
          className="data-[state=active]:bg-white data-[state=active]:text-blue-800"
        >
          Conformidade
        </TabsTrigger>
        <TabsTrigger 
          value="servicos" 
          className="data-[state=active]:bg-white data-[state=active]:text-blue-800"
        >
          Serviços
        </TabsTrigger>
        <TabsTrigger 
          value="outros" 
          className="data-[state=active]:bg-white data-[state=active]:text-blue-800"
        >
          Outros
        </TabsTrigger>
        <TabsTrigger 
          value="prazos" 
          className="data-[state=active]:bg-white data-[state=active]:text-blue-800"
        >
          Prazos
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="conformidade" className="mt-4">
        <ComplianceSection selectedClient={selectedClient} />
      </TabsContent>
      
      <TabsContent value="servicos" className="mt-4">
        <div className="bg-[#d0e0f0] p-4 rounded-md">
          <p className="text-center text-gray-500">Conteúdo da aba Serviços em desenvolvimento</p>
        </div>
      </TabsContent>
      
      <TabsContent value="outros" className="mt-4">
        <div className="bg-[#d0e0f0] p-4 rounded-md">
          <p className="text-center text-gray-500">Conteúdo da aba Outros em desenvolvimento</p>
        </div>
      </TabsContent>
      
      <TabsContent value="prazos" className="mt-4">
        <div className="bg-[#d0e0f0] p-4 rounded-md">
          <p className="text-center text-gray-500">Conteúdo da aba Prazos em desenvolvimento</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}