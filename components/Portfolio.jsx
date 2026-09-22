// Portfolio: cartera real mes a mes contra el BP, por segmento
const { useState, useMemo } = React;

const pfN = (v) => window.pfFmt.n(v);
const pfP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d).replace('.', ',') + '%';
const pfKeur = (v) => window.pfFmt.keur(v);
const pfEur = (v) => window.pfFmt.cartera(v);
const pfPlan = (v) => window.pfFmt.plan(v);

window.Portfolio = function Portfolio() {
  const [metrica, setMetrica] = useState('out');
  const [vista, setVista] = useState('real');

  const meses = useMemo(() => window.pfMonths('2025-01', window.PF_META.realHasta), []);
  const gap = useMemo(() => window.pfGap(), []);
  const hoy = gap.real;
  const segs = window.PF_SEGS;

  const METRICAS = [
    { id:'out',    label:'Outstanding', fmt:pfEur,  get:(r, s) => (window.PF_REAL[s] || {}).outstanding?.[r] },
    { id:'lineas', label:'Líneas',      fmt:pfEur,  get:(r, s) => (window.PF_REAL[s] || {}).lineas?.[r] },
    { id:'util',   label:'Utilización', fmt:v => pfP(v, 0), get:(r, s) => (window.PF_REAL[s] || {}).util?.[r] },
    { id:'clientes', label:'Clientes',  fmt:pfN,    get:(r, s) => (window.PF_REAL[s] || {}).clientes?.[r] },
    { id:'ticketLinea', label:'Línea media', fmt:pfKeur, get:(r, s) => (window.PF_REAL[s] || {}).ticketLinea?.[r] },
  ];
  const met = METRICAS.find(m => m.id === metrica) || METRICAS[0];

  // Serie de la métrica activa, por segmento, solo meses con dato.
  const serie = useMemo(() => meses.filter(mo => segs.some(s => {
    const v = met.get(mo.id, s.id);
    return v != null && v !== 0;
  })), [meses, metrica]);

  const valores = serie.flatMap(mo => segs.map(s => met.get(mo.id, s.id) || 0));
  const max = Math.max(...valores, 1);

  const Chip = ({ v, base }) => {
    if (v == null || base == null || !base) return <span className="pf-none">—</span>;
    const p = v / base;
    return <span className="k-ach" style={{'--c': p >= 0.9 ? '#1F5C42' : p >= 0.6 ? '#B8731F' : '#B23A3A'}}>{pfP(p)}</span>;
  };

  return (
    <div className="pf bk" data-screen-label="13 Portfolio">
      <div className="bk-head">
        <div>
          <h1 className="bk-h1">Portfolio</h1>
          <div className="bk-sub">Cartera real mes a mes contra el BP, por segmento. Líneas concedidas, outstanding dispuesto, utilización y línea media. {window.PF_META.nota} Fuente: <b>{window.PF_META.fuente}</b>.</div>
        </div>
        <div className="bk-kpis">
          <div className="bk-kpi"><b className="mono">{pfN(hoy.cli)}</b><span>clientes en cartera</span></div>
          <div className="bk-kpi"><b className="mono">{pfEur(hoy.lineas)}</b><span>líneas concedidas</span></div>
          <div className="bk-kpi accent"><b className="mono">{pfEur(hoy.out)}</b><span>outstanding a {gap.mes}</span></div>
          <div className="bk-kpi"><b className="mono">{pfP(hoy.util)}</b><span>utilización media</span></div>
        </div>
      </div>

      {/* ===== PLAN CONTRA REAL ===== */}
      <div className="bk-lvl-h">Plan contra real en {gap.mes}</div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr>
            <th>Segmento</th>
            <th className="num">Clientes</th><th className="num">BP</th><th className="num">Cumple</th>
            <th className="num">Outstanding</th><th className="num">BP</th><th className="num">Cumple</th>
            <th className="num">Líneas</th><th className="num">Utilización</th><th className="num">Línea media</th>
          </tr></thead>
          <tbody>
            {gap.segs.map(s => (
              <tr key={s.id} className={s.foco ? 'pf-foco' : ''}>
                <td className="bk-tipo">
                  <span className="bk-dot" style={{background: s.color}}/><b>{s.label}</b>
                  {!s.foco && <em className="pf-nf">fuera de foco</em>}
                </td>
                <td className="num mono"><b>{pfN(s.real.cli)}</b></td>
                <td className="num mono muted">{pfN(s.bp.cli)}</td>
                <td className="num mono"><Chip v={s.real.cli} base={s.bp.cli}/></td>
                <td className="num mono"><b>{pfEur(s.real.out)}</b></td>
                <td className="num mono muted">{pfEur(s.bp.loanbook)}</td>
                <td className="num mono"><Chip v={s.real.out} base={s.bp.loanbook}/></td>
                <td className="num mono">{pfEur(s.real.lineas)}</td>
                <td className="num mono">{s.real.util != null
                  ? <span className="k-ach" style={{'--c': s.real.util >= 0.7 ? '#1F5C42' : s.real.util >= 0.45 ? '#B8731F' : '#B23A3A'}}>{pfP(s.real.util)}</span>
                  : <span className="pf-none">—</span>}</td>
                <td className="num mono">{pfKeur(s.real.linea)}</td>
              </tr>
            ))}
            <tr className="bk-row-tot">
              <td>Total cartera</td>
              <td className="num mono">{pfN(gap.real.cli)}</td>
              <td className="num mono">{pfN(gap.bp.cli)}</td>
              <td className="num mono">{pfP(gap.cliPct)}</td>
              <td className="num mono">{pfEur(gap.real.out)}</td>
              <td className="num mono">{pfEur(gap.bp.loanbook)}</td>
              <td className="num mono">{pfP(gap.lbPct)}</td>
              <td className="num mono">{pfEur(gap.real.lineas)}</td>
              <td className="num mono">{pfP(gap.real.util)}</td>
              <td className="num mono">{pfKeur(gap.real.linea)}</td>
            </tr>
          </tbody>
        </table>
        <div className="cv-note">
          La cartera va al <b>{pfP(gap.cliPct)}</b> del BP en clientes y al <b>{pfP(gap.lbPct)}</b> en outstanding, así que el desvío no es solo de número de clientes: los que hay disponen menos de lo previsto.
          La línea media es la de la propia hoja, sobre clientes al corriente: {pfKeur(gap.real.linea)} de media ponderada. Dividir el total de líneas entre los clientes activos daría {pfKeur(gap.real.lineaPorActivo)}, pero mezcla bases —el numerador incluye clientes que no están al corriente— y por eso no se usa.
          SME Big es el segmento que mejor cumple en euros ({pfP(gap.segs.find(s => s.id === 'big').lbPct)}) y Corporate el que no ha arrancado.
        </div>
      </div>

      {/* ===== EVOLUCIÓN ===== */}
      <div className="bk-lvl-h">Evolución de la cartera</div>
      <div className="zo-ctrl">
        <label>Métrica</label>
        <div className="bk-fg">
          {METRICAS.map(m => (
            <button key={m.id} className={metrica === m.id ? 'on' : ''} onClick={() => setMetrica(m.id)}>{m.label}</button>
          ))}
        </div>
        <span className="zo-ctrl-n">Datos reales de {serie.length ? serie[0].label : '—'} a {serie.length ? serie[serie.length - 1].label : '—'}. Agosto de 2026 en adelante todavía no está cerrado.</span>
      </div>
      <section className="bk-block pf-ev">
        <div className="bk-scroll">
          <table className="bk-plan">
            <thead><tr>
              <th className="k-rl">{met.label}</th>
              {serie.map(mo => <th key={mo.id} className={mo.m === 12 ? 'k-yr' : ''}>{mo.label}</th>)}
            </tr></thead>
            <tbody>
              {segs.map(s => (
                <tr key={s.id}>
                  <th className="k-rl"><b>{s.label}</b><em>{s.foco ? 'foco' : 'fuera de foco'}</em></th>
                  {serie.map(mo => {
                    const v = met.get(mo.id, s.id);
                    return <td key={mo.id}>{v == null || v === 0 ? <span className="k-none">·</span> : met.fmt(v)}</td>;
                  })}
                </tr>
              ))}
              <tr className="k-strong">
                <th className="k-rl"><b>Total cartera</b><em>{metrica === 'util' ? 'ponderada' : metrica === 'ticketLinea' ? 'ponderada' : 'suma'}</em></th>
                {serie.map(mo => {
                  const r = window.pfReal(mo.id);
                  const v = metrica === 'out' ? r.out : metrica === 'lineas' ? r.lineas
                    : metrica === 'util' ? r.util : metrica === 'clientes' ? r.cli : r.linea;
                  return <td key={mo.id}>{v == null ? <span className="k-none">·</span> : met.fmt(v)}</td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bk-bn">
          {metrica === 'util'
            ? <>La utilización de la cartera baja del {pfP(0.745)} de dic-25 al {pfP(gap.real.util)} de {gap.mes}: se conceden líneas más rápido de lo que los clientes disponen, y eso es loanbook que ya está aprobado y no está en balance.</>
            : metrica === 'lineas'
              ? <>Las líneas concedidas crecen mientras el outstanding no sigue el ritmo. La diferencia entre las dos series es la capacidad de balance ya comprometida y sin usar.</>
              : <>Cada celda es el cierre de ese mes. Los ceros se muestran como punto porque no son cero medido, son segmentos sin cartera ese mes.</>}
        </div>
      </section>

      {/* ===== BP POR SEGMENTO ===== */}
      <div className="bk-lvl-h">BP por segmento, cierres de año</div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr>
            <th>Segmento</th>
            {[2026, 2027, 2028, 2029].map(y => <th key={y} className="num">{y}</th>)}
            <th className="num">Línea media 29</th><th className="num">Loanbook 29</th><th className="num">Util. 29</th>
          </tr></thead>
          <tbody>
            {segs.map(s => {
              const b = window.PF_BP[s.id] || {};
              return (
                <tr key={s.id} className={s.foco ? 'pf-foco' : ''}>
                  <td className="bk-tipo"><span className="bk-dot" style={{background: s.color}}/><b>{s.label}</b></td>
                  {[2026, 2027, 2028, 2029].map(y => (
                    <td key={y} className="num mono">{pfN((b.clientes || {})[y + '-12'])}</td>
                  ))}
                  <td className="num mono">{pfKeur(((b.linea || {})['2029-12'] || 0) * 1e3)}</td>
                  <td className="num mono"><b>{pfPlan(((b.loanbook || {})['2029-12'] || 0) * 1e6)}</b></td>
                  <td className="num mono">{pfP((b.util || {})['2029-12'])}</td>
                </tr>
              );
            })}
            <tr className="bk-row-tot">
              <td>Total BP</td>
              {[2026, 2027, 2028, 2029].map(y => (
                <td key={y} className="num mono">{pfN((window.PF_BP.total.clientes || {})[y + '-12'])}</td>
              ))}
              <td className="num mono">{pfKeur((window.PF_BP.total.linea['2029-12'] || 0) * 1e3)}</td>
              <td className="num mono">{pfPlan((window.PF_BP.total.loanbook['2029-12'] || 0) * 1e6)}</td>
              <td className="num mono">{pfP(window.PF_BP.total.util['2029-12'])}</td>
            </tr>
          </tbody>
        </table>
        <div className="cv-note">
          Estas son las cifras que alimentan el master plan de <b>Unicorn</b>, literales de la hoja Targets. El BP incluye los cinco segmentos: SME Mid y Small no son foco de crecimiento pero sí están en cartera y en plan.
        </div>
      </div>

      <div className="bk-foot">
        Cartera real de {window.PF_META.realDesde} a {window.PF_META.realHasta} y BP de {window.PF_META.bpDesde} a {window.PF_META.bpHasta}, los dos del mismo report.
        Donde no hay dato se muestra un punto, no un cero: agosto de 2026 en adelante no está cerrado y Corporate no tiene cartera viva.
      </div>
    </div>
  );
};
