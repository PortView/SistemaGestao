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
      <Card className="border border-slate-200 h-[200px]">
        <CardContent className="p-4 flex flex-col justify-center items-center h-full">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 animate-pulse text-blue-500" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="h-[200px] flex items-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!codserv) {
    return (
      <Card className="border border-slate-200 h-[200px]">
        <CardContent className="p-4 flex justify-center items-center h-full">
          <p className="text-gray-500 text-sm">Selecione um serviço para visualizar as tarefas.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (data.length === 0) {
    return (
      <Card className="border border-slate-200 h-[200px]">
        <CardContent className="p-4 flex justify-center items-center h-full">
          <p className="text-gray-500 text-sm">Não foram encontradas tarefas para o serviço #{codserv}.</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className="border border-slate-200">
      <div className="w-full overflow-x-auto p-1">
        <Table>
          <TableHeader className="bg-[#c0c0c0]">
            <TableRow className="hover:bg-[#b0b0b0] text-xs font-medium text-gray-700">
              <TableHead className="text-left sticky top-0 z-10 w-[150px] p-1">Analista</TableHead>
              <TableHead className="text-center sticky top-0 z-10 w-[100px] p-1">Dt.Tarefa</TableHead>
              <TableHead className="text-center sticky top-0 z-10 w-[30px] p-1">Ok</TableHead>
              <TableHead className="text-center sticky top-0 z-10 w-[30px] p-1">Med</TableHead>
              <TableHead className="text-left sticky top-0 z-10 w-[500px] p-1">Desc.Tarefa</TableHead>
              <TableHead className="text-center sticky top-0 z-10 w-[30px] p-1">Evento</TableHead>
              <TableHead className="text-center sticky top-0 z-10 w-[60px] p-1">H.Tram.</TableHead>
              <TableHead className="text-center sticky top-0 z-10 w-[60px] p-1">H.Ass.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow 
                key={index} 
                className="text-xs border-b hover:bg-slate-50"
              >
                <TableCell className="p-1 text-left">{item.analista}</TableCell>
                <TableCell className="p-1 text-center">{formatDate(item.dttarefa)}</TableCell>
                <TableCell className="p-1 text-center">
                  <Checkbox checked={item.conclusao} disabled className="h-3 w-3 data-[disabled]:opacity-100" />
                </TableCell>
                <TableCell className="p-1 text-center">
                  <Checkbox checked={item.medicao} disabled className="h-3 w-3 data-[disabled]:opacity-100" />
                </TableCell>
                <TableCell className="p-1 text-left">{item.desctarefa}</TableCell>
                <TableCell className="p-1 text-center">
                  <Checkbox checked={item.evento} disabled className="h-3 w-3 data-[disabled]:opacity-100" />
                </TableCell>
                <TableCell className="p-1 text-center">{Number(item.tetramitacao)}</TableCell>
                <TableCell className="p-1 text-center">{Number(item.teassessoria)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}