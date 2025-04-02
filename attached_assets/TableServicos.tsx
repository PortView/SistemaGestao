import { useEffect, useState } from 'react';
import axios from 'axios';
import { parseCookies } from 'nookies';

interface ServicosData {
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
  qcontrato: number;
  qUnidade: number;
  qConcluido: boolean;
  qCodServ: number;
  qStatus: string;
  qDtlimite: string;

}

export default function TableServicos({ qcodCoor, qcontrato, qUnidade, qConcluido, qCodServ, qStatus, qDtlimite }: TableServicosProps) {
  const [data, setData] = useState<ServicosData[]>([]);
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

        //console.log(qcodCoor, qcontrato, qUnidade, qConcluido, qCodServ, qStatus, qDtlimite);
        

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVICOS_URL}?qcodCoor=${qcodCoor}&qcontrato=${qcontrato}&qUnidade=${qUnidade}&qConcluido=${qConcluido}&qCodServ=${qCodServ}&qStatus=${qStatus}&qDtlimite=${qDtlimite}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
            
          }
        );
        setData(response.data as ServicosData[]);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados do serviço');
        setLoading(false);
      }
    };
    fetchData();
  }, [qcodCoor, qcontrato, qUnidade, qConcluido, qCodServ, qStatus, qDtlimite]);

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
    40, // Dt.Limite
    80,  // Valserv
    60,  // H.Tramitação
    60,  // H. Ass.
    400, // Obs.Serv.
    400, // Obs.Resc.
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
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[0]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Cod.Serv.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[1]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Desc.Serv.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[2]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Ok</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[3]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Os</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[4]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Res</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[5]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Pdc</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[6]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Sus</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[7]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Doc.I</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[8]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Novo</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[9]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Ocorr.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[10]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Status</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[11]}px`, zIndex: 10, padding: '8px 0', textAlign: 'center', backgroundColor: '#c0c0c0' }}>Dt.Limite</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[12]}px`, zIndex: 10, padding: '8px 0', textAlign: 'right', backgroundColor: '#c0c0c0' }}>Val.Serv.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[13]}px`, zIndex: 10, padding: '8px 0', textAlign: 'right', backgroundColor: '#c0c0c0' }}>H.Tram.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[14]}px`, zIndex: 10, padding: '8px 0', textAlign: 'right', backgroundColor: '#c0c0c0' }}>H.Ass.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[15]}px`, zIndex: 10, padding: '8px 10px', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Obs.Serviço.</th>
                      <th style={{ position: 'sticky', top: 0, width: `${columnWidths[16]}px`, zIndex: 10, padding: '8px 0', textAlign: 'left', backgroundColor: '#c0c0c0' }}>Obs.Rescisão</th>

                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: '#fff', opacity: 1, color: '#333' }}>
                    {data.map((item, index) => (
                      <tr key={index} style={{ fontSize: '12px', cursor: 'pointer' }}>
                        <td style={{ width: `${columnWidths[0]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'center' }}>{item.codServ}</div></td>
                        <td style={{ width: `${columnWidths[1]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'left' }}>{item.descserv}</div></td>
                        <td style={{ width: `${columnWidths[2]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.concluido} readOnly /></td>
                        <td style={{ width: `${columnWidths[3]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.filtroOs} readOnly /></td>
                        <td style={{ width: `${columnWidths[4]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.rescisao} readOnly /></td>
                        <td style={{ width: `${columnWidths[5]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'center' }}>{Number(item.qtdPende)}</div></td>
                        <td style={{ width: `${columnWidths[6]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.suspenso} readOnly /></td>
                        <td style={{ width: `${columnWidths[7]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.estadoOk} readOnly /></td>
                        <td style={{ width: `${columnWidths[8]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.novo} readOnly /></td>
                        <td style={{ width: `${columnWidths[9]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><input style={{ width: '100%' }} type="checkbox" checked={item.teventserv} readOnly /></td>
                        <td style={{ width: `${columnWidths[10]}px`, zIndex: 150, padding: '4px 0', textAlign: 'right', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'left' }}>{item.mStatus}</div></td>
                        <td style={{ width: `${columnWidths[11]}px`, zIndex: 150, padding: '4px 0', textAlign: 'center', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'center' }}>{formatDate(item.dtLimite)}</div></td>
                        <td style={{ width: `${columnWidths[12]}px`, zIndex: 150, padding: '4px 0', textAlign: 'right', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'right' }}>{Number(item.valserv).toFixed(2)}</div></td>
                        <td style={{ width: `${columnWidths[13]}px`, zIndex: 150, padding: '4px 0', textAlign: 'right', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'right' }}>{Number(item.horastramitacao)}</div></td>
                        <td style={{ width: `${columnWidths[14]}px`, zIndex: 150, padding: '4px 0', textAlign: 'right', backgroundColor: '#fff' }}><div style={{ width: '100%', textAlign: 'right' }}>{Number(item.horasassessoria)}</div></td>
                        <td style={{ width: `${columnWidths[15]}px`, zIndex: 150, padding: '4px 10px', textAlign: 'left', backgroundColor: '#fff' }}>{item.obsServ}</td>
                        <td style={{ width: `${columnWidths[16]}px`, zIndex: 150, padding: '4px 10px', textAlign: 'left', backgroundColor: '#fff' }}>{item.obsResc}</td>

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