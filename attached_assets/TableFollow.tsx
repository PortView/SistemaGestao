import { useEffect, useState } from 'react';
import axios from 'axios';
import { parseCookies } from 'nookies';

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

interface TableFollwupProps {
  codserv: number;
}

export default function TableFollwup({ codserv }: TableFollwupProps) {
  const [data, setData] = useState<TarefasData[]>([]);
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
          `${process.env.NEXT_PUBLIC_API_FOLLOWUP_URL}?codserv=${codserv}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setData(response.data as TarefasData[]);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados do serviço');
        setLoading(false);
      }
    };
    fetchData();
  }, [codserv]);

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
    150, // - Analista - analista
    100, // - Dt.Tarefa - dttarefa 
    30, // - Ok - conclusao
    30, // - Med - medicao
    500, //- Desc.Tarefa - desctarefa
    120,// - Evento - evento
    60, // - H.Tram. - tetramitacao
    60 // - H.Ass - teassessoria
  ];

  // Função para calcular a posição left correta
  // const columnWidths = (index: number): number => {
  //   let position = 0;
  //   for (let i = 0; i < index; i++) {
  //     position += columnWidths[i];
  //   }
  //   return position;
  // };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '454px', position: 'relative', WebkitOverflowScrolling: 'touch', willChange: 'transform' }}>
          <div style={{ display: 'inline-block', minWidth: '100%', textAlign: 'center' }}>
            <div style={{ overflow: 'visible' }}>
              <div style={{ position: 'relative' }}>
                <table style={{ minWidth: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', width: 'max-content' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f7f7f7', opacity: 1, color: '#333', fontSize: '12px', fontWeight: 'bold' }}>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[0]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Analista</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[1]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Dt.Tarefa</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[2]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Ok</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[3]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Med</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[4]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Desc.Tarefa</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[5]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Evento</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[6]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>H.Tram.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[7]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>H.Ass.</th>
                      

                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: '#fff', opacity: 1, color: '#333' }}>
                    {data.map((item, index) => (
                      <tr key={index} style={{ fontSize: '12px', cursor: 'pointer' }}>
                        <td style={{ width: `${columnWidths[0]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'center' }}>{item.analista}</div></td>
                        <td style={{ width: `${columnWidths[1]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'left' }}>{item.dttarefa}</div></td>
                        <td style={{ width: `${columnWidths[2]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.conclusao} readOnly /></td>
                        <td style={{ width: `${columnWidths[3]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.medicao} readOnly /></td>
                        <td style={{ width: `${columnWidths[1]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'left' }}>{item.desctarefa}</div></td>
                        <td style={{ width: `${columnWidths[5]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.evento} readOnly /></td>
                        <td style={{ width: `${columnWidths[6]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'center' }}>{Number(item.tetramitacao)}</div></td>
                        <td style={{ width: `${columnWidths[7]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'center' }}>{Number(item.teassessoria)}</div></td>
                        
                        

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