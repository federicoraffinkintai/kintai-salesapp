// Dashboard 1 · CALIDAD. Cohorte por fecha de creación del deal, con selector
// de trimestre. Todo medido del export: conversión de cohorte, cierre sobre
// cerrados, ticket y las tres conversiones de etapa — incluida la tasa de
// aprobación, que es el paso de risk a negociación.
const qlN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
const qlP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d).replace('.', ',') + '%';
const qlEur = (v) => v == null ? '—' : v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + 'M€'
  : v >= 1e3 ? Math.round(v / 1e3) + 'k€' : qlN(v) + '€';
const qlFmt = (m, v) => m.tipo === 'pct' ? qlP(v) : m.tipo === 'eur' ? qlEur(v) : qlN(v);

// Evolución por trimestre: el selector enseña una cohorte cada vez, así que la
// tendencia — volumen contra conversión — es justo lo que no se puede leer sin
// un gráfico. Barras = deals creados; línea = conversión de cohorte.
function QlEvolucion({ quarters, canal, sel, onSel }) {
  // De la lista resuelta, que es la que trae color y unidad.
  const ows = window.aeQ4().list.filter(a => a.ow);
  const series = ows.map(a => ({ key:a.key, nombre:a.nombre, color:a.color,
    pts: quarters.map(q => {
      const x = window.aeRealDe(a.ow, 'trimestre', q.id, canal);
      return { q: q.id, label: q.label, d: x ? x.d : 0, w: x ? x.w : 0,
        conv: x && x.d ? x.w / x.d : null };
    }) }));
  const equipo = quarters.map((q, i) => {
    const d = series.reduce((y, s) => y + s.pts[i].d, 0);
    const w = series.reduce((y, s) => y + s.pts[i].w, 0);
    return { q:q.id, label:q.label, d, w, conv: d ? w / d : null };
  });
  const paneles = series.concat([{ key:'equipo', nombre:'Equipo', color:'var(--kin)', pts:equipo }]);
  // El equipo es la suma de los tres, así que aplasta a los demás: los AE
  // comparten escala entre ellos y el panel de equipo lleva la suya.
  const maxAE = Math.max(1, ...series.flatMap(p => p.pts.map(x => x.d)));
  const maxEq = Math.max(1, ...equipo.map(x => x.d));
  const maxC = Math.max(0.05, ...paneles.flatMap(p => p.pts.map(x => x.conv || 0)));
  const W = 240, H = 78, pad = 6;
  const bw = (W - pad * 2) / Math.max(1, quarters.length);

  return (
    <div className="cht-g">
      {paneles.map(p => {
        const maxD = p.key === 'equipo' ? maxEq : maxAE;
        const linea = p.pts.map((x, i) => x.conv == null ? null
          : [pad + bw * i + bw / 2, H - 8 - (x.conv / maxC) * (H - 22)]).filter(Boolean);
        return (
          <div key={p.key} className={'cht' + (sel === p.key ? ' on' : '')}
            onClick={() => p.key !== 'equipo' && onSel && onSel(p.key)}>
            <div className="cht-h"><b>{p.nombre}</b><i className="cht-esc">{p.key === 'equipo' ? 'escala propia' : 'escala común'}</i>
              <em>{qlN(p.pts.reduce((y, x) => y + x.d, 0))} creados · {qlP(p.pts.reduce((y, x) => y + x.d, 0) ? p.pts.reduce((y, x) => y + x.w, 0) / p.pts.reduce((y, x) => y + x.d, 0) : null)} conversión</em></div>
            <svg viewBox={'0 0 ' + W + ' ' + H} className="cht-svg" preserveAspectRatio="none">
              {p.pts.map((x, i) => {
                const h = (x.d / maxD) * (H - 22);
                return <rect key={i} x={pad + bw * i + 2} y={H - 8 - h} width={Math.max(2, bw - 4)} height={Math.max(0, h)} className="cht-bar"/>;
              })}
              {linea.length > 1 && <polyline points={linea.map(pt => pt.join(',')).join(' ')} className="cht-line" style={{stroke: p.color}}/>}
              {linea.map((pt, i) => <circle key={i} cx={pt[0]} cy={pt[1]} r="2.2" className="cht-dot" style={{fill: p.color}}/>)}
              <line x1="0" y1={H - 8} x2={W} y2={H - 8} className="cht-ax"/>
            </svg>
            <div className="cht-x"><span>{quarters[0].label}</span><span>{quarters[quarters.length - 1].label}</span></div>
          </div>
        );
      })}
    </div>
  );
}

