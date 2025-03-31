
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
      const userDataStr = localStorage.getItem('siscop_user');
      
      if (!token) {
        throw new Error('Token não encontrado. Por favor, faça login novamente.');
      }

      if (!userDataStr) {
        throw new Error('Dados do usuário não encontrados. Por favor, faça login novamente.');
      }

      let userData;
      try {
        userData = JSON.parse(userDataStr);
      } catch (e) {
        throw new Error('Erro ao processar dados do usuário. Por favor, faça login novamente.');
      }

      if (!userData?.cod) {
        throw new Error('Código do usuário não encontrado. Por favor, faça login novamente.');
      }

      const apiUrl = import.meta.env.VITE_NEXT_PUBLIC_API_CLIENTES_URL;
      if (!apiUrl) {
        throw new Error('URL da API não configurada corretamente.');
      }

      console.log('Fazendo requisição para:', `${apiUrl}?codcorr=${userData.cod}`);
      console.log('Token:', token);
      console.log('Código do usuário:', userData.cod);
      
      const response = await fetch(`${apiUrl}?codcorr=${userData.cod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Resposta da API:', data);
      setClientCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error('Erro na verificação:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao acessar a API');
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
          {error && (
            <div className="text-red-400 mb-2">
              <p>Erro: {error}</p>
            </div>
          )}
          {clientCount !== null && !loading && !error && (
            <p>Quantidade de clientes encontrados: {clientCount}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
