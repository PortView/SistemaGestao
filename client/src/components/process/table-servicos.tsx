import React, { useEffect, useState, useRef } from 'react';
import { LOCAL_STORAGE_TOKEN_KEY } from '@/lib/constants';
import { ApiService } from '@/lib/api-service';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * Interface para os dados de serviços retornados da API
 */
interface ServicosData {
  codccontra: number;
  codServ: number;
  descserv: string;
  concluido: boolean;
  filtroOs: boolean;
  rescisao: boolean;
  qtdPende: number;
  suspenso: boolean;
  estadoOk: boolean;
  novo: boolean;
  teventserv: boolean;
  mStatus: string;
  dtLimite: string;
  valserv: number;
  horasassessoria: number;
  horastramitacao: number;
  obsServ: string;
  obsResc: string;
}

/**
 * Interface para as props do componente TableServicos
 */
interface TableServicosProps {
  qcodCoor: number;
  qcontrato: number | null;
  qUnidade: number | null;
  qConcluido: boolean;
  qCodServ: number;
  qStatus: string;
  qDtlimite: string;
  onSelectServico?: (codServ: number) => void;
}

export function TableServicos({ 
  qcodCoor, 
  qcontrato, 
  qUnidade, 
  qConcluido, 
  qCodServ, 
  qStatus, 
  qDtlimite,
  onSelectServico
}: TableServicosProps) {
  // Estados principais
  const [data, setData] = useState<ServicosData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Estados de filtros
  const [codServ, setCodServ] = useState<string>("-1");
  const [status, setStatus] = useState<string>("ALL");
  const [dtLimite, setDtLimite] = useState<string>("ALL");
  const [concluido, setConcluido] = useState<boolean>(true);

  // Controle de renderização e seleção
  const [dataInitialized, setDataInitialized] = useState(false);
  const initialAutoSelectDone = useRef(false);
  const previousParams = useRef<string>("");
  const isInitialLoad = useRef(true);
  const isProcessingUnitSelection = useRef(false);

  /**
   * Função para buscar dados da API com verificações adequadas
   */
  const fetchData = async () => {
    // Verificação de pré-requisitos para evitar chamadas desnecessárias
    if (!qcontrato || !qUnidade) {
      console.log('TableServicos: Contrato ou unidade não selecionados, cancelando busca');
      setLoading(false);
      setData([]);
      setSelectedRow(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obter o token do localStorage
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (!token) {
        setError('Não autorizado: Token não encontrado');
        setLoading(false);
        return;
      }

      // Logging de parâmetros para diagnóstico
      console.log('TableServicos: Buscando serviços com parâmetros:', {
        qcodCoor, 
        qcontrato, 
        qUnidade, 
        qConcluido: concluido,
        codServ, 
        status, 
        dtLimite
      });

      // Construir a URL com os parâmetros
      const apiUrl = import.meta.env.VITE_NEXT_PUBLIC_API_SERVICOS_URL || 'https://amenirealestate.com.br:5601/ger-clientes/servicos';
      const url = `${apiUrl}?qcodCoor=${qcodCoor}&qcontrato=${qcontrato}&qUnidade=${qUnidade}&qConcluido=${concluido}&qCodServ=${codServ}&qStatus=${status}&qDtlimite=${dtLimite}`;

      // Usar o ApiService para fazer a requisição
      const response = await ApiService.get<ServicosData[]>(url, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        skipCache: true
      });

      // Verificar e processar a resposta
      if (Array.isArray(response)) {
        setData(response);
        setDataInitialized(true);

        // Processar dados para localStorage e filtros
        processServiceData(response);
      } else {
        console.error('Resposta da API não é um array:', response);
        setData([]);
      }
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do serviço');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Processa os dados de serviço para extrair valores únicos para filtros
   */
  const processServiceData = (services: ServicosData[]) => {
    if (services.length === 0) return;

    // Extrair valores únicos para os filtros
    const uniqueCodServs = [...new Set(services.map(s => s.codServ))];
    const uniqueStatus = [...new Set(services.map(s => s.mStatus))];
    const uniqueDtLimites = [...new Set(services.map(s => s.dtLimite).filter(Boolean))];

    // Atualizar o localStorage com esses valores
    localStorage.setItem("v_codServ_list", JSON.stringify(uniqueCodServs));
    localStorage.setItem("v_status_list", JSON.stringify(uniqueStatus));
    localStorage.setItem("v_dtLimite_list", JSON.stringify(uniqueDtLimites));

    console.log("TableServicos: Listas de valores únicos atualizadas no localStorage");

    // Notificar que os filtros foram atualizados
    window.dispatchEvent(new CustomEvent("filters-updated"));
  };

  /**
   * Efeito para buscar dados quando os parâmetros relevantes mudam
   */
  useEffect(() => {
    // Criar uma string de dependências para comparar mudanças reais
    const currentParams = `${qcodCoor}-${qcontrato}-${qUnidade}-${concluido}-${codServ}-${status}-${dtLimite}`;

    // Evitar chamadas duplicadas e execuções desnecessárias
    if (previousParams.current !== currentParams) {
      previousParams.current = currentParams;

      // Se for a carga inicial ou mudança de unidade, resetar controles
      if (isInitialLoad.current || isProcessingUnitSelection.current) {
        initialAutoSelectDone.current = false;
        isInitialLoad.current = false;
      }

      fetchData();
    }
  }, [qcodCoor, qcontrato, qUnidade, concluido, codServ, status, dtLimite]);

  /**
   * Efeito para selecionar automaticamente o primeiro serviço quando os dados são carregados
   * Este efeito é separado para maior controle e evitar loop infinito
   */
  useEffect(() => {
    if (
      data.length > 0 && 
      onSelectServico && 
      !initialAutoSelectDone.current && 
      !loading && 
      dataInitialized
    ) {
      // Marcar que já realizamos a seleção automática
      initialAutoSelectDone.current = true;

      // Selecionar o primeiro serviço da lista
      const firstService = data[0];
      console.log('TableServicos: Selecionando automaticamente o primeiro serviço:', firstService.codServ);
      setSelectedRow(firstService.codccontra);
      onSelectServico(firstService.codServ);
    }
  }, [data, loading, dataInitialized, onSelectServico]);

  /**
   * Efeito para configurar os handlers dos eventos de filtros e seleção de unidade
   */
  useEffect(() => {
    const handleApplyFilters = (event: CustomEvent) => {
      console.log("TableServicos: Evento apply-filters recebido com detalhes:", event.detail);

      const { qCodServ, qStatus, qDtlimite, qConcluido } = event.detail;

      // Resetar o estado de seleção
      setSelectedRow(null);
      initialAutoSelectDone.current = false;

      // Atualizar filtros
      setCodServ(qCodServ);
      setStatus(qStatus);
      setDtLimite(qDtlimite);
      setConcluido(qConcluido);
    };

    const handleUnitSelected = () => {
      console.log("TableServicos: Evento unit-selected recebido");

      // Marcar que estamos processando uma seleção de unidade
      isProcessingUnitSelection.current = true;

      // Resetar a seleção e filtros
      setSelectedRow(null);
      initialAutoSelectDone.current = false;

      setCodServ("-1");
      setStatus("ALL");
      setDtLimite("ALL");
      setConcluido(true);

      // Desmarcar depois de um timeout para permitir o processamento completo
      setTimeout(() => {
        isProcessingUnitSelection.current = false;
      }, 300);
    };

    // Registrar eventos
    window.addEventListener('apply-filters', handleApplyFilters as EventListener);
    window.addEventListener('unit-selected', handleUnitSelected as EventListener);

    // Limpar eventos quando o componente for desmontado
    return () => {
      window.removeEventListener('apply-filters', handleApplyFilters as EventListener);
      window.removeEventListener('unit-selected', handleUnitSelected as EventListener);
    };
  }, []);

  /**
   * Handler para clique na linha
   */
  const handleRowClick = (codccontra: number, codServ: number) => {
    // Evitar seleção duplicada
    if (selectedRow === codccontra) return;

    console.log('TableServicos: Linha clicada, contrato-serviço ID:', codccontra, 'Serviço ID:', codServ);
    setSelectedRow(codccontra);

    // Marcar que já realizamos a seleção
    initialAutoSelectDone.current = true;

    if (onSelectServico) {
      // Passamos o codccontra para o TableFollowup, que é o código usado na API de tarefas
      onSelectServico(codccontra);
    }
  };

  /**
   * Função auxiliar para formatar datas
   */
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateStr;
    }
  };

  // Renderização para estado de carregamento
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

  // Renderização quando não temos contrato ou unidade selecionados
  if (!qcontrato || !qUnidade) {
    return (
      <div className="p-4 bg-[#d0e0f0] backdrop-blur shadow-md w-full h-[460px] overflow-hidden flex items-center justify-center rounded-md">
        <p className="text-md text-zinc-900">
          Selecione um cliente e uma unidade para visualizar os serviços
        </p>
      </div>
    );
  }

  // Definição das larguras das colunas
  const columnWidths = [
    60, 60, 350, 26, 26, 30, 30, 40, 36, 36, 40, 150, 40, 80, 60, 60, 400, 400, 
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
                      <th className='hidden' style={{ position: 'sticky', top: 0, width: `${columnWidths[0]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Código.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[1]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Cod.Serv.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[2]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Desc.Serv.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[3]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Ok</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[4]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Os</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[5]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Res</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[6]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Pdc</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[7]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Sus</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[8]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Doc.I</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[9]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Novo</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[10]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Ocorr.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[11]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Status</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[12]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Dt.Limite</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[13]}px`, zIndex: 10, padding: '8px 0', textAlign: 'right', backgroundColor: '#c0c0c0' }}>Val.Serv.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[14]}px`, zIndex: 10, padding: '8px 0', textAlign: 'right', backgroundColor: '#c0c0c0' }}>H.Tram.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[15]}px`, zIndex: 10, padding: '8px 0', textAlign: 'right', backgroundColor: '#c0c0c0' }}>H.Ass.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[16]}px`, zIndex: 10, padding: '8px 10px', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Obs.Serviço</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[17]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Obs.Rescisão</th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: '#fff', color: '#333' }}>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={18} style={{ textAlign: 'center', padding: '20px 0', color: '#666' }}>
                          Não foram encontrados serviços para esta unidade
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => (
                        <tr 
                          key={index} 
                          style={{ 
                            fontSize: '12px', 
                            cursor: 'pointer', 
                            borderBottom: '1px solid #eee',
                            backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff'
                          }} 
                          className="hover:bg-slate-100"
                          onClick={() => handleRowClick(item.codccontra, item.codServ)}
                        >
                          <td className='hidden' style={{ width: `${columnWidths[0]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <div style={{ width: '100%', textAlign: 'center' }}>{item.codccontra}</div>
                          </td>
                          <td style={{ width: `${columnWidths[1]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <div style={{ width: '100%', textAlign: 'center' }}>{item.codServ}</div>
                          </td>
                          <td style={{ width: `${columnWidths[2]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <div style={{ width: '100%', textAlign: 'left' }}>{item.descserv}</div>
                          </td>
                          <td style={{ width: `${columnWidths[3]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.concluido} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[4]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.filtroOs} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[5]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.rescisao} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[6]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <div style={{ width: '100%', textAlign: 'center' }}>{Number(item.qtdPende)}</div>
                          </td>
                          <td style={{ width: `${columnWidths[7]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.suspenso} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[8]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.estadoOk} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[9]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.novo} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[10]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <input style={{ width: '100%' }} type="checkbox" checked={item.teventserv} readOnly onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td style={{ width: `${columnWidths[11]}px`, zIndex: 150, padding: '4px 0', textAlign: 'left', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <div style={{ width: '100%', textAlign: 'left' }}>{item.mStatus}</div>
                          </td>
                          <td style={{ width: `${columnWidths[12]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <div style={{ width: '100%', textAlign: 'center' }}>{formatDate(item.dtLimite)}</div>
                          </td>
                          <td style={{ width: `${columnWidths[13]}px`, zIndex: 150, padding: '4px 0', textAlign: 'right', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <div style={{ width: '100%', textAlign: 'right' }}>{Number(item.valserv).toFixed(2)}</div>
                          </td>
                          <td style={{ width: `${columnWidths[14]}px`, zIndex: 150, padding: '4px 0', textAlign: 'right', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <div style={{ width: '100%', textAlign: 'right' }}>{Number(item.horastramitacao)}</div>
                          </td>
                          <td style={{ width: `${columnWidths[15]}px`, zIndex: 150, padding: '4px 0', textAlign: 'right', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <div style={{ width: '100%', textAlign: 'right' }}>{Number(item.horasassessoria)}</div>
                          </td>
                          <td style={{ width: `${columnWidths[16]}px`, zIndex: 150, padding: '4px 10px', textAlign: 'left', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>{item.obsServ}</td>
                          <td style={{ width: `${columnWidths[17]}px`, zIndex: 150, padding: '4px 10px', textAlign: 'left', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>{item.obsResc}</td>
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