// BP Serie A: el plan comprometido con los inversores, contra el ambicioso y contra la cartera real
const { useState, useMemo } = React;

const bpN = (v) => window.pfFmt.n(v);
const bpP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d).replace('.', ',') + '%';
const bp1 = (v) => {
  if (v == null || isNaN(v) || !isFinite(v)) return '—';
  // A partir de mil el decimal no informa y el agrupador sí: se imprime entero.
  if (Math.abs(v) >= 1000) return window.pfFmt.n(v);
  return v.toFixed(1).replace('.', ',');
};
const bpKeur = (v) => window.pfFmt.keur(v);
// Plan a 2029: millones enteros. Cartera: un decimal, porque a esta escala sin
// él 3,6 contra 4,1 se leen como 4 y 4 y el 89% parece un error de cálculo.
const bpEur = (v) => window.pfFmt.plan(v);
const bpCart = (v) => window.pfFmt.cartera(v);

window.BpPlan = function BpPlan() {
  const [scope, setScope] = useState('todos');
  const [p] = useState(window.GTM_DEFAULTS);

  const bp = useMemo(() => window.gtmMasterBp(p, { scope: 'todos' }), [p]);
  const uni = useMemo(() => window.gtmMaster(p), [p]);
  const real = useMemo(() => window.pfReal(window.PF_META.realHasta), []);
  const gap = useMemo(() => window.pfGap(), []);

  // Los dos planes cubren ya los mismos cinco segmentos, así que la
  // comparación es directa, segmento a segmento.
  const comp = window.PF_SEGS.map(s => {
    const u = uni.tiers.find(t => t.id === s.id);
    const b = bp.tiers.find(t => t.id === s.id);
    const uCli = u ? u.objetivo : null, uEur = u ? u.fin.eur : null;
    const bCli = b ? b.fin.cli : null, bEur = b ? b.fin.eur : null;
    return { id: s.id, label: s.label, color: s.color, foco: s.foco,
      uCli, uEur, bCli, bEur, uFuente: u ? u.objFuente : null,
      cliX: bCli ? uCli / bCli : null, eurX: bEur ? uEur / bEur : null };
  });
  const uTot = { cli: uni.objCli, eur: uni.fin.eur };
  const bComun = { cli: bp.fin.cli, eur: bp.fin.eur };
  const invertido = uTot.cli <= bComun.cli || uTot.eur <= bComun.eur;

  const years = [2026, 2027, 2028, 2029];

  return (
    <div className="bp bk" data-screen-label="14 BP Serie A">
      <div className="bk-head">
        <div>
          <h1 className="bk-h1">BP Serie A</h1>
          <div className="bk-sub">El plan <b>comprometido con los inversores</b> de la Serie A, literal de {window.PF_META.fuente}. Es el escenario conservador: lo que se ha vendido y hay que cumplir. El plan ambicioso del equipo vive en <b>Unicorn</b> y no se comparte fuera.</div>
        </div>
        <div className="bk-kpis">
          <div className="bk-kpi"><b className="mono">{bpN(bp.fin.cli)}</b><span>clientes a dic 29</span></div>
          <div className="bk-kpi"><b className="mono">{bpKeur(bp.fin.linea)}</b><span>línea media</span></div>
          <div className="bk-kpi accent"><b className="mono">{bpEur(bp.fin.eur)}</b><span>loanbook comprometido</span></div>
          <div className="bk-kpi"><b className="mono">{bpP(bp.fin.util)}</b><span>utilización del plan</span></div>
        </div>
      </div>

      {/* ===== LOS DOS ESCENARIOS ===== */}
      <div className="bk-lvl-h">Los dos escenarios</div>
      <div className="bp-two">
        <div className="bp-card uni">
          <div className="bp-card-h">Unicorn<em>plan del equipo · ambicioso</em></div>
          <div className="bp-card-n mono">{bpN(uTot.cli)}<span>clientes</span></div>
          <div className="bp-card-e mono">{bpEur(uTot.eur)}<span>loanbook</span></div>
          <div className="bp-card-d">Tesis difícil pero posible. Si se cumple siempre, no era ambicioso: la regla es que falle cerca de la mitad de las veces. No se comparte con inversores.</div>
        </div>
        <div className="bp-vs">
          <div className="bp-vs-n mono">{comp.length && bComun.cli ? '×' + bp1(uTot.cli / bComun.cli) : '—'}</div>
          <div className="bp-vs-l">clientes</div>
          <div className="bp-vs-n mono">{bComun.eur ? '×' + bp1(uTot.eur / bComun.eur) : '—'}</div>
          <div className="bp-vs-l">loanbook</div>
          <div className="bp-vs-d">sobre los mismos segmentos</div>
        </div>
        <div className="bp-card bpc">
          <div className="bp-card-h">BP Serie A<em>comprometido · conservador</em></div>
          <div className="bp-card-n mono">{bpN(bp.fin.cli)}<span>clientes</span></div>
          <div className="bp-card-e mono">{bpEur(bp.fin.eur)}<span>loanbook</span></div>
          <div className="bp-card-d">Lo vendido a la Serie A, los cinco segmentos. Es el suelo que hay que cumplir, no la meta a la que se apunta.</div>
        </div>
      </div>
      {invertido && (
        <div className="bp-warn">
          <b>Los dos planes están invertidos.</b> Sobre los segmentos que Unicorn planifica, el ambicioso pide {bpN(uTot.cli)} clientes y {bpEur(uTot.eur)} de loanbook,
          mientras el BP comprometido pide {bpN(bComun.cli)} y {bpEur(bComun.eur)} en esos mismos segmentos. Un plan de equipo que queda por debajo de lo firmado con inversores no cumple su función:
          si el BP es el suelo, Unicorn tiene que estar claramente por encima. Los objetivos de Unicorn se ajustan en su propia pestaña.
        </div>
      )}

      {/* ===== COMPARATIVA POR SEGMENTO ===== */}
      <div className="bk-lvl-h">Por segmento, a cierre de 2029</div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr>
            <th>Segmento</th>
            <th className="num">Unicorn</th><th className="num">BP Serie A</th><th className="num">Unicorn / BP</th>
            <th className="num">Loanbook Unicorn</th><th className="num">Loanbook BP</th><th className="num">Unicorn / BP</th>
          </tr></thead>
          <tbody>
            {comp.map(x => (
              <tr key={x.id}>
                <td className="bk-tipo"><span className="bk-dot" style={{background: x.color}}/><b>{x.label}</b>{!x.foco && <em className="pf-nf">fuera de foco</em>}</td>
                <td className="num mono">{bpN(x.uCli)}</td>
                <td className="num mono">{bpN(x.bCli)}</td>
                <td className="num mono">{x.cliX == null ? <span className="bk-none">—</span>
                  : <span className="k-ach" style={{'--c': x.cliX >= 1.3 ? '#1F5C42' : x.cliX >= 1 ? '#B8731F' : '#B23A3A'}}>×{bp1(x.cliX)}</span>}</td>
                <td className="num mono">{bpEur(x.uEur)}</td>
                <td className="num mono">{bpEur(x.bEur)}</td>
                <td className="num mono">{x.eurX == null ? <span className="bk-none">—</span>
                  : <span className="k-ach" style={{'--c': x.eurX >= 1.3 ? '#1F5C42' : x.eurX >= 1 ? '#B8731F' : '#B23A3A'}}>×{bp1(x.eurX)}</span>}</td>
              </tr>
            ))}
            <tr className="bk-row-tot">
              <td>Total</td>
              <td className="num mono">{bpN(uTot.cli)}</td>
              <td className="num mono">{bpN(bp.fin.cli)}</td>
              <td className="num mono">×{bp1(uTot.cli / bp.fin.cli)}</td>
              <td className="num mono">{bpEur(uTot.eur)}</td>
              <td className="num mono">{bpEur(bp.fin.eur)}</td>
              <td className="num mono">×{bp1(uTot.eur / bp.fin.eur)}</td>
            </tr>
          </tbody>
        </table>
        <div className="cv-note">
          Los dos planes cubren los cinco segmentos, así que la comparación es directa.
          Mid Market y SME Big llevan objetivo de dirección; en el resto Unicorn parte del BP y lo multiplica por {bp1(window.GTM_AMB_FACTOR)}, y esa procedencia se declara en las palancas de su pestaña.
        </div>
      </div>

      {/* ===== CUMPLIMIENTO ===== */}
      <div className="bk-lvl-h">Cómo va el BP contra la cartera real</div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr>
            <th>Segmento</th>
            <th className="num">Clientes reales</th><th className="num">BP en {gap.mes}</th><th className="num">Cumple</th>
            <th className="num">Outstanding</th><th className="num">BP</th><th className="num">Cumple</th>
          </tr></thead>
          <tbody>
            {gap.segs.map(s => (
              <tr key={s.id}>
                <td className="bk-tipo"><span className="bk-dot" style={{background: s.color}}/><b>{s.label}</b></td>
                <td className="num mono"><b>{bpN(s.real.cli)}</b></td>
                <td className="num mono muted">{bpN(s.bp.cli)}</td>
                <td className="num mono">{s.cliPct == null ? <span className="bk-none">—</span>
                  : <span className="k-ach" style={{'--c': s.cliPct >= 0.9 ? '#1F5C42' : s.cliPct >= 0.6 ? '#B8731F' : '#B23A3A'}}>{bpP(s.cliPct)}</span>}</td>
                <td className="num mono"><b>{bpCart(s.real.out)}</b></td>
                <td className="num mono muted">{bpCart(s.bp.loanbook)}</td>
                <td className="num mono">{s.lbPct == null ? <span className="bk-none">—</span>
                  : <span className="k-ach" style={{'--c': s.lbPct >= 0.9 ? '#1F5C42' : s.lbPct >= 0.6 ? '#B8731F' : '#B23A3A'}}>{bpP(s.lbPct)}</span>}</td>
              </tr>
            ))}
            <tr className="bk-row-tot">
              <td>Total cartera</td>
              <td className="num mono">{bpN(gap.real.cli)}</td>
              <td className="num mono">{bpN(gap.bp.cli)}</td>
              <td className="num mono">{bpP(gap.cliPct)}</td>
              <td className="num mono">{bpCart(gap.real.out)}</td>
              <td className="num mono">{bpCart(gap.bp.loanbook)}</td>
              <td className="num mono">{bpP(gap.lbPct)}</td>
            </tr>
          </tbody>
        </table>
        <div className="cv-note">
          El BP conservador ya va al {bpP(gap.cliPct)} en clientes y al {bpP(gap.lbPct)} en outstanding a {gap.mes}. El detalle mes a mes está en <b>Portfolio</b>.
        </div>
      </div>

      {/* ===== SERIE COMPLETA ===== */}
      <div className="bk-lvl-h">Serie del BP por trimestre</div>
      <window.MasterPlan p={p} scope={scope} model="bp"/>

      <div className="bk-foot">
        Dos escenarios y dos audiencias: el <b>BP Serie A</b> es el compromiso con los inversores y se cumple; <b>Unicorn</b> es la tesis ambiciosa del equipo, pensada para fallar cerca de la mitad de las veces.
        Mantenerlos separados evita las dos patologías: sobrevender a los inversores un plan arriesgado y relajar al equipo con un objetivo que ya está firmado.
        Las cifras del BP son literales del report y no se editan aquí; las de Unicorn se ajustan en su pestaña.
      </div>
    </div>
  );
};
