import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ApiParamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  params: {
    token: string | null;
    codcoor: number | null;
    codcli: number | null;
    uf: string | null;
    page: number;
  };
}

export function ApiParamDialog({ isOpen, onClose, onConfirm, params }: ApiParamDialogProps) {
  // Use estado local para garantir que os parâmetros sejam exibidos corretamente
  const [localParams, setLocalParams] = useState(params);
  
  // Atualizar o estado local quando os parâmetros mudarem ou o diálogo abrir
  useEffect(() => {
    if (isOpen) {
      console.log('Diálogo aberto com parâmetros:', params);
      setLocalParams(params);
    }
  }, [isOpen, params]);
  
  // Função para formatar o token
  const formatToken = (token: string | null) => {
    if (!token) return 'Não disponível';
    if (token === 'não disponível') return 'Não disponível';
    
    // Verificar se o token é longo o suficiente para truncar
    if (token.length < 25) return token;
    
    return `${token.substring(0, 15)}...${token.substring(token.length - 5)}`;
  };

  // Função para obter URL completa da API
  const getApiUrl = () => {
    if (!localParams.codcoor || !localParams.codcli || !localParams.uf) {
      return 'Parâmetros incompletos';
    }
    
    return `https://amenirealestate.com.br:5601/ger-clientes/unidades?codcoor=${localParams.codcoor}&codcli=${localParams.codcli}&uf=${localParams.uf}&page=${localParams.page || 1}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Parâmetros da API de Unidades</DialogTitle>
          <DialogDescription className="text-slate-400">
            Verifique se os parâmetros estão corretos antes de prosseguir com a requisição.
          </DialogDescription>
        </DialogHeader>
        
        {/* Exibir URL completa da requisição */}
        <div className="mt-2 rounded-md bg-blue-900 p-3 font-mono text-xs text-blue-200 overflow-x-auto">
          <span className="font-semibold">URL completa: </span>
          <span className="whitespace-nowrap">{getApiUrl()}</span>
        </div>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="font-semibold text-white">Token:</div>
            <div className="font-mono text-xs truncate bg-slate-800 p-2 rounded border border-slate-700 text-slate-300">
              {formatToken(localParams.token)}
            </div>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="font-semibold text-white">Código Coordenador:</div>
            <div className="font-mono text-xs bg-slate-800 p-2 rounded border border-slate-700 text-slate-300">
              {localParams.codcoor || 'Não disponível'}
            </div>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="font-semibold text-white">Código Cliente:</div>
            <div className="font-mono text-xs bg-slate-800 p-2 rounded border border-slate-700 text-slate-300">
              {localParams.codcli || 'Não disponível'}
            </div>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="font-semibold text-white">UF:</div>
            <div className="font-mono text-xs bg-slate-800 p-2 rounded border border-slate-700 text-slate-300">
              {localParams.uf || 'Não disponível'}
            </div>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="font-semibold text-white">Página:</div>
            <div className="font-mono text-xs bg-slate-800 p-2 rounded border border-slate-700 text-slate-300">
              {localParams.page}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-slate-800 text-white hover:bg-slate-700 border-slate-600">
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
            Prosseguir com a requisição
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}