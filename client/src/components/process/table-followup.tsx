
import { useEffect, useState } from "react";
import { LOCAL_STORAGE_TOKEN_KEY } from "@/lib/constants";
import { ApiService } from "@/lib/api-service";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

/**
 * Interface para os dados de tarefas retornados da API
 */
interface TarefasData {
  codtarefa: number;
  codccontra: number;
  codserv: number;
  codcoor: number;
  coduser: number;
  nome: string;
  data: string;
  desctarefa: string;
  obscont: string;
  dtatendto: string;
  contconcluido: boolean;
  conclusaoTec: boolean;
  conclusaoAnalista: boolean;
  prioridade: number;
  horAtendto: string;
  formaPagto: string;
  ocorrencia: boolean;
  tpOcorr: string;
  lembrete: boolean;
  dtocorr: string;
  dtlimite: string;
  obsOcorr: string;
  teventarefa: boolean;
  nomemostrar: string;
  tramitacao: boolean;
  assessoria: boolean;
  tramitacaoCon: boolean;
  assessoriaCon: boolean;
}

/**
 * Props para o componente TableFollowup
 */
interface TableFollowupProps {
  codserv: number;
}

/**
 * Componente de tabela de acompanhamento que mostra as tarefas de um serviço
 */
export function TableFollowup({ codserv }: TableFollowupProps) {
  // Estados para gerenciar dados e estado da UI
  const [data, setData] = useState<TarefasData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [lastFetchedCode, setLastFetchedCode] = useState<number>(-1);

  // Efeito para buscar dados de tarefas quando o código de serviço muda
  useEffect(() => {
    console.log('TableFollowup: codserv prop mudou para:', codserv);
    
    // Evitamos refazer a busca se o código for o mesmo que já buscamos
    if (codserv === lastFetchedCode) {
      console.log('TableFollowup: Código já buscado, ignorando requisição duplicada');
      return;
    }
    
    // Resetar o estado de tentativa de busca quando o serviço muda
    setFetchAttempted(false);
    
    // Resetar o erro anterior
    setError(null);

    // Se não temos um codserv válido, não fazemos requisição
    if (!codserv || codserv <= 0) {
      console.log('TableFollowup: Código de serviço inválido, ignorando requisição:', codserv);
      setData([]);
      setLoading(false);
      return;
    }

    // Atualizar o código da última busca
    setLastFetchedCode(codserv);

    // Função assíncrona para buscar os dados
    const fetchTarefas = async () => {
      try {
        console.log('TableFollowup: Iniciando busca de dados para serviço ID:', codserv);
        setLoading(true);
        setFetchAttempted(true);

        // Obter o token do localStorage
        const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
        if (!token) {
          setError('Não autorizado: Token não encontrado');
          setLoading(false);
          return;
        }

        // Construir a URL para a API de tarefas
        const apiBaseUrl = import.meta.env.VITE_NEXT_PUBLIC_API_TAREFAS_URL || 'https://amenirealestate.com.br:5601/ger-clientes/tarefas';
        
        // Usando codserv como o parâmetro para a API (o valor é o mesmo de codccontra)
        const url = `${apiBaseUrl}?codserv=${codserv}`;
        console.log('URL API Followup:', apiBaseUrl);
        console.log('Buscando tarefas para o serviço ID (usando parameter codserv):', codserv);

        // Fazer a requisição via ApiService
        const response = await ApiService.get<TarefasData[]>(url, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          skipCache: true
        });

        // Verificar se a resposta é um array e atualizar os dados
        if (Array.isArray(response)) {
          setData(response);
        } else {
          console.error('Resposta da API não é um array:', response);
          setData([]);
        }
      } catch (err: any) {
        console.error('Erro ao carregar tarefas:', err);
        
        // Mensagem de erro mais informativa com base no tipo de erro
        if (err.name === 'AbortError') {
          setError('A requisição demorou muito e foi cancelada. Tente novamente mais tarde.');
        } else if (err.message && err.message.includes('Failed to fetch')) {
          setError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        } else if (err.message && err.message.includes('NetworkError')) {
          setError('Erro de rede ao tentar conectar com o servidor. Verifique sua conexão.');
        } else {
          setError('Falha ao carregar dados das tarefas: ' + (err.message || 'Erro desconhecido'));
        }
        
        // Em caso de erro, ainda definimos os dados como um array vazio para não quebrar a interface
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    // Executar a busca
    fetchTarefas();
  }, [codserv]);

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

  // Estado de carregamento
  if (loading) {
    return (
      <Card className="p-4 bg-background shadow-md w-full h-[460px] overflow-hidden">
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Card>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="p-4 bg-[#d0e0f0] backdrop-blur shadow-md w-full h-[460px] overflow-hidden rounded-md">
        <div className="flex flex-col items-center justify-center h-full">
          <Alert variant="destructive" className="max-w-[80%] mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <p className="text-sm text-gray-600 mt-4">
            A comunicação com o servidor de tarefas falhou. Os outros componentes do sistema continuam funcionando normalmente.
          </p>
          
          <Button 
            variant="default"
            size="sm"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setError(null);
              setLastFetchedCode(-1); // Reseta para forçar uma nova busca
              if (codserv) {
                // Isso dispara um novo efeito e tenta buscar os dados novamente
                const fetchTarefas = async () => {
                  setLoading(true);
                  try {
                    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
                    if (!token) {
                      throw new Error('Token não encontrado');
                    }
                    
                    const apiBaseUrl = import.meta.env.VITE_NEXT_PUBLIC_API_TAREFAS_URL || 
                      'https://amenirealestate.com.br:5601/ger-clientes/tarefas';
                      
                    const url = `${apiBaseUrl}?codserv=${codserv}`;
                    
                    const response = await ApiService.get<TarefasData[]>(url, {
                      headers: { Authorization: `Bearer ${token}` },
                      skipCache: true
                    });
                    
                    if (Array.isArray(response)) {
                      setData(response);
                    } else {
                      setData([]);
                    }
                    
                    setFetchAttempted(true);
                    setError(null);
                  } catch (err: any) {
                    console.error('Erro ao tentar novamente buscar tarefas:', err);
                    setError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
                    setData([]);
                  } finally {
                    setLoading(false);
                  }
                };
                
                fetchTarefas();
              }
            }}
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Se não temos um serviço selecionado
  if (!codserv || codserv <= 0) {
    return (
      <div className="p-4 bg-[#d0e0f0] backdrop-blur shadow-md w-full h-[460px] overflow-hidden flex items-center justify-center rounded-md">
        <p className="text-md text-zinc-900">
          Selecione um serviço para visualizar as tarefas
        </p>
      </div>
    );
  }

  // Se fizemos uma busca mas não encontramos dados
  if (fetchAttempted && data.length === 0) {
    return (
      <div className="p-4 bg-[#d0e0f0] backdrop-blur shadow-md w-full h-[460px] overflow-hidden flex items-center justify-center rounded-md">
        <p className="text-md text-zinc-900">
          Não foram encontradas tarefas para este serviço
        </p>
      </div>
    );
  }

  // Definição das larguras das colunas
  const columnWidths = [
    40, 60, 150, 80, 350, 80, 90, 26, 26, 26, 26, 26, 26, 26, 26, 400
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
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[0]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Cod.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[1]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Coor.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[2]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Usuário</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[3]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Data</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[4]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Desc.Tarefa</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[5]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Dt.Atend.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[6]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Hr.Atend.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[7]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Ok</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[8]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>T.O</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[9]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>A.O</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[10]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Trm</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[11]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Ass</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[12]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>T.OK</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[13]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>A.OK</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[14]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Ocorr.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[15]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Obs.Contato</th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: '#fff', color: '#333' }}>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={16} style={{ textAlign: 'center', padding: '20px 0', color: '#666' }}>
                          {fetchAttempted ? 'Não foram encontradas tarefas para este serviço' : 'Selecione um serviço para visualizar as tarefas'}
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
                          <td style={{ width: `${columnWidths[0]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <div style={{ width: '100%', textAlign: 'center' }}>{item.codtarefa}</div>
                          </td>
                          <td style={{ width: `${columnWidths[1]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <div style={{ width: '100%', textAlign: 'center' }}>{item.codcoor}</div>
                          </td>
                          <td style={{ width: `${columnWidths[2]}px`, padding: '4px 0', textAlign: 'left' }}>
                            <div style={{ width: '100%', textAlign: 'left' }}>{item.nome}</div>
                          </td>
                          <td style={{ width: `${columnWidths[3]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <div style={{ width: '100%', textAlign: 'center' }}>{formatDate(item.data)}</div>
                          </td>
                          <td style={{ width: `${columnWidths[4]}px`, padding: '4px 0', textAlign: 'left' }}>
                            <div style={{ width: '100%', textAlign: 'left' }}>{item.desctarefa}</div>
                          </td>
                          <td style={{ width: `${columnWidths[5]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <div style={{ width: '100%', textAlign: 'center' }}>{formatDate(item.dtatendto)}</div>
                          </td>
                          <td style={{ width: `${columnWidths[6]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <div style={{ width: '100%', textAlign: 'center' }}>{item.horAtendto}</div>
                          </td>
                          <td style={{ width: `${columnWidths[7]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.contconcluido} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[8]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.conclusaoTec} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[9]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.conclusaoAnalista} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[10]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.tramitacao} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[11]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.assessoria} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[12]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.tramitacaoCon} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[13]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.assessoriaCon} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[14]}px`, padding: '4px 0', textAlign: 'center' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.ocorrencia} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[15]}px`, padding: '4px 0', textAlign: 'left' }}>{item.obscont}</td>
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
