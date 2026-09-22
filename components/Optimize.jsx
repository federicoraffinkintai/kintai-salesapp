// Funnel optimization: qué mueve la conversión — operativa, canal, tier, cartera, tiempo
const { useState, useMemo } = React;

const zN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
const z1 = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(1).replace('.', ',');
const zP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 1 : d).replace('.', ',') + '%';
const zEur = (v) => v == null ? '—' : v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + 'M€'
  : v >= 1e3 ? Math.round(v / 1e3) + 'k€' : zN(v) + '€';

window.FunnelOpt = function FunnelOpt() {
  const [op, setOp] = useState('ciego');
  const [dim, setDim] = useState('tier');
  const [t2mK, setT2mK] = useState('total');
  const [tier, setTier] = useState(null);

  const porOp = useMemo(() => window.optPorOperativa(op, tier), [op, tier]);
  const porDim = useMemo(() => window.optPorDim(dim), [dim]);
  const perdidas = useMemo(() => window.optPerdidas(), []);
  const t2m = window.optT2M(t2mK);

  const cruzadas = window.CONTACTS.filter(c => window.optCruzada(c));
  const clientes = cruzadas.filter(c => window.optEsCliente(c));
  const wrGlobal = cruzadas.length ? clientes.length / cruzadas.length : null;

  // Matriz canal × segmento, del export completo.
  const matriz = useMemo(() => {
    const canales = window.OPT_CANALES, segs = window.OPT_SEGS;
    return canales.map(c => ({ ...c, celdas: segs.map(s => {
      const x = window.OPT_CS[c.id + '|' + s.id] || { d:0, w:0, l:0 };
      return { seg:s, ...x, wr: (x.w + x.l) ? x.w / (x.w + x.l) : null };
    }) }));
  }, []);
  const maxWr = Math.max(...matriz.flatMap(r => r.celdas.map(c => c.wr || 0)));

  const wrChip = (v, ref) => v == null ? <span className="bk-none">—</span>
    : <span className="k-ach" style={{'--c': ref == null ? '#4054A8' : v >= ref * 1.25 ? '#1F5C42' : v >= ref * 0.75 ? '#B8731F' : '#B23A3A'}}>{zP(v, 0)}</span>;

  return (
    <div className="zo bk" data-screen-label="12 Funnel optimization">
      <div className="bk-head">
        <div>
          <h1 className="bk-h1">Funnel optimization</h1>
          <div className="bk-sub">Qué mueve la conversión, cruzando el fichero de riesgos con HubSpot: la cobertura que dio cada operativa, el canal, el tier, el tipo de cartera, el tiempo hasta el dinero y el motivo por el que se cayó. Sobre las <b>{zN(cruzadas.length)} empresas</b> con expediente y desenlace conocido.</div>
        </div>
        <div className="bk-kpis">
          <div className="bk-kpi"><b className="mono">{zN(cruzadas.length)}</b><span>expedientes cruzados</span></div>
          <div className="bk-kpi"><b className="mono">{zN(clientes.length)}</b><span>acabaron cliente</span></div>
          <div className="bk-kpi accent"><b className="mono">{zP(wrGlobal)}</b><span>conversión de referencia</span></div>
          <div className="bk-kpi"><b className="mono">{t2m ? zN(t2m.med) : '—'}<em> d</em></b><span>time to money mediano</span></div>
        </div>
      </div>

      {/* ===== OPERATIVA × COBERTURA ===== */}
      <div className="bk-lvl-h">Conversión por operativa y cobertura del límite</div>
      <div className="zo-ctrl">
        <div className="zo-cg">
          <label>Operativa</label>
          <div className="bk-fg">
            {window.OPT_OPERATIVAS.map(o => (
              <button key={o.id} className={op === o.id ? 'on' : ''} onClick={() => setOp(o.id)}>{o.label}</button>
            ))}
          </div>
        </div>
        <div className="zo-cg">
          <label>Tier</label>
          <div className="bk-fg">
            <button className={!tier ? 'on' : ''} onClick={() => setTier(null)}>Todos</button>
            {window.OPT_SEGS.map(s => <button key={s.id} className={tier === s.id ? 'on' : ''} onClick={() => setTier(s.id)}>{s.label}</button>)}
          </div>
        </div>
        <span className="zo-ctrl-n">Cobertura = el sublímite que dio riesgos para esa operativa dividido por el importe que pidió el cliente. Los tiempos son los del recorrido modelado del tier y la operativa, estirados cuando la cobertura obliga a renegociar el límite.</span>
      </div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr>
            <th>Cobertura del sublímite</th><th className="num">Empresas</th><th className="num">% aprobación<em className="zo-th-e">de {zN(porOp.base)} evaluada{porOp.base === 1 ? '' : 's'}</em></th><th className="num">Clientes</th>
            <th className="num">Conversión</th>
            <th className="num">T. negociación</th><th className="num">T. activación</th><th className="num">Total</th>
          </tr></thead>
          <tbody>
            {porOp.rows.map(r => {
              const rel = wrGlobal && r.wr != null ? r.wr / wrGlobal : null;
              return (
                <tr key={r.id} className={r.id === 'cero' ? 'zo-cero' : ''}>
                  <td><b>{r.label}</b>{r.id === 'cero' && <em className="zo-sub">riesgos no abrió esta operativa</em>}</td>
                  <td className="num mono">{zN(r.n)}</td>
                  <td className="num mono zo-ap">{r.id === 'cero' ? <span className="bk-none">—</span> : zP(porOp.base ? r.n / porOp.base : null, 1)}</td>
                  <td className="num mono">{zN(r.cli)}</td>
                  <td className="num mono">{wrChip(r.wr, wrGlobal)}</td>
                  <td className="num mono">{r.tNego == null ? <span className="bk-none">—</span> : zN(r.tNego) + ' d'}</td>
                  <td className="num mono">{r.tAct == null ? <span className="bk-none">—</span> : zN(r.tAct) + ' d'}</td>
                  <td className="num mono">{r.tTotal == null ? <span className="bk-none">—</span> : <b>{zN(r.tTotal)} d</b>}</td>
                </tr>
              );
            })}
            <tr className="bk-row-tot">
              <td>Aprobadas<em className="zo-sub">riesgos abrió algún límite en esta operativa</em></td>
              <td className="num mono">{zN(porOp.aprobadas)}</td>
              <td className="num mono zo-ap"><b>{zP(porOp.tasaAprob, 1)}</b></td>
              <td className="num mono">{zN(porOp.cliAprob)}</td>
              <td className="num mono">{wrChip(porOp.wrAprob, wrGlobal)}</td>
              <td className="num mono">{zN(porOp.tNego)} d</td>
              <td className="num mono">{zN(porOp.tAct)} d</td>
              <td className="num mono"><b>{zN(porOp.tTotal)} d</b></td>
            </tr>
          </tbody>
        </table>
        <div className="cv-note">
          La <b>tasa de aprobación</b> es la parte de empresas a las que riesgos abrió límite en esta operativa: {zP(porOp.tasaAprob, 1)} de {porOp.base === 1 ? 'la única empresa' : 'las ' + zN(porOp.base) + ' empresas'} que riesgos llegó a evaluar, contra {zN(porOp.denegadas)} denegadas o sin abrir, que se quedan en el 0% de conversión por definición. Es la lectura que separa la operativa segura de la que no lo es: cuanto más cubierto está el riesgo, más se aprueba. Hoy el orden es {window.OPT_OPERATIVAS.map(o => { const p = window.optPorOperativa(o.id); return { label: o.label, t: p.tasaAprob || 0 }; }).sort((a, b) => b.t - a.t).map(x => x.label.toLowerCase() + ' ' + zP(x.t, 0)).join(' · ')}.{' '}
          {porOp.noEvaluadas > 0 && <>Quedan fuera {zN(porOp.noEvaluadas)} empresas cruzadas que nunca llegaron a riesgos: sin análisis no hay aprobación que medir. </>}
          La lectura que busca este corte: si la conversión cae al bajar la cobertura, el problema no es el producto sino <b>cuánto límite se concede</b>; si no se mueve, el límite no era el bloqueo.
        </div>
      </div>

      {/* ===== CANAL × SEGMENTO ===== */}
      <div className="bk-lvl-h">Conversión por canal y segmento</div>
      <div className="cv">
        <table className="bk-table zo-matriz">
          <thead><tr>
            <th>Canal</th>
            {window.OPT_SEGS.map(s => <th key={s.id} className="num">{s.label}</th>)}
            <th className="num">Total</th>
          </tr></thead>
          <tbody>
            {matriz.map(r => {
              const d = r.celdas.reduce((a, c) => a + c.d, 0);
              const w = r.celdas.reduce((a, c) => a + c.w, 0);
              const l = r.celdas.reduce((a, c) => a + c.l, 0);
              return (
                <tr key={r.id}>
                  <td><b>{r.label}</b></td>
                  {r.celdas.map(c => (
                    <td key={c.seg.id} className="num mono zo-cell"
                      style={{background: c.wr ? `rgba(46,125,91,${0.05 + 0.4 * (c.wr / maxWr)})` : undefined}}
                      title={c.d + ' deals · ' + c.w + ' ganados'}>
                      {c.d ? <><b>{zP(c.wr, 0)}</b><em>{zN(c.d)} deals</em></> : <span className="bk-none">—</span>}
                    </td>
                  ))}
                  <td className="num mono total">{(w + l) ? zP(w / (w + l), 0) : '—'}<em className="zo-sub">{zN(d)} deals</em></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="cv-note">
          Color por conversión, número pequeño por volumen. El contraste que importa: el partner en Big Pymes convierte al {zP((window.OPT_CS['Partners|big']||{}).w / (((window.OPT_CS['Partners|big']||{}).w||0) + ((window.OPT_CS['Partners|big']||{}).l||0)), 0)} y el outbound en el mismo segmento al {zP((window.OPT_CS['Outbound|big']||{}).w / (((window.OPT_CS['Outbound|big']||{}).w||0) + ((window.OPT_CS['Outbound|big']||{}).l||0)), 0)}. Mismo cliente, distinta puerta.
        </div>
      </div>

      <window.RiesgoEmisor/>

      <window.CarteraCompartida/>

      <window.T2MQuarters/>

      {/* ===== TIME TO MONEY ===== */}
      <div className="bk-lvl-h">Time to money</div>
      <div className="zo-ctrl">
        <label>Corte</label>
        <div className="bk-fg">
          <button className={t2mK === 'total' ? 'on' : ''} onClick={() => setT2mK('total')}>Todo</button>
          {window.OPT_CANALES.filter(c => window.OPT_T2M['canal:' + c.id]).map(c => (
            <button key={c.id} className={t2mK === 'canal:' + c.id ? 'on' : ''} onClick={() => setT2mK('canal:' + c.id)}>{c.label}</button>
          ))}
          {window.OPT_SEGS.filter(s => window.OPT_T2M['seg:' + s.id]).map(s => (
            <button key={s.id} className={t2mK === 'seg:' + s.id ? 'on' : ''} onClick={() => setT2mK('seg:' + s.id)}>{s.label}</button>
          ))}
        </div>
      </div>
      {t2m ? (
        <div className="zo-t2m">
          {[['p25','Rápido','El cuartil que menos tarda'],['med','Mediana','La mitad firma antes de esto'],['p75','Lento','Tres de cada cuatro firman antes'],['p90','Cola','El 10% más lento']].map(([k, l, d]) => (
            <div key={k} className={'zo-tk ' + (k === 'med' ? 'accent' : '')}>
              <div className="zo-tk-l">{l}</div>
              <div className="zo-tk-n mono">{zN(t2m[k])}<span> días</span></div>
              <div className="zo-tk-d">{d}</div>
            </div>
          ))}
          <div className="zo-tk">
            <div className="zo-tk-l">Muestra</div>
            <div className="zo-tk-n mono">{zN(t2m.n)}</div>
            <div className="zo-tk-d">deals ganados con las dos fechas</div>
          </div>
        </div>
      ) : <div className="cv-note">Sin muestra suficiente para este corte.</div>}
      <div className="cv-note zo-note">
        Días entre la creación del deal y su firma. La distancia entre la mediana y el p90 es el coste oculto del embudo: {t2m ? <>la mitad firma en {zN(t2m.med)} días y el 10% más lento tarda {zN(t2m.p90)}, <b>{z1(t2m.p90 / t2m.med)}× más</b>. Esa cola es donde se muere el pipeline.</> : null}
      </div>

      {/* ===== DIMENSIÓN ===== */}
      <div className="bk-lvl-h">Conversión por dimensión de cartera</div>
      <div className="zo-ctrl">
        <label>Cortar por</label>
        <div className="bk-fg">
          {[['tier','Tier'],['cartera','Tipo de cartera'],['banda','Banda sobre facturación'],['motivo','Estado del expediente']].map(([k, l]) => (
            <button key={k} className={dim === k ? 'on' : ''} onClick={() => setDim(k)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr>
            <th>{dim === 'tier' ? 'Tier' : dim === 'cartera' ? 'Origen del colateral' : dim === 'banda' ? 'Banda' : 'Estado'}</th>
            <th className="num">Empresas</th><th className="num">Clientes</th><th className="num">Conversión</th>
            <th className="num">Contra la media</th><th>Peso</th><th className="num">Límite aprobado</th>
          </tr></thead>
          <tbody>
            {porDim.map(r => {
              const rel = wrGlobal && r.wr != null ? r.wr / wrGlobal : null;
              const tot = porDim.reduce((a, x) => a + x.n, 0);
              return (
                <tr key={r.id}>
                  <td><b>{r.label}</b></td>
                  <td className="num mono">{zN(r.n)}</td>
                  <td className="num mono">{zN(r.cli)}</td>
                  <td className="num mono">{wrChip(r.wr, wrGlobal)}</td>
                  <td className="num mono">{rel == null ? <span className="bk-none">—</span>
                    : <span className={rel >= 1 ? 'zo-up' : 'zo-down'}>{rel >= 1 ? '×' + z1(rel) : '×' + z1(1/rel) + ' peor'}</span>}</td>
                  <td className="fn-bar"><i style={{width: Math.max(1, r.n / tot * 100) + '%'}}/><em className="mono">{zP(r.n / tot, 0)}</em></td>
                  <td className="num mono">{zEur(r.eur)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {dim === 'cartera' && <div className="cv-note">El tipo de cartera lo clasifica ventas en la ficha de cada empresa: mientras esté sin clasificar, este corte solo tiene una fila. Es el cruce que dirá si el origen del colateral predice la conversión.</div>}
      </div>

      {/* ===== MOTIVOS DE PÉRDIDA ===== */}
      <div className="bk-lvl-h">Motivos de pérdida</div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr>
            <th>Motivo</th><th className="num">Empresas</th><th>Peso</th>
            <th className="num">Límite aprobado que se quedó sin firmar</th><th className="num">Pedido</th>
          </tr></thead>
          <tbody>
            {perdidas.map(r => (
              <tr key={r.id}>
                <td><span className="bk-dot" style={{background: r.color}}/><b>{r.label}</b></td>
                <td className="num mono">{zN(r.n)}</td>
                <td className="fn-bar"><i style={{width: Math.max(1, (r.peso || 0) * 100) + '%', background: r.color}}/><em className="mono">{zP(r.peso, 0)}</em></td>
                <td className="num mono">{zEur(r.eur)}</td>
                <td className="num mono">{zEur(r.req)}</td>
              </tr>
            ))}
            <tr className="bk-row-tot">
              <td>Total no cliente</td>
              <td className="num mono">{zN(perdidas.reduce((a, r) => a + r.n, 0))}</td>
              <td/>
              <td className="num mono">{zEur(perdidas.reduce((a, r) => a + r.eur, 0))}</td>
              <td className="num mono">{zEur(perdidas.reduce((a, r) => a + r.req, 0))}</td>
            </tr>
          </tbody>
        </table>
        <div className="cv-note">
          El motivo sale del expediente de riesgos cruzado con el roadmap de producto, no de un campo de HubSpot: el export no trae razón de pérdida. La columna de límite aprobado es la que ordena la cola de recuperación — <b>{zEur(perdidas.reduce((a, r) => a + r.eur, 0))}</b> pasaron por comité y no llegaron a firma.
        </div>
      </div>

      {/* ===== LO QUE FALTA ===== */}
      <div className="bk-lvl-h">Lo que falta para cerrar el análisis</div>
      <div className="zo-gaps">
        {window.OPT_CRM_GAPS.map(g => (
          <div key={g.id} className="zo-gap">
            <div className="zo-gap-h"><b>{g.campo}</b><em>{g.donde}</em></div>
            <div className="zo-gap-r"><span>Hoy</span>{g.hoy}</div>
            <div className="zo-gap-r ok"><span>Desbloquea</span>{g.desbloquea}</div>
            <div className="zo-gap-r alt"><span>Mientras tanto</span>{g.hoyCubre}</div>
          </div>
        ))}
      </div>

      <div className="bk-foot">
        {window.OPT_META.aviso} La conversión de referencia ({zP(wrGlobal)}) es la de esas mismas empresas, así que las columnas «contra la media» comparan poblaciones equivalentes y no mezclan bases.
        Los tres campos de arriba son la lista de la compra para el CRM. Hasta que existan, lo que se imputa va marcado como imputado en la pantalla donde aparece.
      </div>
    </div>
  );
};
