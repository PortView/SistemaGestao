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
    <Card className="bg-[#d0e0f0] border-none shadow-md">
      <CardContent className="p-4">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-blue-600">
              <TableRow>
                <TableHead className="text-white font-semibold text-sm">Analista</TableHead>
                <TableHead className="text-white font-semibold text-sm">Dt.Tarefa</TableHead>
                <TableHead className="text-white font-semibold text-sm w-10">OK</TableHead>
                <TableHead className="text-white font-semibold text-sm">Desc.Tarefa</TableHead>
                <TableHead className="text-white font-semibold text-sm">Evento</TableHead>
                <TableHead className="text-white font-semibold text-sm">H.Tram</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!selectedService && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    Selecione um serviço para visualizar as tarefas.
                  </TableCell>
                </TableRow>
              )}
              
              {selectedService && tasks.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    Nenhuma tarefa encontrada para este serviço.
                  </TableCell>
                </TableRow>
              )}
              
              {selectedService && isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    Carregando tarefas...
                  </TableCell>
                </TableRow>
              )}
              
              {tasks.map((task) => (
                <TableRow 
                  key={task.id}
                  className={`${task.concluida ? 'bg-gray-100' : ''} hover:bg-blue-50`}
                >
                  <TableCell className="text-sm">{task.analista}</TableCell>
                  <TableCell className="text-sm">{formatDate(new Date(task.dataTarefa))}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox checked={task.concluida} />
                  </TableCell>
                  <TableCell className="text-sm">{task.descricao}</TableCell>
                  <TableCell className="text-sm">{task.evento}</TableCell>
                  <TableCell className="text-sm">{task.horasTramitacao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}