import React from 'react';
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
  const formatToken = (token: string | null) => {
    if (!token) return 'Não disponível';
    return `${token.substring(0, 15)}...${token.substring(token.length - 5)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Parâmetros da API de Unidades</DialogTitle>
          <DialogDescription>
            Verifique se os parâmetros estão corretos antes de prosseguir com a requisição.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="font-semibold">Token:</div>
            <div className="font-mono text-xs truncate bg-slate-50 p-2 rounded">
              {formatToken(params.token)}
            </div>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="font-semibold">Código Coordenador:</div>
            <div className="font-mono text-xs bg-slate-50 p-2 rounded">
              {params.codcoor || 'Não disponível'}
            </div>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="font-semibold">Código Cliente:</div>
            <div className="font-mono text-xs bg-slate-50 p-2 rounded">
              {params.codcli || 'Não disponível'}
            </div>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="font-semibold">UF:</div>
            <div className="font-mono text-xs bg-slate-50 p-2 rounded">
              {params.uf || 'Não disponível'}
            </div>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="font-semibold">Página:</div>
            <div className="font-mono text-xs bg-slate-50 p-2 rounded">
              {params.page}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm}>Prosseguir com a requisição</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}