window.AeDashCalidad = function AeDashCalidad({ sel, onSel }) {
  const quarters = React.useMemo(() => window.aeDashQuarters(), []);
  const [q, setQ] = React.useState(window.aeDashUltimo('trimestre'));
  const [canal, setCanal] = React.useState('todos');
  const C = React.useMemo(() => window.aeDashCohorte(q, 'trimestre', canal), [q, canal]);
  const canLabel = canal === 'todos' ? null : (window.AE_REAL_CANALES.find(x => x.id === canal) || {}).label;
  // Cinco KPIs exactos, que es lo que la rejilla del dashboard SDR reserva.
  const kpis = window.AEDASH_CALIDAD.filter(m => m.id !== 'creados' && m.id !== 'cerrados' && m.id !== 'wr');
  const maxCer = Math.max(...C.list.map(x => x.v.cerrados || 0), 1);

  return (
    <>
      <div className="bk-lvl-h">Dashboard 2 · Calidad · cohorte por fecha de creación</div>
      <div className="ob-lv">
        <label>Trimestre de creación</label>
        <div className="bk-fg">
          {quarters.map(x => (
            <button key={x.id} className={q === x.id ? 'on' : ''} onClick={() => setQ(x.id)}>{x.label}</button>
          ))}
        </div>
        <span className="ob-lv-n">{C.conMedida} de los {C.list.length} AE crearon deals {canLabel ? 'de ' + canLabel.toLowerCase() + ' ' : ''}en {q.replace('-', ' ')}. {window.AEDASH_META.cohorte}</span>
      </div>
      <div className="ob-lv">
        <label>Canal de origen</label>
        <div className="bk-fg">
          <button className={canal === 'todos' ? 'on' : ''} onClick={() => setCanal('todos')}>Todos</button>
          {window.AE_REAL_CANALES.map(x => (
            <button key={x.id} className={canal === x.id ? 'on' : ''} onClick={() => setCanal(x.id)}>{x.label}</button>
          ))}
        </div>
        <span className="ob-lv-n">El origen sale del campo Source Type del deal, así que la cohorte se puede partir por canal: un mismo AE cierra distinto lo que trae un partner que lo que levanta en frío.</span>
      </div>
      <div className="sdr-cards">
        {C.list.map((x, i) => (
          <div className={'sdr-card' + (sel === x.key ? ' me' : '')} key={x.key} onClick={() => onSel && onSel(x.key)}>
            <div className="sdr-card-h">
              <span className="sdr-pos mono">{i + 1}</span>
              <div>
                <div className="sdr-nom">{x.nombre}<em>{x.unidadLabel}</em></div>
                <div className="sdr-sub">{x.medido
                  ? qlN(x.v.cerrados) + ' cerrados · ' + qlN(x.l) + ' perdidos · ' + qlN(x.abiertos) + ' siguen abiertos'
                  : 'sin deals ' + (canLabel ? 'de ' + canLabel.toLowerCase() + ' ' : '') + 'creados en ' + q.replace('-', ' ')}</div>
              </div>
              <span className="sdr-meet mono">{qlN(x.v.creados)}<em>deals creados{canLabel ? ' · ' + canLabel.toLowerCase() : ''}</em></span>
            </div>
            <div className="sdr-kpis">
              <div className={'sdr-k' + (x.medido ? '' : ' pend')} title="Deals de la cohorte que siguen vivos hoy: el resto ya ganó o se perdió.">
                <span className="sdr-k-l">Siguen abiertos</span>
                <span className="sdr-k-n mono">{qlN(x.abiertos)}</span>
                <span className="sdr-k-s">{x.medido ? qlP(x.abiertos / x.v.creados) + ' de la cohorte' : 'sin cohorte'}</span>
              </div>
              {kpis.map(m => (
                <div className={'sdr-k' + (m.estado === 'pendiente' || x.v[m.id] == null ? ' pend' : '')} key={m.id} title={m.desc}>
                  <span className="sdr-k-l">{m.label}</span>
                  <span className="sdr-k-n mono">{m.estado === 'pendiente' ? '—' : qlFmt(m, x.v[m.id])}</span>
                  <span className="sdr-k-s">{m.estado === 'pendiente' ? 'sin instrumentar'
                    : m.estado === 'imputado' ? 'imputado por segmento'
                    : !x.medido ? 'sin cohorte'
                    : m.id === 'conv' ? qlN(x.v.cerrados) + ' de ' + qlN(x.v.creados) + ' creados'
                    : m.id === 'wr' ? qlN(x.v.cerrados) + ' de ' + qlN(x.w + x.l) + ' cerrados'
                    : m.id === 'ticket' ? 'por cliente ganado' : 'medido'}</span>
                </div>
              ))}
            </div>
            <div className="sdr-embudo wide">
              <div className="sdr-e-t">Conversiones de etapa de la cohorte</div>
              {x.conv.map(c => (
                <div className="sdr-e" key={c.id} title={c.desc}>
                  <span>{c.label}</span>
                  {c.v == null
                    ? <span className="sdr-e-p">{c.estado === 'pendiente'
                        ? 'el CRM no separa firma de disposición'
                        : 'sin deals que alcancen ' + window.AE_REAL_META.hitos[c.de].toLowerCase()}</span>
                    : <div><i style={{width: Math.max(2, Math.min(100, c.v * 100)) + '%'}}/></div>}
                  <b className="mono">{qlP(c.v)}</b>
                </div>
              ))}
              <div className="sdr-e">
                <span>Clientes cerrados</span>
                {x.v.cerrados
                  ? <div><i style={{width: Math.max(2, x.v.cerrados / maxCer * 100) + '%', background:'#1F5C42'}}/></div>
                  : <span className="sdr-e-p">sin cierres en la cohorte</span>}
                <b className="mono">{qlN(x.v.cerrados)}</b>
              </div>
            </div>
            <div className="sdr-badges">
              {(() => {
                const bd = (C.act.list.find(a => a.key === x.key) || { badges: [] }).badges;
                return bd.length
                  ? bd.map(id => {
                      const b = window.AEACT_BADGES.find(y => y.id === id);
                      return b ? <span className="ap-badge" key={id} title={b.name + ' · ' + b.desc}>{b.icon}</span> : null;
                    })
                  : <span className="sdr-nobadge">Sin insignias todavía</span>;
              })()}
            </div>
          </div>
        ))}
      </div>
      <section className="bk-block">
        <div className="bk-bh">
          <span className="bk-chip">Evolución por trimestre · volumen contra conversión</span>
          <span className="bk-bh-d">Ocho trimestres de cohortes seguidas{canLabel ? ' de ' + canLabel.toLowerCase() : ''}: la barra es el volumen de deals creados y la línea su conversión a cliente. Las dos juntas son la lectura que importa — sostener la conversión mientras sube el volumen es mérito; subirla recortando volumen, no.</span>
          <span className="bk-bh-k mono">{quarters.length} trimestres</span>
        </div>
        <QlEvolucion quarters={quarters} canal={canal} sel={sel} onSel={onSel}/>
      </section>

      <div className="bk-lvl2">
        <div className="bk-lvl2-n">
          <b>La conversión de cohorte se lee con lo que sigue abierto.</b> Divide los clientes cerrados entre los deals creados en el trimestre, así que un trimestre reciente sale bajo por construcción: la mitad de esos deals todavía está viva. Por eso el KPI de <b>siguen abiertos</b> va al lado — cuanto más alto, más pendiente de resolverse está la cohorte y menos definitiva es su conversión. <b>Volumen y conversión también se leen juntos.</b> Un AE que crea el doble de deals con la misma conversión está haciendo mejor trabajo que uno que sostiene el ratio con la mitad de volumen. {window.AEDASH_META.aviso}
        </div>
      </div>
      <div className="bk-foot">
        {window.AE_REAL_META.fuente}. {window.AE_REAL_META.aviso} La <b>tasa de aprobación</b> es el paso de risk a negociación: operaciones que salen del comité con límite y precio sobre la mesa. {window.AEDASH_CALIDAD.filter(m => m.instrumentar).map(m => m.label + ': ' + m.instrumentar).join(' ')} La TAE sale de la tabla por segmento de la hoja de outbound, que hoy pone {qlP(window.AEDASH_TAE_SEG.big)} en los cuatro segmentos: el ranking por precio no discrimina hasta que el CRM traiga la TAE de cada operación.
      </div>
    </>
  );
};
