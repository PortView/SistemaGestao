import { useEffect, useState } from 'react';
import { ApiService } from '@/lib/api-service';
import { LOCAL_STORAGE_TOKEN_KEY } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock } from 'lucide-react';

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

  // Log quando a prop codserv mudar
  useEffect(() => {
    console.log('TableFollowup: codserv prop mudou para:', codserv);
  }, [codserv]);

  useEffect(() => {
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

        // Fazer a requisição usando ApiService
        const response = await ApiService.get<TarefasData[]>(
          `${apiUrl}?codserv=${codserv}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            skipCache: true // Garantir dados frescos
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
      <Card className="p-4 bg-background shadow-md w-full h-[460px] overflow-hidden">
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-[320px] w-full" />
        </div>
      </Card>
    );
  }

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

  if (!codserv) {
    return (
      <Card className="p-4 bg-background shadow-md w-full h-[460px] overflow-hidden flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Selecione um serviço para visualizar as tarefas
        </p>
      </Card>
    );
  }
  
  if (data.length === 0) {
    return (
      <Card className="p-4 bg-background shadow-md w-full h-[460px] overflow-hidden flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Não foram encontradas tarefas para o serviço #{codserv}
        </p>
      </Card>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
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

  return (
    // <Card className="p-0 bg-background shadow-md w-full overflow-hidden">
      <div className="bg-[#d0e0f0] border-none shadow-md w-full h-[460px] rounded-sm">
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '460px', position: 'relative', WebkitOverflowScrolling: 'touch', willChange: 'transform' }}>
        <div style={{ display: 'inline-block', minWidth: '100%', textAlign: 'center' }}>
          <div style={{ overflow: 'visible' }}>
            <div style={{ position: 'relative' }}>
              <table style={{ minWidth: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', width: 'max-content' }}>
                <thead>
                  <tr style={{ backgroundColor: '#c0c0c0', opacity: 1, color: '#333', fontSize: '12px', fontWeight: 'bold' }}>
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
                        <td style={{ width: `${columnWidths[0]}px`, zIndex: 150, padding: '4px 0', textAlign: 'left', backgroundColor: '#fff' }}>
                          <div style={{ width: '100%', textAlign: 'left', padding: '0 4px' }}>{item.analista}</div>
                        </td>
                        <td style={{ width: `${columnWidths[1]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}>
                          <div style={{ width: '100%', textAlign: 'center' }}>{formatDate(item.dttarefa)}</div>
                        </td>
                        <td style={{ width: `${columnWidths[2]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Checkbox checked={item.conclusao} disabled className="h-3 w-3 data-[disabled]:opacity-100" />
                          </div>
                        </td>
                        <td style={{ width: `${columnWidths[3]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Checkbox checked={item.medicao} disabled className="h-3 w-3 data-[disabled]:opacity-100" />
                          </div>
                        </td>
                        <td style={{ width: `${columnWidths[4]}px`, zIndex: 150, padding: '4px 0', textAlign: 'left', backgroundColor: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          <div style={{ width: '100%', textAlign: 'left', padding: '0 4px' }}>{item.desctarefa}</div>
                        </td>
                        <td style={{ width: `${columnWidths[5]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Checkbox checked={item.evento} disabled className="h-3 w-3 data-[disabled]:opacity-100" />
                          </div>
                        </td>
                        <td style={{ width: `${columnWidths[6]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}>
                          <div style={{ width: '100%', textAlign: 'center' }}>{Number(item.tetramitacao)}</div>
                        </td>
                        <td style={{ width: `${columnWidths[7]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}>
                          <div style={{ width: '100%', textAlign: 'center' }}>{Number(item.teassessoria)}</div>
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
  );
}