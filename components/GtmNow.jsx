// Estado actual contra el objetivo 2029, y plan mensual de un año
const { useState, useMemo } = React;

const sN = (v) => {
  if (v == null || isNaN(v)) return '—';
  if (v > 0 && v < 0.5) return '<1';
  const n = Math.round(v);
  return String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.').replace(/^/, n < 0 ? '-' : '');
};
const sP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 2 : d).replace('.', ',') + '%';
const sK = (v) => v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + 'M' : v >= 1e4 ? sN(v / 1e3) + 'k' : sN(v);

// ===== A) RESUMEN POR TIER =====
window.GtmSummary = function GtmSummary({ target }) {
  const rows = useMemo(() => window.gtmTierState(), []);
  const tot = useMemo(() => {
    const s = (f) => rows.reduce((a, r) => a + f(r), 0);
    const obj = s(r => r.objetivo);
    return { universo: s(r => r.universo), cualificado: s(r => r.cualificado),
      contactado: s(r => r.contactado), deal: s(r => r.deal), cliente: s(r => r.cliente),
      objetivo: obj, achievement: obj ? s(r => r.cliente) / obj : 0 };
  }, [rows]);
  const foco = rows.filter(r => r.tier.focus);
  const focoObj = foco.reduce((a, r) => a + r.objetivo, 0);
  const focoCli = foco.reduce((a, r) => a + r.cliente, 0);

  return (
    <section className="gt-sec">
      <div className="gt-sec-head">
        <h2 className="gt-sec-title">Dónde estamos, por tier</h2>
        <span className="gt-sec-hint">Estado del embudo hoy y qué parte del objetivo de 2029 cubre</span>
      </div>
      <table className="gt-table gt-sum">
        <thead><tr>
          <th>Tier</th><th className="num">Universo</th><th className="num">Cualificado</th>
          <th className="num">Contactado</th><th className="num">Deal</th><th className="num">Cliente</th>
          <th className="num">Penetración</th><th className="num">Objetivo 2029</th><th className="num">Logrado</th>
        </tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.tier.id} className={r.tier.focus ? 'gt-sum-foco' : ''}>
              <td className="gt-sum-t">
                <span className="gt-chip" style={{'--c': r.tier.color}}>{r.tier.label}</span>
                {r.tier.focus && <em className="gt-foco">Foco</em>}
              </td>
              <td className="num mono muted">{sN(r.universo)}</td>
              <td className="num mono">{sN(r.cualificado)}</td>
              <td className="num mono">{sN(r.contactado)}</td>
              <td className="num mono">{sN(r.deal)}</td>
              <td className="num mono strong">{sN(r.cliente)}</td>
              <td className="num mono">{sP(r.penetracion, 3)}</td>
              <td className="num mono">{r.objetivo ? <>{sN(r.objetivo)}<em className="gt-sub2">{sP(r.objPct, 2)} del tier</em></> : <em className="gt-sub2">sin objetivo</em>}</td>
              <td className="num">
                {r.achievement == null ? '—' : <>
                  <span className={`mono gt-ach ${r.achievement >= 0.15 ? 'ok' : r.achievement >= 0.05 ? 'mid' : 'low'}`}>{sP(r.achievement, 1)}</span>
                  <span className="gt-achbar"><i style={{width: Math.min(100, r.achievement * 100) + '%'}}/></span>
                  <em className="gt-sub2">faltan {sN(r.faltan)}</em>
                </>}
              </td>
            </tr>
          ))}
          <tr className="gt-sum-total">
            <td>Total</td>
            <td className="num mono">{sK(tot.universo)}</td>
            <td className="num mono">{sK(tot.cualificado)}</td>
            <td className="num mono">{sN(tot.contactado)}</td>
            <td className="num mono">{sN(tot.deal)}</td>
            <td className="num mono">{sN(tot.cliente)}</td>
            <td className="num mono">{sP(tot.cliente / tot.universo, 3)}</td>
            <td className="num mono">{sN(tot.objetivo)}</td>
            <td className="num mono">{sP(tot.achievement, 1)}</td>
          </tr>
          <tr className="gt-sum-foco-row">
            <td>Solo foco · SME Big + Mid Market</td>
            <td className="num mono">{sK(foco.reduce((a, r) => a + r.universo, 0))}</td>
            <td className="num mono">{sN(foco.reduce((a, r) => a + r.cualificado, 0))}</td>
            <td className="num mono">{sN(foco.reduce((a, r) => a + r.contactado, 0))}</td>
            <td className="num mono">{sN(foco.reduce((a, r) => a + r.deal, 0))}</td>
            <td className="num mono strong">{sN(focoCli)}</td>
            <td className="num mono">{sP(focoCli / foco.reduce((a, r) => a + r.universo, 0), 3)}</td>
            <td className="num mono">{sN(focoObj)}</td>
            <td className="num mono strong">{sP(focoCli / focoObj, 1)}</td>
          </tr>
        </tbody>
      </table>
      <div className="gt-sum-foot">
        El objetivo total reparte {sN(tot.objetivo)} clientes, de los que solo {sP(focoObj / tot.objetivo, 0)} están en los dos tiers de foco.
        Si los {sN(target)} del BP son el compromiso, hay que decidir si se cumplen dentro del foco —donde son el {sP(target / foco.reduce((a, r) => a + r.universo, 0), 2)} del universo— o repartidos sobre todos los tramos, donde son el {sP(target / tot.universo, 2)}.
      </div>
    </section>
  );
};

