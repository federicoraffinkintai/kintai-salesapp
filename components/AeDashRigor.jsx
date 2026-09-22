// Dashboard 3 · RIGOR EN LA EJECUCIÓN ESTRATÉGICA. Conducta, no resultado: es
// lo que explica por qué dos AE con el mismo pipeline cierran distinto.
// Mientras el CRM no registre actividad, preparación ni forecast congelado,
// las celdas se rellenan con valores de EJEMPLO deterministas por AE para
// poder juzgar la pantalla. Van marcados uno a uno; lo medido de verdad es el
// time to money y el proxy de atasco.
const rgN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
const rgP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d).replace('.', ',') + '%';
// Redondear ANTES de decidir el signo: un −0,3% no puede imprimirse «−0%».
const rgSig = (v) => {
  if (v == null || isNaN(v)) return '—';
  const r = Math.round(v * 100);
  return (r > 0 ? '+' : '') + (r / 100 * 100).toFixed(0).replace('-0', '0') + '%';
};

window.AeDashRigor = function AeDashRigor({ sel, onSel }) {
  const A = React.useMemo(() => window.aeActividad(), []);
  const R = window.AEDASH_RIGOR;
  const kpis = ['prepDisc', 'planAct', 'prepNego', 'calc', 'email'];
  const restantes = R.filter(r => kpis.indexOf(r.id) < 0 && r.id !== 'tiempo');
  // Proxy real: deal abierto cuya fecha de cierre pasó hace más de 30 días.
  const proxy = (a) => a.pipe && a.pipe.n ? a.pipe.atasco.n30 / a.pipe.n : null;
  const ciclo = (a) => a.ow ? (window.AE_REAL_CICLO || {})[a.ow] : null;
  const demo = (a, m) => {
    if (m.resp) return window.aeRespSerie(a.key)[m.resp];
    return m.demo ? window.aeDemoVal(a.key, m.id, m.demo[0], m.demo[1]) : null;
  };
  const col = (v, obj, malo) => malo
    ? (v <= obj ? '#2E7D5B' : v <= obj * 2 ? '#B8731F' : '#B23A3A')
    : (v >= obj ? '#2E7D5B' : v >= obj * 0.75 ? '#B8731F' : '#B23A3A');

  return (
    <>
      <div className="bk-lvl-h">Dashboard 3 · Rigor en la ejecución estratégica</div>
      <div className="ob-lv">
        <label>Periodo</label>
        <div className="bk-fg"><button className="on">Cartera viva · ganados desde 2025</button></div>
        <span className="ob-lv-n">Sin selector de ventana a propósito: el rigor se mira sobre la cartera abierta de hoy y el time to money sobre todos los ganados desde 2025, que es lo que da mediana estable. <b>Las celdas marcadas «ejemplo» son datos inventados para validar la pantalla</b>: solo el time to money y el proxy de atasco salen del CRM.</span>
      </div>

      <div className="sdr-cards">
        {A.list.map((a, i) => {
          const c = ciclo(a);
          const fcMes = window.AEDASH_FORECAST.find(f => f.id === 'mensual');
          const fcVal = demo(a, fcMes);
          const conVal = demo(a, window.AEDASH_FORECAST.find(f => f.id === 'consecucion'));
          // Total del time to money: el real si lo hay, y si no el de ejemplo.
          const ttmMoney = window.AEDASH_TTM.find(t => t.id === 'money');
          const total = c ? c.med : demo(a, ttmMoney);
          const serie = window.aeTtmSerie(a.key, total);
          return (
            <div className={'sdr-card' + (sel === a.key ? ' me' : '')} key={a.key} onClick={() => onSel && onSel(a.key)}>
              <div className="sdr-card-h rg-head">
                <span className="sdr-pos mono">{i + 1}</span>
                <div className="rg-who">
                  <div className="sdr-nom">{a.nombre}<em>{a.unidadLabel}</em></div>
                  {a.pipe && <div className="sdr-sub">{rgN(a.pipe.n)} abiertos · {rgN(a.pipe.atasco.n30)} parados +30 d</div>}
                </div>
                <div className="rg-fc" title="Desviación de lo facturado sobre lo que dijo que facturaría. Quedarse corto pesa el doble que pasarse.">
                  <b className="mono" style={{color: fcVal < -0.1 ? '#B23A3A' : fcVal < -0.03 ? '#B8731F' : '#1F5C42'}}>{rgSig(fcVal)}</b>
                  <em>forecast mensual<i className="rg-dm">ejemplo</i></em>
                </div>
                <div className="rg-obj" title="Facturado del periodo sobre el objetivo comprometido.">
                  <b className="mono" style={{color: conVal >= 1 ? '#1F5C42' : conVal >= 0.8 ? '#B8731F' : '#B23A3A'}}>{rgP(conVal)}</b>
                  <em>objetivo revenue<i className="rg-dm">ejemplo</i></em>
                </div>
              </div>
              <div className="sdr-kpis">
                {kpis.map(id => {
                  const r = R.find(x => x.id === id);
                  const v = demo(a, r);
                  return (
                    <div className="sdr-k" key={id} title={r.desc + ' · ' + r.fuente}>
                      <span className="sdr-k-l">{r.label}</span>
                      <span className="sdr-k-n mono">{rgP(v)}</span>
                      <span className="sdr-k-s">{r.obj}<i className="rg-dm">ejemplo</i></span>
                    </div>
                  );
                })}
              </div>

              <div className="sdr-embudo wide">
                <div className="sdr-e-t">Higiene y responsiveness</div>
                {restantes.map(r => {
                  const real = r.id === 'atasco' ? proxy(a) : null;
                  const v = real != null ? real : demo(a, r);
                  const malo = r.malo || r.id === 'atasco';
                  const umbral = malo ? 0.15 : 0.9;
                  return (
                    <div className="sdr-e" key={r.id} title={r.desc + ' · ' + r.fuente}>
                      <span>{r.label}</span>
                      {v == null
                        ? <span className="sdr-e-p">{r.obj}</span>
                        : <div><i style={{width: Math.max(2, Math.min(100, v * 100)) + '%', background: malo ? (v <= umbral ? '#2E7D5B' : '#B23A3A') : (v >= 0.9 ? '#2E7D5B' : v >= 0.7 ? '#B8731F' : '#B23A3A')}}/></div>}
                      <b className="mono">{rgP(v)}<u>{v == null ? '' : real != null ? 'proxy' : 'ejemplo'}</u></b>
                    </div>
                  );
                })}
              </div>

              <div className="sdr-embudo wide">
                <div className="sdr-e-t">Time to money · por tramo</div>
                {window.AEDASH_TTM.map(t => {
                  const real = t.id === 'money' && c ? c.med : null;
                  const v = t.id === 'money' ? total : ((serie.find(x => x.id === t.id) || {}).v);
                  return (
                    <div className={'sdr-e' + (t.id === 'money' ? ' tot' : '')} key={t.id} title={t.desc}>
                      <span>{t.label}</span>
                      {v == null
                        ? <span className="sdr-e-p">objetivo {t.obj}</span>
                        : <div><i style={{width: Math.max(2, Math.min(100, v / 120 * 100)) + '%', background: v <= 30 ? '#2E7D5B' : v <= 60 ? '#B8731F' : '#B23A3A'}}/></div>}
                      <b className="mono">{v == null ? '—' : Math.round(v) + ' d'}
                        <u>{real != null && c ? c.p25 + '–' + c.p75 + ' d' : v == null ? '' : 'ejemplo'}</u></b>
                    </div>
                  );
                })}
              </div>

              <div className="sdr-embudo wide">
                <div className="sdr-e-t">Precisión del forecast</div>
                {window.AEDASH_FORECAST.filter(f => f.id !== 'mensual' && f.id !== 'consecucion').map(f => {
                  const v = demo(a, f);
                  const esDias = f.unidad === 'd';
                  const txt = v == null ? '—' : esDias ? Math.round(v) + ' d' : f.signo ? rgSig(v) : rgP(v);
                  const ancho = v == null ? 0 : esDias ? Math.min(100, v / 60 * 100) : f.signo ? Math.min(100, Math.abs(v) * 300) : Math.min(100, v * 100);
                  // Asimetría: quedarse corto pesa el doble que pasarse, porque
                  // sobre un forecast inflado no se reacciona a tiempo.
                  const colAsim = v == null ? null : v < -0.1 ? '#B23A3A' : v < -0.03 ? '#B8731F' : v <= 0.2 ? '#2E7D5B' : '#B8731F';
                  return (
                    <div className={'sdr-e' + (f.head ? ' tot' : '')} key={f.id} title={f.desc + ' · ' + f.cadencia}>
                      <span>{f.label}</span>
                      {v == null
                        ? <span className="sdr-e-p">{f.cadencia}</span>
                        : <div><i style={{width: Math.max(2, ancho) + '%', background: esDias ? (v <= 15 ? '#2E7D5B' : '#B8731F') : f.asim ? colAsim : f.signo ? (Math.abs(v) <= 0.1 ? '#2E7D5B' : '#B23A3A') : (v >= 0.9 ? '#2E7D5B' : v >= 0.75 ? '#B8731F' : '#B23A3A')}}/></div>}
                      <b className="mono">{txt}<u>ejemplo</u></b>
                    </div>
                  );
                })}
              </div>

              <div className="sdr-badges">
                <span className="sdr-nobadge">{[
                  c ? 'Time to money real sobre ' + rgN(c.n) + ' ganados desde 2025, el peor tardó ' + rgN(c.max) + ' días' : null,
                  a.pipe ? 'atasco real sobre ' + rgN(a.pipe.n) + ' deals abiertos' : null,
                ].filter(Boolean).join(' · ') || 'Sin ganados ni pipeline propio: la ficha entera son datos de ejemplo'}{c || a.pipe ? '. El resto de la ficha son datos de ejemplo.' : ' hasta que abra su primer deal.'}</span>
              </div>
            </div>
          );
        })}
      </div>

      <section className="bk-block">
        <div className="bk-bh">
          <span className="bk-chip">Cómo se calcula la precisión del forecast</span>
          <span className="bk-bh-d">Las {window.AEDASH_FORECAST.length} de esta sección no son un ratio que salga solo del CRM: dependen de congelar una promesa y compararla después con lo que pasó. El <b>forecast mensual se congela tres veces</b> —día 1, 15 y 21— y el <b>del trimestre el día 1 de cada mes</b>, tres fotos por trimestre. La desviación se mide <b>con signo y con asimetría</b>: quedarse corto pesa el doble que pasarse, porque sobre un forecast inflado no hay margen para reaccionar; ser un punto conservador es la posición correcta. Aquí va la fórmula exacta de cada una y el registro que hace falta, para que se implementen sin interpretaciones.</span>
          <span className="bk-bh-k mono">quedarse corto pesa doble</span>
        </div>
        <div className="rg-form">
          {window.AEDASH_FORECAST.map(f => (
            <div className="rg-f" key={f.id}>
              <div className="rg-f-t">{f.label}{f.cadencia && <i>{f.cadencia}</i>}</div>
              <p><b>Fórmula.</b> {f.formula}</p>
              <p><b>Registro.</b> {f.fuente}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bk-lvl2">
        <div className="bk-lvl2-n">
          <b>Tres registros, casi todo el dashboard.</b> <b>Actividad con propietario y sello de tiempo</b> desbloquea los tres tramos de respuesta —4 h, mismo día y más de 48 h—, deals sin actividad y email resumen; <b>snapshot semanal de etapa</b> desbloquea deals atascados, los cuatro tramos del time to money y el sub-bloque de avances del dashboard de actividad; <b>forecast congelado</b> —tres cortes al mes y tres fotos al trimestre— desbloquea la precisión entera. Los checklists de preparación —discovery, negociación, calculadora, plan de activación— son el cuarto, y el más barato: un campo obligatorio por etapa.
        </div>
      </div>
      <div className="bk-foot">
        <b>Aviso.</b> Las celdas marcadas «ejemplo» son valores inventados, deterministas por AE, puestos para validar la pantalla antes de instrumentar: no se pueden usar para evaluar a nadie. Lo único real es el <b>time to money</b> —mediana de días entre creación y cierre de los ganados desde 2025, con p25 y p75 alrededor— y el <b>proxy de atasco</b>: deals abiertos cuya fecha de cierre pasó hace más de 30 días, contado contra hoy y no contra el arranque del trimestre, que es la señal de pipeline sin tocar que sí trae el {window.AEDASH_META.fuente}.
      </div>
    </>
  );
};
