import { useEffect, useState } from 'react';
import { LOCAL_STORAGE_TOKEN_KEY } from '@/lib/constants';
import { ApiService } from '@/lib/api-service';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
  const [data, setData] = useState<ServicosData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Função para buscar dados da API
  const fetchData = async () => {
    // Se não tivermos contrato ou unidade selecionados, não fazemos a requisição
    if (!qcontrato || !qUnidade) {
      console.log('TableServicos: Contrato ou unidade não selecionados, cancelando busca');
      setLoading(false);
      setData([]);
      setSelectedRow(null); // Limpar a seleção quando a unidade muda
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSelectedRow(null); // Limpar a seleção quando a unidade muda
      
      // Obter o token do localStorage
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);

      // Obter valores do localStorage para qCodServ, qStatus e qDtlimite
      const storedCodServ = localStorage.getItem("v_codServ") || "-1";
      const storedStatus = localStorage.getItem("v_status") || "ALL";
      const storedDtLimite = localStorage.getItem("v_dtLimite") || "2001-01-01";

      if (!token) {
        setError('Não autorizado: Token não encontrado');
        setLoading(false);
        return;
      }

      console.log('TableServicos: Buscando serviços com parâmetros:', {
        qcodCoor, 
        qcontrato, 
        qUnidade, 
        qConcluido,
        codServ: storedCodServ, 
        status: storedStatus, 
        dtLimite: storedDtLimite
      });

      // Construir a URL com os parâmetros do localStorage
      const apiUrl = import.meta.env.VITE_NEXT_PUBLIC_API_SERVICOS_URL || 'https://amenirealestate.com.br:5601/ger-clientes/servicos';
      const url = `${apiUrl}?qcodCoor=${qcodCoor}&qcontrato=${qcontrato}&qUnidade=${qUnidade}&qConcluido=${qConcluido}&qCodServ=${storedCodServ}&qStatus=${storedStatus}&qDtlimite=${storedDtLimite}`;
      
      // Usar o ApiService para fazer a requisição (já configurado para adicionar o token)
      const response = await ApiService.get<ServicosData[]>(url, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        skipCache: true  // Sempre buscar dados frescos
      });

      if (Array.isArray(response)) {
        setData(response);
        
        // Extrair valores únicos para codServ, mStatus e dtLimite
        if (response.length > 0) {
          // Extrair codServ únicos
          const uniqueCodServs = [...new Set(response.map(item => item.codServ))];
          localStorage.setItem("v_codServ_list", JSON.stringify(uniqueCodServs));
          console.log("Lista de códigos de serviço únicos armazenada:", uniqueCodServs);
          
          // Extrair mStatus únicos
          const uniqueStatuses = [...new Set(response.map(item => item.mStatus))];
          localStorage.setItem("v_status_list", JSON.stringify(uniqueStatuses));
          console.log("Lista de status únicos armazenada:", uniqueStatuses);
          
          // Extrair dtLimite únicos (formato original)
          const uniqueDates = [...new Set(response.map(item => item.dtLimite))]
            .filter(date => date !== null && date !== undefined);
          localStorage.setItem("v_dtLimite_list", JSON.stringify(uniqueDates));
          console.log("Lista de datas limite únicas armazenada:", uniqueDates);
          
          // Se temos dados e uma função de callback, selecionamos o primeiro item
          if (onSelectServico) {
            const firstItem = response[0];
            setSelectedRow(firstItem.codccontra);
            onSelectServico(firstItem.codccontra);
          }
        }
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

  // Efeito para carregar dados sempre que as props mudarem
  useEffect(() => {
    fetchData();
  }, [qcodCoor, qcontrato, qUnidade, qConcluido]);
  
  // Efeito para ouvir o evento de atualização de filtros
  useEffect(() => {
    const handleFiltersUpdated = () => {
      console.log('TableServicos: Evento filters-updated recebido, recarregando dados');
      fetchData();
    };
    
    window.addEventListener('filters-updated', handleFiltersUpdated);
    
    return () => {
      window.removeEventListener('filters-updated', handleFiltersUpdated);
    };
  }, [qcodCoor, qcontrato, qUnidade, qConcluido]);

  // Renderiza um estado de carregamento
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

  // Renderiza um estado de erro
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

  // Quando não temos unidade ou contrato selecionados
  if (!qcontrato || !qUnidade) {
    return (
      <div className="p-4 bg-[#d0e0f0] backdrop-blur shadow-md w-full h-[460px] overflow-hidden flex items-center justify-center rounded-md">
        <p className="text-md text-zinc-900">
          Selecione um cliente e uma unidade para visualizar os serviços
        </p>
      </div>
    );
  }

  // Função para formatar a data
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateStr;
    }
  };
  
  // Função para lidar com o clique na linha
  const handleRowClick = (codServ: number) => {
    console.log('TableServicos: Linha clicada, serviço ID:', codServ);
    setSelectedRow(codServ);
    if (onSelectServico) {
      onSelectServico(codServ);
    }
  };

  // Definição das larguras das colunas
  const columnWidths = [
    60, // Codcconta
    60,  // Cod. Serv.
    350, // Desc. Serv.
    26,  // Ok
    26,  // Os
    30,  // Resc.
    30,  // Pdc
    40,  // Susp.
    36,  // Doc.I.
    36,  // Novo
    40,  // Ocorr.
    150, // Status
    40,  // Dt.Limite
    80,  // Valserv
    60,  // H.Tramitação
    60,  // H. Ass.
    400, // Obs.Serv.
    400, // Obs.Resc.
  ];

  return (
    // <Card className="bg-background shadow-md w-full h-[460px] overflow-hidden">
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
                          onClick={() => handleRowClick(item.codccontra)}
                        >
                          <td className='hidden' style={{ width: `${columnWidths[0]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: selectedRow === item.codccontra ? '#e6f7ff' : '#fff' }}>
                            <div style={{ width: '100%', textAlign: 'center' }}>{item.codccontra}</div></td>
                            
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