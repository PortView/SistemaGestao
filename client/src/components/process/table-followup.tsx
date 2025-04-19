
import { useEffect, useState } from 'react';
import { LOCAL_STORAGE_TOKEN_KEY } from '@/lib/constants';
import { ApiService } from '@/lib/api-service';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Interface para dados de tarefas retornados da API
interface TarefasData {
  id: number;
  analista: string;
  dataTarefa: string;
  concluida: boolean;
  desc_tarefa: string;
  evento: boolean;
  horas_tramitacao: number;
  horas_assessoria: number;
  medicao: boolean;
}

interface TableFollowupProps {
  codserv: number;
}

export function TableFollowup({ codserv }: TableFollowupProps) {
  // Estados para gerenciar dados e estado da UI
  const [data, setData] = useState<TarefasData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  // Log quando a prop codserv mudar
  useEffect(() => {
    console.log('TableFollowup: codserv prop mudou para:', codserv);
  }, [codserv]);

  // Efeito para buscar dados de tarefas quando o código de serviço muda
  useEffect(() => {
    // Resetar o estado de tentativa de busca quando o serviço muda
    setFetchAttempted(false);
    
    const fetchData = async () => {
      try {
        // Se não temos um codserv válido, não fazemos requisição
        if (!codserv || codserv <= 0) {
          console.log('TableFollowup: Código de serviço inválido, ignorando requisição:', codserv);
          setData([]);
          setLoading(false);
          return;
        }

        console.log('TableFollowup: Iniciando busca de dados para serviço ID:', codserv);
        setLoading(true);
        
        // Usar o token armazenado no localStorage
        const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);

        if (!token) {
          setError('Não autorizado: Token não encontrado');
          setLoading(false);
          return;
        }

        // Usar a URL da API de followup
        const apiUrl = import.meta.env.VITE_NEXT_PUBLIC_API_FOLLOWUP_URL;
        
        console.log('URL API Followup:', apiUrl);
        console.log('Buscando tarefas para o serviço ID:', codserv);
        
        if (!apiUrl) {
          setError('URL da API de tarefas não configurada');
          setLoading(false);
          return;
        }

        // Fazer a requisição usando ApiService - CORRIGIDO: Usando codccontra em vez de codserv
        const response = await ApiService.get<TarefasData[]>(
          `${apiUrl}?codccontra=${codserv}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            skipCache: true // Garantir dados frescos
          }
        );
        
        // Mesmo que a resposta seja um array vazio, marcar que a busca foi tentada
        setFetchAttempted(true);
        setData(response);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar tarefas:', err);
        setError('Erro ao carregar dados das tarefas');
        setFetchAttempted(true);
      } finally {
        setLoading(false);
      }
    };

    if (codserv > 0) {
      fetchData();
    } else {
      setData([]);
      setLoading(false);
    }
  }, [codserv]);

  // Renderização para estado de carregamento
  if (loading) {
    return (
      <Card className="p-4 bg-background shadow-md w-full h-[460px] overflow-hidden">
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-[320px] w-full" />
        </div>
      </Card>
    );
  }

  // Renderização para estado de erro
  if (error) {
    return (
      <Card className="p-4 bg-background shadow-md w-full h-[460px] overflow-hidden">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Card>
    );
  }

  // Renderização quando não há serviço selecionado
  if (!codserv || codserv <= 0) {
    return (
      <div className="p-4 bg-[#d0e0f0] backdrop-blur shadow-md w-full h-[460px] overflow-hidden flex items-center justify-center rounded-md">
        <p className="text-md text-zinc-900">
          Selecione um serviço para visualizar as tarefas.
        </p>
      </div>
    );
  }
  
  // Renderização quando buscamos tarefas mas não há dados
  if (fetchAttempted && data.length === 0) {
    return (
      <div className="p-4 bg-[#d0e0f0] backdrop-blur shadow-md w-full h-[460px] overflow-hidden flex items-center justify-center rounded-md">
        <p className="text-md text-zinc-900">
          Não foram encontradas tarefas para o serviço #{codserv}.
        </p>
      </div>
    );
  }

  // Função auxiliar para formatar datas
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateStr;
    }
  };

  // Definição das larguras das colunas
  const columnWidths = [
    150, // Analista
    100, // Dt.Tarefa
    30,  // Ok
    30,  // Med
    500, // Desc.Tarefa
    30,  // Evento
    60,  // H.Tram
    60,  // H.Ass
  ];

  // Renderização da tabela principal
  return (
    <div className="bg-[#d0e0f0] border-none shadow-md w-full h-[460px] rounded-sm">
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ 
          overflowX: 'auto', 
          overflowY: 'auto', 
          maxHeight: '460px', 
          position: 'relative', 
          WebkitOverflowScrolling: 'touch', 
          willChange: 'transform'
        }}>
          <div style={{ display: 'inline-block', minWidth: '100%', textAlign: 'center' }}>
            <div style={{ overflow: 'visible' }}>
              <div style={{ position: 'relative' }}>
                <table style={{ minWidth: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', width: 'max-content' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#c0c0c0', color: '#333', fontSize: '12px', fontWeight: 'bold' }}>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[0]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Analista</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[1]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Dt.Tarefa</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[2]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Ok</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[3]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Med</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[4]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Desc.Tarefa</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[5]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Evento</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[6]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>H.Tram.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[7]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>H.Ass.</th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: '#fff', opacity: 1, color: '#333' }}>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '20px 0', color: '#666' }}>
                          Não foram encontradas tarefas para este serviço
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => (
                        <tr 
                          key={index} 
                          style={{ 
                            fontSize: '12px', 
                            cursor: 'pointer', 
                            borderBottom: '1px solid #eee'
                          }}
                          className="hover:bg-slate-100"
                        >
                          <td style={{ width: `${columnWidths[0]}px`, padding: '4px 5px', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.analista}
                          </td>
                          <td style={{ width: `${columnWidths[1]}px`, padding: '4px 0', textAlign: 'center' }}>
                            {formatDate(item.dataTarefa)}
                          </td>
                          <td style={{ width: `${columnWidths[2]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <input type="checkbox" checked={item.concluida} readOnly />
                          </td>
                          <td style={{ width: `${columnWidths[3]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <input type="checkbox" checked={item.medicao} readOnly />
                          </td>
                          <td style={{ width: `${columnWidths[4]}px`, padding: '4px 5px', textAlign: 'left' }}>
                            {item.desc_tarefa}
                          </td>
                          <td style={{ width: `${columnWidths[5]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <input type="checkbox" checked={item.evento} readOnly />
                          </td>
                          <td style={{ width: `${columnWidths[6]}px`, padding: '4px 0', textAlign: 'center' }}>
                            {item.horas_tramitacao}
                          </td>
                          <td style={{ width: `${columnWidths[7]}px`, padding: '4px 0', textAlign: 'center' }}>
                            {item.horas_assessoria}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
