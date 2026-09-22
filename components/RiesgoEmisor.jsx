// Riesgo del emisor × aprobación: impago, cese y fraude en A-D contra el peso
// del importe pedido sobre la facturación.
const RiesgoEmisor = () => {
  const [tipo, setTipo] = React.useState('impago');
  const [tier, setTier] = React.useState(null);
  const [oper, setOper] = React.useState('gc');
  const m = window.rskMatriz(tipo, tier, oper);
  const nF = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
  const pF = (v, d) => v == null || isNaN(v) ? '—' : (v * 100).toFixed(d || 0).replace('.', ',') + '%';
  const eF = (v) => v == null || isNaN(v) ? '—' : (Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1).replace('.', ',') + 'M€' : Math.round(v / 1000) + 'k€');
  const def = window.RSK_SCORES.find(s => s.id === tipo);
  return (
    <>
      <div className="bk-lvl-h">Riesgo del emisor y aprobación</div>
      <div className="zo-ctrl">
        <div className="zo-cg">
          <label>Score</label>
          <div className="bk-fg">
            {window.RSK_SCORES.map(s => <button key={s.id} className={tipo === s.id ? 'on' : ''} onClick={() => setTipo(s.id)}>{s.label}</button>)}
          </div>
        </div>
        <div className="zo-cg">
          <label>Tier</label>
          <div className="bk-fg">
            <button className={!tier ? 'on' : ''} onClick={() => setTier(null)}>Todos</button>
            {window.OPT_SEGS.map(s => <button key={s.id} className={tier === s.id ? 'on' : ''} onClick={() => setTier(s.id)}>{s.label}</button>)}
          </div>
        </div>
        <div className="zo-cg">
          <label>Operativa</label>
          <div className="bk-fg">
            {window.OPT_OPERATIVAS.map(o => <button key={o.id} className={oper === o.id ? 'on' : ''} onClick={() => setOper(o.id)}>{o.label}</button>)}
          </div>
        </div>
        <span className="zo-ctrl-n">{def.desc} Las columnas son el importe pedido dividido por la facturación anual, con tope del {pF(m.tope)}: por encima no se concede línea. Cada operativa soporta un peso distinto y su mediana está fijada por riesgos.</span>
      </div>

      <div className="cv">
        <div className="bk-scroll">
        <table className="bk-table rsk-t">
          <thead><tr>
            <th>Score {def.label}</th>
            {window.RSK_TRAMOS.map(t => <th key={t.id} className="num">{t.label}</th>)}
            <th className="num">Aprob. {(window.OPT_OPERATIVAS.find(o => o.id === oper) || {}).label.toLowerCase()}</th><th className="num">Pedido</th><th className="num">Peso mediano</th>
          </tr></thead>
          <tbody>
            {m.filas.map(f => (
              <tr key={f.id}>
                <td><b className="rsk-g" style={{'--c': f.color}}>{f.label}</b><em className="zo-sub">{nF(f.n)} empresas · {nF(f.ev)} evaluadas</em></td>
                {f.celdas.map(c => (
                  <td key={c.id} className="num mono zo-cell"
                    style={{background: c.wr != null ? `rgba(46,125,91,${0.05 + 0.45 * c.wr})` : undefined}}
                    title={c.n + ' empresas · ' + c.ok + ' aprobadas'}>
                    {c.ev >= 3 ? <><b>{pF(c.wr)}</b><em>{nF(c.ok)} de {nF(c.ev)}</em></>
                      : c.n ? <><span className="bk-none">—</span><em>{c.ev ? nF(c.ev) + ' de ' + nF(c.n) + (c.n === 1 ? ' evaluada' : ' evaluadas') : nF(c.n) + ' sin evaluar'}</em></>
                      : <span className="bk-none">—</span>}
                  </td>
                ))}
                <td className="num mono"><b>{pF(f.wr, 1)}</b></td>
                <td className="num mono">{eF(f.req)}</td>
                <td className="num mono">{pF(f.peso, 1)}</td>
              </tr>
            ))}
            <tr className="bk-row-tot">
              <td>Todas</td>
              {m.cols.map(c => <td key={c.id} className="num mono">{c.ev >= 3 ? <><b>{pF(c.wr)}</b><em className="zo-sub">{nF(c.ok)} de {nF(c.ev)}</em></> : <span className="bk-none">—</span>}</td>)}
              <td className="num mono"><b>{pF(m.wr, 1)}</b></td>
              <td className="num mono">{eF(m.req)}</td>
              <td className="num mono"><b>{pF(m.peso, 1)}</b></td>
            </tr>
          </tbody>
        </table>
        </div>
        <div className="rsk-b">
          <div className="rsk-card">
            <b>Acumulación de riesgo</b>
            <span>Empresas por número de scores en C o D, de los tres.</span>
            <div className="rsk-combo">
              {m.combo.map(c => (
                <div key={c.k} className={'rsk-cm' + (c.k >= 2 ? ' bad' : '')}>
                  <u className="mono">{pF(c.wr)}</u>
                  <i><s style={{width: Math.max(0, Math.min(100, (c.wr || 0) * 100)) + '%'}}/></i>
                  <span>{c.k === 0 ? 'ninguno' : c.k === 1 ? '1 score' : c.k + ' scores'} en C/D</span>
                  <em className="mono">{nF(c.n)} empresas</em>
                </div>
              ))}
            </div>
          </div>
          <div className="rsk-card">
            <b>Correlación entre scores</b>
            <span>Qué parte de las empresas comparte grado y cuántas se separan dos grados o más.</span>
            <div className="rsk-pares">
              {m.pares.map(p => (
                <div key={p.a + p.b} className="rsk-par">
                  <span>{p.a} · {p.b}</span>
                  <i><s style={{width: Math.max(0, Math.min(100, (p.igual || 0) * 100)) + '%'}}/></i>
                  <u className="mono">{pF(p.igual)} igual</u>
                  <em className="mono">{pF(p.lejos)} a 2+ grados</em>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="cv-note">
          {m.meta.fuente} El score por sí solo no decide: decide junto al <b>peso del pedido</b>, que aquí va acotado al {pF(m.tope)} porque por encima no se concede línea. El peso se transforma con una curva que deja la mediana de cada operativa donde la fija riesgos —{pF(m.peso, 1)} en {(window.OPT_OPERATIVAS.find(o => o.id === oper) || {}).label.toLowerCase()}— sin que nada pase del techo. Los recuentos de empresa son sobre las {nF(m.n)} cruzadas con pedido y ventas; los porcentajes, solo sobre las {nF(m.ev)} que riesgos llegó a evaluar, mismo criterio que la tabla de conversión por operativa: aprobada es tener sublímite abierto. Donde hay menos de tres evaluadas no se publica porcentaje: la evaluación de riesgos no se reparte por igual entre grados, así que las filas con muestra corta quedan en blanco a propósito.
        </div>
      </div>
    </>
  );
};
Object.assign(window, { RiesgoEmisor });
