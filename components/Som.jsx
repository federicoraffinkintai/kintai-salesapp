// SOM · los tres segmentos de cola larga al 3% de cuota en 2031
const { useMemo } = React;

const somN = (v) => window.pfFmt.n(v);
const somK = (v) => v == null || isNaN(v) ? '—' : v >= 1e4 ? somN(v / 1e3) + 'k' : somN(v);
const somP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 1 : d).replace('.', ',') + '%';
const somKeur = (v) => window.pfFmt.keur(v);
const somEur = (v) => window.pfFmt.plan(v);
const somCart = (v) => window.pfFmt.cartera(v);

window.SomPlan = function SomPlan() {
  const p = window.GTM_DEFAULTS;
  const v = useMemo(() => window.gtmVision2031(p), [p]);
  const fact = useMemo(() => window.mktFacturacionMedia ? window.mktFacturacionMedia() : {}, []);

  const rango = (b) => {
    if (!b) return '—';
    const u = (x) => x == null || !isFinite(x) ? null
      : x >= 1e6 ? (x / 1e6 % 1 ? (x / 1e6).toFixed(1).replace('.', ',') : window.pfFmt.n(x / 1e6)) + 'M€'
      : window.pfFmt.n(x / 1e3) + 'k€';
    if (b[0] === 0) return 'hasta ' + u(b[1]);
    return u(b[1]) ? u(b[0]) + ' – ' + u(b[1]) : u(b[0]) + ' en adelante';
  };

  const uni = v.tiers.reduce((a, t) => a + t.universo, 0);
  const lineas31 = v.tiers.reduce((a, t) => a + t.lineas31, 0);

  return (
    <div className="gt som" data-screen-label="15 SOM">
      <div className="gt-head">
        <div>
          <h1 className="gt-h1">SOM · mercado servible</h1>
          <div className="gt-sub">Los seis segmentos de mayor a menor, con <b>dos horizontes</b>. En <b>Corporate, Mid Market y SME Big</b> el SOM es el objetivo de <b>Unicorn (2029)</b>: son el foco y el plan ya llega ahí.
          En <b>SME Mid, SME Small y Micro</b> el SOM es el <b>3% de cuota</b> y la fecha está por planificar, de 2030 en adelante: aquí solo se dimensiona el tamaño.
          Universo total {somK(uni)} empresas.</div>
        </div>
        <div className="gt-goal">
          <div className="gt-goal-t">
            <span className="gt-goal-l">SOM completo</span>
            <span className="gt-goal-n mono">{somN(v.cli31)}<em>clientes</em></span>
            <span className="gt-goal-n mono">{somEur(v.eur31)}<em>loanbook</em></span>
            <span className="gt-goal-n mono">{somKeur(lineas31 / v.cli31)}<em>línea media</em></span>
            <span className="gt-goal-n mono">{somP(v.cli31 / uni, 1)}<em>cuota media</em></span>
            {(() => {
              const fa = window.gtmFacturacion(v.tiers.map(t => ({ id:t.id, label:t.label, color:t.color, eur:t.eur31, cli:t.cli31 })), 'medio');
              const R = window.gtmRentabilidad(fa.rows);
              return <>
                <span className="gt-goal-n mono">{somEur(R.rev)}<em>facturación</em></span>
                <span className="gt-goal-n mono">{somEur(R.margen)}<em>margen neto · {somP(R.margenPct, 1)}</em></span>
              </>;
            })()}
          </div>
        </div>
      </div>

      <div className="gt-cards">
        {v.tiers.map(t => (
          <div className="gt-card" key={t.id} style={{'--c': t.color}}>
            <div className="gt-card-h">
              <b>{t.label}</b>
              {t.porCuota
                ? <span className="gt-card-late">3% · por planificar</span>
                : <span className="gt-card-f">Unicorn 2029</span>}
            </div>
            <div className="gt-card-range">
              <span className="mono">{rango(t.bounds)}</span>
              <em className="mono">{somK(t.universo)} empresas</em>
            </div>
            <div className="gt-card-cli mono">{somN(t.cli31)}<em>{t.porCuota ? 'clientes del SOM · plan 29 ' + somN(t.cli29) : 'clientes en dic 29'}</em></div>
            <div className="gt-card-eur mono">{somEur(t.eur31)}<em>loanbook · {somP(t.eur31 / v.eur31, 0)} del SOM</em></div>
            <dl className="gt-card-dl">
              <div><dt>Cuota del SOM</dt><dd className="mono">{t.porCuota ? <>{somP(t.share29, 2)} en 29 → <b>{somP(t.share31, 2)}</b></> : <b>{somP(t.share31, 2)}</b>}</dd></div>
              <div><dt>Línea media</dt><dd className="mono"><b>{somKeur(t.lin31)}</b></dd></div>
              <div><dt>Total líneas</dt><dd className="mono">{somEur(t.lineas31)}</dd></div>
              <div><dt>Utilización</dt><dd className="mono">{somP(p.utilizacion, 0)}</dd></div>
              <div className="gt-card-sep"><dt>Facturación media<em>AEAT 2022</em></dt><dd className="mono">{somCart(fact[t.id])}</dd></div>
              <div className="gt-card-hl"><dt>Línea / facturación</dt><dd className="mono"><b>{somP(fact[t.id] ? t.lin31 / fact[t.id] : null, 1)}</b></dd></div>
              <div><dt>Línea / loanbook total</dt><dd className="mono"><b>{somP(v.eur31 ? t.lin31 / v.eur31 : null, 2)}</b></dd></div>
            </dl>
            <div className="gt-card-bar">
              <i style={{width: Math.min(100, (t.cli31 / v.cli31) * 100) + '%'}}/>
              <span>{somP(t.cli31 / v.cli31, 0)} de los clientes del SOM</span>
            </div>
          </div>
        ))}
      </div>

      <div className="gt-disc">
        <b>Cómo se fija cada objetivo.</b> En la cola larga —{v.tiers.filter(t => t.porCuota).map(t => t.label).join(', ')}— es su universo por el 3%.
        {' '}En Corporate, Mid Market y SME Big el SOM <b>es</b> el objetivo de Unicorn a 2029, sin prolongar nada: son el foco y el plan ya llega a ese mercado, así que su cuota sale del propio objetivo.
        {' '}La línea media es la objetivo de 2029 en los seis segmentos.
        {' '}<b>Micro</b> no está en el plan de 2029 y entra desde cero con línea de {somKeur(10000)}, el orden de magnitud de una línea de autoservicio.
        {' '}{window.MKT_FACT_META.aviso}
      </div>

      <section className="gt-sec">
        <div className="gt-sec-head">
          <h2 className="gt-sec-title">Los dos horizontes</h2>
          <span className="gt-sec-hint">Lo que el plan de 2029 ya cubre y lo que queda por planificar</span>
        </div>
        <div className="cv">
          <table className="bk-table">
            <thead><tr>
              <th>Segmento</th>
              <th className="num">Plan 2029</th><th className="num">SOM</th><th className="num">Por cubrir</th>
              <th className="num">Loanbook del SOM</th><th className="num">% del SOM</th><th>Horizonte</th>
            </tr></thead>
            <tbody>
              {v.tiers.map(t => (
                <tr key={t.id}>
                  <td className="bk-tipo"><span className="bk-dot" style={{background: t.color}}/><b>{t.label}</b><em className="pf-nf">{t.porCuota ? '3% de cuota' : 'objetivo Unicorn 2029'}</em></td>
                  <td className="num mono">{somN(t.cli29)}</td>
                  <td className="num mono"><b>{somN(t.cli31)}</b></td>
                  <td className="num mono">{t.cli31 - t.cli29 > 0 ? somN(t.cli31 - t.cli29) : <span className="bk-none">cubierto</span>}</td>
                  <td className="num mono"><b>{somEur(t.eur31)}</b></td>
                  <td className="num mono">{somP(t.eur31 / v.eur31, 0)}</td>
                  <td>{t.porCuota
                    ? <span className="som-h pend">2030 en adelante</span>
                    : <span className="som-h ok">dic 2029</span>}</td>
                </tr>
              ))}
              <tr className="bk-row-tot">
                <td>Total SOM</td>
                <td className="num mono">{somN(v.cli29)}</td>
                <td className="num mono">{somN(v.cli31)}</td>
                <td className="num mono">{somN(v.cli31 - v.cli29)}</td>
                <td className="num mono">{somEur(v.eur31)}</td>
                <td className="num mono">100%</td>
                <td/>
              </tr>
            </tbody>
          </table>
          <div className="cv-note">
            {(() => {
              const foco = v.tiers.filter(t => !t.porCuota), cola = v.tiers.filter(t => t.porCuota);
              const fc = foco.reduce((a, t) => a + t.cli31, 0), fe = foco.reduce((a, t) => a + t.eur31, 0);
              const cc = cola.reduce((a, t) => a + t.cli31, 0), ce = cola.reduce((a, t) => a + t.eur31, 0);
              return <>
                <b>El SOM de foco se alcanza en 2029</b>: {somN(fc)} clientes y {somEur(fe)}, el {somP(fe / v.eur31, 0)} del libro del SOM con el {somP(fc / v.cli31, 0)} de los clientes. Eso es lo que planifica Unicorn.
                {' '}<b>El de la cola larga queda por planificar</b>: {somN(cc)} clientes y {somEur(ce)}. Son {somN(cc - cola.reduce((a, t) => a + t.cli29, 0))} clientes por captar, y a ese volumen el canal no puede ser SDR con discovery ni AE con comité — es autoservicio o embedded, el canal 4 que ya está modelado en la pestaña 2027.
                {' '}Micro es el caso extremo: {somN((v.tiers.find(t => t.id === 'micro') || {}).cli31)} clientes con línea de {somKeur((v.tiers.find(t => t.id === 'micro') || {}).lin31)} y {somEur((v.tiers.find(t => t.id === 'micro') || {}).eur31)} de libro.
              </>;
            })()}
          </div>
        </div>
      </section>

      <window.PricingBlock
        tiers={v.tiers.map(t => ({ id: t.id, label: t.label, color: t.color, eur: t.eur31, cli: t.cli31 }))}
        titulo="Facturación del SOM completo"
        nota="Sobre el loanbook del SOM, que mezcla el horizonte 2029 del foco con la cola larga por planificar."/>

      <div className="gt-foot">
        SOM es el mercado servible con canal de volumen, no una extensión del plan comprometido. Las cuatro dimensiones son las mismas que en Unicorn —clientes, línea media, utilización y cuota— y la utilización es la global del plan ({somP(p.utilizacion, 0)}).
        Los universos y la facturación media salen del motor AEAT de la pestaña Mercado, así que cambian si se cambia allí el año o el método de reparto.
      </div>
    </div>
  );
};
