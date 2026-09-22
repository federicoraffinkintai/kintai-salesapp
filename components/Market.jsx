// Market Intelligence: universo AEAT → tiers Kintai → penetración de embudo
const { useState, useMemo } = React;

const miNum = (v) => {
  if (v == null || isNaN(v)) return '—';
  if (v > 0 && v < 0.5) return '<1';
  const n = Math.round(v);
  return String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.').replace(/^/, n < 0 ? '-' : '');
};
const miPct = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 2 : d).replace('.', ',') + '%';
const miCompact = (v) => {
  if (v == null || isNaN(v)) return '—';
  if (v >= 1e6) return (v / 1e6).toFixed(2).replace('.', ',') + 'M';
  if (v >= 1e4) return miNum(v / 1e3) + 'k';
  return miNum(v);
};
const miEur = (v) => {
  if (v == null) return '∞';
  if (v >= 1e9) return miNum(v / 1e9) + '.000M€';
  if (v >= 1e6) return miNum(v / 1e6) + 'M€';
  if (v >= 1e3) return miNum(v / 1e3) + 'k€';
  return miNum(v) + '€';
};

window.MarketIntel = function MarketIntel() {
  const [methodId, setMethodId] = useState('log');
  const [year, setYear] = useState(2022);
  const [driftId, setDriftId] = useState('d3');
  const [dim, setDim] = useState('sector');
  const [metric, setMetric] = useState('cliente');
  const [funnelMode, setFunnelMode] = useState('abs');
  const [openFinding, setOpenFinding] = useState('m1');
  const [showGrid, setShowGrid] = useState(false);
  const [terrMode, setTerrMode] = useState('abs');

  const method = window.MKT_METHODS.find(m => m.id === methodId);
  const drift = window.MKT_DRIFTS.find(d => d.id === driftId);
  const opts = useMemo(() => ({ method: methodId, year, drift: drift.v }), [methodId, year, drift]);
  const yf = window.mktYearFactors(year, drift.v);
  const projected = year > window.MKT_META.year;

  const uni = useMemo(() => window.mktUniverse(opts), [opts]);
  const funnel = useMemo(() => window.mktFunnel(opts), [opts]);
  const estados = useMemo(() => window.mktEstados(funnel), [funnel]);
  const uni2022 = useMemo(() => window.mktUniverse({ ...opts, year: 2022 }), [methodId]);

  const stageOf = (m) => m === 'contactabilidad' ? 'contactado' : m;
  const bd = useMemo(() => window.mktBreakdown(funnel, dim, stageOf(metric), opts), [funnel, dim, metric, opts]);
  const bdBase = useMemo(() => window.mktBreakdown(funnel, dim, metric === 'contactabilidad' ? 'impactado' : 'universo', opts), [funnel, dim, metric, opts]);

  const tiers = window.MKT_TIERS;
  const totalUni = tiers.reduce((a, t) => a + uni[t.id], 0);
  const focoUni = tiers.filter(t => t.focus).reduce((a, t) => a + uni[t.id], 0);
  const focoCli = tiers.filter(t => t.focus).reduce((a, t) => a + funnel[t.id].cliente, 0);
  const focoObj = tiers.filter(t => t.focus).reduce((a, t) => a + t.targetClients, 0);

  const METRICS = [
    { id:'cliente', label:'Clientes', rel:'universo' },
    { id:'deal', label:'Deals abiertos', rel:'universo' },
    { id:'contactado', label:'Contactados', rel:'universo' },
    { id:'impactado', label:'Impactados', rel:'universo' },
    { id:'cualificado', label:'Cualificados', rel:'universo' },
    { id:'contactabilidad', label:'Contactabilidad', rel:'impactado' },
  ];
  const met = METRICS.find(m => m.id === metric);

  const cell = (tierId, catId) => {
    const v = bd.data[tierId][catId], base = bdBase.data[tierId][catId];
    return { v, base, r: base ? v / base : 0 };
  };
  const maxRatio = useMemo(() => {
    let m = 0;
    for (const t of tiers) for (const c of bd.cats) m = Math.max(m, cell(t.id, c.id).r);
    return m;
  }, [bd, bdBase]);

  const gaps = tiers.filter(t => t.focus).map(t => {
    const s = funnel[t.id];
    const items = [
      { id:'bd', label:'Cobertura de base de datos', v: s.en_bd / s.universo, target:0.95,
        miss:(0.95 - s.en_bd / s.universo) * s.universo, unit:'empresas sin ficha' },
      { id:'imp', label:'Impacto sobre cualificado', v: s.impactado / s.cualificado, target:0.80,
        miss:(0.80 - s.impactado / s.cualificado) * s.cualificado, unit:'cualificadas sin tocar' },
      { id:'con', label:'Contactabilidad', v: s.contactado / s.impactado, target:0.45,
        miss:(0.45 - s.contactado / s.impactado) * s.impactado, unit:'impactos sin conversación' },
    ];
    items.sort((a, b) => (b.target - b.v) / b.target - (a.target - a.v) / a.target);
    return { tier:t, items };
  });

  const sevLabel = { ok:'Validado', warn:'Revisar', bad:'Error', info:'Método' };
  const bounds = window.MKT_BOUNDS;

  return (
    <div className="mi" data-screen-label="06 Market Intelligence">
      <div className="mi-head">
        <div>
          <h1 className="mi-h1">Market intelligence</h1>
          <div className="mi-sub">Todas las sociedades españolas por tramo de facturación, mapeadas a los tiers de Kintai, con la penetración de cada etapa del embudo encima. Tres tablas de la AEAT bajadas enteras; lo que se aproxima está marcado.</div>
        </div>
        <div className="mi-src">
          <div className="mi-src-row"><span>Fuente</span><b>{window.MKT_META.name}</b></div>
          <div className="mi-src-row"><span>Ejercicio</span><b>{window.MKT_META.year} · último publicado</b></div>
          <div className="mi-src-row"><span>Variable</span><b>{window.MKT_META.variable}</b></div>
          <div className="mi-src-row"><span>Tablas</span><b>
            <a href={window.MKT_META.urls.cifra} target="_blank" rel="noopener">Cifra de negocios</a> ·{' '}
            <a href={window.MKT_META.urls.sectores} target="_blank" rel="noopener">Sectores</a> ·{' '}
            <a href={window.MKT_META.urls.evolutiva} target="_blank" rel="noopener">Evolutiva</a> ·{' '}
            <a href={window.MKT_CCAA_URL} target="_blank" rel="noopener">Comunidades</a>
          </b></div>
          <div className="mi-src-row"><span>Consultada</span><b>{window.MKT_META.fetched} · {miNum(window.MKT_META.total)} sociedades</b></div>
          <div className="mi-src-row"><span>Identificación</span><b>{window.MKT_META.sabiName}</b></div>
        </div>
      </div>

      {/* ===== BARRA DE SUPUESTOS ===== */}
      <div className="mi-assump">
        <div className="mi-as">
          <label>Año de análisis</label>
          <div className="mi-toggle">
            {[2022, 2023, 2024, 2025, 2026].map(y => (
              <button key={y} className={year === y ? 'on' : ''} onClick={() => setYear(y)}>{y}</button>
            ))}
          </div>
          <div className="mi-as-note">{projected
            ? `Proyectado: censo ×${yf.census.toFixed(3).replace('.', ',')} y facturación nominal ×${yf.deflate.toFixed(3).replace('.', ',')} sobre ${window.MKT_META.year}.`
            : 'Datos publicados, sin proyectar.'}</div>
        </div>
        <div className="mi-as">
          <label>Deriva nominal anual</label>
          <div className="mi-toggle">
            {window.MKT_DRIFTS.map(d => (
              <button key={d.id} className={driftId === d.id ? 'on' : ''} onClick={() => setDriftId(d.id)} disabled={!projected} title={d.desc}>{d.label}</button>
            ))}
          </div>
          <div className="mi-as-note">{projected ? drift.desc : 'Solo aplica a años proyectados.'}</div>
        </div>
        <div className="mi-as">
          <label>Al partir un tramo</label>
          <div className="mi-toggle">
            {window.MKT_METHODS.map(m => (
              <button key={m.id} className={methodId === m.id ? 'on' : ''} onClick={() => setMethodId(m.id)} title={m.desc}>{m.label}</button>
            ))}
          </div>
          <div className="mi-as-note">{method.desc}</div>
        </div>
      </div>

      <div className="mi-kpis">
        <div className="mi-kpi"><div className="mi-kpi-n">{miCompact(totalUni)}</div><div className="mi-kpi-l">Sociedades con facturación positiva</div></div>
        <div className="mi-kpi"><div className="mi-kpi-n">{miCompact(focoUni)}</div><div className="mi-kpi-l">En los dos tiers de foco · 6M a 180M€</div></div>
        <div className="mi-kpi"><div className="mi-kpi-n">{miNum(focoCli)}</div><div className="mi-kpi-l">Clientes en foco</div></div>
        <div className="mi-kpi accent"><div className="mi-kpi-n">{miPct(focoCli / focoUni, 3)}</div><div className="mi-kpi-l">Penetración en foco · objetivo {miPct(focoObj / focoUni, 2)}</div></div>
      </div>

      {/* ===== 1. MAPEO ===== */}
      <section className="mi-sec">
        <div className="mi-sec-head">
          <h2 className="mi-sec-title">Mapeo de la rejilla AEAT a los tiers Kintai</h2>
          <span className="mi-sec-hint">Seis tramos de tamaño, del micro al corporate. Qué fronteras son cortes publicados y cuáles hay que aproximar.</span>
          <button className="mi-link" onClick={() => setShowGrid(!showGrid)}>{showGrid ? 'Ocultar' : 'Ver'} los {window.AEAT_TRAMOS.length} tramos publicados</button>
        </div>

        <table className="mi-table mi-map">
          <thead><tr>
            <th>Tier Kintai</th><th>Rango</th><th className="num">Empresas {year}</th>
            <th>Tramos AEAT que lo componen</th><th>Frontera baja</th><th>Frontera alta</th>
          </tr></thead>
          <tbody>
            {tiers.map(t => {
              const [lo, hi] = bounds[t.id];
              const parts = window.MKT_MARKET_TRAMOS.filter(tr => tr.max > lo / yf.deflate && tr.min < (hi == null ? Infinity : hi / yf.deflate));
              const loEx = window.mktIsExactBound(lo / yf.deflate);
              const hiEx = window.mktIsExactBound(hi == null ? null : hi / yf.deflate);
              return (
                <tr key={t.id} className={t.focus ? 'mi-row-foco' : ''}>
                  <td><span className="mi-tierchip" style={{'--c': t.color}}>{t.label}</span>{t.focus && <span className="mi-foco">Foco</span>}</td>
                  <td className="mono">{miEur(lo)} – {miEur(hi)}</td>
                  <td className="num mono strong">{miNum(uni[t.id])}</td>
                  <td className="mi-parts">{parts.map(p => (
                    <span key={p.id} className={`mi-part ${p.min < lo / yf.deflate || p.max > (hi == null ? Infinity : hi / yf.deflate) ? 'cut' : ''}`}>
                      {p.label}<em>{miNum(p.n)}</em>
                    </span>
                  ))}</td>
                  <td><span className={`mi-exact ${loEx ? 'yes' : 'no'}`}>{loEx ? 'Exacta' : 'Aproximada'}</span></td>
                  <td><span className={`mi-exact ${hiEx ? 'yes' : 'no'}`}>{hiEx ? 'Exacta' : 'Aproximada'}</span></td>
                </tr>
              );
            })}
            <tr className="mi-row-total">
              <td colSpan="2">Universo comercial</td>
              <td className="num mono">{miNum(totalUni)}</td>
              <td colSpan="3">Más {miNum(window.MKT_NO_ACTIVIDAD.n)} sociedades con {window.MKT_NO_ACTIVIDAD.label.toLowerCase()}, que no son mercado: {miNum(window.MKT_META.total)} en total. El tramo con borde discontinuo se parte porque la frontera de 180M cae dentro.</td>
            </tr>
          </tbody>
        </table>

        {showGrid && (
          <table className="mi-table mi-grid">
            <thead><tr><th>Tramo de cifra de negocios</th><th className="num">Empresas</th><th className="num">% acumulado</th><th>Tier Kintai {year}</th></tr></thead>
            <tbody>
              {(() => { let acc = 0; const mkt = 1116072; return window.AEAT_TRAMOS.map(tr => {
                if (tr.market) acc += tr.n;
                const owners = tr.market ? tiers.filter(t => {
                  const [loB, hiB] = bounds[t.id];
                  return tr.max > loB / yf.deflate && tr.min < (hiB == null ? Infinity : hiB / yf.deflate);
                }) : [];
                return (
                  <tr key={tr.id} className={!tr.market ? 'mi-row-out' : ''}>
                    <td className="mi-tramo">{tr.label}{tr.note && <span className="mi-note">{tr.note}</span>}</td>
                    <td className="num mono">{miNum(tr.n)}</td>
                    <td className="num mono muted">{tr.market ? miPct(acc / mkt, 1) : '—'}</td>
                    <td>{!tr.market
                      ? <span className="mi-out">Sin actividad · fuera del universo</span>
                      : owners.map(o => <span key={o.id} className="mi-tierchip" style={{'--c': o.color}}>{o.label}</span>)}</td>
                  </tr>
                );
              }); })()}
            </tbody>
          </table>
        )}

        <div className="mi-findings">
          {window.MKT_FINDINGS.map(f => (
            <div key={f.id} className={`mi-finding sev-${f.sev} ${openFinding === f.id ? 'open' : ''}`}>
              <button className="mi-finding-h" onClick={() => setOpenFinding(openFinding === f.id ? null : f.id)}>
                <span className={`mi-sev sev-${f.sev}`}>{sevLabel[f.sev]}</span>
                <span className="mi-finding-t">{f.title}</span>
                <span className="mi-finding-x">{openFinding === f.id ? '−' : '+'}</span>
              </button>
              {openFinding === f.id && <div className="mi-finding-b">{f.body}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ===== 2. TIERS ===== */}
      <section className="mi-sec">
        <div className="mi-sec-head">
          <h2 className="mi-sec-title">Los seis tramos de tamaño en {year}</h2>
          <span className="mi-sec-hint">Universo, cobertura, clientes y distancia al objetivo</span>
        </div>
        <div className="mi-tiers six">
          {tiers.map(t => {
            const s = funnel[t.id], pen = s.cliente / s.universo, obj = t.targetClients / s.universo;
            const cov = window.SABI_COVERAGE[t.id];
            const [lo, hi] = bounds[t.id];
            const drift2022 = uni2022[t.id] ? (s.universo - uni2022[t.id]) / uni2022[t.id] : 0;
            return (
              <div key={t.id} className={`mi-tier ${t.focus ? 'foco' : ''}`} style={{'--c': t.color}}>
                <div className="mi-tier-top">
                  <div>
                    <div className="mi-tier-name">{t.label}</div>
                    <div className="mi-tier-range mono">{miEur(lo)} – {miEur(hi)}</div>
                  </div>
                  {t.focus ? <span className="mi-foco">Foco</span> : <span className="mi-nofoco">No foco</span>}
                </div>
                <div className="mi-tier-uni mono">{miNum(s.universo)}</div>
                <div className="mi-tier-unil">
                  empresas en el rango
                  {projected && <span className={`mi-drift ${drift2022 > 0 ? 'up' : 'down'}`}>{drift2022 > 0 ? '+' : ''}{miPct(drift2022, 1)} vs {window.MKT_META.year}</span>}
                </div>
                <dl className="mi-tier-dl">
                  <div><dt>En SABI</dt><dd className="mono">{miNum(s.en_bd)} <em>{miPct(s.en_bd / s.universo, 1)}{cov.count == null ? <span className="mi-est" title={cov.note}>tasa supuesta</span> : <span className="mi-meas" title={cov.note}>recuento</span>}</em></dd></div>
                  <div><dt>Cualificadas</dt><dd className="mono">{miNum(s.cualificado)} <em>{miPct(s.cualificado / s.universo, 1)}</em></dd></div>
                  <div><dt>Impactadas</dt><dd className="mono">{miNum(s.impactado)} <em>{miPct(s.impactado / s.cualificado, 0)} del cualif.</em></dd></div>
                  <div><dt>Clientes</dt><dd className="mono strong">{miNum(s.cliente)}</dd></div>
                </dl>
                <div className="mi-tier-pen">
                  <div className="mi-penbar"><div className="mi-penbar-fill" style={{width: obj ? Math.min(100, (pen / obj) * 100) + '%' : '0%'}}/></div>
                  <div className="mi-penrow">
                    <span>Penetración <b className="mono">{miPct(pen, 3)}</b></span>
                    <span>Objetivo <b className="mono">{obj ? miPct(obj, 2) : '—'}</b></span>
                  </div>
                  <div className="mi-pengap">
                    {t.targetClients > 0
                      ? <>Faltan <b>{miNum(Math.max(0, t.targetClients - s.cliente))}</b> clientes · {miPct(pen / obj, 0)} del objetivo</>
                      : <>Sin objetivo de clientes asignado</>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 3. EMBUDO ===== */}
      <section className="mi-sec">
        <div className="mi-sec-head">
          <h2 className="mi-sec-title">Penetración del embudo</h2>
          <span className="mi-sec-hint">Cada etapa es subconjunto de la anterior</span>
          <div className="mi-toggle">
            {[['abs','Absolutos'],['step','% paso a paso'],['top','% del universo']].map(([k, l]) => (
              <button key={k} className={funnelMode === k ? 'on' : ''} onClick={() => setFunnelMode(k)}>{l}</button>
            ))}
          </div>
        </div>
        <table className="mi-table mi-funnel">
          <thead><tr>
            <th>Etapa</th>
            {tiers.map(t => <th key={t.id} className={`num ${t.focus ? 'foco' : ''}`}>{t.label}</th>)}
            <th className="num total">Total</th>
          </tr></thead>
          <tbody>
            {window.MKT_STAGES.map((st, i) => {
              const prev = window.MKT_STAGES[i - 1];
              const tot = tiers.reduce((a, t) => a + funnel[t.id][st.id], 0);
              const totPrev = prev ? tiers.reduce((a, t) => a + funnel[t.id][prev.id], 0) : null;
              const show = (id) => {
                const v = funnel[id][st.id];
                if (funnelMode === 'abs') return miNum(v);
                if (funnelMode === 'top') { const r = v / funnel[id].universo; return miPct(r, r < 0.001 ? 3 : 1); }
                return prev ? miPct(v / funnel[id][prev.id], 0) : '100%';
              };
              const showTot = () => {
                if (funnelMode === 'abs') return miNum(tot);
                if (funnelMode === 'top') { const r = tot / totalUni; return miPct(r, r < 0.001 ? 3 : 1); }
                return totPrev ? miPct(tot / totPrev, 0) : '100%';
              };
              return (
                <tr key={st.id} className={`mi-stage-${i}`}>
                  <td className="mi-stage">
                    <span className="mi-stage-i mono">{i}</span>
                    <span><b>{st.label}</b><em>{st.desc}</em></span>
                  </td>
                  {tiers.map(t => <td key={t.id} className={`num mono ${t.focus ? 'foco' : ''}`}>{show(t.id)}</td>)}
                  <td className="num mono total">{showTot()}</td>
                </tr>
              );
            })}
            <tr className="mi-row-total">
              <td>Contactabilidad · contactados sobre impactados</td>
              {tiers.map(t => <td key={t.id} className={`num mono ${t.focus ? 'foco' : ''}`}>{miPct(funnel[t.id].contactado / funnel[t.id].impactado, 0)}</td>)}
              <td className="num mono total">{miPct(tiers.reduce((a, t) => a + funnel[t.id].contactado, 0) / tiers.reduce((a, t) => a + funnel[t.id].impactado, 0), 0)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===== 4. ESTADO ===== */}
      <section className="mi-sec">
        <div className="mi-sec-head">
          <h2 className="mi-sec-title">Estado actual del mercado</h2>
          <span className="mi-sec-hint">Cada empresa en un solo estado. La banda de la derecha amplía la parte trabajada.</span>
        </div>
        <div className="mi-legend">
          {window.MKT_ESTADOS.map(e => <span key={e.id}><i style={{background: e.color}}/>{e.label}</span>)}
        </div>
        <div className="mi-estados">
          {tiers.map(t => {
            const e = estados[t.id], tot = uni[t.id];
            const worked = e.cliente + e.deal + e.activa + e.nurturing + e.impactado;
            return (
              <div key={t.id} className="mi-est-row">
                <div className="mi-est-name"><b>{t.label}</b><em className="mono">{miCompact(tot)}</em></div>
                <div className="mi-est-bar">
                  {window.MKT_ESTADOS.map(st => {
                    const w = e[st.id] / tot * 100;
                    if (w <= 0) return null;
                    return <div key={st.id} style={{width: w + '%', background: st.color}} title={`${st.label}: ${miNum(e[st.id])} · ${miPct(e[st.id] / tot, 2)}`}/>;
                  })}
                </div>
                <div className="mi-est-zoom">
                  <div className="mi-est-zoomlab mono">trabajado {miPct(worked / tot, 1)}</div>
                  <div className="mi-est-bar zoom">
                    {['cliente','deal','activa','nurturing','impactado'].map(id => {
                      const st = window.MKT_ESTADOS.find(x => x.id === id);
                      const w = worked ? e[id] / worked * 100 : 0;
                      if (w <= 0) return null;
                      return <div key={id} style={{width: w + '%', background: st.color}} title={`${st.label}: ${miNum(e[id])}`}/>;
                    })}
                  </div>
                  <div className="mi-est-nums mono">
                    <span>{miNum(e.cliente)} cli</span><span>{miNum(e.deal)} deal</span>
                    <span>{miNum(e.activa)} activa</span><span>{miNum(e.nurturing)} nurt.</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 5. MATRIZ ===== */}
      <section className="mi-sec">
        <div className="mi-sec-head">
          <h2 className="mi-sec-title">Penetración por segmento</h2>
          <span className="mi-sec-hint">Color = tasa sobre su base. Número grande = cuenta.</span>
        </div>
        <div className="mi-controls">
          <div className="mi-ctrl">
            <label>Cortar por</label>
            <div className="mi-toggle">
              {window.MKT_DIMS.map(d => <button key={d.id} className={dim === d.id ? 'on' : ''} onClick={() => setDim(d.id)} title={d.src}>{d.label}</button>)}
            </div>
          </div>
          <div className="mi-ctrl">
            <label>Métrica</label>
            <div className="mi-toggle">
              {METRICS.map(m => <button key={m.id} className={metric === m.id ? 'on' : ''} onClick={() => setMetric(m.id)}>{m.label}</button>)}
            </div>
          </div>
        </div>
        <table className="mi-table mi-matrix">
          <thead><tr>
            <th>{window.MKT_DIMS.find(d => d.id === dim).label}</th>
            {tiers.map(t => <th key={t.id} className={`num ${t.focus ? 'foco' : ''}`}>{t.label}</th>)}
            <th className="num total">Total</th>
          </tr></thead>
          <tbody>
            {bd.cats.map(cat => {
              const rowV = tiers.reduce((a, t) => a + bd.data[t.id][cat.id], 0);
              const rowB = tiers.reduce((a, t) => a + bdBase.data[t.id][cat.id], 0);
              const rr = rowB ? rowV / rowB : 0;
              return (
                <tr key={cat.id}>
                  <td className="mi-cat"><b>{cat.label}</b>{cat.desc && <em>{cat.desc}</em>}</td>
                  {tiers.map(t => {
                    const c = cell(t.id, cat.id);
                    const a = maxRatio ? 0.05 + 0.45 * (c.r / maxRatio) : 0;
                    return (
                      <td key={t.id} className={`mi-cell ${t.focus ? 'foco' : ''}`} style={{background: `rgba(46,125,91,${a})`}} title={`${miNum(c.v)} de ${miNum(c.base)}`}>
                        <span className="mi-cell-n mono">{miNum(c.v)}</span>
                        <span className="mi-cell-r mono">{miPct(c.r, c.r < 0.01 ? 3 : 1)}</span>
                      </td>
                    );
                  })}
                  <td className="num total mono">{miNum(rowV)}<span className="mi-cell-r mono">{miPct(rr, rr < 0.01 ? 3 : 1)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mi-matrix-foot">
          {met.id === 'contactabilidad'
            ? 'Contactados sobre impactados: mide si la campaña llega a hablar con alguien, no si la lista era buena. '
            : `${met.label} sobre universo del tier. `}
          {dim === 'sector' && 'Los totales por sector y por tramo son cifras publicadas; el cruce se estima por raking, y el avance por el embudo aplica afinidad de producto, que es criterio Kintai. Ojo con Construcción y Actividades inmobiliarias: es el sector más numeroso de España pero está dominado por patrimoniales sin facturación.'}
          {dim === 'uso' && 'La taxonomía de casos de uso es provisional y la mezcla estimada: hay que cerrarla con ventas antes de que salga en un informe.'}
          {dim === 'segmento' && 'La mezcla de segmentos es una hipótesis de trabajo (1% AAA, 4% A, 30% B), más exigente en el tramo micro. Cuando el scoring corra sobre SABI esto se mide por tier en vez de suponerse.'}
        </div>
      </section>

      {/* ===== 5b. TERRITORIO ===== */}
      <section className="mi-sec">
        <div className="mi-sec-head">
          <h2 className="mi-sec-title">Estructura productiva por comunidad</h2>
          <span className="mi-sec-hint">Cuántas empresas de cada tamaño hay en cada comunidad, y cuánto pesa el foco sobre su censo</span>
          <div className="mi-toggle">
            {[['abs','Empresas'],['share','% del censo regional'],['idx','Índice vs España']].map(([k, l]) => (
              <button key={k} className={terrMode === k ? 'on' : ''} onClick={() => setTerrMode(k)}>{l}</button>
            ))}
          </div>
        </div>
        <table className="mi-table mi-terr">
          <thead><tr>
            <th>Comunidad</th><th className="num">Censo AEAT</th>
            {tiers.map(t => <th key={t.id} className={`num ${t.focus ? 'foco' : ''}`}>{t.label}</th>)}
            <th className="num total">Foco 6M–180M</th>
          </tr></thead>
          <tbody>
            {(() => {
              const byC = window.mktUniverseByCcaa(opts);
              const natFoco = focoUni / totalUni;
              const rows = window.AEAT_CCAA.filter(c => !c.foral).map(c => {
                const vals = {}; let censo = 0;
                for (const t of tiers) { vals[t.id] = byC[t.id][c.id] || 0; censo += vals[t.id]; }
                const foco = vals.big + vals.midmkt;
                return { c, vals, censo, foco, share: censo ? foco / censo : 0 };
              }).sort((a, b) => b.foco - a.foco);
              const maxIdx = Math.max(...rows.map(r => r.share / natFoco));
              return (
                <>
                  {rows.map(({ c, vals, censo, foco, share }) => (
                    <tr key={c.id}>
                      <td className="mi-terr-name">{c.label}</td>
                      <td className="num mono muted">{miNum(censo)}</td>
                      {tiers.map(t => (
                        <td key={t.id} className={`num mono ${t.focus ? 'foco' : ''}`}>
                          {terrMode === 'abs' ? miNum(vals[t.id])
                            : terrMode === 'share' ? miPct(censo ? vals[t.id] / censo : 0, 1)
                            : (() => { const nat = uni[t.id] / totalUni, reg = censo ? vals[t.id] / censo : 0; return nat ? (reg / nat).toFixed(2).replace('.', ',') : '—'; })()}
                        </td>
                      ))}
                      <td className="num total mono">
                        <span className="mi-terr-foco">{miNum(foco)}</span>
                        <span className="mi-cell-r mono">{miPct(share, 2)} · índice {(share / natFoco).toFixed(2).replace('.', ',')}</span>
                        <span className="mi-terr-bar"><i style={{width: Math.min(100, (share / natFoco) / maxIdx * 100) + '%'}}/></span>
                      </td>
                    </tr>
                  ))}
                  {window.AEAT_CCAA.filter(c => c.foral).map(c => (
                    <tr key={c.id} className="mi-row-out">
                      <td className="mi-terr-name">{c.label} <span className="mi-foral">Régimen foral</span></td>
                      <td className="num mono">{miNum(c.n)}</td>
                      <td colSpan={tiers.length + 1}>
                        Declara a la hacienda foral, no a la AEAT. Solo aparecen las sociedades que tributan al Estado, así que el censo no es comparable y queda fuera de todo ratio.
                      </td>
                    </tr>
                  ))}
                  <tr className="mi-row-total">
                    <td>España · sin territorios forales</td>
                    <td className="num mono">{miNum(rows.reduce((a, r) => a + r.censo, 0))}</td>
                    {tiers.map(t => <td key={t.id} className={`num mono ${t.focus ? 'foco' : ''}`}>{terrMode === 'abs' ? miNum(rows.reduce((a, r) => a + r.vals[t.id], 0)) : terrMode === 'share' ? miPct(uni[t.id] / totalUni, 1) : '1,00'}</td>)}
                    <td className="num total mono">{miNum(rows.reduce((a, r) => a + r.foco, 0))}<span className="mi-cell-r mono">{miPct(natFoco, 2)}</span></td>
                  </tr>
                </>
              );
            })()}
          </tbody>
        </table>
        <div className="mi-matrix-foot">
          El censo por comunidad y el censo por tramo son cifras publicadas; el cruce se estima por raking con un prior derivado del inmovilizado medio por empresa de cada comunidad, que también es cifra publicada. El índice compara el peso del tier en la comunidad con su peso en España: 1,00 es la media. Para cerrar el cruce sin estimar habría que bajar las 17 páginas de cifra de negocios por comunidad.
        </div>
      </section>

      {/* ===== 6. BRECHAS ===== */}
      <section className="mi-sec">
        <div className="mi-sec-head">
          <h2 className="mi-sec-title">Qué ata el crecimiento en los tiers de foco</h2>
          <span className="mi-sec-hint">Ordenado por distancia relativa al objetivo operativo</span>
        </div>
        <div className="mi-gaps">
          {gaps.map(g => (
            <div key={g.tier.id} className="mi-gap" style={{'--c': g.tier.color}}>
              <div className="mi-gap-h">{g.tier.label} <em className="mono">{miNum(uni[g.tier.id])} empresas</em></div>
              {g.items.map((it, i) => (
                <div key={it.id} className={`mi-gap-item ${i === 0 ? 'bind' : ''}`}>
                  <div className="mi-gap-lab">{it.label}{i === 0 && <span className="mi-bind">cuello</span>}</div>
                  <div className="mi-gap-bar"><div className="mi-gap-fill" style={{width: Math.min(100, it.v / it.target * 100) + '%'}}/><div className="mi-gap-target" style={{left: '100%'}}/></div>
                  <div className="mi-gap-n mono">{miPct(it.v, 0)} <em>de {miPct(it.target, 0)}</em></div>
                  <div className="mi-gap-miss">{miNum(Math.max(0, it.miss))} {it.unit}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div className="mi-foot">
        <b>Procedencia.</b> Los {window.AEAT_TRAMOS.length} tramos de facturación, los 10 sectores, las 19 comunidades y ciudades autónomas y la serie 2018-2022 del censo son cifras publicadas por la AEAT para el ejercicio {window.MKT_META.year}, bajadas el {window.MKT_META.fetched}.
        Los recuentos de SABI son los dos que están medidos: 10.008 empresas en Mid Market y 1.055 en Corporate.
        Se aproximan cuatro cosas, todas con el método a la vista: la frontera de 180M dentro del tramo 100M–500M, el cruce sector × tamaño y el cruce comunidad × tamaño por raking, y la proyección a años posteriores a {window.MKT_META.year}.
        Las tasas del embudo son datos de ejemplo con la forma correcta: cuando el CRM exponga estado por NIF entran aquí sin tocar la estructura.
      </div>
    </div>
  );
};
