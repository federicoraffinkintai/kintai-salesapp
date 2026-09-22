// Market Research · universo de EMPRESAS filtrable por CNAE a los cuatro
// niveles (sección · división · grupo · clase). Se marcan las empresas una a
// una (o el filtro completo) y la selección se congela como campaña con nombre.
const { useState, useMemo } = React;

const rN = (v) => (v == null ? '—' : Math.round(v).toLocaleString('es-ES'));
const rEur = (v) => {
  if (!v) return '—';
  if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + 'M€';
  if (v >= 1e3) return Math.round(v / 1e3) + 'k€';
  return Math.round(v) + '€';
};

const LEVELS = [
  { f:'s', d:1, label:'Sección',  hint:'letra' },
  { f:'d', d:2, label:'División', hint:'2 díg.' },
  { f:'g', d:3, label:'Grupo',    hint:'3 díg.' },
  { f:'c', d:4, label:'Clase',    hint:'4 díg.' },
];

const SCORE_COLS = [
  { k:'fit', label:'Encaje de nicho', heat:true },
  { k:'nec', label:'Necesidad', heat:true },
  { k:'alt', label:'Alternativas', heat:true },
  { k:'enc', label:'Encaje producto', heat:true },
  { k:'g',   label:'Score global' },
  { k:'pctA',label:'% cat. A', heat:true },
  { k:'n',   label:'Empresas' },
  { k:'linea',label:'Línea potencial' },
];

