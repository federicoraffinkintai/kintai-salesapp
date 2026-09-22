// Canal broker: plan mensual por tipo de partner, corto y medio plazo
const { useState, useMemo } = React;

const bN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
const b1 = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(1).replace('.', ',');
const bE = (v) => v == null || isNaN(v) ? '—'
  : Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1).replace('.', ',') + 'M€'
  : Math.abs(v) >= 1e3 ? Math.round(v / 1e3).toLocaleString('es-ES') + 'k€'
  : Math.round(v).toLocaleString('es-ES') + '€';
const bP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d).replace('.', ',') + '%';

window.BrokerFlow = function BrokerFlow() {
  const [growth, setGrowth] = useState(window.BRK_GROWTH_DEFECTO);
  const [hasta, setHasta] = useState('2027-12');
  const [fuente, setFuente] = useState('plan2027');
  const [openT, setOpenT] = useState(null);
  const [tierVista, setTierVista] = useState('mes');
  const [histVista, setHistVista] = useState('8');
  const [corte, setCorte] = useState('hoy');
  const [abierto, setAbierto] = useState(null);

  const plan = useMemo(() => window.brkPlan({ growth, hasta, fuente }), [growth, hasta, fuente]);
  const q4 = useMemo(() => window.brkQ4(), []);
  const corteDef = (window.BRK_CORTES || []).find(x => x.id === corte) || (window.BRK_CORTES || [])[0];
  const cc = useMemo(() => window.brkQ4Corte(corteDef && corteDef.fecha), [corte]);
  const months = plan.months;
  const segs = window.BRK_SEGS;
  const all = window.BROKERS;

  // Cierre del trimestre que fija la hoja, que es el ancla de todo el plan.
  const q2 = useMemo(() => {
    const act = {}, tgt = {};
    segs.forEach(s => {
      act[s.id] = all.reduce((a, b) => a + (b.a[s.id] || 0), 0);
      tgt[s.id] = all.reduce((a, b) => a + (b.t[s.id] || 0), 0);
    });
    const obj = all.reduce((a, b) => a + (b.obj || 0), 0);
    const actTot = segs.reduce((a, s) => a + act[s.id], 0);
    return { act, tgt, obj, actTot, ach: actTot / obj,
      conDeals: all.filter(b => window.brkAch(b).act > 0).length };
  }, [all]);

  const Row = ({ label, sub, get, fmt, strong, cap, sep, gap, band }) => (
    <tr className={(strong ? 'k-strong ' : '') + (cap ? 'k-cap ' : '') + (sep ? 'k-sep ' : '')}>
      <th className="k-rl"><b>{label}</b>{sub && <em>{sub}</em>}</th>
      {months.map((mo, i) => {
        const v = get(i);
        return (
          <td key={i} className={(mo.real ? '' : 'k-fut ') + (mo.m === 12 ? 'k-yr ' : '') + (gap && gap(i) ? 'k-bad' : '')}>
            {fmt ? fmt(v, i) : bN(v)}
          </td>
        );
      })}
    </tr>
  );

  const Band = ({ label, note, tone }) => (
    <tr className={'k-chan k-chan-' + tone}>
      <th className="k-rl"><b>{label}</b>{note && <em>{note}</em>}</th>
      <td colSpan={months.length}/>
    </tr>
  );

  const achFmt = (v) => v == null ? <span className="k-none">—</span>
    : <span className="k-ach" style={{'--c': v >= 1 ? '#1F5C42' : v >= 0.6 ? '#2E7D5B' : v > 0 ? '#B8731F' : '#B23A3A'}}>{bP(v)}</span>;

  return (
    <div className="bk" data-screen-label="09 Broker success">
      <div className="bk-head">
        <div>
          <h1 className="bk-h1">Canal broker · Q4 2026</h1>
          <div className="bk-sub">El plan solo pone objetivo de Q4 en los dos tiers de foco, <b>Mid Market</b> y <b>Big Pymes</b>: {bN(q4 && q4.totalFoco.obj)} deals y {bN(q4 && q4.totalFoco.objCli)} clientes entre octubre y diciembre. {q4 && q4.sinObjetivo.length > 0 && <>{q4.sinObjetivo.join(' y ')} no llevan objetivo del plan y quedan fuera del cumplimiento, aunque sigan trayendo volumen. </>}La consecución se lee contra el objetivo completo del trimestre, en deals, clientes y loanbook. {q4 && q4.arrancaEn > 0
            ? <>Q4 arranca en <b>{q4.arrancaEn} días</b>; el ritmo medido del canal es de {b1(q4.totalFoco.actSem)} deals foco por semana y el trimestre exige {b1(q4.totalFoco.reqSem)}.</>
            : <>Van <b>{q4 && q4.transcurridos} de {q4 && q4.dias} días</b> del trimestre.</>}</div>
        </div>
        <div className="bk-kpis">
          <div className="bk-kpi"><b className="mono">{bN(q4 && q4.totalFoco.obj)}</b><span>deals objetivo Q4 · foco</span></div>
          <div className="bk-kpi"><b className="mono">{bN(q4 && q4.totalFoco.objCli)}</b><span>clientes comprometidos</span></div>
          {(() => {
            const eur = q4 ? window.BRK_FOCO.reduce((a, id) => { const s = q4.segs.find(x => x.id === id) || {}; const L = window.brkLinea(id); return L ? a + (s.objCli || 0) * L : a; }, 0) : 0;
            return <>
              <div className="bk-kpi"><b className="mono">{bE(eur)}</b><span>líneas comprometidas</span></div>
              <div className="bk-kpi"><b className="mono">{bE(eur * window.BRK_LOANBOOK)}</b><span>loanbook · {bP(window.BRK_LOANBOOK)} de la línea</span></div>
            </>;
          })()}
          <div className="bk-kpi accent"><b className="mono">{bP(cc && cc.totalFoco.pctQ)}</b><span>vs objetivo Q4</span></div>
          <div className="bk-kpi"><b className="mono">{bN(q4 && q4.totalFoco.reqSem)}</b><span>deals/semana a sostener</span></div>
        </div>
      </div>

      {/* ===== PALANCAS ===== */}
      <div className="bk-levers">
        <div className="bk-lv"><label>De dónde sale el objetivo</label>
          <div className="bk-fg">
            {[['plan2027','Plan 2027 · canal 2'],['hoja','Compromiso Q2 proyectado']].map(([k, l]) => (
              <button key={k} className={fuente === k ? 'on' : ''} onClick={() => setFuente(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="bk-lv" style={{display: fuente === 'hoja' ? undefined : 'none'}}><label>Crecimiento mensual exigido desde Q3</label>
          <div className="bk-num">
            <button onClick={() => setGrowth(Math.max(0, +(growth - 0.01).toFixed(2)))}>−</button>
            <span className="mono">{bP(growth)}</span>
            <button onClick={() => setGrowth(+(growth + 0.01).toFixed(2))}>+</button>
          </div>
        </div>
        <div className="bk-lv"><label>Horizonte</label>
          <div className="bk-fg">
            {[['2026-12','Corto · dic-26'],['2027-12','Medio · dic-27']].map(([k, l]) => (
              <button key={k} className={hasta === k ? 'on' : ''} onClick={() => setHasta(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="bk-lv"><label>Ancla del plan</label>
          <div className="bk-anchor">
            {fuente === 'plan2027'
              ? <>El objetivo lo fijan los <b>canales de partner del plan de 2027</b>: {bN(plan.objTotal)} deals desde <b>{plan.objDesde.label}</b>, que es cuando arranca el plan. El canal 2 se reparte entre los tipos de broker con el peso de su compromiso en la hoja y el canal 4 va entero a Embedded. Los meses anteriores quedan vacíos en vez de tomar otra base.</>
              : <>Compromiso Q2 de <b className="mono">{bN(q2.obj)}</b> deals = <b className="mono">{bN(q2.obj / 3)}</b> al mes, repartido 20 / 30 / 50 entre Mid Market, Big Pymes y Mid Pymes.</>}
          </div>
        </div>
      </div>

      {/* ===== RECONCILIACIÓN ===== */}
      <div className="bk-recon">
        <div className="bk-recon-t">Dos recuentos del mismo trimestre, y no miden lo mismo</div>
        <div className="bk-recon-row">
          <div className="bk-rc"><b className="mono">{bN(plan.recon.hoja)}</b><span>según la hoja</span><em>Celdas de actual que rellena el equipo, partner a partner.</em></div>
          <div className="bk-rc"><b className="mono">{bN(plan.recon.canal)}</b><span>deals de canal en HubSpot</span><em>Todo lo de origen Partners en Q2, cruce o no con la hoja.</em></div>
          <div className="bk-rc accent"><b className="mono">{bN(plan.recon.cruzado)}</b><span>cruzan con un partner de la hoja</span><em>{bP(plan.recon.cobertura)} de cobertura. Es lo que alimenta las filas mensuales.</em></div>
        </div>
        <div className="bk-recon-n">
          Las tarjetas de arriba y el listado de partners usan <b>la hoja</b>; las filas mensuales usan <b>el cruce con HubSpot</b>. No son la misma población: el nombre del broker en el CRM no coincide con la razón social de la hoja en un {bP(1 - plan.recon.cobertura)} de los deals, así que las dos cifras conviven a la vista en vez de elegir una. Unificar el nombre en el CRM cierra la diferencia.
          {plan.flojos.length > 0 && <> Los meses <b>{plan.flojos.join(', ')}</b> tienen cobertura por debajo del {bP(window.BRK_COVER_MIN)} y quedan fuera del cumplimiento: no dicen que el canal pare, dicen que los nombres no cuadran.</>}
        </div>
      </div>

      {/* ===== CONSECUCIÓN DE Q4 ===== */}
      {q4 && cc && (() => {
        const w = (v) => Math.max(0, Math.min(100, (v || 0) * 100)) + '%';
        const ritmo = (id) => (q4.segs.find(s => s.id === id) || q4.totalFoco);
        // Crecimiento que pide el objetivo de Q4 sobre lo conseguido en el mismo
        // trimestre del año pasado y sobre el último trimestre cerrado.
        const h = window.brkHistorico ? window.brkHistorico() : null;
        const QH = window.BRK_HIST_Q || [];
        const at = (ids, q) => {
          if (!h) return null;
          const i = QH.indexOf(q); if (i < 0) return null;
          return h.rows.filter(r => ids.indexOf(r.id) >= 0).reduce((a, r) => a + r.serie[i], 0);
        };
        const crec = (s, tot) => {
          const ids = tot ? cc.foco.map(x => x.id) : [s.id];
          const q425 = at(ids, '2025-Q4'), q326 = at(ids, '2026-Q3');
          return { q425, q326,
            vsQ4: q425 ? s.objQ / q425 - 1 : null,
            vsQ3: q326 ? s.objQ / q326 - 1 : null };
        };
        const gw = (v) => v == null ? <span className="k-none">·</span>
          : <span className={'t1-gw' + (v >= 1 ? ' hi' : v >= 0.3 ? ' md' : '')}>{v > 0 ? '↑' : '↓'}{bP(Math.abs(v))}</span>;
        const Card = ({ s, tot }) => {
          const r = tot ? q4.totalFoco : ritmo(s.id);
          // Ritmo del propio trimestre en cuanto hay dato; si Q4 aún está vacío,
          // el del último trimestre cerrado de la hoja.
          // Ritmo y proyección viven en la misma ventana que el corte: lo
          // conseguido hasta esa fecha sobre los días transcurridos hasta ella.
          const enQ = cc.transcurridos > 0 && s.realHasta > 0;
          const actDia = enQ ? s.realHasta / cc.transcurridos : (r.actDia || 0);
          const proy = s.realHasta + actDia * (q4.dias - cc.transcurridos);
          const g = crec(s, tot);
          return (
            <div className={'bk-cn' + (s.foco ? ' foco' : '') + (tot ? ' tot' : '')} style={{'--c': s.color || 'var(--kin)'}}>
              <div className="bk-cn-t"><b>{s.label}</b>{s.foco && <span className="bk-cn-f">foco</span>}</div>
              {(() => {
                const L = window.brkLinea(tot ? cc.foco.map(x => x.id) : s.id);
                const eur = L ? s.objCli * L : 0;
                return <>
                  <div className="bk-cn-hero">
                    <div><b className="mono">{bN(s.objQ)}</b><span>deals objetivo</span></div>
                    <div><b className="mono">{bN(s.objCli)}</b><span>clientes objetivo</span></div>
                    <div><b className="mono">{eur ? bE(eur * window.BRK_LOANBOOK) : '—'}</b><span>loanbook objetivo</span></div>
                  </div>
                  <div className="bk-cn-sub mono">{eur ? bE(eur) + ' de líneas' : 'sin línea fijada'}<u>{bN(s.realQ)} deals conseguidos · {bP(s.pctQ)}</u></div>
                </>;
              })()}
              <div className="bk-cn-m">
                <div className="bk-cn-l"><span>deals · vs objetivo Q4</span><b className="mono">{bP(s.pctQ)}</b></div>
                <div className="bk-cn-bar proy"><i style={{width: w(s.pctQ)}}/><s style={{width: w(s.objQ ? proy / s.objQ : null)}}/></div>
                <em>{bN(s.faltaQ)} deals por cerrar de {bN(s.objQ)}. Al ritmo {enQ ? 'de lo que va de trimestre' : 'del último trimestre cerrado'}, {b1(actDia * 7)} deals por semana, Q4 cierra en <b>{bN(proy)}</b>: el {bP(s.objQ ? proy / s.objQ : null)} del objetivo.</em>
              </div>
              {(() => {
                const L = window.brkLinea(tot ? cc.foco.map(x => x.id) : s.id);
                const conv = s.objQ ? s.objCli / s.objQ : 0;
                const cliAch = s.realQ * conv, lbObj = s.objCli * L * window.BRK_LOANBOOK, lbAch = cliAch * L * window.BRK_LOANBOOK;
                return <>
                  <div className="bk-cn-m">
                    <div className="bk-cn-l"><span>clientes · vs objetivo Q4</span><b className="mono">{bP(s.objCli ? cliAch / s.objCli : null)}</b></div>
                    <div className={'bk-cn-bar' + (s.objCli && cliAch / s.objCli < 0.8 ? ' low' : '')}><i style={{width: w(s.objCli ? cliAch / s.objCli : null)}}/></div>
                    <em><b>{b1(cliAch)}</b> clientes de los {bN(s.objCli)} comprometidos.</em>
                  </div>
                  {L ? <div className="bk-cn-m">
                    <div className="bk-cn-l"><span>loanbook · vs objetivo Q4</span><b className="mono">{bP(lbObj ? lbAch / lbObj : null)}</b></div>
                    <div className={'bk-cn-bar' + (lbObj && lbAch / lbObj < 0.8 ? ' low' : '')}><i style={{width: w(lbObj ? lbAch / lbObj : null)}}/></div>
                    <em><b>{bE(lbAch)}</b> de los {bE(lbObj)} de loanbook objetivo, al {bP(window.BRK_LOANBOOK)} de la línea. Clientes y loanbook se derivan de los {bN(s.realQ)} deals cerrados con la conversión y la línea media del tier.</em>
                  </div> : null}
                </>;
              })()}
              <div className="bk-cn-m bk-cn-g">
                <div className="bk-cn-l"><span>crecimiento que pide el objetivo</span></div>
                {(() => {
                  const L = window.brkLinea(tot ? cc.foco.map(x => x.id) : s.id);
                  const conv = s.objQ ? s.objCli / s.objQ : 0;
                  const lb = (d) => bE(d * conv * L * window.BRK_LOANBOOK);
                  const fila = (k, lab, obj, v25, v26) => (
                    <div className={'bk-cn-gf m-' + k}>
                      <div className="bk-cn-gf-h"><span className="bk-cn-gf-l">{lab}</span><b className="mono bk-cn-gf-o">{obj}</b></div>
                      <div className="bk-cn-gf-r">
                        <div className="bk-cn-gf-c">{gw(g.vsQ4)}<u className="mono">← {v25}</u></div>
                        <div className="bk-cn-gf-c">{gw(g.vsQ3)}<u className="mono">← {v26}</u></div>
                      </div>
                    </div>
                  );
                  return <div className="bk-cn-gt">
                    <div className="bk-cn-gth"><span>vs Q4 25</span><span>vs Q3 26</span></div>
                    {fila('d', 'deals', bN(s.objQ), bN(g.q425), bN(g.q326))}
                    {fila('c', 'clientes', bN(s.objCli), b1(g.q425 * conv), b1(g.q326 * conv))}
                    {L ? fila('l', 'loanbook', lb(s.objQ), lb(g.q425), lb(g.q326)) : null}
                  </div>;
                })()}
              </div>
            </div>
          );
        };
        return (
          <div className="bk-cons">
            <div className="bk-cons-h">
              <span className="bk-chip">Consecución de Q4 · tiers de foco</span>
              <span className="bk-bh-d">Objetivo de Q4 en las tres unidades que importan — <b>deals</b>, <b>clientes</b> y <b>loanbook</b> — y lo conseguido a la fecha de corte. Clientes y loanbook se derivan de los deals cerrados con la conversión y la línea media del tier.{window.BRK_ACH_DEMO ? <> Los actuals de octubre y noviembre son <b>datos de ejemplo</b>.</> : null}</span>
              <div className="bk-fg">
                {(window.BRK_CORTES || []).map(x => (
                  <button key={x.id} className={corte === x.id ? 'on' : ''} onClick={() => setCorte(x.id)}>{x.label}</button>
                ))}
              </div>
              <span className="bk-bh-k mono">{bN(cc.totalFoco.objQ)} deals · {bN(cc.totalFoco.objCli)} clientes</span>
            </div>
            <div className="bk-cons-g">
              {cc.foco.map(s => <Card key={s.id} s={s}/>)}
              <Card s={cc.totalFoco} tot/>
            </div>
            <div className="bk-cons-r">
              <span className="bk-cons-rl">Fuera de foco</span>
              {cc.resto.map(s => (
                <div key={s.id} className="bk-cons-rc" style={{'--c': s.color}}>
                  <b>{s.label}</b>
                  <span className="mono bk-cons-rv">{bN(s.realQ)} de {bN(s.objQ)}</span>
                  <em>{s.objQ ? bP(s.pctQ) + ' del objetivo Q4' : 'sin objetivo del plan en Q4'}</em>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ===== NIVEL 1 · OBJETIVO POR TIER ===== */}
      {(() => {
        const tp = window.brkTierPlan();
        if (!tp) return null;
        const trimestre = tierVista === 'mes';
        const h = window.brkHistorico ? window.brkHistorico() : null;
        const QH = window.BRK_HIST_Q || [];
        // Los tiers que la tabla pinta, que son los que tienen que alimentar la
        // fila de total: si el histórico sumara los cuatro segmentos contra un
        // target de dos tiers, el total diría lo contrario que sus partes.
        const idsTabla = tp.tiers.map(x => x.id).filter(id => window.BRK_SEGS.some(s => s.id === id));
        const serieDe = (id) => {
          if (!h) return null;
          if (id === '__tot') return QH.map((q, i) => h.rows.filter(r => idsTabla.indexOf(r.id) >= 0)
            .reduce((a, r) => a + r.serie[i], 0));
          const r = h.rows.find(x => x.id === id);
          return r ? r.serie : null;
        };
        const histAt = (id, q) => {
          const s = serieDe(id); if (!s) return null;
          const i = QH.indexOf(q);
          return i >= 0 ? s[i] : null;
        };
        // Conseguido del mes por segmento, de la misma serie cruzada que usa el
        // day to day: hoy sale 0 en Q4 y se rellena en cuanto entre el dato.
        const realMes = (id, mes) => {
          const ids = id === '__tot' ? idsTabla : [id];
          if (!ids.some(x => window.BRK_SEGS.some(s => s.id === x))) return null;
          return window.brkAchMes(ids, mes);
        };
        const achDe = (id, c) => {
          const ids = id === '__tot' ? idsTabla : [id];
          if (!ids.some(x => window.BRK_SEGS.some(sg => sg.id === x))) return null;
          if (c.mes) return window.brkAchMes(ids, c.id);
          const hv = c.achQ ? histAt(id, c.achQ) : null;
          if (hv != null) return hv;
          // Trimestre en curso: el histórico aún no lo tiene, así que se suman
          // sus meses de la misma serie que alimenta la vista mensual.
          let v = null;
          c.idx.forEach(i => {
            const mo = tp.months[i]; if (!mo) return;
            const x = window.brkAchMes(ids, mo.id);
            if (x != null) v = (v || 0) + x;
          });
          return v;
        };
        const cols = trimestre
          ? window.BRK_Q.meses.map(id => {
              const i = tp.months.findIndex(m => m.id === id);
              const mo = tp.months[i] || {};
              return { id, label: mo.label, idx: [i], real: !!mo.real, anio: mo.m === 12,
                q: '2026-Q4', prevQ: '2025-Q4', div: 3, mes: true, sinGrowth: true, ahora: id === (window.BRK_TODAY || '').slice(0, 7) };
            })
          : ((window.brkTierPlanQ('2027-12') || { cols: [] }).cols).map(c => ({ ...c,
              q: c.id, prevQ: (c.y - 1) + '-Q' + c.q, div: 1, achQ: c.id, ahora: c.id === '2026-Q4' }));
        const cell = (rows, c) => c.idx.reduce((a, i) => ({
          deals: a.deals + (rows[i] ? rows[i].deals : 0),
          cli: a.cli + (rows[i] ? rows[i].cli : 0) }), { deals: 0, cli: 0 });
        const nombre = (t) => {
          const sg = window.BRK_SEGS.find(x => x.id === t.id);
          return sg ? sg.label : t.label;
        };
        // Growth aquí es demanda del plan, no resultado: chip monocromo con la
        // intensidad como única señal, para no chocar con el verde/rojo del
        // interanual conseguido del bloque de histórico.
        const gChip = (v) => v == null ? <span className="k-none">·</span>
          : <span className={'t1-gw' + (v >= 1 ? ' hi' : v >= 0.3 ? ' md' : '')}>{v > 0 ? '↑' : '↓'}{bP(Math.abs(v))}</span>;
        const Tier = ({ t, sum }) => {
          const cells = cols.map(c => cell(t.rows, c));
          // Los porcentajes se derivan del target que se imprime, ya redondeado,
          // y el total suma los targets redondeados de cada tier: si redondeara
          // la suma, la fila de total no cuadraría con sus propias tarjetas.
          const tgt = cols.map((c, i) => sum
            ? tp.tiers.reduce((a, x) => a + Math.round(cell(x.rows, c).deals), 0)
            : Math.round(cells[i].deals));
          const totD = tgt.reduce((a, v) => a + v, 0);
          const totC = cells.reduce((a, x) => a + x.cli, 0);
          const foco = !sum && window.BRK_FOCO.indexOf(t.id) >= 0;
          const lin = window.brkLinea(sum ? '__tot' : t.id);
          // El total no puede multiplicar sus clientes por una media congelada:
          // cada tier aporta su propia línea, periodo a periodo.
          // Se multiplica por los clientes que la fila de arriba imprime, ya
          // redondeados: si no, la multiplicación que invita a hacer no cuadra.
          const eurCol = cols.map((c, i) => sum
            ? tp.tiers.reduce((a, x) => { const L = window.brkLinea(x.id); return L ? a + cell(x.rows, c).cli * L : a; }, 0)
            : (lin ? cells[i].cli * lin : 0));
          const eurTot = eurCol.reduce((a, v) => a + v, 0);
          const base = cols.map(c => {
            const b = histAt(t.id, c.prevQ);
            return b == null ? null : b / c.div;
          });
          const ach = cols.map(c => achDe(t.id, c));
          const totAch = ach.reduce((a, v) => v == null ? a : a + v, 0);
          return (
            <div className={'t1-t' + (foco ? ' foco' : '') + (sum ? ' sum' : '') + (!foco && !sum ? ' dim' : '')} style={{'--c': sum ? 'var(--kin)' : t.color}}>
              <div className="t1-h">
                <span className="t1-n"><b>{sum ? t.label : nombre(t)}</b><em>{sum ? 'suma de tiers · canales 2 y 4' : t.rango + ' · ' + (t.canal === 'embedded' ? 'canal 4 embedded' : t.canal === 'ambos' ? 'canales 2 y 4' : 'canal 2 broker')}</em></span>
                {foco && <span className="t1-f">foco</span>}
                <span className="t1-k mono">{bN(totD)} deals · {bN(totC)} clientes{lin ? ' · línea media ' + bE(lin) : ''}{eurTot ? ' · ' + bE(eurTot) + ' de línea' : ''}{trimestre ? '' : ' · ' + bN(totAch) + ' conseguidos'}</span>
              </div>
              <div className="bk-scroll">
                <table className="t1-tb g3">
                  <thead>
                    <tr className="t1-g">
                      <th className="t1-rl" rowSpan={2}/>
                      {cols.map(c => <th key={c.id} colSpan={c.sinGrowth ? 3 : 4} className={'grp ' + (c.real ? '' : 'k-fut ') + (c.anio ? 'k-yr ' : '') + (c.ahora ? 'k-now' : '')}>{c.label}</th>)}
                      <th className="k-tot" rowSpan={2}>Total</th>
                    </tr>
                    <tr className="t1-g2">
                      {cols.map(c => (
                        <React.Fragment key={c.id}>
                          <th className={'grp ' + (c.ahora ? 'k-now' : '')} title="Conseguido">Ach</th>
                          <th className={c.ahora ? 'k-now' : ''} title="Conseguido sobre el objetivo del periodo">% tgt</th>
                          <th className={'t1-th-tgt ' + ((c.anio && c.sinGrowth) ? 'k-yr ' : '') + (c.ahora ? 'k-now' : '')} title="Objetivo del plan">Tgt</th>
                          {!c.sinGrowth && <th className={(c.anio ? 'k-yr ' : '') + (c.ahora ? 'k-now' : '')} title={'Crecimiento que pide el target sobre el conseguido de ' + c.prevQ}>Growth</th>}
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className="t1-rl">Deals</th>
                      {cols.map((c, i) => (
                        <React.Fragment key={c.id}>
                          <td className={'t1-ach grp' + (c.ahora ? ' k-now' : '')}>{ach[i] == null ? <span className="k-none">·</span> : bN(ach[i])}</td>
                          <td className={'t1-pct' + (c.ahora ? ' k-now' : '')}>{ach[i] == null || !tgt[i] ? <span className="k-none">·</span>
                            : <span className={ach[i] / tgt[i] >= 1 ? 'ok' : ach[i] / tgt[i] >= 0.8 ? 'mid' : 'low'}>{bP(ach[i] / tgt[i])}</span>}</td>
                          <td className={'t1-tgt' + (c.real ? ' ' : ' k-fut') + ((c.anio && c.sinGrowth) ? ' k-yr' : '') + (c.ahora ? ' k-now' : '')}>{bN(tgt[i])}</td>
                          {!c.sinGrowth && <td className={(c.anio ? 'k-yr ' : '') + (c.ahora ? 'k-now' : '')}>{gChip(base[i] ? tgt[i] / base[i] - 1 : null)}</td>}
                        </React.Fragment>
                      ))}
                      <td className="k-tot mono">{bN(totD)}</td>
                    </tr>
                    <tr className="t1-cli">
                      <th className="t1-rl">Clientes</th>
                      {cols.map((c, i) => (
                        <React.Fragment key={c.id}>
                          <td className={'grp' + (c.ahora ? ' k-now' : '')}><span className="k-none">·</span></td>
                          <td className={c.ahora ? 'k-now' : ''}><span className="k-none">·</span></td>
                          <td className={'t1-tgt' + ((c.anio && c.sinGrowth) ? ' k-yr' : '') + (c.ahora ? ' k-now' : '')}>{bN(cells[i].cli)}</td>
                          {!c.sinGrowth && <td className={(c.anio ? 'k-yr ' : '') + (c.ahora ? 'k-now' : '')}><span className="k-none">·</span></td>}
                        </React.Fragment>
                      ))}
                      <td className="k-tot mono">{bN(totC)}</td>
                    </tr>
                    {eurTot > 0 && <><tr className="t1-lin">
                      <th className="t1-rl">Líneas<em>{sum ? 'línea de cada tier' : bE(lin) + ' de media'}</em></th>
                      {cols.map((c, i) => (
                        <React.Fragment key={c.id}>
                          <td className={'grp' + (c.ahora ? ' k-now' : '')}><span className="k-none">·</span></td>
                          <td className={c.ahora ? 'k-now' : ''}><span className="k-none">·</span></td>
                          <td className={'t1-tgt t1-eur' + ((c.anio && c.sinGrowth) ? ' k-yr' : '') + (c.ahora ? ' k-now' : '')}>{bE(eurCol[i])}</td>
                          {!c.sinGrowth && <td className={(c.anio ? 'k-yr ' : '') + (c.ahora ? 'k-now' : '')}><span className="k-none">·</span></td>}
                        </React.Fragment>
                      ))}
                      <td className="k-tot mono">{bE(eurTot)}</td>
                    </tr>
                    <tr className="t1-lin">
                      <th className="t1-rl">Loanbook<em>{bP(window.BRK_LOANBOOK)} de la línea</em></th>
                      {cols.map((c, i) => (
                        <React.Fragment key={c.id}>
                          <td className={'grp' + (c.ahora ? ' k-now' : '')}><span className="k-none">·</span></td>
                          <td className={c.ahora ? 'k-now' : ''}><span className="k-none">·</span></td>
                          <td className={'t1-tgt t1-eur' + ((c.anio && c.sinGrowth) ? ' k-yr' : '') + (c.ahora ? ' k-now' : '')}>{bE(eurCol[i] * window.BRK_LOANBOOK)}</td>
                          {!c.sinGrowth && <td className={(c.anio ? 'k-yr ' : '') + (c.ahora ? 'k-now' : '')}><span className="k-none">·</span></td>}
                        </React.Fragment>
                      ))}
                      <td className="k-tot mono">{bE(eurTot * window.BRK_LOANBOOK)}</td>
                    </tr></>}
                  </tbody>
                </table>
              </div>
            </div>
          );
        };
        const orden = tp.tiers.slice().sort((a, b) =>
          (window.BRK_FOCO.indexOf(b.id) >= 0) - (window.BRK_FOCO.indexOf(a.id) >= 0));
        return (
          <section className="bk-block bk-lvl1">
            <div className="bk-bh">
              <span className="bk-chip">Nivel 1 · Objetivo por tier</span>
              <span className="bk-bh-d">En la vista mensual, <b>Ach</b> contra <b>Tgt</b>: actuals contra budget, mes a mes. En la vista de trimestres se añade <b>Growth</b>, el crecimiento que el objetivo pide sobre el mismo trimestre del año anterior. <b>Big Pymes lleva {bN(window.BRK_BIG_Q4)} deals de objetivo en Q4.</b> Los clientes de Q4 están fijados a mano en los tiers de foco —{(() => { const F = window.BRK_CLI_FIJOS || {}; const ms = { '2026-10': 'octubre', '2026-11': 'noviembre', '2026-12': 'diciembre' }; const ks = Object.keys(F); return <b>{ks.map((k, i) => bN(F[k]) + ' en ' + (ms[k] || k) + (i === ks.length - 2 ? ' y ' : i < ks.length - 1 ? ', ' : '')).join('')}, {bN(ks.reduce((a, k) => a + F[k], 0))} por tier</b>; })()}—. La fila <b>Líneas</b> es el volumen que implican esos clientes a la línea media del tier: 1,5M€ en Mid Market y 400k€ en Big Pymes, y <b>Loanbook</b> el {bP(window.BRK_LOANBOOK)} de esa línea. Primero los dos tiers de foco; el tier micro queda fuera.</span>
              <div className="bk-fg">
                <button className={trimestre ? 'on' : ''} onClick={() => setTierVista('mes')}>Q4 2026 · 3 meses</button>
                <button className={!trimestre ? 'on' : ''} onClick={() => setTierVista('q')}>Hasta 2027 · trimestres</button>
              </div>
            </div>
            <div className="t1">
              {orden.map(t => <Tier key={t.id} t={t}/>)}
              <Tier t={{ id:'__tot', label:'Canal partner completo', rows: tp.totalRows }} sum/>
            </div>
            <div className="bk-bn">
              {trimestre
                ? <>Los tres meses de Q4 son el compromiso que se monitoriza arriba: actuals contra budget, sin crecimiento mensual. Ach va en absoluto y en porcentaje sobre el target del mes; el crecimiento vive en las tarjetas de consecución de arriba y en la vista de trimestres.{window.BRK_ACH_DEMO ? <> Los actuals de octubre y noviembre son <b>datos de ejemplo</b> para ver la mecánica con dato.</> : null}</>
                : <>La vista larga agrega por trimestres hasta dic-27. Ach sale del histórico de consecución, que llega a 2026-Q3, y el Growth compara el target con el mismo trimestre del año anterior: los trimestres de 2027 se miden contra 2026, y donde el año anterior no tiene conseguido la celda queda vacía.</>}
            </div>
          </section>
        );
      })()}

      {/* ===== PIPELINE VIVO ===== */}
      {(() => {
        const pp = window.pipeline && window.pipeline();
        if (!pp) return null;
        const maxE = Math.max(...pp.etapas.map(e => e.eur), 1);
        const maxM = Math.max(...pp.meses.map(m => m.eur), 1);
        return (
          <section className="bk-block bk-pipe">
            <div className="bk-bh">
              <span className="bk-chip">Pipeline vivo · forecast</span>
              <span className="bk-bh-d">Los {bN(pp.n)} deals abiertos hoy por fase del embudo y por segmento, con el importe de línea esperado, la fecha de cierre que lleva cada deal y la probabilidad de su etapa. El ponderado es importe × probabilidad: el forecast mensual sale de repartir ese ponderado por la fecha esperada de cierre.</span>
              <span className="bk-bh-k mono">{bE(pp.pond)} ponderado · {bE(pp.eur)} bruto</span>
            </div>

            <div className="pp-top">
              <div className="pp-c"><b className="mono">{bN(pp.n)}</b><span>deals abiertos</span><em>{bE(pp.eur)} de línea pedida</em></div>
              <div className="pp-c accent"><b className="mono">{bE(pp.pond)}</b><span>ponderado por probabilidad</span><em>{bP(pp.eur ? pp.pond / pp.eur : null)} del bruto</em></div>
              <div className="pp-c"><b className="mono">{bE(pp.q4.pond)}</b><span>con cierre esperado en Q4</span><em>{bN(pp.q4.n)} deals · {bN(pp.q4.cli)} clientes ponderados</em></div>
              <div className="pp-c warn"><b className="mono">{bN(pp.vencidos.n)}</b><span>con fecha anterior a Q4</span><em>{bP(pp.n ? pp.vencidos.n / pp.n : null)} del pipeline · {bE(pp.vencidos.pond)} sin recolocar</em></div>
            </div>

            <div className="bk-scroll">
              <table className="bk-table pp-t">
                <thead><tr>
                  <th>Fase</th><th className="num">Prob.</th><th className="num">Deals</th>
                  {pp.segs.map(s => <th key={s.id} className="num">{s.label}<em className="cap-th-e">deals · línea</em></th>)}
                  <th className="num">Línea bruta</th><th>Ponderado</th>
                </tr></thead>
                <tbody>
                  {pp.etapas.map(e => (
                    <tr key={e.st}>
                      <td className="bk-nom"><b>{e.label}</b><em className="bk-hs">{e.desc}</em></td>
                      <td className="num mono">{bP(e.p)}</td>
                      <td className="num mono">{bN(e.n)}</td>
                      {e.porSeg.map(s => (
                        <td key={s.id} className="num mono pp-seg">{s.n ? <><b>{bN(s.n)}</b><em>{bE(s.eur)}</em></> : <span className="bk-none">·</span>}</td>
                      ))}
                      <td className="num mono">{bE(e.eur)}</td>
                      <td className="cap-acum"><b className="mono cap-acum-v">{bE(e.pond)}</b><span className="cap-acum-b"><i style={{width: Math.max(0, Math.min(100, e.eur / maxE * 100)) + '%'}}/></span></td>
                    </tr>
                  ))}
                  <tr className="bk-row-tot">
                    <td>Pipeline abierto</td>
                    <td className="num mono"><span className="bk-none">—</span></td>
                    <td className="num mono">{bN(pp.n)}</td>
                    {pp.totalSeg.map(s => (
                      <td key={s.id} className="num mono pp-seg"><b>{bN(s.n)}</b><em>{bE(s.eur)}</em></td>
                    ))}
                    <td className="num mono">{bE(pp.eur)}</td>
                    <td className="cap-acum"><b className="mono cap-acum-v">{bE(pp.pond)}</b></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pp-fc">
              <div className="pp-fc-h"><b>Forecast por mes de cierre esperado</b><span>Ponderado del mes y clientes que salen de sumar las probabilidades; los tres meses de Q4 van marcados. Solo entran los {bN(pp.meses.reduce((a, m) => a + m.n, 0))} deals cuya fecha cae en estos meses; los {bN(pp.vencidos.n)} con fecha anterior a octubre se quedan fuera hasta que ventas los recoloque.</span></div>
              <div className="pp-fc-g">
                {pp.meses.map(m => (
                  <div key={m.id} className={'pp-m' + (m.q4 ? ' q4' : '')}>
                    <span className="pp-m-l">{m.label}</span>
                    <b className="mono">{bE(m.pond)}</b>
                    <i className="pp-m-b"><u style={{width: Math.max(0, Math.min(100, m.eur / maxM * 100)) + '%'}}/></i>
                    <em className="mono">{bN(m.n)} deals · {bN(m.cli)} clientes</em>
                    <div className="pp-m-s">
                      {m.porSeg.filter(s => s.pond > 0).map(s => (
                        <span key={s.id}>{(pp.segs.find(x => x.id === s.id) || {}).label}<u className="mono">{bE(s.pond)}</u></span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bk-bn">
              {pp.meta.fuente}. {pp.meta.aviso} El segmento sale del importe: a partir de {bE(1000000)} Mid Market, {bE(250000)} Big Pymes, {bE(60000)} Mid Pymes y por debajo Small. La probabilidad la fija dirección por fase: {bP(0.1)} en data gathering, {bP(0.2)} en risk, {bP(0.25)} en negociación y {bP(0.8)} en activación. Activación solo tiene deals cuando hay firmas pendientes de alta. {bN(pp.sinImporte)} de los {bN(pp.n)} deals abiertos no llevan importe en HubSpot: van a la columna <b>Sin importe</b> porque el segmento se deriva del importe, y no suman nada al ponderado.{pp.sinFecha ? ' ' + bN(pp.sinFecha) + ' tampoco llevan fecha esperada y quedan fuera del forecast mensual.' : ''}
            </div>
          </section>
        );
      })()}

      {/* ===== CÓMO SE LLEGA · CAPACIDAD DE LA RED ===== */}
      {(() => {
        const cap = window.brkCapacidad && window.brkCapacidad();
        if (!cap) return null;
        const w = (v) => Math.max(0, Math.min(100, (v || 0) * 100)) + '%';
        return (
          <section className="bk-block bk-cap">
            <div className="bk-bh">
              <span className="bk-chip">Cómo llegamos · capacidad de la red</span>
              <span className="bk-bh-d">El objetivo de Q4 contra lo que la red ya ha demostrado: el mejor trimestre de cada segmento y el mejor trimestre de cada partner en cada tier. Entran los <b>Best y Good</b> y los referral que ya han traído algún deal de Mid Market o Big Pymes: {cap.enRed} partners, todos listados. A todo partner listado sin histórico en un tier se le pide <b>1 deal</b>; al que lo tiene, su mejor trimestre +{bP(cap.crece)}. Sin desglose mensual: aquí la pregunta es si los partners de hoy dan el número o hay que firmar más.</span>
              <span className="bk-bh-k mono">{bN(cap.totalPedido)} de {bN(cap.objFoco)} a la red firmada · {bP(cap.cobPedido)}</span>
            </div>

            <div className="cap-top">
              {cap.segs.map(s => (
                <div key={s.id} className="cap-c" style={{'--c': s.color}}>
                  <div className="cap-c-t"><b>{s.label}</b><span className="t1-f">foco</span></div>
                  <div className="cap-c-n mono">{bN(s.obj)}<span> deals de objetivo en Q4</span></div>
                  <div className="cap-r">
                    <div className="cap-r-l"><span>mejor trimestre histórico</span><b className="mono">{bN(s.mejor)}</b></div>
                    <div className="cap-bar"><i style={{width: w(s.obj ? s.mejor / s.obj : null)}}/></div>
                    <em>{s.mejorQ ? 'Fue en ' + s.mejorQ.replace('-', ' ') + '. ' : ''}{s.gapMejor ? bN(s.gapMejor) + (s.gapMejor === 1 ? ' deal' : ' deals') + ' por encima de lo mejor que se ha hecho nunca en el segmento.' : 'El objetivo cabe dentro de lo ya conseguido.'}</em>
                  </div>
                  <div className="cap-r">
                    <div className="cap-r-l"><span>objetivo asignado · máx +{bP(cap.crece)}</span><b className="mono">{bN(s.asignado)}</b></div>
                    <div className="cap-bar"><i style={{width: w(s.obj ? s.asignado / s.obj : null)}}/></div>
                    <em>Su mejor trimestre más un {bP(cap.crece)}, y 1 deal a los listados que nunca han traído nada en este tier. {s.faltaAsignado ? (s.faltaAsignado === 1 ? 'Queda 1 deal sin asignar.' : 'Quedan ' + bN(s.faltaAsignado) + ' deals sin asignar.') : 'Cubre el objetivo del tier.'}</em>
                  </div>
                  <div className="cap-r">
                    <div className="cap-r-l"><span>con altas objetivo</span><b className="mono">{bN(s.conAltas)}</b></div>
                    <div className="cap-bar"><i style={{width: w(s.obj ? s.conAltas / s.obj : null)}}/></div>
                    <em>{bN(s.altasObj)} más de los partners por firmar. {s.faltaConAltas ? 'Aun así faltaría' + (s.faltaConAltas === 1 ? ' 1 deal.' : 'n ' + bN(s.faltaConAltas) + ' deals.') : 'Con ellos el tier queda cubierto' + (s.conAltas > s.obj ? ' con ' + bN(s.conAltas - s.obj) + ' de colchón.' : '.')}</em>
                  </div>
                  <div className="cap-r">
                    <div className="cap-r-l"><span>techo por mejores trimestres</span><b className="mono">{bN(s.topeMax)}</b></div>
                    <div className="cap-bar red"><i style={{width: w(s.obj ? s.topeMax / s.obj : null)}}/></div>
                    <em>Referencia sin el +{bP(cap.crece)}: cada partner repitiendo su mejor trimestre a la vez. {s.activos} partners, {b1(s.media)} deals de media y {b1(s.mediaTop)} los cinco mejores. {s.falta ? 'Contra ese techo faltaría' + (s.falta === 1 ? ' 1 deal.' : 'n ' + bN(s.falta) + ' deals.') : 'Ese techo ya cubre el objetivo.'} En la hoja Q2-26 firmó {bN(s.tope)}.</em>
                  </div>
                </div>
              ))}
              <div className="cap-c gap">
                <div className="cap-c-t"><b>Lo que falta</b></div>
                <div className="cap-c-n mono">{bN(cap.faltaPedido)}<span>{cap.faltaPedido === 1 ? ' deal' : ' deals'} sin asignar en la red firmada</span></div>
                <div className="cap-r">
                  <div className="cap-r-l"><span>pedido a la red firmada</span><b className="mono">{bN(cap.totalPedido)} de {bN(cap.objFoco)}</b></div>
                  <div className="cap-bar"><i style={{width: w(cap.cobPedido)}}/></div>
                  <em>{bN(cap.asignado)} de los {cap.enRed} partners listados y {bN(cap.referral.total)} de los {cap.referral.n} referral sin histórico de foco, uno cada uno; los referral no van asignados a tier, así que no tapan el hueco de un tier concreto. Las altas por firmar no cuentan aquí: van en el bloque de abajo. El déficit se mide tier a tier y sin netear: {cap.segs.filter(x => x.faltaAsignado).map(x => bN(x.faltaAsignado) + ' sin asignar en ' + x.label).join(' y ') || 'ningún tier por debajo'}{cap.segs.some(x => x.asignado > x.obj) ? ', y lo que sobra en ' + cap.segs.filter(x => x.asignado > x.obj).map(x => x.label).join(' y ') + ' no sirve para el otro tier: son partners distintos' : ''}.</em>
                </div>
                <div className="cap-alta">
                  <div><b className="mono">+{bN(cap.altasTop)}</b><span className="cap-alta-l">altas del nivel de los cinco mejores del tier que falla</span></div>
                  <div><b className="mono">+{bN(cap.altasMedia)}</b><span className="cap-alta-l">altas al nivel medio de ese tier</span></div>
                </div>
                <em className="cap-note">{cap.segs.filter(x => x.faltaAsignado).map(x => x.label + ' se queda a ' + bN(x.faltaAsignado)).join(' · ') || 'Los objetivos asignados cubren los dos tiers.'} El foco de altas del bloque de abajo pone {bN(cap.altasTotal)} deals más y lo cubre de sobra; el riesgo pasa a ser firmarlas a tiempo.</em>
              </div>
            </div>

            <div className="cap-wrap">
              <table className="bk-table cap-t">
                <thead><tr>
                  <th>Partner</th><th>Tipo</th>
                  {cap.segs.map(s => <th key={s.id} className="num" colSpan={3}>{s.label}<em className="cap-th-e">mejor trim. · objetivo · conseguido</em></th>)}
                  <th className="num">AEs<em className="cap-th-e">en el partner</em></th><th className="num">Deals/AE<em className="cap-th-e">2026</em></th><th>Consecución Q4<em className="cap-th-e">conseguido sobre objetivo</em></th>
                </tr></thead>
                <tbody>
                  {cap.partners.map(p => { const aes = (window.BRK_AE || {})[p.nombre]; const ab = abierto === p.nombre; return <React.Fragment key={p.nombre}>
                    <tr className={(p.tope ? '' : 'cap-off ') + (p.achPct != null && p.achPct >= 1 ? 'cap-in ' : '') + (aes ? 'cap-cl ' : '') + (ab ? 'cap-op' : '')} onClick={aes ? () => setAbierto(ab ? null : p.nombre) : undefined}>
                      <td className="bk-nom"><b>{aes ? <i className="cap-caret">{ab ? '▾' : '▸'}</i> : null}{p.nombre}</b>{p.obj != null && <em className="bk-hs">{bN(p.obj)} de compromiso en la hoja</em>}{aes && !ab ? <em className="bk-hs">{aes.length} AE con deals</em> : null}</td>
                      <td><span className="bk-tchip" style={{'--c': p.color}}>{p.tipo === 'Referral/Small' ? 'Referral' : p.tipo}</span></td>
                      {cap.segs.map(s => (
                        <React.Fragment key={s.id}>
                          <td className="num mono cap-max grp">{p.maxq[s.id] && p.maxq[s.id].max
                            ? <><b>{bN(p.maxq[s.id].max)}</b><em>{p.maxq[s.id].q.replace('-', ' ')}</em></>
                            : <span className="bk-none">—</span>}</td>
                          <td className="num mono cap-obj">{p.objq[s.id] || <span className="bk-none">—</span>}</td>
                          <td className={'num mono cap-ach' + (p.objq[s.id] && p.achq[s.id] >= p.objq[s.id] ? ' ok' : '')}>{p.objq[s.id] ? <><b>{bN(p.achq[s.id] || 0)}</b><i className="cap-mb"><u className={p.achq[s.id] >= p.objq[s.id] ? 'ok' : (p.achq[s.id] / p.objq[s.id] < 0.6 ? 'low' : '')} style={{width: w(p.achq[s.id] / p.objq[s.id])}}/></i></> : <span className="bk-none">—</span>}</td>
                        </React.Fragment>
                      ))}
                      <td className="num mono cap-ae-c">{aes ? <b>{bN((window.BRK_AE_N || {})[p.nombre] || aes.length)}</b> : <span className="bk-none">—</span>}</td>
                      <td className="num mono cap-ae-c">{aes ? b1(aes.reduce((x, a) => x + a.q1 + a.q2 + a.q3, 0) / ((window.BRK_AE_N || {})[p.nombre] || aes.length)) : <span className="bk-none">—</span>}</td>
                      <td className="cap-acum">
                        {p.objTot ? <>
                          <b className="mono cap-acum-v">{bN(p.achTot)}</b>
                          <span className="cap-acum-b"><i className={p.achPct < 0.6 ? 'low' : (p.achPct >= 1 ? 'ok' : '')} style={{width: w(p.achPct)}}/></span>
                          <em className="mono">{bP(p.achPct)}</em>
                        </> : <span className="bk-none">sin obj.</span>}
                      </td>
                    </tr>
                    {ab && aes ? <tr className="cap-ae-row"><td colSpan={2 + cap.segs.length * 3 + 3}>
                      <div className="cap-ae">
                        <div className="cap-ae-h"><b>{p.nombre} · AEs que han traído deals</b><span>2025 cerrado y 2026 por trimestre, del export de HubSpot. MM y BP son los deals de 2026 que cayeron en los tiers de foco.</span></div>
                        <table className="cap-ae-t">
                          <thead><tr><th>AE</th><th className="num">2025</th><th className="num">Q1 26</th><th className="num">Q2 26</th><th className="num">Q3 26</th><th className="num">Total 26</th><th className="num">MM</th><th className="num">BP</th></tr></thead>
                          <tbody>
                            {aes.map(a => (
                              <tr key={a.ae}>
                                <td>{a.ae}</td>
                                <td className="num mono">{a.t25 || <span className="bk-none">·</span>}</td>
                                <td className="num mono">{a.q1 || <span className="bk-none">·</span>}</td>
                                <td className="num mono">{a.q2 || <span className="bk-none">·</span>}</td>
                                <td className="num mono">{a.q3 || <span className="bk-none">·</span>}</td>
                                <td className="num mono"><b>{bN(a.q1 + a.q2 + a.q3)}</b></td>
                                <td className="num mono cap-ae-f">{a.mm || <span className="bk-none">·</span>}</td>
                                <td className="num mono cap-ae-f">{a.bp || <span className="bk-none">·</span>}</td>
                              </tr>
                            ))}
                            <tr className="cap-ae-tot">
                              <td>Total {p.nombre}</td>
                              {['t25','q1','q2','q3'].map(k => <td key={k} className="num mono">{bN(aes.reduce((x, a) => x + a[k], 0))}</td>)}
                              <td className="num mono"><b>{bN(aes.reduce((x, a) => x + a.q1 + a.q2 + a.q3, 0))}</b></td>
                              <td className="num mono cap-ae-f">{bN(aes.reduce((x, a) => x + a.mm, 0))}</td>
                              <td className="num mono cap-ae-f">{bN(aes.reduce((x, a) => x + a.bp, 0))}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td></tr> : null}
                  </React.Fragment>; })}
                  <tr className="bk-row-tot cap-sub">
                    <td>Listados<em className="cap-tot-e">Best, Good y referral con histórico</em></td>
                    <td/>
                    {cap.segs.map(s => (
                      <React.Fragment key={s.id}>
                        <td className="num mono">{bN(s.topeMax)}</td>
                        <td className="num mono cap-obj">{bN(s.asignado)}</td>
                        <td className="num mono cap-ach">{bN(s.ach)}</td>
                      </React.Fragment>
                    ))}
                    <td className="num mono cap-ae-c">{(() => { const A = window.BRK_AE || {}; const ls = cap.partners.filter(p => A[p.nombre]); return bN(ls.reduce((x, p) => x + ((window.BRK_AE_N || {})[p.nombre] || A[p.nombre].length), 0)); })()}</td>
                    <td className="num mono cap-ae-c">{(() => { const A = window.BRK_AE || {}; const ls = cap.partners.filter(p => A[p.nombre]); const n = ls.reduce((x, p) => x + ((window.BRK_AE_N || {})[p.nombre] || A[p.nombre].length), 0); const d = ls.reduce((x, p) => x + A[p.nombre].reduce((y, a) => y + a.q1 + a.q2 + a.q3, 0), 0); return n ? b1(d / n) : '—'; })()}</td>
                    <td className="cap-acum"><b className="mono cap-acum-v">{bN(cap.achTotal)}</b><em className="mono">{bP(cap.achPct)}</em></td>
                  </tr>
                  <tr className="cap-ref">
                    <td className="bk-nom"><b>Resto · referral sin histórico de foco</b><em className="bk-hs">{cap.referral.n} partners × {cap.referral.porPartner} deal cada uno · los {cap.referral.conFoco} con histórico van listados arriba</em></td>
                    <td><span className="bk-tchip" style={{'--c': '#767D8C'}}>Referral</span></td>
                    {cap.segs.map(s => (
                      <React.Fragment key={s.id}>
                        <td className="num mono"><span className="bk-none">—</span></td>
                        <td className="num mono"><span className="bk-none">—</span></td>
                        <td className="num mono"><span className="bk-none">—</span></td>
                      </React.Fragment>
                    ))}
                    <td className="num mono cap-ae-c"><span className="bk-none">—</span></td>
                    <td className="num mono cap-ae-c"><span className="bk-none">—</span></td>
                    <td className="cap-acum"><em className="mono">—</em></td>
                  </tr>
                  <tr className="bk-row-tot">
                    <td>Pedido a la red firmada<em className="cap-tot-e">listados con tier, resto referral sin tier · las altas van en el bloque de abajo</em></td>
                    <td/>
                    {cap.segs.map(s => (
                      <React.Fragment key={s.id}>
                        <td className="num mono"><span className="bk-none">—</span></td>
                        <td className="num mono cap-obj">{bN(s.asignado)}</td>
                        <td className="num mono cap-ach">{bN(s.ach)}</td>
                      </React.Fragment>
                    ))}
                    <td className="num mono cap-ae-c">{(() => { const A = window.BRK_AE || {}; const ls = cap.partners.filter(p => A[p.nombre]); return bN(ls.reduce((x, p) => x + ((window.BRK_AE_N || {})[p.nombre] || A[p.nombre].length), 0)); })()}</td>
                    <td className="num mono cap-ae-c">{(() => { const A = window.BRK_AE || {}; const ls = cap.partners.filter(p => A[p.nombre]); const n = ls.reduce((x, p) => x + ((window.BRK_AE_N || {})[p.nombre] || A[p.nombre].length), 0); const d = ls.reduce((x, p) => x + A[p.nombre].reduce((y, a) => y + a.q1 + a.q2 + a.q3, 0), 0); return n ? b1(d / n) : '—'; })()}</td>
                    <td className="cap-acum"><b className="mono cap-acum-v">{bN(cap.achTotal)}</b><em className="mono">{bP(cap.achPct)}</em></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bk-bn">
              {cap.fuente} El objetivo de cada partner es ese máximo más un <b>{bP(cap.crece)}</b>, redondeado, así que le pide crecer sobre su propio récord. El foco de altas son partners por firmar: las cuatro grandes auditoras a 5 deals de Mid Market cada una, Marsh a 5 y 5 y Ebury a 10 y 10, {bN(cap.altasTotal)} deals que hoy no dependen de nadie porque el contrato no existe todavía. Sumando los {cap.referral.n} referral sin histórico de foco a un deal cada uno se piden <b>{bN(cap.totalPedido)} deals</b> contra los {bN(cap.objFoco)} del objetivo, pero el referral no lleva tier y el hueco no se compensa entre tiers: {cap.segs.filter(x => x.faltaAsignado).map(x => bN(x.faltaAsignado) + ' deals en ' + x.label).join(' y ')} exigen <b>{bN(cap.altasTop)} partners nuevos</b> del nivel de los cinco mejores de ese tier —o {bN(cap.altasMedia)} del nivel medio— firmados antes de que arranque el trimestre.
            </div>
          </section>
        );
      })()}

      {/* ===== FOCO DE ALTAS ===== */}
      {(() => {
        const cap = window.brkCapacidad && window.brkCapacidad();
        if (!cap || !cap.altas.length) return null;
        const w = (v) => Math.max(0, Math.min(100, (v || 0) * 100)) + '%';
        const grupos = [];
        cap.altas.forEach(a => {
          let g = grupos.find(x => x.grupo === a.grupo);
          if (!g) { g = { grupo: a.grupo, items: [], total: 0 }; grupos.push(g); }
          g.items.push(a); g.total += a.total;
        });
        return (
          <section className="bk-block bk-nuevos">
            <div className="bk-bh">
              <span className="bk-chip">Foco de altas · partners por firmar</span>
              <span className="bk-bh-d">Las seis altas que se persiguen para Q4 y el objetivo que se les pide desde el primer trimestre. Ninguna está firmada: es el pipeline de alta, no capacidad disponible.</span>
              <span className="bk-bh-k mono">{bN(cap.altasTotal)} deals · {cap.segs.map(s => bN(s.altasObj) + ' ' + s.label).join(' · ')}</span>
            </div>
            <div className="nv-g">
              <div className="nv-gr-h">
                {grupos.map(g => <span key={g.grupo} className="nv-chip"><b>{g.grupo}</b><em className="mono">{bN(g.total)}</em></span>)}
              </div>
              <div className="nv-cards">
                {cap.altas.map(a => (
                  <div key={a.nombre} className="nv-c">
                    <div className="nv-c-t"><b>{a.nombre}</b><span className="nv-c-s">sin firmar</span></div>
                    <div className="nv-c-g">{a.grupo}</div>
                    <div className="nv-c-n mono">{bN(a.total)}<span> deals/trimestre</span></div>
                    <div className="nv-c-r">
                      {cap.segs.map(s => (
                        <div key={s.id} className={'nv-c-seg' + (a.obj[s.id] ? '' : ' off')} style={{'--c': s.color}}>
                          <span>{s.label}</span>
                          <b className="mono">{a.obj[s.id] ? bN(a.obj[s.id]) : '—'}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="nv-sum">
              {cap.segs.map(s => (
                <div key={s.id} className="nv-s" style={{'--c': s.color}}>
                  <div className="nv-s-t"><b>{s.label}</b><span className="mono">{bN(s.conAltas)} de {bN(s.obj)}</span></div>
                  {(() => {
                    // El eje es el mayor entre lo pedido y el objetivo: si no,
                    // los tramos suman más del 100% y el flex los encoge, y la
                    // barra deja de decir lo que dicen los números de arriba.
                    const eje = Math.max(s.conAltas, s.obj) || 1;
                    return (
                      <div className="nv-s-bar">
                        <i style={{width: (s.asignado / eje * 100) + '%'}}/>
                        <s style={{width: (s.altasObj / eje * 100) + '%'}}/>
                        <u style={{left: (s.obj / eje * 100) + '%'}} title={'Objetivo ' + bN(s.obj)}/>
                      </div>
                    );
                  })()}
                  <em>{bN(s.asignado)} de la red firmada más <b>{bN(s.altasObj)}</b> de las altas. {s.faltaConAltas ? 'Aun así faltaría' + (s.faltaConAltas === 1 ? ' 1 deal.' : 'n ' + bN(s.faltaConAltas) + ' deals.') : 'Cubre el objetivo con ' + bN(s.conAltas - s.obj) + ' de colchón.'}</em>
                </div>
              ))}
              <div className="nv-s tot">
                <div className="nv-s-t"><b>Pedido total con altas</b><span className="mono">{bN(cap.totalConAltas)} de {bN(cap.objFoco)}</span></div>
                {(() => {
                  const eje = Math.max(cap.totalConAltas, cap.objFoco) || 1;
                  return (
                    <div className="nv-s-bar">
                      <i style={{width: (cap.totalPedido / eje * 100) + '%'}}/>
                      <s style={{width: (cap.altasTotal / eje * 100) + '%'}}/>
                      <u style={{left: (cap.objFoco / eje * 100) + '%'}} title={'Objetivo ' + bN(cap.objFoco)}/>
                    </div>
                  );
                })()}
                <em>{bN(cap.totalPedido)} de la red firmada —{bN(cap.asignado)} de los listados y {bN(cap.referral.total)} de los referral— más {bN(cap.altasTotal)} de las altas: {bN(cap.totalConAltas)}, el {bP(cap.objFoco ? cap.totalConAltas / cap.objFoco : null)} del objetivo de foco.</em>
              </div>
            </div>
            <div className="bk-bn">
              Big Four a 5 deals de Mid Market cada una, Marsh a 5 y 5 y Ebury a 10 y 10. Son {bN(cap.altasTotal)} deals que hoy no dependen de ningún partner porque el contrato no existe: el riesgo de Q4 se traslada a firmar estas altas antes de que arranque el trimestre. Sin ellas la red firmada se queda a {bN(cap.faltaPedido)} {cap.faltaPedido === 1 ? 'deal' : 'deals'} del objetivo.
            </div>
          </section>
        );
      })()}

      {/* ===== EMBUDO DEL DEAL ===== */}
      <div className="bk-lvl-h">Embudo del deal de broker</div>
      <window.FunnelBlock canal="Partners" fases={window.FN_AE}
        titulo="Discovery → Won · canal partner" tone="#C8A24C"
        nota="El recorrido del deal que trae un broker, desde el discovery hasta la firma. Comparar con el embudo de outbound dice dónde el partner ahorra trabajo."/>

      <window.BkCohorts/>

      {/* ===== ANÁLISIS DE CONVERSIONES ===== */}
      <div className="bk-lvl-h">Análisis de conversiones</div>
      {(() => {
        const cv = window.brkConversiones(plan.months[0].id);
        return (
          <div className="cv">
            <div className="cv-top">
              <div className="cv-card"><b className="mono">{bP(cv.canal ? cv.canal.wr : null, 1)}</b><span>canal partner en HubSpot</span><em>{bN(cv.canal && cv.canal.won)} ganados de {bN(cv.canal && cv.canal.deals)} deals, histórico completo</em></div>
              <div className="cv-card accent"><b className="mono">{bP(cv.cruzado.wr, 1)}</b><span>lo que cruza con la hoja</span><em>{bN(cv.cruzado.won)} de {bN(cv.cruzado.deals)} en el periodo de la tabla</em></div>
              <div className={"cv-card " + (cv.plan && cv.plan.wr > cv.cruzado.wr ? "bad" : "")}><b className="mono">{bP(cv.plan ? cv.plan.wr : null, 1)}</b><span>la que exige el plan</span><em>{bN(cv.plan && cv.plan.cli)} clientes de {bN(cv.plan && cv.plan.deals)} deals comprometidos</em></div>
            </div>
            <table className="bk-table">
              <thead><tr>
                <th>Tipo de partner</th><th className="num">Deals</th><th className="num">Ganados</th>
                <th className="num">Conversión</th><th className="num">Deals por cliente</th><th>Contra el plan</th>
              </tr></thead>
              <tbody>
                {cv.tipos.map(t => {
                  const dif = cv.plan && cv.plan.wr && t.wr != null ? t.wr / cv.plan.wr : null;
                  return (
                    <tr key={t.id}>
                      <td className="bk-tipo"><span className="bk-dot" style={{background: t.color}}/><b>{t.label}</b></td>
                      <td className="num mono">{bN(t.deals)}</td>
                      <td className="num mono">{bN(t.won)}</td>
                      <td className="num mono"><span className="k-ach" style={{"--c": t.wr >= 0.25 ? "#1F5C42" : t.wr >= 0.12 ? "#B8731F" : "#B23A3A"}}>{bP(t.wr, 1)}</span></td>
                      <td className="num mono">{t.dealsPorCliente ? b1(t.dealsPorCliente) : <span className="bk-none">—</span>}</td>
                      <td className="cv-gap">{dif == null ? <span className="bk-none">—</span>
                        : <span className="cv-bar"><i style={{width: Math.min(100, dif * 50) + "%", background: dif >= 1 ? "var(--good)" : "var(--warn)"}}/><em>{dif >= 1 ? "×" + b1(dif) + " por encima" : "×" + b1(1/dif) + " por debajo"}</em></span>}</td>
                    </tr>
                  );
                })}
                <tr className="bk-row-tot">
                  <td>Total cruzado</td>
                  <td className="num mono">{bN(cv.cruzado.deals)}</td>
                  <td className="num mono">{bN(cv.cruzado.won)}</td>
                  <td className="num mono">{bP(cv.cruzado.wr, 1)}</td>
                  <td className="num mono">{b1(cv.cruzado.won ? cv.cruzado.deals / cv.cruzado.won : null)}</td>
                  <td/>
                </tr>
              </tbody>
            </table>
            <table className="bk-table cv-segs">
              <thead><tr><th>Segmento</th><th className="num">Deals</th><th className="num">Clientes imputados</th><th className="num">Conversión</th><th className="num">Peso del canal</th></tr></thead>
              <tbody>
                {cv.segs.map(s => (
                  <tr key={s.id}>
                    <td className="bk-tipo"><span className="bk-dot" style={{background: s.color}}/><b>{s.label}</b></td>
                    <td className="num mono">{bN(s.deals)}</td>
                    <td className="num mono">{bN(s.won)}</td>
                    <td className="num mono">{bP(s.wr, 1)}</td>
                    <td className="num mono">{bP(s.deals / cv.cruzado.deals)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cv-note">
              La conversión por partner vive en el bloque de cohortes, con los mismos deals y ganados de HubSpot. La conversión por tipo es medida: deals ganados sobre deals cruzados en el periodo de la tabla. La de segmento está <b>imputada</b>, porque la serie no desglosa el ganado por segmento: se reparte con la tasa del tipo que lo trajo, así que sirve para comparar pesos, no para fijar objetivos.
              {cv.plan && cv.plan.wr > cv.cruzado.wr && <> Y el contraste que importa: el plan exige un {bP(cv.plan.wr, 1)} de deal a cliente y el canal mide {bP(cv.cruzado.wr, 1)} — <b>{b1(cv.plan.wr / cv.cruzado.wr)}× por encima</b> de lo que hoy hace.</>}
            </div>
          </div>
        );
      })()}

      {/* ===== CONSECUCIÓN HISTÓRICA ===== */}
      {(() => {
        const h = window.brkHistorico && window.brkHistorico();
        if (!h) return null;
        const n = histVista === '8' ? 8 : h.quarters.length;
        const from = h.quarters.length - n;
        const cols = h.quarters.slice(from).map((q, i) => ({ id:q, label:'Q' + q.slice(-1) + ' ' + q.slice(2, 4), i: from + i, anio: q.slice(-1) === '4' }));
        const yoyChip = (v) => v == null ? <span className="k-none">—</span>
          : <span className="hq-yoy" style={{'--y': v >= 0.15 ? 'var(--good)' : v >= -0.05 ? 'var(--warn)' : 'var(--bad)'}}>{v > 0 ? '+' : ''}{bP(v)}</span>;
        const Card = ({ r, sum }) => (
          <div className={'t1-t hq' + (r.foco ? ' foco' : '') + (sum ? ' sum' : '') + (!r.foco && !sum ? ' dim' : '')} style={{'--c': sum ? 'var(--kin)' : r.color}}>
            <div className="t1-h">
              <span className="t1-n"><b>{r.label}</b><em>{r.notaMerge ? r.notaMerge + ' · ' : ''}{bN(r.ult)} en {h.ultimo} contra {bN(r.prev)} un año antes</em></span>
              {r.foco && <span className="t1-f">foco</span>}
              <span className="t1-k mono">{yoyChip(r.yoyUlt)} interanual · {r.yoyAcum != null ? (r.yoyAcum > 0 ? '+' : '') + bP(r.yoyAcum) : '—'} acumulado 2026</span>
            </div>
            <table className="t1-tb hq-tb">
              <thead><tr>
                <th className="t1-rl"/>
                {cols.map(c => <th key={c.id} className={c.anio ? 'k-yr' : ''}>{c.label}</th>)}
                <th className="k-tot">{h.q4}</th>
              </tr></thead>
              <tbody>
                <tr>
                  <th className="t1-rl">Conseguido</th>
                  {cols.map(c => <td key={c.id} className={(c.anio ? 'k-yr ' : '') + (c.i === h.quarters.length - 1 ? 'k-now' : '')}>{bN(r.serie[c.i])}</td>)}
                  <td className="k-tot mono">{r.obj ? bN(r.obj) + ' obj.' : <span className="k-none">sin obj.</span>}</td>
                </tr>
                <tr className="t1-cli">
                  <th className="t1-rl">vs año anterior</th>
                  {cols.map(c => <td key={c.id} className={(c.anio ? 'k-yr ' : '') + (c.i === h.quarters.length - 1 ? 'k-now' : '')}>{r.yoy[c.i] == null ? <span className="k-none">·</span> : (r.yoy[c.i] > 0 ? '+' : '') + bP(r.yoy[c.i])}</td>)}
                  <td className="k-tot mono">{r.salto ? '×' + b1(r.salto) : <span className="k-none">·</span>}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
        const orden = h.rows.slice().sort((a, b) => b.foco - a.foco);
        return (
          <section className="bk-block bk-lvl1">
            <div className="bk-bh">
              <span className="bk-chip">Consecución histórica</span>
              <span className="bk-bh-d">Cerrado por trimestre y segmento, con el crecimiento contra el mismo trimestre del año anterior. La última columna es lo que {h.q4} exige y el salto que pide sobre {h.ultimo}.</span>
              <div className="bk-fg">
                <button className={histVista === '8' ? 'on' : ''} onClick={() => setHistVista('8')}>Últimos 8 trimestres</button>
                <button className={histVista === 'all' ? 'on' : ''} onClick={() => setHistVista('all')}>Todo el histórico</button>
              </div>
            </div>
            <div className="hq-top">
              {h.rows.filter(r => r.foco).map(r => (
                <div key={r.id} className="hq-c" style={{'--c': r.color}}>
                  <div className="hq-c-t"><b>{r.label}</b><span className="t1-f">foco</span></div>
                  <div className="hq-c-n mono">{bN(r.ult)}<span> en {h.ultimo}</span></div>
                  <div className="hq-c-r"><span>vs {h.ultimo.slice(0,4) - 1 + h.ultimo.slice(4)}</span>{yoyChip(r.yoyUlt)}</div>
                  <div className="hq-c-r"><span>acumulado 2026 vs 2025</span>{yoyChip(r.yoyAcum)}</div>
                  <div className="hq-c-r"><span>salto que pide {h.q4}</span><b className="mono">{r.salto ? '×' + b1(r.salto) : '—'}</b></div>
                  <em>{bN(r.obj)} deals de objetivo contra los {bN(r.ult)} del último trimestre cerrado. Mejor trimestre histórico: {bN(r.mejor)}.</em>
                </div>
              ))}
              <div className="hq-c tot" style={{'--c': 'var(--kin)'}}>
                <div className="hq-c-t"><b>{h.foco.label}</b></div>
                <div className="hq-c-n mono">{bN(h.foco.ult)}<span> en {h.ultimo}</span></div>
                <div className="hq-c-r"><span>vs un año antes</span>{yoyChip(h.foco.yoyUlt)}</div>
                <div className="hq-c-r"><span>acumulado 2026 vs 2025</span>{yoyChip(h.foco.yoyAcum)}</div>
                <div className="hq-c-r"><span>salto que pide {h.q4}</span><b className="mono">{h.foco.salto ? '×' + b1(h.foco.salto) : '—'}</b></div>
                <em>Total general del canal en {h.ultimo}: {bN(h.total.ult)} operaciones, {h.total.yoyUlt != null ? (h.total.yoyUlt > 0 ? '+' : '') + bP(h.total.yoyUlt) : '—'} interanual.</em>
              </div>
            </div>
            <div className="t1">
              {orden.map(r => <Card key={r.id} r={r}/>)}
              <Card r={{...h.total, foco:false, obj:null, salto:null}} sum/>
            </div>
            <div className="bk-bn">
              {h.nota} El total general incluye las operaciones sin segmento asignado, que son casi todo lo de 2022 a 2024 y hoy ya no aparecen. {h.foco.salto ? <>El salto que pide {h.q4} en los dos tiers de foco es <b>×{b1(h.foco.salto)}</b> sobre {h.ultimo}: de {bN(h.foco.ult)} a {bN(h.foco.obj)} deals en un trimestre.</> : null}
            </div>
          </section>
        );
      })()}

      {/* ===== NIVEL 2 · TIPO DE PARTNER ===== */}
      <div className="bk-lvl-h">Nivel 2 · Tipo de partner</div>
      {(() => {
        // Mismos meses que los bloques mensuales: si aquí se contara todo el
        // histórico, el nivel 2 y el bloque de abajo dirían cifras distintas.
        const ts = window.brkTipoSeg(true, plan.months[0].id);
        const tipos = plan.blocks;
        return (
          <div className="bk-lvl2">
            <table className="bk-table">
              <thead><tr>
                <th>Tipo</th><th className="num">Partners en la hoja</th><th className="num">Activos hoy</th>
                <th className="num">Necesarios a {hasta === '2026-12' ? 'dic-26' : 'dic-27'}</th><th className="num">Altas</th>
                <th className="num">Deals por partner</th>
                {segs.map(s => <th key={s.id} className="num">{s.label}</th>)}
                <th className="num">Deals reales</th>
              </tr></thead>
              <tbody>
                {tipos.map(b => {
                  const seg = ts[b.tipo] || {};
                  return (
                    <tr key={b.tipo}>
                      <td className="bk-tipo"><span className="bk-dot" style={{background: b.color}}/><b>{b.label}</b></td>
                      <td className="num mono">{b.partners || <span className="bk-none">—</span>}</td>
                      <td className="num mono">{b.activosHoy}</td>
                      <td className="num mono">{b.necesariosFin != null ? bN(Math.ceil(b.necesariosFin)) : <span className="bk-none">—</span>}</td>
                      <td className="num mono">{b.altasFin ? <b className="bk-altas">+{bN(Math.ceil(b.altasFin))}</b> : <span className="bk-none">—</span>}</td>
                      <td className="num mono">{b.prod ? b1(b.prod) : <span className="bk-none">—</span>}</td>
                      {segs.map(s => <td key={s.id} className="num mono">{seg[s.id] || <span className="bk-none">—</span>}</td>)}
                      <td className="num mono"><b>{bN(seg.total)}</b></td>
                    </tr>
                  );
                })}
                <tr className="bk-row-tot">
                  <td>Total</td>
                  <td className="num mono">{all.length}</td>
                  <td className="num mono">{plan.activosHoy}</td>
                  <td className="num mono">{bN(Math.ceil(plan.necesariosFin))}</td>
                  <td className="num mono">+{bN(Math.ceil(plan.altasFin))}</td>
                  <td/>
                  {segs.map(s => <td key={s.id} className="num mono">{tipos.reduce((a, b) => a + ((ts[b.tipo] || {})[s.id] || 0), 0)}</td>)}
                  <td className="num mono">{tipos.reduce((a, b) => a + ((ts[b.tipo] || {}).total || 0), 0)}</td>
                </tr>
              </tbody>
            </table>
            <div className="bk-lvl2-n">
              Partners y deals por tipo, con el reparto por segmento del deal real. Las altas salen de dividir el objetivo del tipo entre su productividad observada, así que un tipo productivo necesita menos altas para el mismo objetivo.
            </div>
          </div>
        );
      })()}

      <div className="bk-foot">
        El corto plazo es el cumplimiento de Q2, que va al <b>{bP(q2.ach)}</b>; el medio, {fuente === 'plan2027'
          ? <>los {bN(plan.objTotal)} deals que el plan de 2027 le pide al canal desde {plan.objDesde.label}. Los meses anteriores no llevan objetivo del plan: se dejan vacíos en vez de rellenarlos con otra base.</>
          : <>lo que el canal tiene que sostener cada mes hasta {hasta === '2026-12' ? 'diciembre de 2026' : 'diciembre de 2027'} para que el compromiso trimestral crezca al {bP(growth)}.</>}
        Los meses en gris son objetivo, no dato. Las altas de partners salen de dividir el objetivo entre la productividad observada de cada tipo, así que suben o bajan con el objetivo: con el plan de 2027 como fuente hacen falta <b>{bN(Math.ceil(plan.altasFin))} altas netas</b> sobre los {plan.activosHoy} partners que hoy producen.
      </div>
    </div>
  );
};
