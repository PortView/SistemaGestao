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
    <div className="w-full flex">
      {/* Tabs na vertical seguindo o exemplo da imagem */}
      <Tabs defaultValue="web" orientation="vertical" className="flex w-full">
        <TabsList className="bg-blue-600 text-white h-auto flex flex-col w-24 mr-2 shrink-0">
          <TabsTrigger 
            value="web" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs justify-start w-full"
          >
            Web
          </TabsTrigger>
          <TabsTrigger 
            value="rel" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs justify-start w-full"
          >
            Rel
          </TabsTrigger>
          <TabsTrigger 
            value="certcli" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs justify-start w-full"
          >
            Cert.Cli
          </TabsTrigger>
          <TabsTrigger 
            value="cod" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs justify-start w-full"
          >
            Cod.
          </TabsTrigger>
          <TabsTrigger 
            value="descricao" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs justify-start w-full"
          >
            Descrição
          </TabsTrigger>
          <TabsTrigger 
            value="documento" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs justify-start w-full"
          >
            Doc
          </TabsTrigger>
          <TabsTrigger 
            value="area" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs justify-start w-full"
          >
            Área
          </TabsTrigger>
          <TabsTrigger 
            value="emissao" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs justify-start w-full"
          >
            Emissão
          </TabsTrigger>
          <TabsTrigger 
            value="vencim" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs justify-start w-full"
          >
            Vencim.
          </TabsTrigger>
          <TabsTrigger 
            value="renov" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs justify-start w-full"
          >
            Renov.
          </TabsTrigger>
          <TabsTrigger 
            value="periodicidade" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 text-xs justify-start w-full"
          >
            Periodicidade
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1">
          <TabsContent value="web" className="mt-2 ml-2">
            <ComplianceSection selectedClient={selectedClient} selectedUnit={selectedUnit} />
          </TabsContent>
          
          <TabsContent value="rel" className="mt-2 ml-2">
            <div className="bg-[#d0e0f0] p-4 rounded-md">
              <p className="text-center text-gray-500 text-xs">Relatórios em desenvolvimento</p>
            </div>
          </TabsContent>
          
          <TabsContent value="certcli" className="mt-2 ml-2">
            <div className="bg-[#d0e0f0] p-4 rounded-md">
              <p className="text-center text-gray-500 text-xs">Certificados do cliente em desenvolvimento</p>
            </div>
          </TabsContent>
          
          <TabsContent value="cod" className="mt-2 ml-2">
            <div className="bg-[#d0e0f0] p-4 rounded-md">
              <p className="text-center text-gray-500 text-xs">Códigos em desenvolvimento</p>
            </div>
          </TabsContent>
          
          <TabsContent value="descricao" className="mt-2 ml-2">
            <div className="bg-[#d0e0f0] p-4 rounded-md">
              <p className="text-center text-gray-500 text-xs">Descrições em desenvolvimento</p>
            </div>
          </TabsContent>
          
          <TabsContent value="documento" className="mt-2 ml-2">
            <div className="bg-[#d0e0f0] p-4 rounded-md">
              <p className="text-center text-gray-500 text-xs">Documentos em desenvolvimento</p>
            </div>
          </TabsContent>
          
          <TabsContent value="area" className="mt-2 ml-2">
            <div className="bg-[#d0e0f0] p-4 rounded-md">
              <p className="text-center text-gray-500 text-xs">Áreas em desenvolvimento</p>
            </div>
          </TabsContent>
          
          <TabsContent value="emissao" className="mt-2 ml-2">
            <div className="bg-[#d0e0f0] p-4 rounded-md">
              <p className="text-center text-gray-500 text-xs">Emissão em desenvolvimento</p>
            </div>
          </TabsContent>
          
          <TabsContent value="vencim" className="mt-2 ml-2">
            <div className="bg-[#d0e0f0] p-4 rounded-md">
              <p className="text-center text-gray-500 text-xs">Vencimento em desenvolvimento</p>
            </div>
          </TabsContent>
          
          <TabsContent value="renov" className="mt-2 ml-2">
            <div className="bg-[#d0e0f0] p-4 rounded-md">
              <p className="text-center text-gray-500 text-xs">Renovação em desenvolvimento</p>
            </div>
          </TabsContent>
          
          <TabsContent value="periodicidade" className="mt-2 ml-2">
            <div className="bg-[#d0e0f0] p-4 rounded-md">
              <p className="text-center text-gray-500 text-xs">Periodicidade em desenvolvimento</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}