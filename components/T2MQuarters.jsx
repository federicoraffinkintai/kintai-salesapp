// Time to money por trimestre, con desglose por fase.
const T2MQuarters = () => {
  const [segs, setSegs] = React.useState(['midmkt', 'big', 'mid', 'small']);
  const [canal, setCanal] = React.useState(null);
  const [oper, setOper] = React.useState(null);
  const n0 = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
  const p1 = (v) => v == null || isNaN(v) ? '—' : (v * 100).toFixed(0) + '%';
  // Nunca se queda vacío: sin segmento no hay time to money que enseñar.
  const tog = (v) => { const nx = segs.indexOf(v) >= 0 ? segs.filter(x => x !== v) : segs.concat([v]); if (nx.length) setSegs(nx); };
  const s = window.t2mSerie({ segs, canal, oper });
  return (
    <>
      <div className="bk-lvl-h">Time to money por trimestre</div>
      <div className="zo-ctrl t2m-ctrl">
        <div className="zo-cg">
          <label>Segmento</label>
          <div className="bk-fg">
            {window.OPT_SEGS.filter(x => window.T2M_BASE[x.id]).map(x => (
              <button key={x.id} className={segs.indexOf(x.id) >= 0 ? 'on' : ''} onClick={() => tog(x.id)}>{x.label}</button>
            ))}
          </div>
        </div>
        <div className="zo-cg">
          <label>Canal</label>
          <div className="bk-fg">
            <button className={!canal ? 'on' : ''} onClick={() => setCanal(null)}>Todos</button>
            {window.OPT_CANALES.map(c => (
              <button key={c.id} className={canal === c.id ? 'on' : ''} onClick={() => setCanal(c.id)}>{c.label}</button>
            ))}
          </div>
        </div>
        <div className="zo-cg">
          <label>Producto</label>
          <div className="bk-fg">
            <button className={!oper ? 'on' : ''} onClick={() => setOper(null)}>Todos</button>
            {window.OPT_OPERATIVAS.map(o => (
              <button key={o.id} className={oper === o.id ? 'on' : ''} onClick={() => setOper(o.id)}>{o.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="cv">
        <div className="t2m-top">
          <div className="t2m-c accent"><b className="mono">{n0(s.ult.total)}<u> d</u></b><span>time to money hoy</span><em>mediana medida de {n0(s.refN)} firmas: {n0(s.refMed)} d{oper ? ' · producto ×' + s.kOper.toFixed(2).replace('.', ',') : ''}</em></div>
          <div className="t2m-c"><b className="mono">{s.delta < 0 ? '−' : '+'}{p1(Math.abs(s.delta))}</b><span>contra {s.prim.q.replace('-Q', ' Q')}</span><em>de {n0(s.prim.total)} a {n0(s.ult.total)} días</em></div>
          <div className="t2m-c"><b className="mono">{s.cuello.label}</b><span>fase más larga</span><em>{n0(s.cuello.dias)} días · {p1(s.ult.total ? s.cuello.dias / s.ult.total : null)} del total</em></div>
        </div>

        <table className="bk-table t2m-t">
          <thead><tr>
            <th>Corte</th>
            {window.T2M_FASES.map(f => <th key={f.id} className="num">{f.label}</th>)}
            <th className="num">Total</th><th>Reparto</th>
          </tr></thead>
          <tbody>
            {s.qs.map(q => (
              <tr key={q.q}>
                <td><b>{q.q.replace('-Q', ' Q')}</b></td>
                {q.fases.map(f => <td key={f.id} className="num mono">{n0(f.dias)} d</td>)}
                <td className="num mono"><b>{n0(q.total)} d</b></td>
                <td className="t2m-mix"><span className="t2m-mixb">{q.fases.map(f => <i key={f.id} style={{flexGrow: f.dias, background: f.color}}/>)}</span></td>
              </tr>
            ))}
            <tr className="bk-row-tot">
              <td>{s.ult.q.replace('-Q', ' Q')} por segmento</td>
              <td colSpan={window.T2M_FASES.length + 2} className="t2m-segs">
                {s.porSeg.map(x => (
                  <span key={x.id} className="t2m-seg" style={{'--c': x.color}}>{x.label}<u className="mono">{n0(x.total)} d</u></span>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="t2m-g">
          {s.qs.map(q => (
            <div key={q.q} className="t2m-q">
              <span className="t2m-q-l">{q.q.replace('-Q', ' Q')}</span>
              <div className="t2m-st" style={{height: Math.max(12, (q.total / s.max) * 150) + 'px'}}>
                {q.fases.map(f => (
                  <i key={f.id} style={{flexGrow: f.dias, background: f.color}} title={f.label + ': ' + n0(f.dias) + ' días'}/>
                ))}
              </div>
              <b className="mono">{n0(q.total)} d</b>
              <em className="mono">{n0(q.n)} ops</em>
            </div>
          ))}
        </div>
        <div className="t2m-leg">
          {window.T2M_FASES.map(f => (
            <span key={f.id}><i style={{background: f.color}}/>{f.label}<u className="mono">{n0(s.ult.fases.find(x => x.id === f.id).dias)} d</u></span>
          ))}
        </div>

        <div className="cv-note">
          {s.meta.fuente} El total del trimestre de corte es la mediana medida del cruce ({n0(s.refMed)} días sobre {n0(s.refN)} operaciones), {s.refKey === 'total' ? ' — la misma del KPI de cabecera y la sección de percentiles' : ', media ponderada por volumen de las medianas de los segmentos elegidos, que no coincide con la mediana del total'}. Lo que aporta esta vista es en qué fase se va ese tiempo y cómo se ha movido por trimestre. El filtro de producto sí mueve el total (×{s.kOper.toFixed(2).replace('.', ',')} aquí) pero es modelo: el dato medido no distingue operativa. El corte de hoy: {canal ? 'canal ' + canal.toLowerCase() : 'todos los canales'}, {oper ? (window.OPT_OPERATIVAS.find(o => o.id === oper) || {}).label.toLowerCase() : 'todos los productos'}, {segs.length} de {window.OPT_SEGS.filter(x => window.T2M_BASE[x.id]).length} segmentos. La lectura es dónde se va el tiempo: <b>{s.cuello.label.toLowerCase()}</b> se lleva {p1(s.ult.total ? s.cuello.dias / s.ult.total : null)} del recorrido, así que es ahí donde un día ganado vale por cuatro.
        </div>
      </div>
    </>
  );
};
Object.assign(window, { T2MQuarters });
