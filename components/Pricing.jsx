// Bloque de facturación y escenarios de pricing, compartido por Unicorn y SOM
const { useState, useMemo } = React;

window.PricingBlock = function PricingBlock({ tiers, titulo, nota }) {
  const [esc, setEsc] = useState(window.GTM_TAE_DEFECTO);
  const N = (v) => window.pfFmt.n(v);
  const P = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d).replace('.', ',') + '%';
  const E = (v) => window.pfFmt.plan(v);
  const K = (v) => window.pfFmt.keur(v);
  const C = (v) => window.pfFmt.cartera(v);
  // Millones con un decimal siempre, para columnas que se comparan en vertical.
  const M = (v) => v == null || isNaN(v) ? '—' : (v / 1e6).toFixed(1).replace('.', ',') + 'M€';
  const som = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(1).replace('.', ',');

  const all = useMemo(() => window.gtmFacturacionEsc(tiers), [tiers]);
  const f = all[esc];
  const escDef = window.GTM_TAE_ESC.find(e => e.id === esc) || window.GTM_TAE_ESC[1];
  const max = Math.max(...f.rows.map(r => r.rev || 0));

  return (
    <section className="gt-sec pr">
      <div className="gt-sec-head">
        <h2 className="gt-sec-title">{titulo || 'Facturación y pricing'}</h2>
        <span className="gt-sec-hint">La facturación es <b>TAE × loanbook dispuesto</b>, no × línea concedida: lo que devenga es el saldo, no el límite. {nota}</span>
        <div className="gt-tg">
          {window.GTM_TAE_ESC.map(e => (
            <button key={e.id} className={esc === e.id ? 'on' : ''} onClick={() => setEsc(e.id)}>{e.label}</button>
          ))}
        </div>
      </div>

      <div className="pr-band">
        <span className="pr-band-l">{escDef.label}</span>
        <span className="pr-band-n mono">{E(f.rev)}<em>facturación</em></span>
        <span className="pr-band-n mono">{P(f.taeMedia, 1)}<em>TAE media ponderada</em></span>
        <span className="pr-band-n mono">{E(f.loanbook)}<em>loanbook</em></span>
        <span className="pr-band-n mono">{K(f.cli ? f.rev / f.cli : null)}<em>por cliente y año</em></span>
      </div>

      <div className="cv">
        <table className="bk-table">
          <thead><tr>
            <th>Segmento</th><th className="num">Clientes</th><th className="num">Loanbook</th>
            {window.GTM_TAE_ESC.map(e => <th key={e.id} className={'num ' + (esc === e.id ? 'pr-on' : '')}>{e.label}</th>)}
            <th className="num">TAE activa</th><th className="num">Facturación</th>
            <th className="num">Por cliente</th><th>Peso</th>
          </tr></thead>
          <tbody>
            {f.rows.map(r => (
              <tr key={r.id}>
                <td className="bk-tipo"><span className="bk-dot" style={{background: r.color}}/><b>{r.label}</b></td>
                <td className="num mono">{N(r.cli)}</td>
                <td className="num mono">{E(r.loanbook)}</td>
                {window.GTM_TAE_ESC.map(e => {
                  const x = all[e.id].rows.find(y => y.id === r.id);
                  return (
                    <td key={e.id} className={'num mono ' + (esc === e.id ? 'pr-on' : 'muted')}>
                      {P(x.tae)}<em className="pr-rev">{E(x.rev)}</em>
                    </td>
                  );
                })}
                <td className="num mono"><b>{P(r.tae)}</b></td>
                <td className="num mono"><b>{E(r.rev)}</b><em className="pr-rev">{P(r.rev / f.rev)} del total</em></td>
                <td className="num mono">{K(r.revPorCli)}</td>
                <td className="fn-bar"><i style={{width: Math.max(1, (r.rev || 0) / max * 100) + '%', background: r.color}}/></td>
              </tr>
            ))}
            <tr className="bk-row-tot">
              <td>Total</td>
              <td className="num mono">{N(f.cli)}</td>
              <td className="num mono">{E(f.loanbook)}</td>
              {window.GTM_TAE_ESC.map(e => (
                <td key={e.id} className={'num mono ' + (esc === e.id ? 'pr-on' : 'muted')}>
                  {P(all[e.id].taeMedia, 1)}<em className="pr-rev">{E(all[e.id].rev)}</em>
                </td>
              ))}
              <td className="num mono">{P(f.taeMedia, 1)}</td>
              <td className="num mono">{E(f.rev)}<em className="pr-rev">100%</em></td>
              <td className="num mono">{K(f.cli ? f.rev / f.cli : null)}</td>
              <td/>
            </tr>
          </tbody>
        </table>
        <div className="cv-note">
          {(() => {
            const lo = all.bajo, hi = all.alto, mid = all.medio;
            const top = f.rows.slice().sort((a, b) => b.rev - a.rev)[0];
            return <>
              La horquilla de precio mueve la facturación de <b>{E(lo.rev)}</b> a <b>{E(hi.rev)}</b> sobre el mismo loanbook: {E(hi.rev - lo.rev)} de diferencia, un {P(hi.rev / lo.rev - 1)} más, sin un cliente ni un euro de balance adicional.
              {' '}El escenario central da {E(mid.rev)} y una TAE media del {P(mid.taeMedia, 1)}, que sale ponderada y no es la media de los {f.rows.length} segmentos: los de TAE alta pesan poco en saldo.
              {' '}<b>{top.label}</b> es el que más factura ({E(top.rev)}, el {P(top.rev / f.rev)}) aunque no sea el de TAE más alta, porque la facturación la manda el loanbook.
            </>;
          })()}
        </div>
      </div>

      {(() => {
        const eq = window.gtmEquipo(f.rows);
        return (
          <div className="pr-team">
            <div className="pr-team-h">
              <b>Equipo Sales · Risk · Ops</b>
              <em>Misma plantilla en los tres roles por segmento: {eq.rows.map(r => r.porRol + ' en ' + r.label).join(', ')}. Son {eq.porRol} por rol y <b>{eq.total} personas</b> en total.</em>
            </div>
            <table className="bk-table">
              <thead><tr>
                <th>Segmento</th><th className="num">Clientes</th>
                {window.GTM_ROLES.map(rol => <th key={rol.id} className="num" title={rol.desc}>{rol.label}</th>)}
                <th className="num">Clientes por rol</th><th className="num">Total equipo</th>
                <th className="num">Loanbook / persona</th><th className="num">Facturación / persona</th>
              </tr></thead>
              <tbody>
                {eq.rows.map(r => (
                  <tr key={r.id}>
                    <td className="bk-tipo"><span className="bk-dot" style={{background: r.color}}/><b>{r.label}</b></td>
                    <td className="num mono">{N(r.cli)}</td>
                    {window.GTM_ROLES.map(rol => <td key={rol.id} className="num mono">{r.porRol}</td>)}
                    <td className="num mono"><b>{N(r.cliPorRol)}</b></td>
                    <td className="num mono">{r.total}</td>
                    <td className="num mono">{M(r.lbPorPersona)}</td>
                    <td className="num mono">{M(r.revPorPersona)}</td>
                  </tr>
                ))}
                <tr className="bk-row-tot">
                  <td>Total</td>
                  <td className="num mono">{N(eq.cli)}</td>
                  {window.GTM_ROLES.map(rol => <td key={rol.id} className="num mono">{eq.porRol}</td>)}
                  <td className="num mono">{N(eq.cli / eq.porRol)}</td>
                  <td className="num mono">{eq.total}</td>
                  <td className="num mono">{M(eq.lbPorPersona)}</td>
                  <td className="num mono">{M(eq.revPorPersona)}</td>
                </tr>
              </tbody>
            </table>
            <div className="cv-note">
              «Clientes por rol» es la carga de cada Sales, cada Risk y cada Ops: los clientes del segmento entre la plantilla de un solo rol. «Total equipo» son los tres roles juntos, de {Math.min(...eq.rows.map(r => r.total))} a {Math.max(...eq.rows.map(r => r.total))} personas según la fila, y es el denominador de las dos columnas de euros.
              {' '}La horquilla va de {N(Math.min(...eq.rows.map(r => r.cliPorRol)))} a {N(Math.max(...eq.rows.map(r => r.cliPorRol)))} clientes por ejecutivo: {eq.rows.slice().sort((a, b) => b.cliPorRol - a.cliPorRol)[0].label} es el extremo y marca si ese segmento puede llevarse con gestión individual o necesita autoservicio.
              {' '}En euros la relación se invierte: {M(Math.max(...eq.rows.map(r => r.lbPorPersona)))} de loanbook por persona en {eq.rows.slice().sort((a, b) => b.lbPorPersona - a.lbPorPersona)[0].label} contra {M(Math.min(...eq.rows.map(r => r.lbPorPersona)))} en {eq.rows.slice().sort((a, b) => a.lbPorPersona - b.lbPorPersona)[0].label}.
            </div>
          </div>
        );
      })()}

      {(() => {
        const R = window.gtmRentabilidad(f.rows);
        const maxM = Math.max(...R.rows.map(r => r.margen));
        return (
          <div className="pr-rent">
            <div className="pr-team-h">
              <b>Rentabilidad</b>
              <em>Facturación menos coste de equipo, de mora y de capital. El coste por persona <b>depende del tier</b>: el perfil que cierra una operación de 10M€ no es el que da de alta una línea de 10k€ — las cifras y su tesis están en la leyenda de abajo. {window.GTM_BASE_TIPOS}</em>
            </div>
            <table className="bk-table">
              <thead><tr>
                <th>Segmento</th><th className="num">Loanbook</th><th className="num">TAE media</th>
                <th className="num">Coste por persona</th><th className="num">Coste operativo</th><th className="num">Coste de mora</th><th className="num">Coste de capital</th>
                <th className="num">Facturación</th><th className="num">Margen neto</th><th>Peso del margen</th>
              </tr></thead>
              <tbody>
                {R.rows.map(r => (
                  <tr key={r.id}>
                    <td className="bk-tipo"><span className="bk-dot" style={{background: r.color}}/><b>{r.label}</b></td>
                    <td className="num mono">{E(r.loanbook)}</td>
                    <td className="num mono"><b>{P(r.tae)}</b><em className="pr-rev">{K(r.cli ? r.rev / r.cli : null)} por cliente</em></td>
                    <td className="num mono">{K(r.costePersona)}<em className="pr-rev">{r.personas} personas</em></td>
                    <td className="num mono"><b>{P(r.costeEqPct, 2)}</b><em className="pr-rev">{K(r.costeEq)}</em></td>
                    <td className="num mono"><b>{P(r.tasaDef)}</b><em className="pr-rev">{M(r.costeDef)}</em></td>
                    <td className="num mono"><b>{P(r.tasaCap)}</b><em className="pr-rev">{M(r.costeCap)}</em></td>
                    <td className="num mono">{E(r.rev)}<em className="pr-rev">{P(r.rev / R.rev)} del total</em></td>
                    <td className="num mono"><b>{E(r.margen)}</b><em className="pr-rev">{P(r.margenPct, 1)} del loanbook</em></td>
                    <td className="fn-bar"><i style={{width: Math.max(1, r.margen / maxM * 100) + '%', background: r.color}}/><em className="mono">{P(r.margen / R.margen)}</em></td>
                  </tr>
                ))}
                <tr className="bk-row-tot">
                  <td>Total</td>
                  <td className="num mono">{E(R.loanbook)}</td>
                  <td className="num mono">{P(R.taeMedia, 1)}<em className="pr-rev">{K(f.cli ? R.rev / f.cli : null)} por cliente</em></td>
                  <td className="num mono">{K(R.costePersonaMedio)}<em className="pr-rev">{R.personas} personas</em></td>
                  <td className="num mono">{P(R.costeEqPct, 2)}<em className="pr-rev">{K(R.costeEq)}</em></td>
                  <td className="num mono">{P(R.costeDefPct, 2)}<em className="pr-rev">{M(R.costeDef)}</em></td>
                  <td className="num mono">{P(R.costeCapPct, 2)}<em className="pr-rev">{M(R.costeCap)}</em></td>
                  <td className="num mono">{E(R.rev)}<em className="pr-rev">100%</em></td>
                  <td className="num mono">{E(R.margen)}<em className="pr-rev">{P(R.margenPct, 1)} del loanbook</em></td>
                  <td/>
                </tr>
              </tbody>
            </table>
            <div className="cv-note">
              El margen neto del plan es <b>{E(R.margen)}</b>, el {P(R.margenPct, 1)} del loanbook y el {P(R.margenSobreRev)} de la facturación.
              {' '}Los tres costes en orden: <b>capital {M(R.costeCap)}</b>, <b>mora {M(R.costeDef)}</b> y equipo {M(R.costeEq)}.
              {' '}El capital y la mora juntos son {P((R.costeCap + R.costeDef) / R.rev)} de la facturación y el equipo {P(R.costeEq / R.rev)}: la rentabilidad la deciden el fondeo y el riesgo, no la plantilla.
              {(() => {
                const pico = R.rows.reduce((a, r) => r.margenPct > a.margenPct ? r : a, R.rows[0]);
                const iPico = R.rows.indexOf(pico);
                const tras = R.rows.slice(iPico + 1);
                const top = R.rows.slice().sort((a, b) => b.margen - a.margen)[0];
                return <>
                  {' '}El margen sobre loanbook sube al bajar de tamaño <b>hasta {pico.label}</b> ({P(pico.margenPct, 1)}), porque la TAE crece más que la mora.
                  {tras.length > 0 && <> Por debajo se revierte —{tras.map(r => P(r.margenPct, 1) + ' en ' + r.label).join(', ')}— y la causa es el <b>coste operativo sobre loanbook</b>: pasa de {P(pico.costeEqPct, 2)} en {pico.label} a {tras.map(r => P(r.costeEqPct, 2) + ' en ' + r.label).join(' y ')}, porque la plantilla es fija y el balance pequeño.</>}
                  {' '}En euros el orden es otro: <b>{top.label}</b> aporta el {P(top.margen / R.margen)} del margen total.
                </>;
              })()}
            </div>
          </div>
        );
      })()}

      {(() => {
        const R = window.gtmRentabilidad(f.rows);
        return (
          <div className="pr-cost">
            <div className="pr-cost-h">Tesis de coste por tier <em>· coste anual por persona, todo incluido: salario, seguridad social, puesto y herramientas</em>
              <span className="pr-cost-cap">Coste de capital <b className="mono">{P(window.GTM_COSTE_CAPITAL)}</b> igual en todos los segmentos: el fondeo no distingue por tamaño de cliente.</span>
            </div>
            <div className="pr-cost-grid">
              {R.rows.map(r => (
                <div className="pr-cost-c" key={r.id} style={{'--c': r.color}}>
                  <div className="pr-cost-t">{r.label}<em className="mono">{K(r.costePersona)} medio</em></div>
                  <div className="pr-cost-r">
                    {window.GTM_ROLES.map(rol => (
                      <span key={rol.id}>{rol.label}<b className="mono">{K(r.costeRol[rol.id])}</b></span>
                    ))}
                  </div>
                  <div className="pr-cost-d">{r.tesis}</div>
                </div>
              ))}
            </div>
            <div className="cv-note">
              El coste medio por persona va de {K(Math.max(...R.rows.map(r => r.costePersona)))} en {R.rows.slice().sort((a, b) => b.costePersona - a.costePersona)[0].label} a {K(Math.min(...R.rows.map(r => r.costePersona)))} en {R.rows.slice().sort((a, b) => a.costePersona - b.costePersona)[0].label}, un factor de {som(Math.max(...R.rows.map(r => r.costePersona)) / Math.min(...R.rows.map(r => r.costePersona)))}.
              {' '}Aun así el coste operativo sobre loanbook se mueve al revés y con mucha más fuerza —de {P(Math.min(...R.rows.map(r => r.costeEqPct)), 2)} a {P(Math.max(...R.rows.map(r => r.costeEqPct)), 2)}— porque lo que manda no es lo que cuesta la persona sino cuánto balance gestiona.
              {' '}Son supuestos declarados: cambiarlos en <b>GTM_COSTE_ROL</b> recalcula la rentabilidad de las dos pestañas.
            </div>
          </div>
        );
      })()}

      <div className="pr-esc">
        {window.GTM_TAE_ESC.map(e => (
          <div key={e.id} className={'pr-esc-c ' + (esc === e.id ? 'on' : '')} onClick={() => setEsc(e.id)}>
            <div className="pr-esc-h">{e.label}<em className="mono">{P(all[e.id].taeMedia, 1)}</em></div>
            <div className="pr-esc-n mono">{E(all[e.id].rev)}</div>
            <div className="pr-esc-d">{e.desc}</div>
            <div className="pr-esc-t mono">
              {f.rows.map(r => {
                const x = all[e.id].rows.find(y => y.id === r.id);
                return <span key={r.id}>{r.label.replace('SME ', '')} {P(x.tae)}</span>;
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
