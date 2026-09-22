// Tabla trimestral de negocio por tier: clientes, línea, cuota y loanbook
const { useMemo } = React;

window.QuarterPlan = function QuarterPlan({ p, scope }) {
  const qN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
  const q1 = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(1).replace('.', ',');
  const qK = (v) => v == null || isNaN(v) ? '—' : v >= 1e4 ? Math.round(v / 1e3).toLocaleString('es-ES') + 'k' : qN(v);
  const qP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 1 : d).replace('.', ',') + '%';
  const qKeur = (v) => v == null || isNaN(v) ? '—' : Math.round(v / 1e3).toLocaleString('es-ES') + 'k€';
  const qEur = (v) => v == null ? '—' : v >= 1e6 ? Math.round(v / 1e6).toLocaleString('es-ES') + 'M€'
    : v >= 1e3 ? Math.round(v / 1e3).toLocaleString('es-ES') + 'k€' : qN(v) + '€';

  // Capacity-only por diseño: el objetivo de penetración no tiene serie temporal.
  const plan = useMemo(() => window.gtmQuarterly(p), [p]);
  const objOf = (id) => (plan.obj.rows || []).find(r => r.id === id) || {};
  // Clientes que ya existen al arrancar el plan: no los trae ningún canal.
  const baseCli = (b) => [b.tier.id].concat(b.merged || [])
    .reduce((a, id) => a + (((window.HS_START || {})[id] || {}).clientes || 0), 0);
  const qs = plan.quarters;
  const foco = scope === 'foco';
  const bl = foco ? plan.blocks.filter(b => b.tier.focus) : plan.blocks;

  const Row = ({ label, sub, get, fmt, strong, cap, sep }) => (
    <tr className={(strong ? 'h-strong ' : '') + (cap ? 'h-cap ' : '') + (sep ? 'h-sep ' : '')}>
      <th className="h-rl">{label}{sub && <em>{sub}</em>}</th>
      {qs.map((q, i) => {
        const v = get(i);
        return (
          <td key={i} className={q.q === 4 ? 'h-yr' : ''}>
            {v == null ? <span className="k-none">·</span> : (fmt ? fmt(v) : qN(v))}
          </td>
        );
      })}
    </tr>
  );

  // Totales del alcance visible, recompuestos de los bloques para que la cuota
  // use el universo del mismo alcance.
  const uni = bl.reduce((a, b) => a + b.st.universo, 0);
  const tot = qs.map((q, k) => {
    const cli = bl.reduce((a, b) => a + b.rows[k].cumAllCli, 0);
    const lineas = bl.reduce((a, b) => a + b.rows[k].lineas, 0);
    return { ...q, cli, lineas, eur: lineas * plan.util,
      nuevos: bl.reduce((a, b) => a + b.rows[k].allCli, 0),
      ticket: cli ? lineas / cli : null, share: uni ? cli / uni : null };
  });
  const fin = tot[tot.length - 1];
  const objCli = bl.reduce((a, b) => a + (objOf(b.tier.id).objetivo || 0), 0);

  const bloque = (b) => {
    const last = b.rows[b.rows.length - 1];
    const o = objOf(b.tier.id);
    b.objetivo = o.objetivo || 0; b.objFuente = o.objFuente;
    return (
      <section className="h-block" key={b.tier.id} style={{'--c': b.tier.color}}>
        <div className="h-bh">
          <span className="h-chip">{b.label}</span>
          <span className="h-bh-d">
            {b.rango} · {qK(b.st.universo)} empresas · línea media {qKeur(b.ticket)}
            {b.objetivo > 0 && <> · objetivo {qN(b.objetivo)} clientes a 2029{b.objFuente ? ' (' + b.objFuente + ')' : ''}, cubierto al {qP(last.cumAllCli / b.objetivo, 0)}</>}
            {b.objetivo > 0 && last.cumAllCli > b.objetivo * 1.2 &&
              <span className="h-overshoot" title="La capacidad se separa del objetivo más de un 20%: o el objetivo está corto o hay un supuesto de crecimiento sin techo, normalmente el compuesto del canal partner.">
                supuesto sin revisar
              </span>}
          </span>
          <span className="h-bh-k mono">{qN(last.cumAllCli)} clientes · {qEur(last.eur)}</span>
        </div>
        <div className="h-scroll">
          <table className="h-table">
            <thead><tr>
              <th className="h-rl">{b.label}</th>
              {qs.map((q, i) => (
                <th key={i} className={q.q === 4 ? 'h-yr' : ''}>
                  {q.label}{q.parcial && <em className="k-q">{q.meses}m</em>}
                </th>
              ))}
            </tr></thead>
            <tbody>
              <Row label="Clientes" sub="acumulados a cierre de trimestre" get={i => b.rows[i].cumAllCli} strong/>
              <Row label="Clientes nuevos" sub="del trimestre, los cuatro canales" get={i => b.rows[i].allCli} />
              <Row label="Línea media" sub="límite concedido por cliente" get={() => b.ticket} fmt={qKeur}/>
              <Row label="Total líneas" sub="clientes × línea media" get={i => b.rows[i].lineas} fmt={qEur}/>
              <Row label="Cuota de mercado" sub={'sobre ' + qK(b.st.universo) + ' empresas del tramo'} get={i => b.rows[i].share} fmt={v => qP(v, 1)}/>
              <Row label="Utilización media" sub="parte de la línea dispuesta" get={() => plan.util} fmt={v => qP(v, 0)} cap/>
              <Row label="Loanbook" sub="saldo dispuesto en balance" get={i => b.rows[i].eur} fmt={qEur} strong/>
              <Row label="Base de partida" sub="clientes que ya existen, medidos en HubSpot" get={() => baseCli(b)} cap sep/>
              <Row label="De outbound" sub={'acumulado neto · cierra al ' + qP(window.gtmWin(p, b.tier.id, 'out'), 1)} get={i => b.rows[i].cumCli - baseCli(b)} cap/>
              {b.pa && <Row label="De partners" sub={'acumulado · cierra al ' + qP(window.gtmWin(p, b.tier.id, 'part'), 1) + ' y crece ' + qP(b.pa.growth, 0) + ' al mes'} get={i => b.rows[i].cumPDeal * window.gtmWin(p, b.tier.id, 'part')} cap/>}
              <Row label="De contactos" sub="acumulado · cartera de perdidos" get={i => b.rows[i].cumFuCli} cap/>
              {b.em && <Row label="De embedded" sub={'acumulado · ' + b.em.partner} get={i => b.rows[i].cumECli} cap/>}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  const total = (
    <section className="h-block h-total">
        <div className="h-bh">
          <span className="h-chip">{foco ? 'Tiers de foco' : 'Todos los tiers'}</span>
          <span className="h-bh-d">Lo que suman los bloques, con la línea media ponderada que resulta de la mezcla y la cuota sobre las {qK(uni)} empresas del alcance.</span>
          <span className="h-bh-k mono">{qN(fin.cli)} clientes · {qEur(fin.eur)}</span>
        </div>
        <div className="h-scroll">
          <table className="h-table">
            <thead><tr>
              <th className="h-rl">Total</th>
              {qs.map((q, i) => <th key={i} className={q.q === 4 ? 'h-yr' : ''}>{q.label}</th>)}
            </tr></thead>
            <tbody>
              <Row label="Clientes" sub="acumulados" get={i => tot[i].cli} strong/>
              <Row label="Clientes nuevos" sub="del trimestre" get={i => tot[i].nuevos} />
              <Row label="Línea media" sub="ponderada por la mezcla de tiers" get={i => tot[i].ticket} fmt={qKeur}/>
              <Row label="Total líneas" sub="límite concedido" get={i => tot[i].lineas} fmt={qEur}/>
              <Row label="Cuota de mercado" sub={'sobre ' + qK(uni) + ' empresas'} get={i => tot[i].share} fmt={v => qP(v, 1)}/>
              <Row label="Utilización media" sub="palanca" get={() => plan.util} fmt={v => qP(v, 0)} cap/>
              <Row label="Loanbook" sub="saldo dispuesto" get={i => tot[i].eur} fmt={qEur} strong/>
              <Row label="Objetivo de clientes" sub={'a cierre de 2029 · ' + qN(objCli) + ' clientes'} get={() => objCli} cap sep/>
              <Row label="Sobre el objetivo" sub="clientes acumulados entre objetivo" get={i => objCli ? tot[i].cli / objCli : null} fmt={v => qP(v, 0)} cap/>
            </tbody>
          </table>
        </div>
        <div className="h-bn">
          El loanbook es <b>saldo dispuesto</b>, no límite concedido: {qEur(fin.lineas)} de líneas al {qP(plan.util, 0)} dan {qEur(fin.eur)} en balance.
          La línea media sube de {qKeur(tot[0].ticket)} a {qKeur(fin.ticket)} porque cambia la mezcla de tiers, no porque se conceda más a nadie.
          Q3 26 es parcial: el plan arranca en septiembre y ese trimestre solo tiene un mes.
          Esta tabla mide <b>lo que entregan los canales</b>; el objetivo de penetración ({qN(foco ? plan.obj.focoCli : plan.obj.cli)} clientes, {qEur(foco ? plan.obj.focoTotal : plan.obj.total)}) está en el loanbook por segmento.
        </div>
      </section>
  );

  return (
    <div className="qp">
      {total}
      {bl.map(bloque)}
    </div>
  );
};
