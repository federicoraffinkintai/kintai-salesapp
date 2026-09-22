// Actividad del trimestre y generación de deals por AE. El embudo de actividad
// (discovery → propuesta → activación → cliente) y el esfuerzo de contacto por
// canal son modelo declarado; lo medido es el pipeline vivo que va al lado.
const ctN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
const ct1 = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(1).replace('.', ',');
const ctP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d).replace('.', ',') + '%';
const ctEur = (v) => v == null ? '—' : v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + 'M€'
  : v >= 1e3 ? Math.round(v / 1e3) + 'k€' : ctN(v) + '€';

window.AeAct = function AeAct({ sel, onSel }) {
  const A = React.useMemo(() => window.aeActividad(), []);
  const F = window.AEACT_FUNNEL;
  const hitos = F.filter(f => f.id !== 'deals');
  const maxH = Math.max(...A.hitosTot.map(h => h.n), 1);
  const a = A.list.find(x => x.key === sel) || A.list[0];

  return (
    <>
      {/* ===== ACTIVIDAD DEL TRIMESTRE ===== */}
      <div className="bk-lvl-h">Modelo de actividad de Q4 · plan, no medición</div>
      <section className="bk-block">
        <div className="bk-bh">
          <span className="bk-chip">Plan de actividad del equipo · Q4</span>
          <span className="bk-bh-d"><b>Este bloque es el único que no mide: es el plan con el que se dimensiona Q4.</b> Los tres dashboards de abajo son actuals del CRM y pueden no coincidir con estas cifras — esa diferencia es precisamente lo que hay que mirar. Los {ctN(A.hitosTot[0].n)} deals de nuevo negocio del trimestre convertidos en reuniones y firmas. Los pasos no son los mismos en las dos unidades y es justo lo que las distingue: <b>Pymes</b> trabaja mucho deal de poco ticket y pierde la mitad antes del discovery ({ctP(window.AEACT_PASOS.pymes.discovery)} llega a reunión, {ctP(window.aeactEndToEnd('pymes'))} punta a punta); <b>Mid Market</b> trabaja pocas operaciones muy cualificadas y las lleva casi todas a reunión ({ctP(window.AEACT_PASOS.midmkt.discovery)} y {ctP(window.aeactEndToEnd('midmkt'))} punta a punta). Al lado va lo único medido: los deals que hoy están vivos en la fase que evidencia cada hito.</span>
          <span className="bk-bh-k mono">{ct1(A.tot.clientes)} clientes del modelo · {ctN(A.tot.objCli)} comprometidos</span>
        </div>
        <div className="pp-top">
          {A.hitosTot.map(h => (
            <div key={h.id} className={'pp-c' + (h.id === 'cliente' ? ' accent' : '')}>
              <b className="mono">{h.id === 'deals' ? ctN(h.n) : ct1(h.n)}</b>
              <span>{h.label} en el trimestre</span>
              <em>{ct1(h.n / A.t.semanas)} por semana · {h.vivo ? ctN(h.vivo) + ' vivos hoy en pipeline' : 'sin evidencia en pipeline'}</em>
              <i className="pp-m-b" style={{marginTop:'4px'}}><u style={{width: Math.max(2, Math.min(100, h.n / maxH * 100)) + '%', background: h.color}}/></i>
            </div>
          ))}
        </div>
        <div className="bk-scroll">
          <table className="bk-table pp-t">
            <thead><tr>
              <th>AE</th><th className="num">Deals de nuevo negocio</th>
              {hitos.map(h => <th key={h.id} className="num">{h.label}<em className="cap-th-e">total · por semana</em></th>)}
              <th className="num">Clientes comprometidos</th><th className="num">Desvío del modelo</th><th className="num">€ por cliente</th>
            </tr></thead>
            <tbody>
              {A.list.map(x => (
                <tr key={x.key} className={sel === x.key ? 'on' : ''} onClick={() => onSel && onSel(x.key)}>
                  <td className="bk-nom"><b>{x.nombre}</b><em>{x.derivar ? 'deals derivados de sus ' + x.derivar.clientes + ' clientes' : x.embudoNota ? 'solo nuevo negocio de sus ' + ctN(x.deals) + ' deals' : x.unidadLabel + ' · ' + ctP(window.aeactEndToEnd(x.unidad)) + ' punta a punta'}</em></td>
                  <td className="num mono"><b>{ctN(x.dealsEmbudo)}</b></td>
                  {hitos.map((h, i) => {
                    const v = x.hitos[i + 1];
                    return <td key={h.id} className="num mono pp-seg"><b>{ct1(v.n)}</b><em>{ct1(v.sem)} / sem</em></td>;
                  })}
                  <td className="num mono">{ctN(x.objCli)}</td>
                  <td className="num mono">{x.desvio == null ? <span className="bk-none">—</span>
                    : <span className="k-ach" style={{'--c': Math.abs(x.desvio) <= 0.1 ? '#1F5C42' : x.desvio > 0 ? '#2E7D5B' : '#B23A3A'}}>{(x.desvio >= 0 ? '+' : '') + ctP(x.desvio)}</span>}</td>
                  <td className="num mono">{ctEur(x.eurPorCliente)}</td>
                </tr>
              ))}
              <tr className="bk-row-tot">
                <td>Equipo Q4<em className="ap-pop">{A.list.length} AE</em></td>
                <td className="num mono">{ctN(A.hitosTot[0].n)}</td>
                {hitos.map((h, i) => (
                  <td key={h.id} className="num mono pp-seg"><b>{ct1(A.hitosTot[i + 1].n)}</b><em>{ct1(A.hitosTot[i + 1].n / A.t.semanas)} / sem</em></td>
                ))}
                <td className="num mono">{ctN(A.tot.objCli)}</td>
                <td className="num mono">{ctP(A.tot.objCli ? A.tot.clientes / A.tot.objCli - 1 : null)}</td>
                <td className="num mono">{ctEur(A.q4.tot.obj / A.tot.objCli)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="pp-fc">
          <div className="pp-fc-h"><b>Pasos del embudo por unidad</b><span>Cada juego de pasos está anclado en los deals por cliente de su unidad, así que la cadena cuadra con el objetivo comprometido en lugar de forzarlo.</span></div>
          <div className="pp-fc-g">
            {window.AEQ4_UNIDADES.map(u => {
              const p = window.AEACT_PASOS[u.id];
              return (
                <div key={u.id} className="pp-m" style={{borderColor: u.color}}>
                  <span className="pp-m-l">{u.label}</span>
                  <b className="mono">{ctP(window.aeactEndToEnd(u.id))} punta a punta</b>
                  <em className="mono">{ct1(1 / window.aeactEndToEnd(u.id))} deals por cliente</em>
                  <div className="pp-m-s">
                    {hitos.map(h => <span key={h.id}>{h.label}<u className="mono">{ctP(p[h.id])}</u></span>)}
                  </div>
                  <div className="pp-m-s"><span>{p.ancla}</span></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bk-bn">
          {window.AEACT_META.aviso} El desvío compara los clientes que sale del embudo con los comprometidos en el objetivo: por encima de cero el modelo de actividad da holgura, por debajo el AE no llega ni haciendo todas las reuniones. {A.list.filter(x => x.embudoNota).map(x => x.nombre + ': ' + x.embudoNota).join(' ')} {window.AEACT_META.instrumentar}
        </div>
      </section>

    </>
  );
};