// ===== B) PENETRACIÓN POR SCORE E INDUSTRIA =====
// Un solo 'scope' alimenta numerador y denominador de TODAS las etapas, así
// que es imposible mezclar bases: o todo el universo, o solo los tiers de foco.
window.GtmPenetration = function GtmPenetration({ target }) {
  const [dim, setDim] = useState('segmento');
  const [scope, setScope] = useState('foco');
  const opts = { method: 'log', year: 2022, drift: 0.03 };
  const funnel = useMemo(() => window.mktFunnel(opts), []);

  const data = useMemo(() => {
    const tiers = scope === 'foco' ? window.MKT_TIERS.filter(t => t.focus) : window.MKT_TIERS;
    const stages = ['universo', 'cualificado', 'contactado', 'deal', 'cliente'];
    const b = {};
    for (const s of stages) b[s] = window.mktBreakdown(funnel, dim, s, opts);
    const agg = (s, id) => tiers.reduce((a, t) => a + b[s].data[t.id][id], 0);
    return b.universo.cats.map(c => {
      const r = { cat: c };
      for (const s of stages) r[s] = agg(s, c.id);
      r.penetracion = r.universo ? r.cliente / r.universo : 0;
      return r;
    });
  }, [funnel, dim, scope]);

  const totCli = data.reduce((a, r) => a + r.cliente, 0);
  const totUni = data.reduce((a, r) => a + r.universo, 0);
  const maxPen = Math.max(...data.map(r => r.penetracion));
  const scopeLabel = scope === 'foco' ? 'los tiers de foco' : 'todo el universo';

  // El pie se deriva del dato: si se escribe a mano acaba contradiciendo la tabla.
  const top = data.reduce((a, r) => (r.cliente > a.cliente ? r : a), data[0]);
  const bottom = data.reduce((a, r) => (r.cliente < a.cliente ? r : a), data[0]);
  const share = (r) => totCli ? r.cliente / totCli : 0;

  return (
    <section className="gt-sec">
      <div className="gt-sec-head">
        <h2 className="gt-sec-title">Penetración por score e industria</h2>
        <span className="gt-sec-hint">Dónde está funcionando hoy y qué cuota del objetivo aportaría cada corte si la mezcla no cambia</span>
        <div className="gt-tg">
          {[['segmento','Score'],['sector','Industria'],['uso','Caso de uso']].map(([k, l]) => (
            <button key={k} className={dim === k ? 'on' : ''} onClick={() => setDim(k)}>{l}</button>
          ))}
        </div>
        <div className="gt-tg">
          {[['foco','Solo foco'],['all','Todo el universo']].map(([k, l]) => (
            <button key={k} className={scope === k ? 'on' : ''} onClick={() => setScope(k)}>{l}</button>
          ))}
        </div>
      </div>
      <table className="gt-table">
        <thead><tr>
          <th>{dim === 'segmento' ? 'Segmento de score' : dim === 'sector' ? 'Sector AEAT' : 'Caso de uso'}</th>
          <th className="num">Universo</th><th className="num">Cualificado</th>
          <th className="num">Contactado</th><th className="num">Deal</th><th className="num">Cliente</th>
          <th className="num">Penetración</th><th className="num">Cuota de clientes</th>
          <th className="num">Implica del BP</th>
        </tr></thead>
        <tbody>
          {data.map(r => (
            <tr key={r.cat.id}>
              <td className="gt-pen-c">
                <b>{r.cat.label}</b>
                {r.cat.desc && r.cat.desc !== r.cat.label && <em>{r.cat.desc}</em>}
              </td>
              <td className="num mono muted">{sK(r.universo)}</td>
              <td className="num mono">{sN(r.cualificado)}</td>
              <td className="num mono">{sN(r.contactado)}</td>
              <td className="num mono">{sN(r.deal)}</td>
              <td className="num mono strong">{sN(r.cliente)}</td>
              <td className="num">
                <span className="mono">{sP(r.penetracion, 3)}</span>
                <span className="gt-penbar"><i style={{width: maxPen ? r.penetracion / maxPen * 100 + '%' : 0}}/></span>
              </td>
              <td className="num mono">{sP(share(r), 1)}</td>
              <td className="num mono">{sN(target * share(r))}</td>
            </tr>
          ))}
          <tr className="gt-sum-total">
            <td>Total · {scopeLabel}</td>
            <td className="num mono">{sK(totUni)}</td>
            <td className="num mono">{sN(data.reduce((a, r) => a + r.cualificado, 0))}</td>
            <td className="num mono">{sN(data.reduce((a, r) => a + r.contactado, 0))}</td>
            <td className="num mono">{sN(data.reduce((a, r) => a + r.deal, 0))}</td>
            <td className="num mono">{sN(totCli)}</td>
            <td className="num mono">{sP(totUni ? totCli / totUni : 0, 3)}</td>
            <td className="num mono">100%</td>
            <td className="num mono">{sN(target)}</td>
          </tr>
        </tbody>
      </table>
      <div className="gt-sum-foot">
        Todas las columnas están calculadas sobre <b>{scopeLabel}</b>, numerador y denominador: la penetración es clientes sobre universo del mismo ámbito.
        La última columna reparte los {sN(target)} clientes del BP con la mezcla actual, que es el objetivo implícito de cada corte si nada cambia.
        {' '}<b>{top.cat.label}</b> se lleva el {sP(share(top), 0)} de ese reparto, {sN(target * share(top))} clientes, y <b>{bottom.cat.label}</b> solo el {sP(share(bottom), 1)}.
        {dim === 'segmento' && ' El reparto está tan concentrado en la cabeza porque el modelo supone que el avance por el embudo premia el buen score; en cuanto haya scoring corrido sobre SABI esa mezcla se mide en vez de suponerse, y es entonces cuando el reparto del objetivo puede cambiar de forma.'}
        {dim === 'sector' && ' Los totales por sector son cifras publicadas por la AEAT; el cruce con tamaño se estima por raking y el avance por el embudo aplica afinidad de producto, que es criterio Kintai.'}
        {dim === 'uso' && ' La taxonomía de casos de uso es provisional y su mezcla estimada: conviene cerrarla con ventas antes de fijar objetivos por caso.'}
      </div>
    </section>
  );
};

