// Performance AE · Q4 2026: objetivo de cada AE, la mezcla que lo sostiene y
// el pipeline vivo con el que llega. Sin histórico: esta pestaña mira adelante.
const { useState, useMemo } = React;

const aN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
const a1 = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(1).replace('.', ',');
const aP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 1 : d).replace('.', ',') + '%';
const aEur = (v) => v == null ? '—' : v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + 'M€'
  : v >= 1e3 ? Math.round(v / 1e3) + 'k€' : aN(v) + '€';

window.AePerf = function AePerf() {
  const q4 = useMemo(() => window.aeQ4(), []);
  const [sel, setSel] = useState((q4.list.find(a => a.pipe) || q4.list[0]).key);
  const [tier, setTier] = useState('todos');
  // Agrega una lista de deals abiertos con la misma forma que aeQ4Pipe, para
  // poder mirar el pipeline de un AE, del equipo entero o de un solo tier.
  const agregar = (ds) => {
    if (!ds || !ds.length) return null;
    const sum = (l, f) => l.reduce((y, x) => y + f(x), 0);
    const venc = ds.filter(x => x.d && x.d < window.PIPE_Q4[0] + '-01');
    const enQ4 = ds.filter(x => x.d && (window.PIPE_Q4.indexOf(x.d.slice(0, 7)) >= 0 || x.d < window.PIPE_Q4[0] + '-01'));
    return { deals: ds, n: ds.length, eur: sum(ds, x => x.e), pond: sum(ds, x => x.e * x.p),
      sinFecha: ds.filter(x => !x.d).length, sinImporte: ds.filter(x => !x.e).length,
      venc: { n: venc.length, eur: sum(venc, x => x.e), pond: sum(venc, x => x.e * x.p) },
      q4: { n: enQ4.length, eur: sum(enQ4, x => x.e), pond: sum(enQ4, x => x.e * x.p),
        cli: sum(enQ4, x => x.p), conFecha: enQ4.filter(x => x.d >= window.PIPE_Q4[0] + '-01').length } };
  };
  const TIERS = (window.BRK_SEGS || []).map(s => ({ id: s.id, label: s.label }))
    .concat([{ id: 'sinimp', label: 'Sin importe' }]);
  const w100 = (v) => Math.max(0, Math.min(100, (v || 0) * 100)) + '%';
  const cobCol = (v) => v == null ? '#767D8C' : v >= 1 ? '#1F5C42' : v >= 0.6 ? '#B8731F' : '#B23A3A';

  return (
    <div className="ap bk" data-screen-label="11 Performance AE">
      <div className="bk-head">
        <div>
          <h1 className="bk-h1">Performance AE · Q4 2026</h1>
          <div className="bk-sub">Seis AE con objetivo de trimestre: <b>cuatro en Pymes</b> a 2M€ cada uno — 6 clientes Big de 300k€, 2 Mid de 100k€ y unos 80 deals por cabeza — y <b>dos en Mid Market</b>, Paula con {aEur(28e6)} y Alex con {aEur(30e6)}: {aEur(q4.tot.obj)} en total. {q4.t.arrancaEn > 0
            ? <>Q4 arranca en <b>{q4.t.arrancaEn} días</b>, así que lo que se mide hoy es el ritmo que exige cada objetivo y el pipeline vivo con el que se llega.</>
            : <>Van <b>{q4.t.transcurridos} de {q4.t.dias} días</b> del trimestre.</>}</div>
        </div>
        <div className="bk-kpis">
          <div className="bk-kpi accent"><b className="mono">{aEur(q4.tot.obj)}</b><span>objetivo Q4 · volumen</span></div>
          <div className="bk-kpi"><b className="mono">{aN(q4.tot.cli)}</b><span>clientes comprometidos</span></div>
          <div className="bk-kpi"><b className="mono">{aN(q4.tot.deals)}</b><span>deals a trabajar</span></div>
          <div className="bk-kpi"><b className="mono">{aEur(q4.tot.pipePond)}</b><span>forecast Q4 ponderado</span></div>
          <div className="bk-kpi"><b className="mono">{aP(q4.tot.obj ? q4.tot.pipePond / q4.tot.obj : null, 0)}</b><span>cobertura del objetivo total</span></div>
        </div>
      </div>

      {/* ===== OBJETIVO Q4 · UNIDADES ===== */}
      <section className="bk-cons">
        <div className="bk-cons-h">
          <span className="bk-chip">Objetivo de Q4 · por unidad</span>
          <span className="bk-bh-d">{window.AEQ4_META.nota} El ritmo semanal reparte el objetivo sobre las {a1(q4.t.semanas)} semanas del trimestre.</span>
          <span className="bk-bh-k mono">{aEur(q4.tot.obj)} · {aN(q4.tot.cli)} clientes</span>
        </div>
        <div className="bk-cons-g">
          {q4.unidades.map(u => (
            <div key={u.id} className="bk-cn foco" style={{'--c': u.color}}>
              <div className="bk-cn-h"><div className="bk-cn-t">{u.label}<span className="bk-cn-f">{u.miembros.length} AE</span></div></div>
              <div className="bk-cn-hero">
                <div><b className="mono">{aEur(u.obj)}</b><span>volumen objetivo</span></div>
                <div><b className="mono">{u.cli ? aN(u.cli) : '—'}</b><span>clientes</span></div>
                <div><b className="mono">{u.deals ? aN(u.deals) : '—'}</b><span>deals</span></div>
              </div>
              <div className="bk-cn-sub mono">{u.nuevo === u.obj ? 'todo nuevo negocio' : aEur(u.nuevo) + ' nuevo · ' + aEur(u.rec) + ' cartera'}<u>{aEur(u.eurSem)} por semana</u><u>{u.miembros.map(a => a.nombre).join(' · ')}</u></div>
              <div className="bk-cn-m">
                <div className="bk-cn-l"><span>forecast Q4 · cobertura</span><b className="mono">{aP(u.obj ? u.pipePond / u.obj : null, 0)}</b></div>
                <div className="bk-cn-bar"><i style={{width: w100(u.obj ? u.pipePond / u.obj : null)}}/></div>
                <em>{u.desc} El pipeline vivo aporta <b>{aEur(u.pipePond)}</b> ponderados sobre {aN(u.pipeN)} deals con cierre esperado en Q4.</em>
              </div>
            </div>
          ))}
          <div className="bk-cn foco" style={{'--c':'var(--kin)'}}>
            <div className="bk-cn-h"><div className="bk-cn-t">Total equipo<span className="bk-cn-f">{q4.list.length} AE</span></div></div>
            <div className="bk-cn-hero">
              <div><b className="mono">{aEur(q4.tot.obj)}</b><span>volumen objetivo</span></div>
              <div><b className="mono">{aN(q4.tot.cli)}</b><span>clientes</span></div>
              <div><b className="mono">{aN(q4.tot.deals)}</b><span>deals comprometidos</span></div>
            </div>
            <div className="bk-cn-sub mono">{aEur(q4.tot.nuevo)} nuevo · {aEur(q4.tot.rec)} cartera<u>{aEur(q4.tot.eurSem)} por semana</u></div>
            <div className="bk-cn-m">
              <div className="bk-cn-l"><span>peso de cada unidad</span></div>
              <div className="ap-q4-split">
                {q4.unidades.map(u => (
                  <i key={u.id} style={{width:(u.obj / q4.tot.obj * 100) + '%', background:u.color}} title={u.label + ' · ' + aEur(u.obj)}/>
                ))}
              </div>
              <em>Mid Market concentra <b>{aP(q4.unidades[1].obj / q4.tot.obj, 0)}</b> del volumen con un tercio del equipo. Los {aN(q4.tot.deals)} deals de objetivo son el trabajo que sostiene la cifra: {aN(q4.unidades[0].deals)} en Pymes — mitad partners, mitad outbound — y {aN(q4.unidades[1].deals)} de Paula.</em>
            </div>
          </div>
        </div>
      </section>

      {/* ===== OBJETIVO POR AE ===== */}
      <div className="bk-lvl-h">Objetivo de cada AE</div>
      <div className="ap-q4-g">
        {q4.list.map(a => (
          <div key={a.key} className={'bk-cn ap-q4 ' + (sel === a.key ? 'on' : '')} style={{'--c': a.color}} onClick={() => setSel(a.key)}>
            <div className="bk-cn-h"><div className="bk-cn-t">{a.nombre}<span className="bk-cn-f">{a.unidadLabel}</span></div>
              <span className="mono ap-q4-sem">{aEur(a.eurSem)}/sem</span></div>
            <div className="bk-cn-hero">
              <div><b className="mono">{aEur(a.obj.eur)}</b><span>volumen</span></div>
              <div><b className="mono">{a.obj.clientes ? aN(a.obj.clientes) : '—'}</b><span>clientes</span></div>
              <div><b className="mono">{a.obj.deals ? aN(a.obj.deals) : '—'}</b><span>deals</span></div>
            </div>
            <div className="bk-cn-sub mono">{a.obj.recurrente ? aEur(a.obj.nuevo) + ' nuevo + ' + aEur(a.obj.recurrente) + ' cartera' : 'todo nuevo negocio'}
              <u>{a.obj.ticket ? 'ticket ' + aEur(a.obj.ticket) : 'ticket mixto Big / Mid'}</u></div>
            <div className="bk-cn-m">
              <div className="bk-cn-l"><span>forecast Q4 · cobertura</span><b className="mono" style={{color: cobCol(a.cob)}}>{a.pipe ? aP(a.cob, 0) : '—'}</b></div>
              <div className="bk-cn-bar"><i style={{width: w100(a.cob)}}/></div>
              <em>{a.pipe
                ? <>Su pipeline vivo pone <b>{aEur(a.pipe.q4.pond)}</b> ponderados de los {aEur(a.pipe.q4.eur)} que puede cerrar en Q4, sobre {aN(a.pipe.q4.n)} deals abiertos. Faltan <b>{aEur(Math.max(0, a.obj.eur - a.pipe.q4.pond))}</b> por generar.</>
                : <>Sin pipeline propio en el export: los {aEur(a.obj.eur)} están por construir enteros.</>}</em>
            </div>
            {a.mezcla && <div className="ap-q4-mx">
              <div className="ap-q4-mx-t">De dónde salen los {aEur(a.obj.eur)}</div>
              <div className="ap-q4-split">
                {a.mezcla.map(m => <i key={m.id} style={{width:(m.eur / a.obj.eur * 100) + '%', background:m.color}} title={m.label + ' · ' + aEur(m.eur)}/>)}
              </div>
              <ul>
                {a.mezcla.map(m => (
                  <li key={m.id}><s style={{background:m.color}}/><span>{m.label}</span>
                    <em>{m.ticket ? aEur(m.ticket) + ' cada uno' : 'renovación'}</em>
                    <b className="mono">{aEur(m.eur)}</b></li>
                ))}
              </ul>
            </div>}
            {a.canal && <div className="ap-q4-mx">
              <div className="ap-q4-mx-t">De dónde salen los {aN(a.obj.deals)} deals</div>
              <div className="ap-q4-split">
                {a.canal.map(c => <i key={c.id} style={{width:(c.deals / a.obj.deals * 100) + '%', background:c.color}} title={c.label}/>)}
              </div>
              <ul>
                {a.canal.map(c => (
                  <li key={c.id}><s style={{background:c.color}}/><span>{c.label}</span>
                    <em>{a1(c.deals / q4.t.semanas)} por semana</em>
                    <b className="mono">{aN(c.deals)}</b></li>
                ))}
              </ul>
            </div>}
          </div>
        ))}
      </div>
      <div className="bk-lvl2">
        <div className="bk-lvl2-n">
          Cada AE de Pymes construye sus 2M€ con <b>6 clientes Big de 300k€</b> y <b>2 Mid de 100k€</b>, sobre unos <b>80 deals</b> — 40 de partners y 40 de outbound —, así que la unidad compromete {aN(q4.unidades[0].cli)} clientes y {aN(q4.unidades[0].deals)} deals. En Mid Market el ticket es 1M€ por cliente: los 6M€ nuevos de Paula son sus 6 clientes y los 30M€ de Alex son sus 30. El forecast ponderado aplica la probabilidad por fase de dirección — {window.PIPE_FASES.map(f => f.label.toLowerCase() + ' ' + Math.round(window.PIPE_PROB_FASE[f.id] * 100) + '%').join(', ')} — al importe de línea esperado.
        </div>
      </div>

      {/* ===== RESUMEN DEL EQUIPO ===== */}
      {(() => {
        const q = window.aeDashUltimo ? window.aeDashUltimo('trimestre') : null;
        if (!q) return null;
        const util = (window.pfReal(window.PF_META.realHasta) || {}).util;
        const tae = window.AEDASH_TAE_SEG ? window.AEDASH_TAE_SEG.big : 0.25;
        const filas = q4.list.map(a => {
          const x = window.aeRealDe(a.ow, 'trimestre', q);
          const c = a.ow ? (window.AE_REAL_CICLO || {})[a.ow] : null;
          const lineas = x ? x.eurW : null;
          const loanbook = lineas != null && util ? lineas * util : null;
          return { a, x, c, lineas, loanbook,
            revenue: loanbook != null ? loanbook * tae : null,
            fcast: a.pipe ? a.pipe.q4.pond : null,
            conv: x && x.d ? x.w / x.d : null,
            // Higiene y respuesta: sin registro por propietario, valores de
            // ejemplo deterministas para poder juzgar la tabla.
            sinAct: window.aeDemoVal(a.key, 'sinAct', 0.05, 0.34),
            resp36: window.aeDemoVal(a.key, 'resp36', 0.62, 0.98),
            email4: window.aeDemoVal(a.key, 'email4', 0.45, 0.96) };
        });
        const sum = (f) => filas.reduce((y, r) => y + (f(r) || 0), 0);
        const tD = sum(r => r.x && r.x.d), tW = sum(r => r.x && r.x.w), tLin = sum(r => r.lineas);
        return (
          <section className="bk-block">
            <div className="bk-bh">
              <span className="bk-chip">Resumen del equipo · Q4 2026</span>
              <span className="bk-bh-d">La foto con la que el equipo entra en Q4, de la actividad al dinero: deals creados y hasta dónde llegaron, líneas firmadas, lo que esas líneas ponen en cartera y el ingreso que generan al precio actual. {q4.t.arrancaEn > 0 ? 'El trimestre arranca en ' + q4.t.arrancaEn + ' días, así que las columnas medidas son las de la última cohorte cerrada (' + q.replace('-', ' ') + ') y el forecast es el pipeline vivo para Q4.' : 'Las columnas medidas son las de la cohorte del trimestre.'} Las tres últimas son <b>datos de ejemplo</b>: la actividad y la respuesta no se registran todavía con propietario.</span>
              <span className="bk-bh-k mono">{aN(tW)} clientes · {aEur(tLin)} en líneas</span>
            </div>
            <div className="bk-scroll">
              <table className="bk-table">
                <thead><tr>
                  <th>AE</th><th className="num">Deals</th><th className="num">Data gatherings</th>
                  <th className="num">Propuestas</th><th className="num">Activaciones</th><th className="num">Clientes</th>
                  <th className="num">Líneas</th><th className="num">Loanbook</th><th className="num">Pricing</th>
                  <th className="num">Revenue generado</th><th className="num">Forecast pipe Q4</th>
                  <th className="num">Conversión</th><th className="num">Time to money</th>
                  <th className="num grp">% deals sin actividad<em className="cap-th-e">ejemplo</em></th>
                  <th className="num">% respuesta en 36 h<em className="cap-th-e">ejemplo</em></th>
                  <th className="num">% email resumen en 4 h<em className="cap-th-e">ejemplo</em></th>
                </tr></thead>
                <tbody>
                  {filas.map(r => (
                    <tr key={r.a.key} className={sel === r.a.key ? 'on' : ''} onClick={() => setSel(r.a.key)}>
                      <td className="bk-nom"><b>{r.a.nombre}</b><em>{r.x ? r.a.unidadLabel : 'sin cohorte medida'}</em></td>
                      <td className="num mono">{r.x ? aN(r.x.d) : <span className="bk-none">—</span>}</td>
                      <td className="num mono">{r.x ? aN(r.x.alc.data) : <span className="bk-none">—</span>}</td>
                      <td className="num mono">{r.x ? aN(r.x.alc.nego) : <span className="bk-none">—</span>}</td>
                      <td className="num mono">{r.x ? aN(r.x.alc.won) : <span className="bk-none">—</span>}</td>
                      <td className="num mono"><b>{r.x ? aN(r.x.w) : <span className="bk-none">—</span>}</b></td>
                      <td className="num mono">{r.lineas != null ? aEur(r.lineas) : <span className="bk-none">—</span>}</td>
                      <td className="num mono">{r.loanbook != null ? aEur(r.loanbook) : <span className="bk-none">—</span>}</td>
                      <td className="num mono">{r.x ? aP(tae, 0) : <span className="bk-none">—</span>}</td>
                      <td className="num mono">{r.revenue != null ? aEur(r.revenue) : <span className="bk-none">—</span>}</td>
                      <td className="num mono">{r.fcast != null ? aEur(r.fcast) : <span className="bk-none">—</span>}</td>
                      <td className="num mono">{r.conv == null ? <span className="bk-none">—</span>
                        : <span className="k-ach" style={{'--c': r.conv >= 0.15 ? '#1F5C42' : r.conv >= 0.07 ? '#B8731F' : '#B23A3A'}}>{aP(r.conv, 1)}</span>}</td>
                      <td className="num mono">{r.c ? aN(r.c.med) + ' d' : <span className="bk-none">—</span>}</td>
                      <td className="num mono grp"><span className="k-ach" style={{'--c': r.sinAct <= 0.1 ? '#1F5C42' : r.sinAct <= 0.2 ? '#B8731F' : '#B23A3A'}}>{aP(r.sinAct, 0)}</span></td>
                      <td className="num mono"><span className="k-ach" style={{'--c': r.resp36 >= 0.9 ? '#1F5C42' : r.resp36 >= 0.75 ? '#B8731F' : '#B23A3A'}}>{aP(r.resp36, 0)}</span></td>
                      <td className="num mono"><span className="k-ach" style={{'--c': r.email4 >= 0.9 ? '#1F5C42' : r.email4 >= 0.7 ? '#B8731F' : '#B23A3A'}}>{aP(r.email4, 0)}</span></td>
                    </tr>
                  ))}
                  <tr className="bk-row-tot">
                    <td>Equipo<em className="ap-pop">{q.replace('-', ' ')}</em></td>
                    <td className="num mono">{aN(tD)}</td>
                    <td className="num mono">{aN(sum(r => r.x && r.x.alc.data))}</td>
                    <td className="num mono">{aN(sum(r => r.x && r.x.alc.nego))}</td>
                    <td className="num mono">{aN(sum(r => r.x && r.x.alc.won))}</td>
                    <td className="num mono">{aN(tW)}</td>
                    <td className="num mono">{aEur(tLin)}</td>
                    <td className="num mono">{aEur(sum(r => r.loanbook))}</td>
                    <td className="num mono">{aP(tae, 0)}</td>
                    <td className="num mono">{aEur(sum(r => r.revenue))}</td>
                    <td className="num mono">{aEur(q4.tot.pipePond)}</td>
                    <td className="num mono">{aP(tD ? tW / tD : null, 1)}</td>
                    <td className="num mono">—</td>
                    <td className="num mono grp">{aP(filas.reduce((y, r) => y + r.sinAct, 0) / filas.length, 0)}</td>
                    <td className="num mono">{aP(filas.reduce((y, r) => y + r.resp36, 0) / filas.length, 0)}</td>
                    <td className="num mono">{aP(filas.reduce((y, r) => y + r.email4, 0) / filas.length, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bk-bn">
              Deals, hitos alcanzados, clientes y líneas salen del {window.AE_REAL_META.fuente}, por cohorte de creación. <b>Loanbook</b> imputa la utilización real de cartera ({aP(util, 0)} en {window.PF_META.realHasta}) sobre las líneas firmadas, y <b>revenue generado</b> aplica la TAE de {aP(tae, 0)} a ese loanbook: son dos imputaciones declaradas, no cobros. El <b>time to money</b> es la mediana de días entre creación y cierre de los ganados desde 2025. Las tres últimas columnas —deals sin actividad, respuesta en 36 h y email resumen en 4 h— son <b>valores de ejemplo</b> deterministas por AE: no hay registro de actividad con propietario en HubSpot, así que están para validar la lectura de la tabla, no para evaluar a nadie.
            </div>
          </section>
        );
      })()}

      {/* ===== PIPELINE Y FORECAST ===== */}
      <div className="bk-lvl-h">Pipeline vivo y forecast por AE</div>
      <div className="ob-lv">
        <label>AE</label>
        <div className="bk-fg">
          <button className={sel === 'todos' ? 'on' : ''} onClick={() => setSel('todos')}>Todos los AE</button>
          {q4.list.map(a => (
            <button key={a.key} className={sel === a.key ? 'on' : ''} onClick={() => setSel(a.key)} disabled={!a.pipe}>{a.nombre}</button>
          ))}
        </div>
        <label>Tier</label>
        <div className="bk-fg">
          <button className={tier === 'todos' ? 'on' : ''} onClick={() => setTier('todos')}>Todos</button>
          {TIERS.map(t => (
            <button key={t.id} className={tier === t.id ? 'on' : ''} onClick={() => setTier(t.id)}>{t.label}</button>
          ))}
        </div>
        <span className="ob-lv-n">{q4.tot.conPipe} de los {q4.list.length} AE son propietarios de deals abiertos en el export; los recién incorporados todavía no tienen pipeline a su nombre. El tier sale del importe de línea de cada deal, así que filtrar por tier reparte el mismo pipeline, no lo recorta.</span>
      </div>
      {(() => {
        const todos = sel === 'todos';
        const base = todos
          ? { key:'todos', nombre:'Todo el equipo', unidadLabel:q4.list.length + ' AE', color:'var(--kin)',
              obj:{ eur:q4.tot.obj },
              pipe: agregar(q4.list.filter(x => x.pipe).reduce((acc, x) => acc.concat(x.pipe.deals), [])) }
          : (q4.list.find(x => x.key === sel) || q4.list[0]);
        // El tier reparte el pipeline: se recalcula todo sobre los deals del tier.
        const pipeT = base.pipe && tier !== 'todos'
          ? agregar(base.pipe.deals.filter(x => x.seg === tier))
          : base.pipe;
        const tierL = tier === 'todos' ? null : (TIERS.find(t => t.id === tier) || {}).label;
        const a = { ...base, pipe: pipeT,
          nombre: base.nombre + (tierL ? ' · ' + tierL : ''),
          cob: pipeT && base.obj.eur ? pipeT.q4.pond / base.obj.eur : null,
          cobBruta: pipeT && base.obj.eur ? pipeT.q4.eur / base.obj.eur : null };
        if (!a.pipe) return (
          <section className="bk-block" style={{'--c': a.color}}>
            <div className="bk-bh"><span className="bk-chip">{a.nombre}</span>
              <span className="bk-bh-d">{tierL && base.pipe
                ? 'Ninguno de sus ' + aN(base.pipe.n) + ' deals abiertos es de ' + tierL + ': sus ' + aEur(base.pipe.q4.pond) + ' de forecast ponderado para Q4 están en otros tiers.'
                : 'No hay deals abiertos a su nombre en el export de HubSpot del ' + window.PIPE_META.fuente.split('deals abiertos ')[1] + '. Su objetivo de ' + aEur(a.obj.eur) + ' está por construir entero: ' + (a.obj.deals ? aN(a.obj.deals) + ' deals a abrir, ' + a1(a.obj.deals / q4.t.semanas) + ' por semana.' : 'sin deals de referencia.')}</span></div>
          </section>
        );
        const p = a.pipe;
        const pp = window.aePipeView(p.deals);
        const maxE = Math.max(...pp.etapas.map(e => e.eur), 1);
        const maxM = Math.max(...pp.meses.map(m => m.eur), 1);
        const gap = Math.max(0, a.obj.eur - p.q4.pond);
        return (
          <section className="bk-block bk-pipe" style={{'--c': a.color}}>
            <div className="bk-bh">
              <span className="bk-chip">Pipeline vivo · forecast · {a.nombre}</span>
              <span className="bk-bh-d">Los {aN(pp.n)} deals que {a.nombre} tiene abiertos hoy, por fase del embudo, con el importe de línea esperado, la fecha de cierre que lleva cada deal y la probabilidad de su etapa. El ponderado es importe × probabilidad: el forecast mensual sale de repartir ese ponderado por la fecha esperada de cierre.</span>
              <span className="bk-bh-k mono">{aEur(pp.pond)} ponderado · {aEur(pp.eur)} bruto</span>
            </div>

            <div className="pp-top">
              <div className="pp-c"><b className="mono">{aN(pp.n)}</b><span>deals abiertos</span><em>{aEur(pp.eur)} de línea pedida</em></div>
              <div className="pp-c accent"><b className="mono">{aEur(pp.pond)}</b><span>ponderado por probabilidad</span><em>{aP(pp.eur ? pp.pond / pp.eur : null, 0)} del bruto</em></div>
              <div className="pp-c"><b className="mono">{aEur(p.q4.pond)}</b><span>forecast Q4 · con arrastrados</span><em>{aN(p.q4.n)} deals · {a1(p.q4.cli)} clientes ponderados</em></div>
              <div className="pp-c" style={{borderColor: cobCol(a.cob)}}><b className="mono" style={{color: cobCol(a.cob)}}>{aP(a.cob, 0)}</b><span>cobertura de su objetivo</span><em>{aEur(a.obj.eur)} de objetivo{tierL ? ' total, no del tier' : ''} · {aEur(gap)} por generar</em></div>
              <div className="pp-c warn"><b className="mono">{aN(pp.vencidos.n)}</b><span>con fecha anterior a Q4</span><em>{aP(pp.n ? pp.vencidos.n / pp.n : null, 0)} del pipeline · {aEur(pp.vencidos.pond)} arrastrados a Q4</em></div>
            </div>

            <div className="bk-scroll">
              <table className="bk-table pp-t">
                <thead><tr>
                  <th>Fase</th><th className="num">Prob.</th><th className="num">Deals</th>
                  <th className="num">Línea bruta</th><th className="num">Línea media</th><th>Ponderado</th>
                </tr></thead>
                <tbody>
                  {pp.etapas.map(e => (
                    <tr key={e.st}>
                      <td className="bk-nom"><b>{e.label}</b><em className="bk-hs">{e.desc}</em></td>
                      <td className="num mono">{aP(e.p, 0)}</td>
                      <td className="num mono">{aN(e.n)}</td>
                      <td className="num mono">{aEur(e.eur)}</td>
                      <td className="num mono">{e.n ? aEur(e.eur / e.n) : <span className="bk-none">—</span>}</td>
                      <td className="cap-acum"><b className="mono cap-acum-v">{aEur(e.pond)}</b><span className="cap-acum-b"><i style={{width: Math.max(0, Math.min(100, e.eur / maxE * 100)) + '%'}}/></span></td>
                    </tr>
                  ))}
                  <tr className="bk-row-tot">
                    <td>Pipeline abierto</td>
                    <td className="num mono"><span className="bk-none">—</span></td>
                    <td className="num mono">{aN(pp.n)}</td>
                    <td className="num mono">{aEur(pp.eur)}</td>
                    <td className="num mono">{pp.n ? aEur(pp.eur / pp.n) : <span className="bk-none">—</span>}</td>
                    <td className="cap-acum"><b className="mono cap-acum-v">{aEur(pp.pond)}</b></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pp-fc">
              <div className="pp-fc-h"><b>Forecast por mes de cierre esperado</b><span>Ponderado del mes y clientes que salen de sumar las probabilidades; los tres meses de Q4 van marcados. Entran los {aN(pp.meses.reduce((x, m) => x + m.n, 0))} deals cuya fecha cae en estos meses. Los {aN(pp.vencidos.n)} con fecha anterior a octubre no tienen mes en el grid, pero siguen abiertos y cuentan en el forecast de Q4 con la probabilidad de su fase.</span></div>
              <div className="pp-fc-g">
                {pp.meses.map(m => (
                  <div key={m.id} className={'pp-m' + (m.q4 ? ' q4' : '')}>
                    <span className="pp-m-l">{m.label}</span>
                    <b className="mono">{aEur(m.pond)}</b>
                    <i className="pp-m-b"><u style={{width: Math.max(0, Math.min(100, m.eur / maxM * 100)) + '%'}}/></i>
                    <em className="mono">{aN(m.n)} deals · {a1(m.cli)} clientes</em>
                    <div className="pp-m-s">
                      {m.porSeg.filter(s => s.pond > 0).map(s => (
                        <span key={s.id}>{(pp.segs.find(x => x.id === s.id) || {}).label}<u className="mono">{aEur(s.pond)}</u></span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bk-cn-m" style={{padding:'12px 15px'}}>
              <div className="bk-cn-l"><span>cobertura ponderada contra objetivo de {aEur(a.obj.eur)}</span><b className="mono" style={{color: cobCol(a.cob)}}>{aP(a.cob, 0)}</b></div>
              <div className="bk-cn-bar proy"><i style={{width: w100(a.cob)}}/><s style={{width: w100(a.cobBruta)}}/></div>
              <em>La barra clara es el pipeline bruto de Q4 ({aP(a.cobBruta, 0)} del objetivo) y la oscura lo que queda tras aplicar la probabilidad de fase. Para cerrar el gap hacen falta <b>{aEur(gap / q4.t.semanas)}</b> ponderados nuevos por semana durante el trimestre.</em>
            </div>
            <div className="bk-bn">
              {pp.meta.fuente}, filtrado por propietario del deal. El segmento sale del importe: a partir de {aEur(1e6)} Mid Market, {aEur(250000)} Big Pymes, {aEur(60000)} Mid Pymes y por debajo Small. La probabilidad la fija dirección por fase: {window.PIPE_FASES.map(f => aP(window.PIPE_PROB_FASE[f.id], 0) + ' en ' + f.label.toLowerCase()).join(', ')}.{pp.sinImporte ? ' ' + aN(pp.sinImporte) + ' de los ' + aN(pp.n) + ' deals abiertos no llevan importe en HubSpot: van a la columna Sin importe y no suman nada al ponderado.' : ''}{pp.sinFecha ? ' ' + aN(pp.sinFecha) + ' no llevan fecha esperada y quedan fuera del forecast mensual.' : ''}
            </div>
          </section>
        );
      })()}
      <div className="bk-foot">
        Los objetivos los fija dirección para Q4 2026. El pipeline sale del {window.PIPE_META.fuente} y se asigna por propietario del deal, así que solo cubre a los AE que ya tenían cartera en el CRM. Un deal abierto con fecha de cierre ya pasada se cuenta en Q4 con su probabilidad de fase — lo que ha caducado es la fecha, no la operación —; los que no tienen fecha quedan fuera y se declaran aparte. {window.PIPE_META.aviso}
      </div>
      {window.AeDashActividad ? <window.AeDashActividad sel={sel} onSel={setSel}/> : null}
      {window.AeDashCalidad ? <window.AeDashCalidad sel={sel} onSel={setSel}/> : null}
      {window.AeDashRigor ? <window.AeDashRigor sel={sel} onSel={setSel}/> : null}
      {window.AePerfLegacy ? <window.AePerfLegacy/> : null}
    </div>
  );
};
