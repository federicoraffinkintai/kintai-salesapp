// Tabla de plan maestro, compartida por Unicorn (ambicioso) y BP Serie A (comprometido)
const { useMemo } = React;

window.MasterPlan = function MasterPlan({ p, scope, model }) {
  // Mismo formateador que el resto de la pestaña: toLocaleString('es-ES') no
  // agrupa cuatro dígitos, así que 6077 saldría sin punto.
  const mN = (v) => window.pfFmt.n(v);
  const mK = (v) => v == null || isNaN(v) ? '—' : v >= 1e4 ? mN(v / 1e3) + 'k' : mN(v);
  const mP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 1 : d).replace('.', ',') + '%';
  const mKeur = (v) => window.pfFmt.keur(v);
  const mEur = (v) => window.pfFmt.plan(v);
  const mCart = (v) => window.pfFmt.cartera(v);

  const bp = model === 'bp';
  const plan = useMemo(
    () => bp ? window.gtmMasterBp(p, { scope }) : window.gtmMaster(p),
    [p, scope, model]);
  const qs = plan.quarters;
  const real = plan.realHasta;
  const [ry, rm] = (real || '2026-07').split('-').map(Number);
  const rq = Math.ceil(rm / 3);
  const pasado = (q) => q.y < ry || (q.y === ry && q.q <= rq);

  const Row = ({ label, sub, get, fmt, strong, cap }) => (
    <tr className={(strong ? 'h-strong ' : '') + (cap ? 'h-cap ' : '')}>
      <th className="h-rl">{label}{sub && <em>{sub}</em>}</th>
      {qs.map((q, i) => {
        const v = get(i);
        return (
          <td key={i} className={(q.q === 4 ? 'h-yr ' : '') + (pasado(q) ? 'mp-past' : '')}>
            {v == null ? <span className="k-none">·</span> : (fmt ? fmt(v) : mN(v))}
          </td>
        );
      })}
    </tr>
  );

  const tabla = (label, rows, uni) => (
    <div className="h-scroll">
      <table className="h-table">
        <thead><tr>
          <th className="h-rl">{label}</th>
          {qs.map((q, i) => <th key={i} className={q.q === 4 ? 'h-yr' : ''}>{q.label}</th>)}
        </tr></thead>
        <tbody>
          <Row label="Clientes" sub="cierre de trimestre" get={i => rows[i].cli} strong/>
          <Row label="Clientes reales" sub={'medidos hasta ' + real} get={i => rows[i].real ? rows[i].real.cli : null} cap/>
          <Row label="Línea media" sub={bp ? 'límite concedido por cliente' : 'recorrido hacia la línea objetivo'} get={i => rows[i].linea} fmt={mKeur}/>
          <Row label="Total líneas" sub="clientes × línea media" get={i => rows[i].lineas} fmt={mEur}/>
          <Row label="Utilización" sub="parte de la línea dispuesta" get={i => rows[i].util} fmt={v => mP(v, 0)} cap/>
          <Row label="Loanbook" sub="saldo en balance" get={i => rows[i].eur} fmt={mEur} strong/>
          <Row label="Loanbook real" sub={'outstanding hasta ' + real} get={i => rows[i].real ? rows[i].real.out : null} fmt={mCart} cap/>
          <Row label="Cuota de mercado" sub={uni ? 'sobre ' + mK(uni) + ' empresas' : 'sin universo asignado'} get={i => rows[i].share} fmt={v => mP(v, 2)}/>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={'qp mp ' + (bp ? 'mp-bp' : 'mp-uni')}>
      <section className="h-block h-total">
        <div className="h-bh">
          <span className="h-chip">Global</span>
          <span className="h-bh-d">{bp
            ? <>BP literal por segmento, de ene 2026 a dic 2029. Es el plan comprometido con los inversores de la Serie A.</>
            : <>Recorrido hacia el objetivo ambicioso, repartido con la forma del BP desde la cartera de hoy. Es el plan del equipo.</>}
            {' '}Los trimestres hasta {real} llevan la cartera real medida, para ver el plan y lo que hay en la misma columna.</span>
          <span className="h-bh-k mono">{mN(plan.fin.cli)} clientes · {mEur(plan.fin.eur)}</span>
        </div>
        {tabla('Global', plan.total, plan.universo)}
        <div className="h-bn">
          El loanbook es <b>saldo dispuesto</b>: {mEur(plan.fin.lineas)} de líneas al {mP(plan.fin.util, 0)} dan {mEur(plan.fin.eur)} en balance.
          {(() => {
            const s = plan.total.map(q => q.linea).filter(v => v != null);
            const min = Math.min(...s), max = Math.max(...s);
            return <> La línea media del global arranca en {mKeur(s[0])}, se mueve entre {mKeur(min)} y {mKeur(max)} y cierra en {mKeur(s[s.length - 1])}, según qué segmento gana peso cada trimestre.</>;
          })()}
        </div>
      </section>

      {plan.tiers.map(t => (
        <section className="h-block" key={t.id} style={{'--c': t.color}}>
          <div className="h-bh">
            <span className="h-chip">{t.label}</span>
            <span className="h-bh-d">
              {t.universo ? mK(t.universo) + ' empresas · ' : ''}línea media {t.ticket0 && Math.abs(t.ticket0 - t.ticket) > 1000
                ? <>{mKeur(t.ticket0)} → <b>{mKeur(t.ticket)}</b></>
                : mKeur(t.fin.linea)} · {mN(t.fin.cli)} clientes en dic 29
              {t.objFuente && <> · objetivo por {t.objFuente}</>}
              {t.foco === false && <span className="h-nofoco">fuera de foco</span>}
              {t.late && <span className="h-nofoco late">crecimiento fuerte en 28-29</span>}
            </span>
            <span className="h-bh-k mono">{mN(t.fin.cli)} clientes · {mEur(t.fin.eur)}</span>
          </div>
          {tabla(t.label, t.q, t.universo)}
        </section>
      ))}
    </div>
  );
};