// ===== C) PLAN MENSUAL HASTA DICIEMBRE =====
// RETIRADO de Unicorn: sus columnas de leads, contactados y discoveries son
// detalle de prospección y viven en la pestaña Outbound; el horizonte lo cubre
// el plan trimestral. Se conserva la función por si se quiere montar en otra
// pestaña, y el selector ya no ofrece 2027 para no duplicar su pestaña propia.
window.GtmMonthly = function GtmMonthly({ p, sol }) {
  const [year, setYear] = useState(2028);
  const plan = useMemo(() => window.gtmMonthlyPlan(p, sol, year), [p, sol, year]);
  const maxAe = Math.max(...plan.rows.map(r => r.ae));
  const maxSdr = Math.max(...plan.rows.map(r => r.sdr));

  return (
    <section className="gt-sec">
      <div className="gt-sec-head">
        <h2 className="gt-sec-title">Plan mensual {year}</h2>
        <span className="gt-sec-hint">Del hito de BP hacia atrás: qué volumen hay que mover cada mes y qué plantilla pide</span>
        <div className="gt-tg">
          {[2028, 2029].map(y => (
            <button key={y} className={year === y ? 'on' : ''} onClick={() => setYear(y)}>{y}</button>
          ))}
        </div>
      </div>

      <div className="gt-mo-kpis">
        <div className="gt-mo-k"><div className="gt-mo-n mono">{sN(plan.cumPrev)} → {sN(plan.cumEnd)}</div><div className="gt-mo-l">Clientes acumulados: hito de entrada y de salida</div></div>
        <div className="gt-mo-k"><div className="gt-mo-n mono">{sN(plan.net)}</div><div className="gt-mo-l">Clientes nuevos que exige el año</div></div>
        <div className="gt-mo-k"><div className="gt-mo-n mono">{sK(plan.totals.leads)}</div><div className="gt-mo-l">Leads a trabajar en el año</div></div>
        <div className="gt-mo-k"><div className="gt-mo-n mono">{sN(plan.totals.disc)}</div><div className="gt-mo-l">Discoveries a celebrar</div></div>
        <div className="gt-mo-k accent"><div className="gt-mo-n mono">{Math.ceil(plan.peak.sdr)} / {Math.ceil(plan.peak.ae)}</div><div className="gt-mo-l">SDR y AE en el pico de diciembre</div></div>
      </div>

      <table className="gt-table gt-mo">
        <thead><tr>
          <th>Mes</th><th className="num">Leads</th><th className="num">Contactados</th>
          <th className="num">Discoveries</th><th className="num">Deals a abrir</th>
          <th className="num">Deals en cartera</th><th className="num">Clientes nuevos</th>
          <th className="num">Cartera de clientes</th><th className="num">SDR</th><th className="num">AE</th>
        </tr></thead>
        <tbody>
          {plan.rows.map(r => (
            <tr key={r.i}>
              <td className="gt-per">{r.label} {String(year).slice(2)}</td>
              <td className="num mono">{sN(r.leads)}</td>
              <td className="num mono">{sN(r.contacts)}</td>
              <td className="num mono strong">{sN(r.disc)}</td>
              <td className="num mono">{sN(r.dealsOpen)}</td>
              <td className="num mono muted">{sN(r.inPipe)}</td>
              <td className="num mono strong">{sN(r.clients)}</td>
              <td className="num mono">{sN(r.cum)}</td>
              <td className="num">
                <span className="mono">{Math.ceil(r.sdr)}</span>
                <span className="gt-cap"><i style={{width: maxSdr ? r.sdr / maxSdr * 100 + '%' : 0, background: r.sdr > p.sdr ? 'var(--bad)' : 'var(--good)'}}/></span>
              </td>
              <td className="num">
                <span className="mono">{Math.ceil(r.ae)}</span>
                <span className="gt-cap"><i style={{width: maxAe ? r.ae / maxAe * 100 + '%' : 0, background: r.ae > p.ae ? 'var(--bad)' : 'var(--good)'}}/></span>
              </td>
            </tr>
          ))}
          <tr className="gt-sum-total">
            <td>Año {year}</td>
            <td className="num mono">{sK(plan.totals.leads)}</td>
            <td className="num mono">{sN(plan.totals.contacts)}</td>
            <td className="num mono">{sN(plan.totals.disc)}</td>
            <td className="num mono">{sN(plan.totals.dealsOpen)}</td>
            <td className="num mono">—</td>
            <td className="num mono">{sN(plan.totals.clients)}</td>
            <td className="num mono">{sN(plan.cumEnd)}</td>
            <td className="num mono">{Math.ceil(plan.peak.sdr)}</td>
            <td className="num mono">{Math.ceil(plan.peak.ae)}</td>
          </tr>
        </tbody>
      </table>
      <div className="gt-sum-foot">
        Las barras se ponen en rojo cuando el mes pide más gente de la que hay hoy: {p.sdr} SDR y {p.ae} AE.
        El plan usa {sP(plan.dealEff, 0)} de discovery a deal y {sP(plan.winEff, 0)} de cierre, que es el supuesto activo de la sección de arriba, y un ciclo de {p.cycleMonths} meses: los deals de un mes se abren para firmar {p.cycleMonths} meses después, por eso la fila de deals a abrir va por delante de la de clientes.
      </div>
    </section>
  );
};
