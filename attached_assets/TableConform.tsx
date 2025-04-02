import { useEffect, useState } from 'react';
import axios from 'axios';
import { parseCookies } from 'nookies';

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
        const cookies = parseCookies();
        const token = cookies['auth_token']; // Ajustado para usar o mesmo nome do cookie definido no login

        if (!token) {
          setError('Não autorizado: Token não encontrado');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_CONFORMIDADE_URL}?codimov=${codimov}&web=${web}&relatorio=${relatorio}&cnpj=${cnpj}&temcnpj=${temcnpj}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setData(response.data as ConformidadeData[]);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados da conformidade');
        setLoading(false);
      }
    };
    fetchData();
  }, [codimov, web, relatorio, cnpj, temcnpj]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #3498db', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ color: '#e74c3c' }}>{error}</div>
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
    <div style={{ width: '100%' }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '360px', position: 'relative', WebkitOverflowScrolling: 'touch', willChange: 'transform' }}>
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
                    {data.map((item, index) => (
                      <tr key={index} style={{ fontSize: '12px', cursor: 'pointer' }}>
                        <td style={{ position: 'sticky', left: 0, width: `${columnWidths[0]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.finternet} readOnly /></td>
                        <td style={{ position: 'sticky', left: `${getLeftPosition(1)}px`, width: `${columnWidths[1]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.frelatorio} readOnly /></td>
                        <td style={{ position: 'sticky', left: `${getLeftPosition(2)}px`, width: `${columnWidths[2]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.gestaocli} readOnly /></td>
                        <td style={{ position: 'sticky', left: `${getLeftPosition(3)}px`, width: `${columnWidths[3]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'center' }}>{item.codcfor}</div></td>
                        <td style={{ position: 'sticky', left: `${getLeftPosition(4)}px`, width: `${columnWidths[4]}px`, zIndex: 150, padding: '4px 0', textAlign: 'left', backgroundColor: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}><div style={{ width: '100%', textAlign: 'left' }}>{item.descr}</div></td>
                        <td style={{ position: 'sticky', left: `${getLeftPosition(5)}px`, width: `${columnWidths[5]}px`, zIndex: 150, padding: '4px 0', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.flagtipopdf} readOnly /></td>
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
                    ))}
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