// Outbound 2027: tier → fuente → persona, con puntos y payout
const { useState, useMemo } = React;

const oN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
const o1 = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(1).replace('.', ',');
const oP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d).replace('.', ',') + '%';
const oEur = (v) => v == null ? '—' : v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + 'M€'
  : v >= 1e3 ? Math.round(v / 1e3) + 'k€' : oN(v) + '€';

window.OutboundFlow = function OutboundFlow() {
  const [growth, setGrowth] = useState(window.OB_GROWTH_DEFECTO);
  const [sel, setSel] = useState(null);

  const tp = useMemo(() => window.obTierPlan(), []);
  const plan = useMemo(() => window.obPlan({ growth }), [growth]);
  const months = plan.months;

  const Cell = ({ v, fmt, cls }) => <td className={cls}>{fmt ? fmt(v) : oN(v)}</td>;
  const payChip = (q) => <span className="k-ach" style={{'--c': q.payout >= 1.25 ? '#1F5C42' : q.payout >= 1 ? '#2E7D5B' : q.payout >= 0.6 ? '#B8731F' : '#B23A3A'}}>{oP(q.payout)}</span>;

  return (
    <div className="ob bk" data-screen-label="10 Outbound 2027">
      <div className="bk-head">
        <div>
          <h1 className="bk-h1">Outbound · objetivos 2027</h1>
          <div className="bk-sub">Mismo formato que el canal broker, de arriba abajo: el compromiso del plan por tier, luego las fuentes de discovery, y al final persona a persona con sus puntos y su payout. La mecánica es la de <b>Objetivos_Outbound_Q4</b>: un discovery de Mid-Market vale {window.OB_PUNTOS['Mid-Market']} puntos y uno de SME {window.OB_PUNTOS['SME Big']}.</div>
        </div>
        <div className="bk-kpis">
          <div className="bk-kpi"><b className="mono">{oN(plan.disc)}</b><span>discoveries 2027</span></div>
          <div className="bk-kpi"><b className="mono">{oN(plan.puntos)}</b><span>puntos del año</span></div>
          <div className="bk-kpi accent"><b className="mono">{oN(plan.clientes)}</b><span>clientes al {oP(0.07)} de conversión</span></div>
          <div className="bk-kpi"><b className="mono">{plan.personas.length}<em> personas</em></b><span>{plan.fuentes.length} fuentes</span></div>
        </div>
      </div>

      {/* ===== NIVEL 1 · TIER ===== */}
      {tp && (
        <section className="bk-block bk-lvl1">
          <div className="bk-bh">
            <span className="bk-chip">Nivel 1 · Objetivo por tier</span>
            <span className="bk-bh-d">Leads, deals y clientes que el plan de 2027 pide al canal 1 outbound. Es el compromiso contra el que se dimensionan las discoveries de abajo.</span>
            <span className="bk-bh-k mono">{oN(tp.totL)} leads · {oN(tp.totD)} deals · {oN(tp.totC)} clientes</span>
          </div>
          <div className="bk-scroll">
            <table className="bk-plan">
              <thead><tr>
                <th className="k-rl">Tier</th>
                {months.map((mo, i) => <th key={i} className={mo.m === 12 ? 'k-yr' : ''}>{mo.label}{mo.m % 3 === 1 && <em className="k-q">{mo.q}</em>}</th>)}
                <th className="k-tot">Total</th>
              </tr></thead>
              <tbody>
                {tp.tiers.map(t => (
                  <React.Fragment key={t.id}>
                    <tr className="k-tier-open" style={{'--ch': t.color}}>
                      <th className="k-rl"><span className="k-tier-name">{t.label}<em>{t.rango} · {t.cap.sdr} SDR y {t.cap.ae} AE</em></span><b>Leads</b><em>trabajados en el mes</em></th>
                      {months.map((mo, i) => <Cell key={i} v={t.rows[i].leads}/>)}
                      <td className="k-tot mono">{oN(t.totL)}</td>
                    </tr>
                    <tr>
                      <th className="k-rl"><b>Deals</b><em>abiertos en el mes</em></th>
                      {months.map((mo, i) => <Cell key={i} v={t.rows[i].deals} fmt={o1}/>)}
                      <td className="k-tot mono">{oN(t.totD)}</td>
                    </tr>
                    <tr className="k-strong">
                      <th className="k-rl"><b>Clientes</b><em>firmados en el mes</em></th>
                      {months.map((mo, i) => <Cell key={i} v={t.rows[i].cli} fmt={o1}/>)}
                      <td className="k-tot mono">{oN(t.totC)}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bk-bn">El plan pide {oN(tp.totC)} clientes de outbound en 2027. Los objetivos de discovery de abajo producen {oN(plan.clientes)} al {oP(0.07)} de conversión: {plan.clientes >= tp.totC ? <>cubren el compromiso.</> : <><b>{oN(tp.totC - plan.clientes)} clientes por debajo</b>, que es la brecha que hay que cerrar con más actividad o mejor conversión.</>}</div>
        </section>
      )}

      {/* ===== NIVEL 2 · FUENTE ===== */}
      <div className="bk-lvl-h">Nivel 2 · Fuente de discovery</div>
      <div className="ob-lv">
        <label>Crecimiento mensual de actividad</label>
        <div className="bk-num">
          <button onClick={() => setGrowth(Math.max(0, +(growth - 0.01).toFixed(2)))}>−</button>
          <span className="mono">{oP(growth)}</span>
          <button onClick={() => setGrowth(+(growth + 0.01).toFixed(2))}>+</button>
        </div>
        <span className="ob-lv-n">Cada persona arranca 2027 en el régimen que alcanzó en diciembre de {window.OB_META.baseQ} y crece a este ritmo.</span>
      </div>
      <div className="bk-lvl2">
        <table className="bk-table">
          <thead><tr>
            <th>Fuente</th><th className="num">Personas</th><th className="num">Discoveries 2027</th>
            <th className="num">Puntos</th><th className="num">Puntos por persona</th><th className="num">Disc./semana</th><th>Segmentos</th>
          </tr></thead>
          <tbody>
            {plan.fuentes.map(f => (
              <tr key={f.id}>
                <td className="bk-tipo"><span className="bk-dot" style={{background: f.color}}/><b>{f.label}</b><em>{f.desc}</em></td>
                <td className="num mono">{f.personas.length}</td>
                <td className="num mono">{oN(f.disc)}</td>
                <td className="num mono"><b>{oN(f.puntos)}</b></td>
                <td className="num mono">{oN(f.puntos / f.personas.length)}</td>
                <td className="num mono">{o1(f.rows[11].disc / window.OB_SEMANAS)}</td>
                <td className="ob-segs">
                  {[...new Set(f.personas.map(p => p.seg))].map(s => (
                    <span key={s} className="ob-seg-chip">{s}<em>×{window.obPuntos(s)}</em></span>
                  ))}
                </td>
              </tr>
            ))}
            <tr className="bk-row-tot">
              <td>Total</td>
              <td className="num mono">{plan.personas.length}</td>
              <td className="num mono">{oN(plan.disc)}</td>
              <td className="num mono">{oN(plan.puntos)}</td>
              <td className="num mono">{oN(plan.puntos / plan.personas.length)}</td>
              <td className="num mono">{o1(plan.totalRows[11].disc / window.OB_SEMANAS)}</td>
              <td/>
            </tr>
          </tbody>
        </table>
        <div className="bk-lvl2-n">
          El punto es la unidad del plan de comisión: un discovery de Mid-Market cuenta doble, así que una fuente con menos volumen puede valer más. La columna de discoveries por semana es la de diciembre, el mes de más carga.
        </div>
      </div>

      {/* ===== POR SEGMENTO ===== */}
      <div className="bk-lvl-h">Discoveries y puntos por segmento</div>
      <div className="ob-bloques">
        {plan.porSeg.map(s => {
          const e = window.OB_ECON.find(x => x.seg === s.seg);
          return (
            <div key={s.seg} className="ob-bl">
              <div className="ob-bl-h">{s.seg}<em>×{s.pts} {s.pts > 1 ? 'puntos' : 'punto'} por discovery</em></div>
              <div className="ob-bl-n mono">{oN(s.disc)}</div>
              <dl>
                <div><dt>Puntos</dt><dd className="mono">{oN(s.puntos)}</dd></div>
                <div><dt>Personas</dt><dd className="mono">{s.gente}</dd></div>
                {e && <div><dt>Clientes al {oP(e.conv)}</dt><dd className="mono">{o1(s.disc * e.conv)}</dd></div>}
                {e && <div><dt>Facility media</dt><dd className="mono">{oEur(e.facility)}</dd></div>}
              </dl>
            </div>
          );
        })}
      </div>

      {/* ===== PAYOUT ===== */}
      <div className="bk-lvl-h">Curva de payout y gates</div>
      <div className="zo-ctrl zo-recal">
        <span className="ap-imp">recalibrada</span>
        <span className="zo-ctrl-n">
          La hoja escribe la curva en puntos absolutos con target 400, calibrado para el equipo de {plan.targetCal.fuente} ({plan.targetCal.personas} personas).
          Con {plan.personas.length} en régimen ese target se supera siempre y el plan pagaría el máximo los cuatro trimestres.
          Aquí la curva se guarda como múltiplos del target y el target se deriva de la plantilla: <b>{oN(plan.target)} puntos por trimestre</b> ({oN(plan.target / plan.personas.length)} por persona), ×{o1(plan.target / plan.targetCal.target)} sobre el de la hoja.
          Los gates escalan igual para seguir mordiendo.
        </span>
      </div>
      <div className="ob-qtrs">
        {plan.quarters.map(q => (
          <div key={q.q} className={'ob-qtr ' + (q.payout >= 1 ? 'ok' : 'low')}>
            <div className="ob-qtr-h">{q.q} 2027<em>{oN(q.disc)} discoveries</em></div>
            <div className="ob-qtr-n mono">{oN(q.puntos)}<span> puntos</span></div>
            <div className="ob-qtr-p">{payChip(q)}<em>{q.nivel}</em></div>
            <dl>
              <div><dt>Mid-Market</dt><dd className="mono">{oN(q.mm)}</dd></div>
              <div><dt>SME</dt><dd className="mono">{oN(q.sme)}</dd></div>
              <div><dt>Cap por gates</dt><dd className="mono">{q.cap ? oP(q.cap) : <span className="bk-none">no pasa</span>}</dd></div>
            </dl>
            {q.capado && <div className="ob-qtr-w">La curva daría {oP(q.payoutCurva)} pero el gate de segmento lo capa al {oP(q.cap)}.</div>}
          </div>
        ))}
      </div>
      <div className="ob-pay">
        <div className="ob-pay-l">
          <table className="bk-table">
            <thead><tr><th>Nivel</th><th className="num">Puntos del trimestre</th><th className="num">Payout</th></tr></thead>
            <tbody>
              {plan.curva.map(c => (
                <tr key={c.nivel}>
                  <td>{c.nivel}<em className="zo-sub">{oP(c.r, 0)} del target</em></td>
                  <td className="num mono">{oN(c.puntos)}</td>
                  <td className="num mono"><span className="k-ach" style={{'--c': c.payout >= 1.25 ? '#1F5C42' : c.payout >= 1 ? '#2E7D5B' : '#B8731F'}}>{oP(c.payout)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ob-pay-r">
          <table className="bk-table">
            <thead><tr><th>Gate por segmento</th><th className="num">Mid-Market</th><th className="num">SME</th><th className="num">Cap</th></tr></thead>
            <tbody>
              {plan.gates.map(g => (
                <tr key={g.regla}>
                  <td>{g.regla}</td>
                  <td className="num mono">{oN(g.mm)}</td>
                  <td className="num mono">{oN(g.sme)}</td>
                  <td className="num mono">{oP(g.cap)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ob-qual">
            {window.OB_QUALITY.map(q => (
              <span key={q.metrica} className="ob-q"><b>{q.metrica}</b> ≥ {oP(q.umbral)}<em>{q.efecto}</em></span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== EMBUDO ===== */}
      <div className="bk-lvl-h">Embudo del deal de outbound</div>
      <window.FunnelBlock canal="Outbound" fases={window.FN_AE}
        titulo="Discovery → Won · canal outbound" tone="#2E7D5B"
        nota="El recorrido del deal que abre el equipo propio. El paso por riesgos es donde se separa del deal de partner."/>

      {/* ===== ANÁLISIS DE CONVERSIONES ===== */}
      <div className="bk-lvl-h">Análisis de conversiones</div>
      {(() => {
        const cv = window.obConversiones();
        const c = cv.cadena;
        return (
          <div className="cv">
            {c && (
              <div className="cv-chain">
                <div className="cv-ch"><b className="mono">{oN(c.leads)}</b><span>leads del plan</span></div>
                <div className="cv-op">×{oP(c.leadADeal, 1)}</div>
                <div className="cv-ch"><b className="mono">{oN(c.deals)}</b><span>deals</span></div>
                <div className="cv-op">×{oP(c.dealACliente, 1)}</div>
                <div className="cv-ch accent"><b className="mono">{oN(c.cli)}</b><span>clientes</span></div>
                <div className="cv-op">=</div>
                <div className="cv-ch"><b className="mono">{oP(c.puntaAPunta, 2)}</b><span>de punta a punta</span></div>
                {c.realCanal != null && <>
                  <div className="cv-op alt">vs</div>
                  <div className="cv-ch bad"><b className="mono">{oP(c.realCanal, 1)}</b><span>cierre real del outbound en HubSpot</span></div>
                </>}
              </div>
            )}
            <table className="bk-table">
              <thead><tr>
                <th>Segmento</th><th className="num">Conversión de la hoja</th><th className="num">Conversión medida</th>
                <th className="num">Discoveries por cliente</th><th className="num">Deals reales</th><th className="num">Ganados</th><th>Distancia</th>
              </tr></thead>
              <tbody>
                {cv.filas.map(f => (
                  <tr key={f.seg}>
                    <td className="bk-tipo"><b>{f.seg}</b><em>facility media {oEur(f.facility)} · {oEur(f.precioDeal)} por deal</em></td>
                    <td className="num mono">{oP(f.supuesto)}</td>
                    <td className="num mono">{f.real != null
                      ? <span className="k-ach" style={{"--c": f.real >= f.supuesto ? "#1F5C42" : f.real >= f.supuesto/2 ? "#B8731F" : "#B23A3A"}}>{oP(f.real, 1)}</span>
                      : <span className="bk-none">sin cerrados</span>}</td>
                    <td className="num mono">
                      <span className="cv-two"><b>{o1(f.dealsPorClienteSup)}</b><em>{f.dealsPorClienteReal ? o1(f.dealsPorClienteReal) + " real" : "—"}</em></span>
                    </td>
                    <td className="num mono">{f.dealsReales != null ? oN(f.dealsReales) : <span className="bk-none">—</span>}</td>
                    <td className="num mono">{f.wonReales != null ? oN(f.wonReales) : <span className="bk-none">—</span>}</td>
                    <td className="cv-gap">{f.factor == null ? <span className="bk-none">—</span>
                      : <span className="cv-bar"><i style={{width: Math.min(100, 100/f.factor) + "%", background: f.factor <= 1 ? "var(--good)" : "var(--warn)"}}/><em>{f.factor <= 1 ? "cumple" : "×" + o1(f.factor) + " optimista"}</em></span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cv-note">
              La hoja supone un {oP(0.07)} de discovery a cliente en todos los segmentos, lo que da {o1(cv.discPorCliente.hoja)} discoveries por cliente. HubSpot mide {oP(cv.real ? cv.real.wr : null, 1)} en el canal outbound sobre {oN(cv.real && cv.real.deals)} deals, que son <b>{cv.discPorCliente.real ? o1(cv.discPorCliente.real) : "—"} deals por cliente</b>.
              {c && c.realCanal != null && <> Con la tasa medida, los {oN(c.deals)} deals del plan darían {oN(c.deals * c.realCanal)} clientes en vez de {oN(c.cli)}: la diferencia no se cierra con más actividad, se cierra con mejor calificación.</>}
            </div>
          </div>
        );
      })()}

      {/* ===== NIVEL 3 · PERSONA ===== */}
      <div className="bk-lvl-h">Nivel 3 · Persona con nombre</div>
      <div className="bk-lvl2">
        <table className="bk-table">
          <thead><tr>
            <th>Persona</th><th>Fuente</th><th>Segmento</th>
            <th className="num">Régimen dic-26</th><th className="num">Disc. 2027</th><th className="num">Disc./semana dic</th>
            <th className="num">Puntos año</th>
            {['Q1','Q2','Q3','Q4'].map(q => <th key={q} className="num">{q}<em className="k-q">puntos</em></th>)}
            <th className="num">% del equipo</th>
          </tr></thead>
          <tbody>
            {plan.personas.map(p => {
              const f = window.OB_FUENTES.find(x => x.id === p.fuente) || {};
              return (
                <tr key={p.id} className={sel === p.id ? 'on' : ''} onClick={() => setSel(sel === p.id ? null : p.id)}>
                  <td className="bk-nom"><b>{p.nombre}</b><em>{p.rol}</em></td>
                  <td><span className="bk-tchip" style={{'--c': f.color}}>{f.label}</span></td>
                  <td className="ob-segs"><span className="ob-seg-chip">{p.seg}<em>×{p.pts}</em></span></td>
                  <td className="num mono">{oN(p.regimen)}</td>
                  <td className="num mono"><b>{oN(p.disc)}</b></td>
                  <td className="num mono">{o1(p.semanal)}</td>
                  <td className="num mono">{oN(p.puntos)}</td>
                  {p.quarters.map(q => <td key={q.q} className="num mono">{oN(q.puntos)}</td>)}
                  <td className="num mono"><b>{oP(p.puntos / plan.puntos)}</b></td>
                </tr>
              );
            })}
            <tr className="bk-row-tot">
              <td>Total equipo</td><td/><td/>
              <td className="num mono">{oN(plan.personas.reduce((a,p)=>a+p.regimen,0))}</td>
              <td className="num mono">{oN(plan.disc)}</td>
              <td className="num mono">{o1(plan.totalRows[11].disc / window.OB_SEMANAS)}</td>
              <td className="num mono">{oN(plan.puntos)}</td>
              {plan.quarters.map(q => <td key={q.q} className="num mono">{oN(q.puntos)}</td>)}
              <td className="num mono">100%</td>
            </tr>
          </tbody>
        </table>
        <div className="bk-lvl2-n">
          La curva de payout mide los puntos del <b>equipo</b>, no de cada persona: en la hoja de Q4 una persona hace entre 34 y 90 puntos y el umbral de entrada son 230, así que aplicarla individualmente daría cero a todos. Aquí cada uno muestra sus puntos por trimestre y su parte del total, y el payout se calcula arriba a nivel de equipo.
        </div>
      </div>

      {/* ===== DETALLE MENSUAL ===== */}
      {sel && (() => {
        const p = plan.personas.find(x => x.id === sel);
        const f = window.OB_FUENTES.find(x => x.id === p.fuente) || {};
        const e = window.OB_ECON.find(x => x.seg === p.seg);
        return (
          <section className="bk-block" style={{'--c': f.color}}>
            <div className="bk-bh">
              <span className="bk-chip">{p.nombre}</span>
              <span className="bk-bh-d">{p.rol} · {p.seg} a ×{p.pts} puntos · arranca en {oN(p.regimen)} discoveries al mes y crece al {oP(growth)}</span>
              <span className="bk-bh-k mono">{oN(p.disc)} discoveries · {oN(p.puntos)} puntos</span>
            </div>
            <div className="bk-scroll">
              <table className="bk-plan">
                <thead><tr>
                  <th className="k-rl">{p.nombre}</th>
                  {months.map((mo, i) => <th key={i} className={mo.m === 12 ? 'k-yr' : ''}>{mo.label}{mo.m % 3 === 1 && <em className="k-q">{mo.q}</em>}</th>)}
                  <th className="k-tot">Total</th>
                </tr></thead>
                <tbody>
                  <tr className="k-chan k-chan-obj"><th className="k-rl"><b>Actividad</b><em>discoveries cualificadas</em></th><td colSpan={months.length + 1}/></tr>
                  <tr className="k-strong">
                    <th className="k-rl"><b>Discoveries</b><em>del mes</em></th>
                    {months.map((mo, i) => <Cell key={i} v={p.rows[i].disc} fmt={o1}/>)}
                    <td className="k-tot mono">{oN(p.disc)}</td>
                  </tr>
                  <tr className="k-cap">
                    <th className="k-rl"><b>Por semana</b><em>sobre {window.OB_SEMANAS} semanas</em></th>
                    {months.map((mo, i) => <Cell key={i} v={p.rows[i].semanal} fmt={o1}/>)}
                    <td className="k-tot mono">{o1(p.semanal)}</td>
                  </tr>
                  <tr className="k-chan k-chan-real"><th className="k-rl"><b>Compensación</b><em>puntos y payout</em></th><td colSpan={months.length + 1}/></tr>
                  <tr>
                    <th className="k-rl"><b>Puntos</b><em>×{p.pts} por discovery</em></th>
                    {months.map((mo, i) => <Cell key={i} v={p.rows[i].puntos} fmt={o1}/>)}
                    <td className="k-tot mono">{oN(p.puntos)}</td>
                  </tr>
                  <tr>
                    <th className="k-rl"><b>Puntos del trimestre</b><em>los suyos</em></th>
                    {months.map((mo, i) => {
                      const q = p.quarters.find(x => x.q === mo.q);
                      return <td key={i} className={mo.m % 3 === 0 ? 'k-strong' : 'k-fut'}>{mo.m % 3 === 0 ? oN(q.puntos) : <span className="k-none">·</span>}</td>;
                    })}
                    <td className="k-tot mono">{oN(p.puntos)}</td>
                  </tr>
                  <tr>
                    <th className="k-rl"><b>Payout del equipo</b><em>la curva es de equipo</em></th>
                    {months.map((mo, i) => {
                      const q = plan.quarters.find(x => x.q === mo.q);
                      return <td key={i}>{mo.m % 3 === 0 ? payChip(q) : <span className="k-none">·</span>}</td>;
                    })}
                    <td className="k-tot"/>
                  </tr>
                  {e && <>
                    <tr className="k-chan k-chan-seg"><th className="k-rl"><b>Resultado</b><em>al {oP(e.conv)} de conversión</em></th><td colSpan={months.length + 1}/></tr>
                    <tr>
                      <th className="k-rl"><b>Clientes</b><em>de sus discoveries</em></th>
                      {months.map((mo, i) => <Cell key={i} v={p.rows[i].disc != null ? p.rows[i].disc * e.conv : null} fmt={o1}/>)}
                      <td className="k-tot mono">{o1(p.disc * e.conv)}</td>
                    </tr>
                    <tr>
                      <th className="k-rl"><b>Volumen</b><em>facility media {oEur(e.facility)}</em></th>
                      {months.map((mo, i) => <Cell key={i} v={p.rows[i].disc != null ? p.rows[i].disc * e.conv * e.facility : null} fmt={oEur}/>)}
                      <td className="k-tot mono">{oEur(p.disc * e.conv * e.facility)}</td>
                    </tr>
                  </>}
                </tbody>
              </table>
            </div>
            <div className="bk-bn">
              {p.nombre} cierra el año en <b>{o1(p.semanal)} discoveries por semana</b> y {oN(p.quarters[3].puntos)} puntos en Q4, el {oP(p.quarters[3].puntos / plan.quarters[3].puntos)} de los {oN(plan.quarters[3].puntos)} del equipo, que en la curva es <b>{plan.quarters[3].nivel.toLowerCase()}</b> al {oP(plan.quarters[3].payout)}.
              {e && <> A {oP(e.conv)} de conversión eso son {o1(p.disc * e.conv)} clientes y {oEur(p.disc * e.conv * e.facility)} de volumen en el año.</>}
            </div>
          </section>
        );
      })()}

      <div className="bk-foot">
        El nivel 1 sale del plan de 2027 y no se recalcula aquí. Los niveles 2 y 3 son el modelo de <b>Objetivos_Outbound_Q4</b> extendido a los doce meses de 2027: cada persona arranca en el régimen que alcanzó en diciembre y crece al {oP(growth)} mensual, con los puntos y la curva de payout de la hoja.
        Pulsa una persona para ver su detalle mensual con puntos, payout y el volumen que produce.
      </div>
    </div>
  );
};
