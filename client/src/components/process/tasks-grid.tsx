import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { SiscopServico } from '@/lib/types';
import { formatDate } from '@/lib/types';

// Mock interface para as tarefas, já que não foi definido no types.ts
interface SiscopTarefa {
  id: number;
  analista: string;
  dataTarefa: string;
  descricao: string;
  evento: string;
  horasTramitacao: number;
  concluida: boolean;
}

interface TasksGridProps {
  selectedService: SiscopServico | null;
}

export function TasksGrid({ selectedService }: TasksGridProps) {
  // Fetch tasks for selected service
  const { data: tasks = [], isLoading } = useQuery<SiscopTarefa[]>({
    queryKey: ['/api/tarefas', selectedService?.codccontra, selectedService?.codServ],
    enabled: !!selectedService,
  });
  
  return (
    <Card className="bg-[#d0e0f0] border-none shadow-md w-full h-full">
      <CardContent className="p-2">
        <div className="rounded-md border overflow-hidden h-[445px]">
          <Table>
            <TableHeader className="bg-blue-600 sticky top-0">
              <TableRow>
                <TableHead className="text-white font-semibold text-xs py-1 w-24">Analista</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-20">Dt.Tarefa</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-8">OK</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1">Desc.Tarefa</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-24">Evento</TableHead>
                <TableHead className="text-white font-semibold text-xs py-1 w-16">H.Tram</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedService && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-2 text-gray-500 text-xs">
                    Selecione um serviço para visualizar as tarefas.
                  </TableCell>
                </TableRow>
              )}
              
              {selectedService && tasks.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-2 text-gray-500 text-xs">
                    Nenhuma tarefa encontrada para este serviço.
                  </TableCell>
                </TableRow>
              )}
              
              {selectedService && isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-2 text-gray-500 text-xs">
                    Carregando tarefas...
                  </TableCell>
                </TableRow>
              )}
              
              {tasks.map((task) => (
                <TableRow 
                  key={task.id}
                  className={`${task.concluida ? 'bg-gray-100' : ''} hover:bg-blue-50`}
                >
                  <TableCell className="text-xs py-1">{task.analista}</TableCell>
                  <TableCell className="text-xs py-1">{formatDate(new Date(task.dataTarefa))}</TableCell>
                  <TableCell className="text-center py-1">
                    <Checkbox checked={task.concluida} className="h-3 w-3" />
                  </TableCell>
                  <TableCell className="text-xs py-1">{task.descricao}</TableCell>
                  <TableCell className="text-xs py-1">{task.evento}</TableCell>
                  <TableCell className="text-xs py-1">{task.horasTramitacao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}