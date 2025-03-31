
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function VerificationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      checkApiResults();
    }
  }, [open]);

  const checkApiResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('siscop_token');
      const userData = localStorage.getItem('siscop_user');
      
      if (!token || !userData) {
        throw new Error('Token ou dados do usuário não encontrados');
      }
      
      const { cod } = JSON.parse(userData);
      const apiUrl = import.meta.env.VITE_NEXT_PUBLIC_API_CLIENTES_URL;
      
      const response = await fetch(`${apiUrl}?codcorr=${cod}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados da API');
      }
      
      const data = await response.json();
      setClientCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Verificação da API</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {loading && <p>Carregando...</p>}
          {error && <p className="text-red-400">Erro: {error}</p>}
          {clientCount !== null && !loading && !error && (
            <p>Quantidade de clientes encontrados: {clientCount}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
