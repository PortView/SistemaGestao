import { useEffect, useState } from 'react';
import { ApiService } from '@/lib/api-service';
import { LOCAL_STORAGE_TOKEN_KEY } from '@/lib/constants';

interface TarefasData {
  analista: string;
  dttarefa: string;
  conclusao: boolean;
  medicao: boolean;
  desctarefa: string;
  evento: boolean;
  tetramitacao: number;
  teassessoria: number;
}

interface TableFollowupProps {
  codserv: number;
}

export function TableFollowup({ codserv }: TableFollowupProps) {
  const [data, setData] = useState<TarefasData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Usar o token armazenado no localStorage
        const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);

        if (!token) {
          setError('Não autorizado: Token não encontrado');
          setLoading(false);
          return;
        }

        // Usar a URL da API de followup
        const apiUrl = process.env.NEXT_PUBLIC_API_FOLLOWUP_URL || 
                      import.meta.env.VITE_NEXT_PUBLIC_API_FOLLOWUP_URL;
        
        if (!apiUrl) {
          setError('URL da API de tarefas não configurada');
          setLoading(false);
          return;
        }

        // Fazer a requisição usando ApiService
        const response = await ApiService.get<TarefasData[]>(
          `${apiUrl}?codserv=${codserv}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setData(response);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar tarefas:', err);
        setError('Erro ao carregar dados das tarefas');
        setLoading(false);
      }
    };

    if (codserv > 0) {
      setLoading(true);
      fetchData();
    } else {
      setData([]);
      setLoading(false);
    }
  }, [codserv]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!codserv || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="text-gray-500 text-sm">Selecione um serviço para visualizar as tarefas.</div>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse bg-white">
        <thead>
          <tr className="bg-[#c0c0c0] text-xs font-medium text-gray-700">
            <th className="px-2 py-1 text-left sticky top-0 z-10">Analista</th>
            <th className="px-2 py-1 text-center sticky top-0 z-10">Dt.Tarefa</th>
            <th className="px-2 py-1 text-center sticky top-0 z-10">Ok</th>
            <th className="px-2 py-1 text-center sticky top-0 z-10">Med</th>
            <th className="px-2 py-1 text-left sticky top-0 z-10">Desc.Tarefa</th>
            <th className="px-2 py-1 text-center sticky top-0 z-10">Evento</th>
            <th className="px-2 py-1 text-center sticky top-0 z-10">H.Tram.</th>
            <th className="px-2 py-1 text-center sticky top-0 z-10">H.Ass.</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={index} 
              className="text-xs border-b border-gray-200 hover:bg-gray-50"
            >
              <td className="px-2 py-1 text-left">{item.analista}</td>
              <td className="px-2 py-1 text-center">{formatDate(item.dttarefa)}</td>
              <td className="px-2 py-1 text-center">
                <input type="checkbox" checked={item.conclusao} readOnly className="h-3 w-3" />
              </td>
              <td className="px-2 py-1 text-center">
                <input type="checkbox" checked={item.medicao} readOnly className="h-3 w-3" />
              </td>
              <td className="px-2 py-1 text-left">{item.desctarefa}</td>
              <td className="px-2 py-1 text-center">
                <input type="checkbox" checked={item.evento} readOnly className="h-3 w-3" />
              </td>
              <td className="px-2 py-1 text-center">{Number(item.tetramitacao)}</td>
              <td className="px-2 py-1 text-center">{Number(item.teassessoria)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}