window.Research = function Research({ companies, camps, onCamps, onSelectLead }) {
  const [f, setF] = useState({ s:'', d:'', g:'', c:'' });
  const [tiers, setTiers] = useState([]);
  const [pmcMin, setPmcMin] = useState(0);
  const [onlyA, setOnlyA] = useState(false);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('g');
  const [sel, setSel] = useState([]);              // NIFs marcados
  const [draft, setDraft] = useState(null);
  const [mxTiers, setMxTiers] = useState([]);
  const [mxSort, setMxSort] = useState('fit');
  const [mxLevel, setMxLevel] = useState(2);

  const bounds = window.MKT_BOUNDS || {};
  const inTier = (c) => {
    if (!tiers.length) return true;
    return tiers.some(id => {
      const [lo, hi] = bounds[id] || [0, null];
      return (c.ventas || 0) >= lo && (hi == null || (c.ventas || 0) < hi);
    });
  };
  // Filtros que no son CNAE: se aplican también al calcular las opciones del árbol
  const passBase = (c) => inTier(c) && (c.pmc || 0) >= pmcMin && (!onlyA || c.g_cat === 'A') &&
    (!q.trim() || (c.empresa || '').toLowerCase().includes(q.trim().toLowerCase()) || String(c.nif || '').toLowerCase().includes(q.trim().toLowerCase()));

  // Un nivel del árbol se cumple si todos los niveles seleccionados coinciden
  const passCnae = (c, upto) => LEVELS.every(l => {
    if (upto != null && l.d > upto) return true;
    const v = f[l.f];
    return !v || window.cnaeKey(c.cnae, l.d) === v;
  });

  const rows = useMemo(() => {
    const list = companies.filter(c => passBase(c) && passCnae(c));
    const cmp = {
      g:(a,b)=>(b.g||0)-(a.g||0), name:(a,b)=>String(a.empresa).localeCompare(String(b.empresa)),
      ventas:(a,b)=>(b.ventas||0)-(a.ventas||0), pmc:(a,b)=>(b.pmc||0)-(a.pmc||0),
      linea:(a,b)=>(b.linea||0)-(a.linea||0), cnae:(a,b)=>(a.cnae||0)-(b.cnae||0),
      nec:(a,b)=>(b.nec||0)-(a.nec||0), alt:(a,b)=>(b.alt||0)-(a.alt||0), enc:(a,b)=>(b.enc||0)-(a.enc||0),
    };
    return list.sort(cmp[sort] || cmp.g);
  }, [companies, f, tiers, pmcMin, onlyA, q, sort]);

  // Opciones de cada nivel, con su recuento, dependientes de los niveles superiores
  const options = useMemo(() => {
    const out = {};
    for (const l of LEVELS) {
      const m = new Map();
      for (const c of companies) {
        if (!passBase(c) || !passCnae(c, l.d - 1)) continue;
        const k = window.cnaeKey(c.cnae, l.d);
        if (!k) continue;
        m.set(k, (m.get(k) || 0) + 1);
      }
      out[l.f] = [...m.entries()]
        .map(([key, n]) => ({ key, n, label: window.cnaeLabel(key, l.d) }))
        .sort((a, b) => b.n - a.n);
    }
    return out;
  }, [companies, f, tiers, pmcMin, onlyA, q]);

  const pick = (lf, v) => setF(prev => {
    const next = { ...prev, [lf]: v };
    const i = LEVELS.findIndex(l => l.f === lf);
    for (const l of LEVELS.slice(i + 1)) next[l.f] = '';   // limpia los niveles inferiores
    return next;
  });
  const clearAll = () => setF({ s:'', d:'', g:'', c:'' });

  const universe = useMemo(() => window.nicheStats(companies), [companies]);
  const viewStats = useMemo(() => window.nicheStats(rows), [rows]);

  const selSet = useMemo(() => new Set(sel), [sel]);
  const selCos = useMemo(() => companies.filter(c => selSet.has(c.nif)), [companies, selSet]);
  const selStats = useMemo(() => window.nicheStats(selCos), [selCos]);

  const toggle = (nif) => setSel(p => p.includes(nif) ? p.filter(x => x !== nif) : [...p, nif]);
  const allShown = rows.length > 0 && rows.every(c => selSet.has(c.nif));
  const toggleAll = () => setSel(p => allShown
    ? p.filter(n => !rows.some(c => c.nif === n))
    : [...new Set([...p, ...rows.map(c => c.nif)])]);

  const activeLevel = [...LEVELS].reverse().find(l => f[l.f]);
  const filterLabel = activeLevel
    ? `${f[activeLevel.f]} · ${window.cnaeLabel(f[activeLevel.f], activeLevel.d)}`
    : 'Todo el universo';

  const topLocalidad = useMemo(() => {
    const m = new Map();
    for (const c of selCos) if (c.localidad) m.set(c.localidad, (m.get(c.localidad) || 0) + 1);
    const top = [...m.entries()].sort((a, b) => b[1] - a[1])[0];
    return top && top[1] / Math.max(1, selCos.length) >= 0.45 ? top[0] : null;
  }, [selCos]);

  const openDraft = () => setDraft({
    name: window.campSuggestName({
      cnaeLabel: activeLevel ? window.cnaeLabel(f[activeLevel.f], activeLevel.d) : null,
      tierLabels: (window.MKT_TIERS || []).filter(t => tiers.includes(t.id)).map(t => t.label),
      pmcMin, onlyA, topLocalidad, stats: selStats,
    }),
    tesis: '', tpl: 'e3li',
    code: window.campCode(camps, [activeLevel ? f[activeLevel.f] : 'MIX'], activeLevel ? activeLevel.d : 0),
  });
  const create = () => {
    if (!draft.name.trim()) return;
    onCamps([...camps, {
      id: 'cmp-' + Date.now(), code: draft.code.trim(), name: draft.name.trim(),
      tesis: draft.tesis.trim(), status: 'draft', createdAt: Date.now(),
      tpl: draft.tpl,
      seq: (window.CAMP_TPL.find(t => t.id === draft.tpl) || window.CAMP_TPL[2]).steps
        .map((s, i) => ({ ...s, id: draft.tpl + '-' + i, enviados: 0, aperturas: 0, respuestas: 0 })),
      nodes: activeLevel ? [{ d: activeLevel.d, key: f[activeLevel.f], label: window.cnaeLabel(f[activeLevel.f], activeLevel.d) }] : [],
      filters: { tiers: [...tiers], pmcMin, onlyA, cnae: { ...f } },
      fit: selStats.fit, nifs: selCos.map(x => x.nif),
      metrics: window.campEmptyMetrics(),
    }]);
    setDraft(null); setSel([]);
  };

  const enrich = selCos.filter(c => !c.tel_ok && !c.dm_nombre).length;
  const shown = rows.slice(0, 400);

  // ---- Matriz industria × scores: de dónde salen las ideas de campaña -----
  const matrix = useMemo(() => {
    const pass = (c) => !mxTiers.length || mxTiers.some(id => {
      const [lo, hi] = bounds[id] || [0, null];
      return (c.ventas || 0) >= lo && (hi == null || (c.ventas || 0) < hi);
    });
    const m = new Map();
    for (const c of companies) {
      if (!pass(c)) continue;
      const key = window.cnaeKey(c.cnae, mxLevel);
      if (!key) continue;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(c);
    }
    return [...m.entries()].filter(([, l]) => l.length >= 3).map(([key, list]) => {
      const s = window.nicheStats(list);
      return { key, label: window.cnaeLabel(key, mxLevel), n: list.length,
        fit: s.fit, nec: s.parts.nec, alt: s.parts.alt, enc: s.parts.enc, g: s.g, pctA: s.pctA, linea: s.linea };
    }).sort((a, b) => (b[mxSort] || 0) - (a[mxSort] || 0)).slice(0, 24);
  }, [companies, mxTiers, mxSort, mxLevel]);

  const heat = (v) => {
    const t = Math.max(0, Math.min(1, (v || 0) / 100));
    return { background: `color-mix(in oklch, var(--kin) ${Math.round(t * 70)}%, white)`, color: 'var(--ink)' };
  };

  const applyIdea = (key) => {
    const lf = LEVELS.find(l => l.d === mxLevel).f;
    setF({ s:'', d:'', g:'', c:'', [lf]: key });
    if (mxTiers.length) setTiers(mxTiers);
  };

  return (
    <div className="mr">
      <div className="mr-head">
        <div>
          <h1 className="mr-h1">Market research · universo de empresas</h1>
          <div className="mr-sub">Filtra el universo por CNAE a los cuatro niveles, marca las empresas que quieres atacar y congélalas como campaña con un nombre que diga de qué va. La performance se sigue en Campañas.</div>
        </div>
        <div className="mr-kpis">
          <div className="mr-kpi"><span>Universo</span><b>{rN(companies.length)}</b></div>
          <div className="mr-kpi"><span>En el filtro</span><b>{rN(rows.length)}</b></div>
          <div className="mr-kpi"><span>Seleccionadas</span><b>{rN(sel.length)}</b></div>
        </div>
      </div>

      <div className="mr-cnae">
        {LEVELS.map(l => (
          <div className="mr-lvl" key={l.f}>
            <label>{l.label} <em>{l.hint}</em></label>
            <select value={f[l.f]} onChange={e => pick(l.f, e.target.value)}>
              <option value="">Todas ({rN((options[l.f] || []).reduce((a, o) => a + o.n, 0))})</option>
              {(options[l.f] || []).map(o => (
                <option key={o.key} value={o.key}>{o.key} · {o.label} ({o.n})</option>
              ))}
            </select>
          </div>
        ))}
        <button className="mr-clear" onClick={clearAll} disabled={!activeLevel}>Limpiar CNAE</button>
      </div>

      <div className="mr-controls">
        <div className="mr-ctl">
          <label>Buscar</label>
          <input className="mr-search" placeholder="Empresa o NIF" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <div className="mr-ctl">
          <label>Tier por facturación</label>
          <div className="mr-chips">
            {(window.MKT_TIERS || []).map(t => (
              <button key={t.id} className={`mr-chip ${tiers.includes(t.id) ? 'on' : ''}`} style={{'--c': t.color}}
                onClick={() => setTiers(p => p.includes(t.id) ? p.filter(x => x !== t.id) : [...p, t.id])}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mr-ctl">
          <label>PMC mínimo · {pmcMin} días</label>
          <input className="mr-range" type="range" min="0" max="180" step="15" value={pmcMin} onChange={e => setPmcMin(+e.target.value)}/>
        </div>
        <div className="mr-ctl">
          <label>Corte</label>
          <button className={`mr-chip ${onlyA ? 'on' : ''}`} onClick={() => setOnlyA(v => !v)}>Solo categoría A</button>
        </div>
      </div>

      <div className="mr-barline">
        <div className="mr-barinfo"><b>{filterLabel}</b><span>{rN(rows.length)} empresas · score de nicho {Math.round(viewStats.fit)} · línea potencial {rEur(viewStats.linea)}</span></div>
        <div className="mr-baracts">
          <button className="mr-chip" onClick={toggleAll} disabled={!rows.length}>{allShown ? 'Quitar las del filtro' : `Marcar las ${rN(rows.length)} del filtro`}</button>
          <button className="mr-chip" onClick={() => setSel([])} disabled={!sel.length}>Vaciar selección</button>
        </div>
      </div>

      <div className="mr-grid">
        <div className="mr-tablewrap">
          <table className="mr-table">
            <thead><tr>
              <th className="mr-cb"><input type="checkbox" checked={allShown} onChange={toggleAll}/></th>
              <th onClick={() => setSort('name')}>Empresa</th>
              <th onClick={() => setSort('cnae')}>CNAE</th>
              <th>Localidad</th>
              <th className="num" onClick={() => setSort('ventas')}>Ventas</th>
              <th className="num" onClick={() => setSort('pmc')}>PMC</th>
              <th className="num" onClick={() => setSort('nec')}>Nec.</th>
              <th className="num" onClick={() => setSort('alt')}>Alt.</th>
              <th className="num" onClick={() => setSort('enc')}>Enc.</th>
              <th className="num" onClick={() => setSort('g')}>Score</th>
              <th className="num" onClick={() => setSort('linea')}>Línea</th>
            </tr></thead>
            <tbody>
              {shown.map(c => (
                <tr key={c.nif} className={selSet.has(c.nif) ? 'on' : ''}>
                  <td className="mr-cb"><input type="checkbox" checked={selSet.has(c.nif)} onChange={() => toggle(c.nif)}/></td>
                  <td className="mr-name">
                    <b>{c.empresa}</b>
                    <button className="mr-drill" onClick={() => onSelectLead(c.nif)}>ficha →</button>
                    <em className="mr-nif mono">{c.nif}</em>
                  </td>
                  <td className="mono mr-code">{window.cnaeKey(c.cnae, 4)}<span className="mr-cnaelab">{window.cnaeLabel(window.cnaeKey(c.cnae, 4), 4)}</span></td>
                  <td className="mr-loc">{c.localidad || '—'}</td>
                  <td className="num mono">{rEur(c.ventas)}</td>
                  <td className="num mono">{rN(c.pmc)}</td>
                  <td className="num mono">{rN(c.nec)}</td>
                  <td className="num mono">{rN(c.alt)}</td>
                  <td className="num mono">{rN(c.enc)}</td>
                  <td className="num mono"><b className={`mr-cat cat-${c.g_cat}`}>{c.g_cat}</b> {rN(c.g)}</td>
                  <td className="num mono">{rEur(c.linea)}</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={11} className="mr-empty">Ninguna empresa cumple el filtro actual: sube un nivel de CNAE o suelta el corte.</td></tr>}
            </tbody>
          </table>
          {rows.length > shown.length && <div className="mr-morerow">Mostrando {rN(shown.length)} de {rN(rows.length)}. Afina el CNAE o usa el buscador —«marcar las del filtro» incluye las {rN(rows.length)}.</div>}
        </div>

        <aside className="mr-side">
          <div className="mr-tesis">
            <div className="mr-tesis-h">Selección</div>
            {!sel.length && <div className="mr-tesis-empty">Marca empresas en la tabla, o el filtro completo, para montar la campaña. Puedes mezclar varios CNAE: la selección se acumula al cambiar de filtro.</div>}
            {!!sel.length && (
              <>
                <div className="mr-pool">
                  <div className="mr-pool-k"><b>{rN(selStats.n)}</b><span>empresas</span></div>
                  <div className="mr-pool-k"><b>{Math.round(selStats.fit)}</b><span>score de nicho</span></div>
                  <div className="mr-pool-k"><b>{rEur(selStats.linea)}</b><span>línea potencial</span></div>
                </div>
                <div className="mr-parts">
                  {[['Necesidad','nec'],['Alternativas','alt'],['Encaje','enc']].map(([lab, k]) => {
                    const v = selStats.parts[k], u = universe.parts[k], d = v - u;
                    return (
                      <div className="mr-part" key={k}>
                        <span>{lab}</span>
                        <div className="mr-part-bar"><i style={{width: Math.max(2, Math.min(100, v)) + '%'}}/><u style={{left: Math.min(100, u) + '%'}}/></div>
                        <b>{Math.round(v)}</b>
                        <em className={d >= 0 ? 'up' : 'down'}>{d >= 0 ? '+' : ''}{Math.round(d)}</em>
                      </div>
                    );
                  })}
                  <div className="mr-part-legend">La marca vertical es la media del universo.</div>
                </div>
                <div className="mr-enrich">
                  {enrich > 0
                    ? <><b>{rN(enrich)}</b> de {rN(selStats.n)} sin teléfono ni decisor: pasan a enrichment antes de la secuencia.</>
                    : <>Todas las empresas seleccionadas tienen al menos un canal identificado.</>}
                </div>
                <div className="mr-top">
                  {selCos.slice().sort((a,b)=>(b.g||0)-(a.g||0)).slice(0, 6).map(c => (
                    <button key={c.nif} className="mr-toprow" onClick={() => onSelectLead(c.nif)}>
                      <span className="mr-topname">{c.empresa}</span>
                      <span className="mono">{rN(c.g)}</span>
                    </button>
                  ))}
                  {sel.length > 6 && <div className="mr-morelead">+{rN(sel.length - 6)} más</div>}
                </div>
                <button className="btn primary mr-create" onClick={openDraft}>Crear campaña con {rN(sel.length)} empresas →</button>
              </>
            )}
          </div>

          <div className="mr-camps">
            <div className="mr-tesis-h">Campañas creadas</div>
            {!camps.length && <div className="mr-tesis-empty">Todavía ninguna. La performance de cada campaña se sigue en la pestaña Campañas.</div>}
            {camps.map(c => (
              <div className="mr-campitem" key={c.id}>
                <div className="mr-campcode mono">{c.code}</div>
                <div className="mr-campbody">
                  <b>{c.name}</b>
                  <em>{rN((c.nifs || []).length)} empresas · encaje {Math.round(c.fit || 0)}</em>
                </div>
                <div className={`mr-campst st-${c.status}`}>{(window.CAMP_STATUS.find(s => s.id === c.status) || {}).label}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="mr-mx">
        <div className="cm-mxhead">
          <div>
            <div className="cm-cmp-h">Industria × scores · ideas de campaña</div>
            <div className="mr-sub">Media de los scores por industria sobre el universo filtrado por tier. Pincha una fila para llevarla al filtro de arriba y montar la lista.</div>
          </div>
          <div className="cm-mxctl">
            <div className="mr-chips">
              {(window.MKT_TIERS || []).map(t => (
                <button key={t.id} className={`mr-chip ${mxTiers.includes(t.id) ? 'on' : ''}`} style={{'--c': t.color}}
                  onClick={() => setMxTiers(p => p.includes(t.id) ? p.filter(x => x !== t.id) : [...p, t.id])}>{t.label}</button>
              ))}
              {!!mxTiers.length && <button className="mr-chip" onClick={() => setMxTiers([])}>Todos los tiers</button>}
            </div>
            <select className="cm-st" value={mxLevel} onChange={e => setMxLevel(+e.target.value)}>
              <option value={1}>Por sección CNAE</option>
              <option value={2}>Por división CNAE</option>
              <option value={3}>Por grupo CNAE</option>
            </select>
          </div>
        </div>
        <div className="cm-tablewrap">
          <table className="cm-table cm-mx">
            <thead><tr>
              <th>Industria</th>
              {SCORE_COLS.map(s => <th key={s.k} className="num" onClick={() => setMxSort(s.k)}>{s.label}</th>)}
              <th/>
            </tr></thead>
            <tbody>
              {matrix.map(r => (
                <tr key={r.key}>
                  <td className="cm-mxname"><b>{r.label}</b><em className="mono">{r.key}</em></td>
                  {SCORE_COLS.map(s => (
                    <td key={s.k} className="num mono" style={s.heat ? heat(r[s.k]) : undefined}>
                      {s.k === 'n' ? rN(r.n) : s.k === 'linea' ? rEur(r.linea) : s.k === 'g' ? rN(r.g) : Math.round(r[s.k] || 0)}
                    </td>
                  ))}
                  <td><button className="mr-chip" onClick={() => applyIdea(r.key)}>filtrar</button></td>
                </tr>
              ))}
              {!matrix.length && <tr><td colSpan={SCORE_COLS.length + 2} className="cm-emptyrow">Ninguna industria con suficientes empresas en este tier.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {draft && (
        <div className="modal-bg" onClick={() => setDraft(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Nombrar la campaña</h3>
            <div className="modal-sub">{rN(sel.length)} empresas quedan congeladas bajo este nombre. La secuencia y la performance se gestionan en Campañas.</div>
            <div className="mr-form">
              <label>Nombre de campaña<input autoFocus placeholder="Promoción inmobiliaria Levante · PMC > 90d" value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})}/></label>
              <div className="mr-namehint">Sugerido a partir del filtro: nicho + geografía o corte + ángulo. Edítalo si el ángulo real es otro.</div>
              <label>Cadena de mensajes
                <select value={draft.tpl} onChange={e => setDraft({...draft, tpl: e.target.value})}>
                  {window.CAMP_TPL.map(t => <option key={t.id} value={t.id}>{t.label} ({t.steps.length} pasos)</option>)}
                </select>
              </label>
              <label>Código<input className="mono" value={draft.code} onChange={e => setDraft({...draft, code: e.target.value})}/></label>
              <label>Tesis<textarea rows={3} placeholder="Por qué este nicho: qué tensión tiene y qué le vendemos" value={draft.tesis} onChange={e => setDraft({...draft, tesis: e.target.value})}/></label>
            </div>
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setDraft(null)}>Cancelar</button>
              <button className="btn primary" onClick={create} disabled={!draft.name.trim()}>Crear campaña</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
