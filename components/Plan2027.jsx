// Plan de ahora a diciembre de 2027: meses en columnas, un bloque por tier
const { useState, useMemo } = React;

const hN = (v) => {
  if (v == null || isNaN(v)) return '—';
  if (v > 0 && v < 0.5) return '<1';
  const n = Math.round(v);
  return String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.').replace(/^/, n < 0 ? '-' : '');
};
const hP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 2 : d).replace('.', ',') + '%';
const hK = (v) => v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + 'M' : v >= 1e4 ? hN(v / 1e3) + 'k' : hN(v);
const h1 = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(1).replace('.', ',');

window.Plan2027 = function Plan2027() {
  const [p, setP] = useState(window.GTM_DEFAULTS);
  const [splitId, setSplitId] = useState('foco');
  const [engine, setEngine] = useState('cap');

  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }));
  const sim = useMemo(() => window.gtmSimulate(p), [p]);
  const sol = useMemo(() => window.gtmSolve(p, sim, 'required'), [p, sim]);
  const plan = useMemo(() => window.gtmTierMonthly(p, sol, splitId), [p, sol, splitId]);
  const capPlan = useMemo(() => window.gtmCapacityPlan(p), [p]);
  const setCap = (tid, k, v) => setP(prev => ({ ...prev,
    tierCaps: { ...prev.tierCaps, [tid]: { ...prev.tierCaps[tid], [k]: Math.max(0, v) } } }));
  const months = plan.months;

  const Num = ({ k, min, max, step, pct }) => (
    <div className="h-num">
      <button onClick={() => set(k, Math.max(min, +(p[k] - step).toFixed(4)))}>−</button>
      <span className="mono">{pct ? hP(p[k], p[k] < 0.1 ? 1 : 0) : hN(p[k])}</span>
      <button onClick={() => set(k, Math.min(max, +(p[k] + step).toFixed(4)))}>+</button>
    </div>
  );

  // una fila del bloque de tier
  const Chan = ({ label, note, tone }) => (
    <tr className={'h-chan h-chan-' + tone}>
      <td className="h-rl"><b>{label}</b>{note && <em>{note}</em>}</td>
      <td colSpan={months.length}/>
    </tr>
  );
  const Row = ({ label, sub, get, fmt, pen, strong, cap, gap, sep }) => (
    <tr className={(strong ? 'h-strong ' : '') + (cap ? 'h-cap ' : '') + (sep ? 'h-sep ' : '')}>
      <th className="h-rl">{label}{sub && <em>{sub}</em>}</th>
      {months.map((mo, i) => {
        const v = get(i);
        const over = gap ? gap(i) : false;
        return (
          <td key={i} className={'mono ' + (over ? 'h-over' : '')}>
            {fmt ? fmt(v) : hN(v)}
            {pen ? <span className="h-pen">{hP(pen(i), 2)}</span> : null}
          </td>
        );
      })}
    </tr>
  );

  return (
    <div className="h2" data-screen-label="08 Plan 2027">
      <div className="h-head">
        <div>
          <h1 className="h-h1">De aquí a diciembre de 2027</h1>
          <div className="h-sub">El tramo ejecutable del unicorn plan: {months.length} meses, un bloque por tier, los meses en columnas. Del hito de BP hacia atrás hasta el número de SDR y AE que pide cada mes.</div>
        </div>
        {(() => {
        const src = engine === 'cap' ? capPlan : plan;
        return (
        <div className={'h-goal ' + (engine === 'cap' && capPlan.gap > 0 ? 'bad' : '')}>
          <div className="h-goal-l">Hito de BP a dic 2027{engine !== 'cap' && <em className="h-goal-pop">{plan.def.label.toLowerCase()}</em>}</div>
          <div className="h-goal-n mono">{hN(src.milestone)}</div>
          {engine === 'cap'
            ? <div className="h-goal-d">clientes acumulados. Con {capPlan.sdr} SDR, {capPlan.ae} AE y el canal de partners la capacidad sostiene <b>{hN(capPlan.endCli)}</b>{capPlan.gap > 0 ? <>, o sea {hN(capPlan.gap)} por debajo</> : <>, por encima del hito</>}. Reparto de los nuevos: partners <b>{hN(capPlan.totPCli)}</b> ({hP(capPlan.partnerShare, 0)}), contactos <b>{hN(capPlan.totFuCli)}</b> ({hP(capPlan.contactShare, 0)}), embedded <b>{hN(capPlan.totECli)}</b> ({hP(capPlan.embeddedShare, 0)}), y el resto outbound. Descontando {hN(capPlan.totChurn)} de churn.</div>
            : <div className="h-goal-d">clientes acumulados. Hoy hay {hN(plan.baseCli)} en {plan.def.label.toLowerCase()}, así que el plan tiene que producir <b>{hN(plan.net)}</b> nuevos.</div>}
          {src.milestonePlano != null && Math.abs(src.milestonePlano - src.milestone) > 1 && (
            <div className="h-goal-rebase">
              {src.baseCli >= src.milestonePlano
                ? <>Hito rebasado sobre la base real: el {hP((window.GTM_BP_SHAPE.find(s => s.year === 2027) || {}).cum, 0)} del objetivo de {hN(p.target)} daría {hN(src.milestonePlano)}, que con {hN(src.baseCli)} clientes ya firmados estaría cumplido sin hacer nada. Lo que se mide es el camino que queda de {hN(src.baseCli)} a {hN(p.target)} a cierre de 2029.</>
                : <>Hito rebasado sobre la base real, y sale <b>más duro</b>: el {hP((window.GTM_BP_SHAPE.find(s => s.year === 2027) || {}).cum, 0)} del objetivo de {hN(p.target)} daría {hN(src.milestonePlano)}, pero repartir el recorrido de {hN(src.baseCli)} a {hN(p.target)} exige {hN(src.milestone)} a dic-27. Partir de una base pequeña no rebaja el hito: obliga a un tramo mayor cada año.</>}
              {engine !== 'cap' && <> Esta tarjeta cuenta {plan.def.label.toLowerCase()}: en los cinco tiers la base es {hN(capPlan.baseCli)} y el hito {hN(capPlan.milestone)}.</>}
            </div>
          )}
        </div>
        );
        })()}
      </div>

      {/* ===== PALANCAS ===== */}
      <div className="h-levers">
        <div className="h-lv"><label>Cómo se resuelve</label>
          <div className="h-tg">
            {[['cap','Capacidad → objetivo'],['top','Objetivo → capacidad']].map(([k, l]) => (
              <button key={k} className={engine === k ? 'on' : ''} onClick={() => setEngine(k)}>{l}</button>
            ))}
          </div>
        </div>
        {engine === 'cap' && window.MKT_TIERS.slice().reverse().map(t => t.id)
          .filter(tid => p.tierCaps[tid] && !Object.values(window.GTM_MERGE || {}).flat().includes(tid))
          .map(tid => {
          const t = window.MKT_TIERS.find(x => x.id === tid);
          const lab = window.GTM_MERGE_LABEL[tid] || t.label;
          return (
            <div className="h-lv" key={tid}><label>{lab} · SDR y AE</label>
              <div className="h-caps">
                <div className="h-num">
                  <button onClick={() => setCap(tid, 'sdr', p.tierCaps[tid].sdr - 1)}>−</button>
                  <span className="mono">{p.tierCaps[tid].sdr} SDR</span>
                  <button onClick={() => setCap(tid, 'sdr', p.tierCaps[tid].sdr + 1)}>+</button>
                </div>
                <div className="h-num">
                  <button onClick={() => setCap(tid, 'ae', p.tierCaps[tid].ae - 1)}>−</button>
                  <span className="mono">{p.tierCaps[tid].ae} AE</span>
                  <button onClick={() => setCap(tid, 'ae', p.tierCaps[tid].ae + 1)}>+</button>
                </div>
                <div className="h-num">
                  <button onClick={() => setCap(tid, 'dealsPerSdr', p.tierCaps[tid].dealsPerSdr - 5)}>−</button>
                  <span className="mono">{p.tierCaps[tid].dealsPerSdr} deals/SDR</span>
                  <button onClick={() => setCap(tid, 'dealsPerSdr', p.tierCaps[tid].dealsPerSdr + 5)}>+</button>
                </div>
              </div>
            </div>
          );
        })}
        <div className="h-lv" style={{display: engine === 'cap' ? 'none' : undefined}}><label>Reparto del objetivo</label>
          <div className="h-tg">
            {window.GTM_SPLITS.map(s => (
              <button key={s.id} className={splitId === s.id ? 'on' : ''} onClick={() => setSplitId(s.id)} title={s.desc}>{s.label}</button>
            ))}
          </div>
        </div>
        <div className="h-lv"><label>{p.stages === 3 ? 'Lead → deal' : 'Lead → cualificada'}</label><Num k="discRate" min={0.005} max={0.4} step={0.005} pct/></div>
        <div className="h-lv"><label>Etapas del embudo</label>
          <div className="h-tg">
            {[[3,'Lead → deal → cliente'],[4,'Con cualificada aparte']].map(([k, l]) => (
              <button key={k} className={p.stages === k ? 'on' : ''} onClick={() => set('stages', k)}>{l}</button>
            ))}
          </div>
        </div>
        {p.stages === 4 && <div className="h-lv"><label>Cualificada → deal</label><Num k="dealRate" min={0.02} max={0.9} step={0.02} pct/></div>}
        <div className="h-lv"><label>Deal → cliente</label><Num k="winRate" min={0.02} max={0.9} step={0.02} pct/></div>
        <div className="h-lv"><label>Leads por SDR y mes</label><Num k="leadsPerSdrMonth" min={100} max={1200} step={50}/></div>
        <div className="h-lv"><label>Deals por AE y mes</label><Num k="dealsPerAeMonth" min={6} max={200} step={6}/></div>

        {engine === 'cap' && p.embedded && Object.keys(p.embedded).map(tid => {
          const t = window.MKT_TIERS.find(x => x.id === tid);
          const e = p.embedded[tid];
          const setEm = (k, v) => setP(prev => ({ ...prev, embedded: { ...prev.embedded, [tid]: { ...prev.embedded[tid], [k]: Math.max(0, v) } } }));
          return (
            <div className="h-lv" key={'em' + tid}><label>Embedded en {t.label}</label>
              <div className="h-caps">
                <div className="h-num">
                  <button onClick={() => setEm('targetDeals', e.targetDeals - 5)}>−</button>
                  <span className="mono">{e.targetDeals} deals</span>
                  <button onClick={() => setEm('targetDeals', e.targetDeals + 5)}>+</button>
                </div>
                <div className="h-num">
                  <button onClick={() => setEm('targetCli', e.targetCli - 5)}>−</button>
                  <span className="mono">{e.targetCli} cli</span>
                  <button onClick={() => setEm('targetCli', e.targetCli + 5)}>+</button>
                </div>
              </div>
            </div>
          );
        })}
        <div className="h-lv"><label>Prima de encaje inicial</label><Num k="qualityPremium" min={1} max={2.5} step={0.05}/></div>
        <div className="h-lv"><label>Ciclo de venta</label><Num k="cycleMonths" min={0} max={12} step={1}/></div>
      </div>

      {/* ===== REALIDAD MEDIDA ===== */}
      {engine === 'cap' && window.HS_META && (
        <section className="h-real">
          <div className="h-real-h">
            <b>Calibrado con HubSpot</b>
            <em>{window.HS_META.deals.toLocaleString('es-ES')} deals sobre {window.HS_META.empresas.toLocaleString('es-ES')} empresas, {window.HS_META.desde} a {window.HS_META.hasta}. Donde el supuesto y el dato discrepan, manda el dato.</em>
            <button className="h-real-t" onClick={() => set('useReal', !p.useReal)}>{p.useReal ? 'Usando tasas reales' : 'Usando supuestos'}</button>
          </div>
          <div className="h-real-grid">
            {window.HS_CANAL.map(c => (
              <div key={c.id} className={'h-real-c ' + (c.wr > 0.15 ? 'good' : c.wr < 0.07 ? 'bad' : '')}>
                <div className="h-real-cl">{c.label}</div>
                <div className="h-real-cn mono">{hP(c.wr, 1)}</div>
                <div className="h-real-cd">{hN(c.won)} ganados de {hN(c.deals)}</div>
              </div>
            ))}
          </div>
          <div className="h-real-gaps">
            {window.HS_GAPS.map(g => (
              <div key={g.id} className={'h-real-g sev-' + g.sev}>
                <div className="h-real-gt">{g.titulo}</div>
                <div className="h-real-gr"><span>Supuesto</span>{g.plan}</div>
                <div className="h-real-gr real"><span>HubSpot</span>{g.real}</div>
                <div className="h-real-ge">{g.efecto}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== CADENA DE CONVERSIÓN ===== */}
      {engine === 'cap' && (() => {
        const dr = window.gtmDealRate(p);
        const L = capPlan.sdr * p.leadsPerSdrMonth;
        const capD = Math.min(...capPlan.blocks.map(b => b.sdrDealCap / Math.max(1e-9, b.leadsCap * p.discRate)));
        const C = Math.min(L * p.discRate, capPlan.blocks.reduce((a, b) => a + b.sdrDealCap, 0)), DE = C * dr;
        const wAvg = capPlan.blocks.reduce((a, b) => a + window.gtmWin(p, b.tier.id, 'out') * b.sdrDealCap, 0) / Math.max(1e-9, capPlan.blocks.reduce((a, b) => a + b.sdrDealCap, 0));
        const CL = DE * wAvg;
        const e2e = p.discRate * dr * p.winRate;
        return (
          <div className="h-chain">
            <div className="h-ch-h">Cadena de conversión en régimen <em>· con {capPlan.sdr} SDR a {hN(p.leadsPerSdrMonth)} leads al mes</em></div>
            <div className="h-ch-row">
              <div className="h-ch"><b className="mono">{hN(L)}</b><span>leads/mes</span></div>
              <div className="h-ch-op">×{hP(p.discRate, 0)}</div>
              <div className="h-ch"><b className="mono">{hN(C)}</b><span>{capD < 1 ? 'deals/mes · techo del SDR' : p.stages === 3 ? 'cualificadas = deals' : 'cualificadas/mes'}</span></div>
              {p.stages === 4 && <div className="h-ch-op">×{hP(p.dealRate, 0)}</div>}
              {p.stages === 4 && <div className="h-ch"><b className="mono">{hN(DE)}</b><span>deals/mes</span></div>}
              <div className="h-ch-op">×{hP(wAvg, 1)}</div>
              <div className="h-ch accent"><b className="mono">{h1(CL)}</b><span>clientes/mes</span></div>
              <div className="h-ch-op">=</div>
              <div className="h-ch"><b className="mono">{hP(e2e, 2)}</b><span>de punta a punta</span></div>
            </div>
            <div className="h-ch-f">
              {p.stages === 3
                ? capD < 1
                  ? <>Dos saltos, pero el que manda es el techo del SDR: {hN(L)} × {hP(p.discRate, 0)} darían {hN(L * p.discRate)} deals y el equipo solo puede abrir <b>{hN(C)}</b> ({capPlan.blocks.map(b => b.cap.dealsPerSdr + ' en ' + b.tier.label).join(', ')}). De ahí × {hP(wAvg, 1)} de cierre = {h1(CL)} clientes al mes.</>
                  : <>Dos saltos: el lead se convierte en deal y el deal en cliente. {hN(L)} × {hP(p.discRate, 0)} = {hN(C)} deals, × {hP(wAvg, 1)} de cierre = {h1(CL)} clientes al mes.</>
                : <>Tres saltos encadenados, y ahí está la trampa: {hP(p.discRate, 0)} × {hP(p.dealRate, 0)} × {hP(p.winRate, 0)} no es {hP(p.discRate, 0)}, es {hP(e2e, 2)}. Cada etapa extra al {hP(p.dealRate, 0)} divide el resultado por {h1(1 / p.dealRate)}.</>}
              {' '}Los primeros meses no dan esta cifra: la rampa de madurez sube mes a mes de {hP(p.ramp[0], 0)} a {hP(p.ramp[1], 0)} en vez de saltar en enero, el cierre de cada cohorte se reparte en cinco meses alrededor del ciclo de {p.cycleMonths} meses, y la prima de encaje arranca en ×{h1(p.qualityPremium)} porque se trabajan primero las listas de mayor probabilidad y decae al consumirse. De ahí que septiembre firme {h1(capPlan.totalRows[0].cli)} y no {h1(CL)}.
            </div>
          </div>
        );
      })()}

      {/* ===== BLOQUES POR TIER ===== */}
      {engine === 'cap' ? capPlan.blocks.map(b => (
        <section className="h-block" key={b.tier.id} style={{'--c': b.tier.color}}>
          <div className="h-bh">
            <span className="h-chip">{b.label}</span>
            <span className="h-bh-d">{b.cap.sdr} SDR × {hN(p.leadsPerSdrMonth)} = {hN(b.leadsCap)} leads/mes · {b.cap.ae} AE × {hN(p.dealsPerAeMonth)} = {hN(b.dealsCap)} deals/mes de capacidad · parte de {hN(b.rows[0].cumAllCli)} clientes y llega a {hN(b.endAllCli)}</span>
            <span className="h-bh-k mono">{hN(b.totDeals + b.totPDeals + b.totFuDeals)} deals · {hN(b.totCli + b.totPCli + b.totFuCli)} clientes · {hP((b.totPCli + b.totFuCli) / Math.max(1e-9, b.totCli + b.totPCli + b.totFuCli), 0)} de canales indirectos</span>
          </div>
          <div className="h-scroll">
            <table className="h-table">
              <thead><tr>
                <th className="h-rl">{b.label}</th>
                {months.map((mo, i) => <th key={i} className={mo.m === 12 ? 'h-yr' : ''}>{mo.label}</th>)}
              </tr></thead>
              <tbody>
                <Row label="Empresas" sub="universo del tramo" get={() => b.st.universo} fmt={hK}/>
                <Row label="Sin tocar" sub="empresas que no se han prospectado nunca" get={i => b.rows[i].untouched} fmt={hK}/>
                <Row label="Prospectadas" sub="empresas únicas · penetración" get={i => b.rows[i].cumPros} pen={i => b.rows[i].penPros}/>
                {b.passes > 1 && <Row label="Retoques" sub="leads repetidos sobre empresas ya tocadas" get={i => b.rows[i].retouch} fmt={hK}/>}
                {p.stages === 4 && <Row label="Cualificadas" sub="acumulado · penetración" get={i => b.rows[i].cumCual} pen={i => b.rows[i].penCual}/>}
                <Row label="Deals" sub="acumulados · todos los canales" get={i => b.rows[i].cumAllDeals} pen={i => b.rows[i].cumAllDeals / b.st.universo}/>
                <Row label="Clientes" sub="acumulado · todos los canales" get={i => b.rows[i].cumAllCli} pen={i => b.rows[i].penAllCli} strong/>
                <Chan label="Canal 1 · Outbound" note="lista fría trabajada por el SDR" tone="out"/>
                <Row label="Leads del mes" sub={'capacidad ' + hN(b.leadsCap) + ' · nuevos + retoques'} get={i => b.rows[i].leads} gap={i => b.rows[i].again > 0.01}/>
                {p.stages === 4 && <Row label="Cualificadas nuevas" sub={'del mes · ' + hP(p.discRate, 0) + ' del lead'} get={i => b.rows[i].cual}/>}
                <Row label="Deals nuevos" sub={'del mes · ' + (p.stages === 3 ? hP(p.discRate, 0) + ' del lead' : hP(p.dealRate, 0) + ' de la cualificada')} get={i => b.rows[i].deals} gap={i => b.rows[i].dealsLost > b.rows[i].deals * 0.02}/>
                <Row label="Clientes nuevos" sub={'outbound · ' + hP(window.gtmWin(p, b.tier.id, 'out'), 1) + ' del deal'} get={i => b.rows[i].cli} fmt={h1}/>

                <Chan label="Equipo y capacidad" note={b.em && !b.em.usesAe ? 'la plantilla sirve a los canales 1 a 3; el embedded no consume AE' : 'la plantilla sirve a los tres canales'} tone="cap"/>
                <Row label="SDR" sub={'contratados · ' + hN(p.leadsPerSdrMonth) + ' leads/mes cada uno'} get={() => b.cap.sdr} cap/>
                <Row label="Deals por SDR y mes" sub={'techo ' + b.cap.dealsPerSdr} get={i => b.cap.sdr ? b.rows[i].deals / b.cap.sdr : null} fmt={h1} cap gap={i => b.rows[i].sdrCapped > b.rows[i].dealsRaw * 0.02}/>
                <Row label="AE" sub={'contratados · ' + hN(p.dealsPerAeMonth) + ' deals/mes de capacidad'} get={() => b.cap.ae} cap/>
                <Row label="Deals por AE y mes" sub={p.partnerUsesAe ? 'carga real · outbound + partners' : 'carga real · solo outbound'} get={i => b.cap.ae ? b.rows[i].aeLoad / b.cap.ae : null} fmt={h1} cap gap={i => b.rows[i].dealsLost > 1}/>
                <Row label="Clientes por AE y mes" sub="lo que cierra cada AE, los dos canales" get={i => b.cap.ae ? b.rows[i].allCli / b.cap.ae : null} fmt={h1} cap/>
                {b.pa && <Chan label="Canal 2 · Partners y brokers" note="deal cualificado por el broker, cierra en el mes" tone="part"/>}
                {b.pa && <Row label="Deals de partners" sub={'del mes · ' + b.pa.startDeals + ' a ' + b.pa.targetDeals + ' hasta nov-26, luego +' + hP(b.pa.growth, 0) + ' al mes'} get={i => b.rows[i].pDeals} fmt={h1}/>}
                {b.pa && <Row label="Deals de partners acumulados" sub="del canal indirecto" get={i => b.rows[i].cumPDeal} fmt={hN}/>}
                {b.pa && <Row label="Clientes de partners" sub={'del mes · ' + hP(window.gtmWin(p, b.tier.id, 'part'), 1) + ' y cierre en el mismo mes'} get={i => b.rows[i].pCli} fmt={h1}/>}
                <Chan label="Canal 3 · Contactos" note="ya nos conocen: deal perdido o churn, lo trabaja el AE" tone="cont"/>
                <Row label="Contactos en cartera" sub="discovery hecho y deal perdido, más churn" get={i => b.rows[i].contactPool} fmt={hN}/>
                <Row label="Follow ups del mes" sub={hP(p.contacts.followUpShare, 0) + ' de la cartera'} get={i => b.rows[i].fuDone} fmt={hN}/>
                <Row label="Deals de contactos" sub={'del mes · ' + hP(p.contacts.dealRate, 0) + ' del follow up'} get={i => b.rows[i].fuDeals} fmt={h1} gap={i => b.rows[i].fuDeals < b.rows[i].fuDealsWanted * 0.98}/>
                <Row label="Clientes de contactos" sub={'del mes · ' + hP(p.contacts.winRate, 0) + ', ya hubo discovery'} get={i => b.rows[i].fuCli} fmt={h1}/>
                {b.em && <Chan label="Canal 4 · Tech / embedded" note={b.em.partner + ': el deal nace dentro del producto del partner'} tone="emb"/>}
                {b.em && <Row label="Deals embedded" sub={'del mes · ' + b.em.startDeals + ' a ' + b.em.targetDeals + ' hasta dic-26, luego +' + hP(b.em.growth, 0) + ' al mes'} get={i => b.rows[i].eDeals} fmt={h1}/>}
                {b.em && <Row label="Clientes embedded" sub={'del mes · ' + b.em.startCli + ' a ' + b.em.targetCli + ', los reporta el partner'} get={i => b.rows[i].eCli} fmt={h1}/>}
                {b.em && <Row label="Cierre implícito" sub="clientes sobre deals del canal" get={i => b.rows[i].eDeals ? b.rows[i].eCli / b.rows[i].eDeals : null} fmt={v => v == null ? '—' : hP(v, 0)}/>}
                <Row label="Clientes nuevos totales" sub="todos los canales" get={i => b.rows[i].allCli} fmt={h1} strong sep/>
              </tbody>
            </table>
          </div>
          <div className="h-bn">
            <span className={'h-use ' + (b.aeUse < 0.5 ? 'low' : '')}>AE al {hP(b.aeUse, 0)} de capacidad</span>
            <span className={'h-use ' + (b.sdrUse < 0.95 ? 'low' : '')}>SDR al {hP(b.sdrUse, 0)}</span>
            {b.sdrCapped > 1 && <>El techo de {b.cap.dealsPerSdr} deals por SDR y mes recorta <b>{hN(b.sdrCapped)} deals</b> que la lista habría dado: la restricción es lo que un SDR puede trabajar, no la calidad del lead. </>}
            {b.aeUse < 0.5 && <>Los {b.cap.ae} AE tienen <b>{hN(b.aeIdle)} deals</b> de capacidad sin usar en los {months.length} meses: sobra equipo de cierre y falta arriba del embudo. </>}
            {b.dealsLost > 1 && <>Se quedan <b>{hN(b.dealsLost)} deals</b> sin atender por capacidad de AE. </>}
            {b.passes > 1 && <>El universo se agota en {months[b.exhaustedAt].label} y a partir de ahí los SDR repiten sobre empresas ya tocadas, con la eficacia al {hP(p.retouch, 0)}.</>}
          </div>
        </section>
      )) : plan.blocks.map(b => (
        <section className="h-block" key={b.tier.id} style={{'--c': b.tier.color}}>
          <div className="h-bh">
            <span className="h-chip">{b.label}</span>
            <span className="h-bh-d">{hN(b.universo)} empresas · {hP(b.share, 0)} del objetivo · parte de {hN(b.start.cliente)} clientes y llega a {hN(b.rows[b.rows.length - 1].cumCli)}</span>
            <span className="h-bh-k mono">pico {Math.ceil(b.peak.sdr)} SDR · {Math.ceil(b.peak.ae)} AE</span>
          </div>
          <div className="h-scroll">
            <table className="h-table">
              <thead><tr>
                <th className="h-rl">{b.label}</th>
                {months.map((mo, i) => <th key={i} className={mo.m === 12 ? 'h-yr' : ''}>{mo.label}</th>)}
              </tr></thead>
              <tbody>
                <Row label="Empresas" sub="universo del tramo" get={() => b.universo} fmt={hK}/>
                <Row label="Prospectadas" sub="acumulado · penetración" get={i => b.rows[i].cumPros} pen={i => b.rows[i].penPros}/>
                <Row label="Cualificadas" sub="acumulado · penetración" get={i => b.rows[i].cumCual} pen={i => b.rows[i].penCual}/>
                <Row label="Deals" sub="abiertos en cartera" get={i => b.rows[i].pipe}/>
                <Row label="Clientes" sub="acumulado · todos los canales" get={i => b.rows[i].cumAllCli} pen={i => b.rows[i].penAllCli} strong/>
                <Row label="Leads nuevos" sub="a trabajar en el mes" get={i => b.rows[i].pros} sep/>
                <Row label="Cualificadas nuevas" sub={'del mes · ' + hP(p.discRate, 0) + ' del lead'} get={i => b.rows[i].cual}/>
                <Row label="Deals nuevos" sub="a abrir en el mes" get={i => b.rows[i].dealsOpen}/>
                <Row label="Clientes nuevos" sub="firmados en el mes" get={i => b.rows[i].cli} fmt={h1} strong/>
                <Row label="SDR necesarios" sub={'a ' + hN(p.leadsPerSdrMonth) + ' leads/mes'} get={i => Math.ceil(b.rows[i].sdr)} cap sep/>
                <Row label="AE necesarios" sub={'a ' + hN(p.dealsPerAeMonth) + ' deals/mes'} get={i => Math.ceil(b.rows[i].ae)} cap/>
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* ===== CAPACIDAD AGREGADA ===== */}
      <section className="h-block h-total" style={{'--c': '#0B1220'}}>
        <div className="h-bh">
          <span className="h-chip">Equipo total</span>
          <span className="h-bh-d">{engine === 'cap'
            ? 'La plantilla está fija; lo que varía es el objetivo que sostiene. Comparado con el hito de BP mes a mes.'
            : 'Lo que se contrata es esto, no la suma de bloques leída por separado. Rojo cuando el mes pide más de la plantilla comprometida.'}</span>
          <span className="h-bh-k mono">{engine === 'cap'
            ? capPlan.sdr + ' SDR · ' + capPlan.ae + ' AE fijos'
            : 'pico ' + Math.ceil(plan.peak.sdr) + ' SDR · ' + Math.ceil(plan.peak.ae) + ' AE'}</span>
        </div>
        <div className="h-scroll">
          <table className="h-table">
            <thead><tr>
              <th className="h-rl">Equipo</th>
              {months.map((mo, i) => <th key={i} className={mo.m === 12 ? 'h-yr' : ''}>{mo.label}</th>)}
            </tr></thead>
            <tbody>
              {engine === 'cap' ? <>
                <Row label="Clientes" sub="acumulado · todos los canales" get={i => capPlan.totalRows[i].cumAllCli} strong/>
                <Row label="Hito de BP" sub="recta al hito de diciembre" get={i => capPlan.baseCli + (capPlan.milestone - capPlan.baseCli) * (i + 1) / months.length} gap={i => capPlan.totalRows[i].cumCli < capPlan.baseCli + (capPlan.milestone - capPlan.baseCli) * (i + 1) / months.length}/>
                <Chan label="Canal 1 · Outbound" note="lo que produce el equipo de SDR y AE" tone="out"/>
                <Row label="Leads nuevos" sub="del mes" get={i => capPlan.totalRows[i].leads}/>
                {p.stages === 4 && <Row label="Cualificadas nuevas" sub="del mes" get={i => capPlan.totalRows[i].cual}/>}
                <Row label="Deals nuevos" sub="del mes" get={i => capPlan.totalRows[i].deals}/>
                <Row label="Clientes nuevos" sub="outbound" get={i => capPlan.totalRows[i].cli} fmt={h1}/>

                <Chan label="Equipo y capacidad" note="la plantilla que se contrata, para los canales directos" tone="cap"/>
                <Row label="SDR" sub="plantilla fija" get={i => capPlan.totalRows[i].sdr} cap/>
                <Row label="Deals por SDR y mes" sub="lo que genera cada SDR" get={i => capPlan.totalRows[i].sdr ? capPlan.totalRows[i].deals / capPlan.totalRows[i].sdr : null} fmt={h1} cap/>
                <Row label="AE" sub="plantilla fija" get={i => capPlan.totalRows[i].ae} cap/>
                <Row label="Deals por AE y mes" sub={p.partnerUsesAe ? 'carga real · outbound + partners' : 'carga real · solo outbound'} get={i => capPlan.totalRows[i].ae ? capPlan.totalRows[i].allDeals / capPlan.totalRows[i].ae : null} fmt={h1} cap/>
                <Row label="Clientes por AE y mes" sub="lo que cierra cada AE, los dos canales" get={i => capPlan.totalRows[i].ae ? capPlan.totalRows[i].allCli / capPlan.totalRows[i].ae : null} fmt={h1} cap/>
                <Chan label="Canal 2 · Partners y brokers" note="prioridad sobre el outbound en la agenda del AE" tone="part"/>
                <Row label="Deals de partners" sub={p.partnerUsesAe ? 'del mes · ocupan AE con prioridad' : 'del mes · sin carga de AE'} get={i => capPlan.totalRows[i].pDeals} fmt={h1}/>
                <Row label="Clientes de partners" sub="cierre en el mismo mes" get={i => capPlan.totalRows[i].pCli} fmt={h1}/>
                <Chan label="Canal 3 · Contactos" note="cartera de perdidos y churn que reabre el AE" tone="cont"/>
                <Row label="Contactos en cartera" sub="deals perdidos y churn acumulados" get={i => capPlan.totalRows[i].contactPool} fmt={hN}/>
                <Row label="Follow ups del mes" sub="que hace el equipo de AE" get={i => capPlan.totalRows[i].fuDone} fmt={hN}/>
                <Row label="Deals de contactos" sub="reabiertos en el mes" get={i => capPlan.totalRows[i].fuDeals} fmt={h1}/>
                <Row label="Clientes de contactos" sub="cierre del canal" get={i => capPlan.totalRows[i].fuCli} fmt={h1}/>
                {capPlan.totEDeals > 0 && <Chan label="Canal 4 · Tech / embedded" note="integrado en el producto del partner, sin coste de plantilla" tone="emb"/>}
                {capPlan.totEDeals > 0 && <Row label="Deals embedded" sub="del mes" get={i => capPlan.totalRows[i].eDeals} fmt={h1}/>}
                {capPlan.totEDeals > 0 && <Row label="Clientes embedded" sub="del mes" get={i => capPlan.totalRows[i].eCli} fmt={h1}/>}
                <Row label="Clientes nuevos totales" sub="todos los canales" get={i => capPlan.totalRows[i].allCli} fmt={h1} strong sep/>
              </> : <>
                <Row label="Clientes" sub="acumulado del plan" get={i => plan.totalRows[i].cumCli} strong/>
                <Row label="Leads nuevos" sub="a trabajar en el mes" get={i => plan.totalRows[i].pros} sep/>
                <Row label="Cualificadas nuevas" sub="reuniones del mes" get={i => plan.totalRows[i].cual}/>
                <Row label="Deals nuevos" sub="a abrir en el mes" get={i => plan.totalRows[i].dealsOpen}/>
                <Row label="Clientes nuevos" sub="firmados en el mes" get={i => plan.totalRows[i].cli} fmt={h1} strong/>
                <Row label="SDR necesarios" sub={'a ' + hN(p.leadsPerSdrMonth) + '/mes'} get={i => Math.ceil(plan.totalRows[i].sdr)} cap sep gap={i => Math.ceil(plan.totalRows[i].sdr) > capPlan.sdr}/>
                <Row label="AE necesarios" sub={'a ' + hN(p.dealsPerAeMonth) + '/mes'} get={i => Math.ceil(plan.totalRows[i].ae)} cap gap={i => Math.ceil(plan.totalRows[i].ae) > capPlan.ae}/>
              </>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="h-foot">
        El universo de cada tier sale del motor AEAT de la pestaña Mercado y el punto de partida del embudo es el estado actual del modelo.
        El hito de diciembre de 2027 es el {hP((window.GTM_BP_SHAPE.find(s => s.year === 2027) || {}).cum, 0)} del compromiso de 2029: es el año bisagra, el último con universo virgen.
        Las tasas son las exigidas por el objetivo, no las de hoy: si se quedan en las actuales, este plan no se cumple con ninguna plantilla razonable, y eso se ve en el unicorn plan.
        El SDR se dimensiona sobre leads nuevos del mes y el AE sobre deals nuevos del mes, porque el AE es AE puro y no lleva la prospección.
        En modo capacidad la plantilla es el dato: {capPlan.sdr} SDR y {capPlan.ae} AE reparten {hN(capPlan.sdr * p.leadsPerSdrMonth)} leads y {hN(capPlan.ae * p.dealsPerAeMonth)} deals de capacidad al mes, y la rampa de madurez castiga los primeros meses.
      </div>
    </div>
  );
};
