import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ApiService } from '@/lib/api-service';
import { LOCAL_STORAGE_TOKEN_KEY } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Clock } from 'lucide-react';

interface ConformidadeData {
  cod: number;
  codimov: number;
  codcfor: number;
  descr: string;
  doc: string;
  area: string;
  dt: string;
  dtvenc: string | null;
  providencia: string;
  quando: string | null;
  quem: string;
  grupo: string;
  atividade: string;
  finternet: boolean;
  frelatorio: boolean;
  dtrenov: string | null;
  vgraurisco: number;
  obs: string;
  flagtipopdf: boolean;
  gestaocli: boolean;
  periodicidade: string;
  docorig: string;
}

interface TableConformProps {
  codimov: number;
  web: boolean;
  relatorio: boolean;
  cnpj: string;
  temcnpj: boolean;
}

export default function TableConform({ codimov, web, relatorio, cnpj, temcnpj }: TableConformProps) {
  const [data, setData] = useState<ConformidadeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obter token do localStorage usando a constante apropriada
        const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);

        if (!token) {
          setError('Não autorizado: Token não encontrado');
          setLoading(false);
          return;
        }

        // Construir a URL com todos os parâmetros
        const url = `${import.meta.env.VITE_NEXT_PUBLIC_API_CONFORMIDADE_URL}?codimov=${codimov}&web=${web}&relatorio=${relatorio}&cnpj=${cnpj}&temcnpj=${temcnpj}`;
        
        console.log('Buscando conformidades com URL:', url);

        // Fazer a requisição usando o ApiService
        const response = await ApiService.get<ConformidadeData[]>(
          url, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            skipCache: true
          }
        );

        setData(response);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados da conformidade:', err);
        setError('Erro ao carregar dados da conformidade');
        setLoading(false);
      }
    };
    
    // Só fazer a requisição se tivermos o codimov
    if (codimov) {
      fetchData();
    } else {
      setData([]);
      setLoading(false);
    }
  }, [codimov, web, relatorio, cnpj, temcnpj]);

  if (loading) {
    return (
      <Card className="border border-slate-200 h-[400px]">
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
      <Alert variant="destructive" className="h-[400px] flex items-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!codimov) {
    return (
      <div className="p-4 bg-[#d0e0f0] backdrop-blur shadow-md w-full h-[460px] overflow-hidden flex items-center justify-center rounded-md">
        <p className="text-md text-zinc-900">Selecione uma unidade para visualizar os documentos de conformidade.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const columnWidths = [
    40,  // Web
    40,  // Rel.
    80,  // Gest.Cli.
    80,  // Cod.
    420, // Descrição
    40,  // PDF
    190, // Doc.
    100, // Área
    100, // Emissão
    100, // Vencim.
    100,  // Renov.
    2,    // Separador
    100,  // Periodicidade
    40,   // Peso
    100,  // Atividade
    300,  // Obs
    100,  // Dt.Prov.
    100,  // Grupo
    100,  // Compet.
    80,   // Doc.Orig.
  ];

  // Função para calcular a posição left correta
  const getLeftPosition = (index: number): number => {
    let position = 0;
    for (let i = 0; i < index; i++) {
      position += columnWidths[i];
    }
    return position;
  };

  return (
    <div style={{ width: '100%'}}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px', position: 'relative', WebkitOverflowScrolling: 'touch', willChange: 'transform' }}>
          <div style={{ display: 'inline-block', minWidth: '100%', textAlign: 'center' }}>
            <div style={{ overflow: 'visible' }}>
              <div style={{ position: 'relative' }}>
                <table style={{ minWidth: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', width: 'max-content' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f7f7f7', opacity: 1, color: '#333', fontSize: '12px', fontWeight: 'bold' }}>
                      <th style={{ position: 'sticky', top: 0, left: 0, width: `${columnWidths[0]}px`, zIndex: 200, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Web</th>
                      <th style={{ position: 'sticky', top: 0, left: `${getLeftPosition(1)}px`, width: `${columnWidths[1]}px`, zIndex: 200, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Rel.</th>
                      <th style={{ position: 'sticky', top: 0, left: `${getLeftPosition(2)}px`, width: `${columnWidths[2]}px`, zIndex: 200, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Gest.Cli.</th>
                      <th style={{ position: 'sticky', top: 0, left: `${getLeftPosition(3)}px`, width: `${columnWidths[3]}px`, zIndex: 200, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Cod.</th>
                      <th style={{ position: 'sticky', top: 0, left: `${getLeftPosition(4)}px`, width: `${columnWidths[4]}px`, zIndex: 200, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Descrição</th>
                      <th style={{ position: 'sticky', top: 0, left: `${getLeftPosition(5)}px`, width: `${columnWidths[5]}px`, zIndex: 200, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>PDF</th>
                      <th style={{ position: 'sticky', top: 0, left: `${getLeftPosition(6)}px`, width: `${columnWidths[6]}px`, zIndex: 200, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Doc.</th>
                      <th style={{ position: 'sticky', top: 0, left: `${getLeftPosition(7)}px`, width: `${columnWidths[7]}px`, zIndex: 200, padding: '8px 0', textAlign: 'right', backgroundColor: '#c0c0c0' }}>Área</th>
                      <th style={{ position: 'sticky', top: 0, left: `${getLeftPosition(8)}px`, width: `${columnWidths[8]}px`, zIndex: 200, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Emissão</th>
                      <th style={{ position: 'sticky', top: 0, left: `${getLeftPosition(9)}px`, width: `${columnWidths[9]}px`, zIndex: 200, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Vencim.</th>
                      <th style={{ position: 'sticky', top: 0, left: `${getLeftPosition(10)}px`, width: `${columnWidths[10]}px`, zIndex: 200, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Renov.</th>
                      <th style={{ position: 'sticky', top: 0, left: `${getLeftPosition(11)}px`, width: `${columnWidths[11]}px`, zIndex: 200, padding: '8px 0', backgroundColor: '#d9d9d9' }}><div style={{ width: '1px', height: '100%', backgroundColor: '#000', margin: '0 auto' }}></div></th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[12]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#ddd' }}>Periodicidade</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[13]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#ddd' }}>Peso</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[14]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#ddd' }}>Atividade</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[15]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#ddd' }}>Obs</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[16]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#ddd' }}>Dt.Prov.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[17]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#ddd' }}>Grupo</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[18]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#ddd' }}>Compet.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[19]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#ddd' }}>Doc.Orig.</th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: '#fff', opacity: 1, color: '#333' }}>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={20} style={{ textAlign: 'center', padding: '20px 0', color: '#666' }}>
                          Não foram encontrados documentos de conformidade
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => (
                        <tr key={index} style={{ fontSize: '12px', cursor: 'pointer' }}>
                          <td style={{ position: 'sticky', left: 0, width: `${columnWidths[0]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <Checkbox checked={item.finternet} disabled className="h-3 w-3 data-[disabled]:opacity-100" />
                            </div>
                          </td>
                          <td style={{ position: 'sticky', left: `${getLeftPosition(1)}px`, width: `${columnWidths[1]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <Checkbox checked={item.frelatorio} disabled className="h-3 w-3 data-[disabled]:opacity-100" />
                            </div>
                          </td>
                          <td style={{ position: 'sticky', left: `${getLeftPosition(2)}px`, width: `${columnWidths[2]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <Checkbox checked={item.gestaocli} disabled className="h-3 w-3 data-[disabled]:opacity-100" />
                            </div>
                          </td>
                          <td style={{ position: 'sticky', left: `${getLeftPosition(3)}px`, width: `${columnWidths[3]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'center' }}>{item.codcfor}</div></td>
                          <td style={{ position: 'sticky', left: `${getLeftPosition(4)}px`, width: `${columnWidths[4]}px`, zIndex: 150, padding: '4px 0', textAlign: 'left', backgroundColor: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}><div style={{ width: '100%', textAlign: 'left' }}>{item.descr}</div></td>
                          <td style={{ position: 'sticky', left: `${getLeftPosition(5)}px`, width: `${columnWidths[5]}px`, zIndex: 150, padding: '4px 0', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <Checkbox checked={item.flagtipopdf} disabled className="h-3 w-3 data-[disabled]:opacity-100" />
                            </div>
                          </td>
                          <td style={{ position: 'sticky', left: `${getLeftPosition(6)}px`, width: `${columnWidths[6]}px`, zIndex: 150, padding: '4px 0', textAlign: 'left', backgroundColor: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}><div style={{ width: '100%', textAlign: 'left' }}>{item.doc}</div></td>
                          <td style={{ position: 'sticky', left: `${getLeftPosition(7)}px`, width: `${columnWidths[7]}px`, zIndex: 150, padding: '4px 0', textAlign: 'right', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'right' }}>{Number(item.area).toFixed(2)}</div></td>
                          <td style={{ position: 'sticky', left: `${getLeftPosition(8)}px`, width: `${columnWidths[8]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'center' }}>{formatDate(item.dt)}</div></td>
                          <td style={{ position: 'sticky', left: `${getLeftPosition(9)}px`, width: `${columnWidths[9]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'center' }}>{formatDate(item.dtvenc)}</div></td>
                          <td style={{ position: 'sticky', left: `${getLeftPosition(10)}px`, width: `${columnWidths[10]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'center' }}>{formatDate(item.dtrenov)}</div></td>
                          <td style={{ position: 'sticky', left: `${getLeftPosition(11)}px`, width: `${columnWidths[11]}px`, zIndex: 150, padding: '4px 0', backgroundColor: '#d9d9d9' }}><div style={{ width: '1px', height: '100%', backgroundColor: '#000', margin: '0 auto' }}></div></td>
                          <td style={{ width: `${columnWidths[12]}px`, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}>{item.periodicidade}</td>
                          <td style={{ width: `${columnWidths[13]}px`, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}>{item.vgraurisco}</td>
                          <td style={{ width: `${columnWidths[14]}px`, padding: '4px 0', textAlign: 'left', backgroundColor: '#fff' }}>{item.atividade}</td>
                          <td style={{ width: `${columnWidths[15]}px`, padding: '4px 0', textAlign: 'left', backgroundColor: '#fff' }}>{item.obs}</td>
                          <td style={{ width: `${columnWidths[16]}px`, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}>{formatDate(item.quando)}</td>
                          <td style={{ width: `${columnWidths[17]}px`, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}>{item.grupo}</td>
                          <td style={{ width: `${columnWidths[18]}px`, padding: '4px 0', textAlign: 'left', backgroundColor: '#fff' }}>{item.quem}</td>
                          <td style={{ width: `${columnWidths[19]}px`, padding: '4px 0', textAlign: 'left', backgroundColor: '#fff' }}>{item.docorig}</td>
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