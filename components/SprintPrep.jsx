// Preparar el sprint: construir la lista de ~100 antes de empezar a llamar.
const { useState, useMemo } = React;

function TouchPanel({ c, touch, onTouch, engId, onEng }) {
  const t = touch || window.emptyTouch();
  const set = (k, v) => onTouch(c.nif, { ...t, [k]: v });
  const tw = window.touchWeight(t, engId);
  const toggleInb = id => set('inbound', (t.inbound || []).includes(id)
    ? t.inbound.filter(x => x !== id) : [...(t.inbound || []), id]);

  return (
    <div className="tp">
      <div className="tp-grid">
        <label className="tp-f">
          <span>Campaña de email</span>
          <input list="tp-camps" value={t.campaign} onChange={e => set('campaign', e.target.value)} placeholder="ninguna"/>
          <datalist id="tp-camps">{window.CAMPAIGNS.map(x => <option key={x} value={x}/>)}</datalist>
        </label>
        <label className="tp-f sm">
          <span>Emails enviados</span>
          <input type="number" min="0" max="99" value={t.emails}
            onChange={e => set('emails', Math.max(0, +e.target.value || 0))}/>
        </label>
        <label className="tp-f">
          <span>Actividad de email <em>llegará del CRM</em></span>
          <select value={engId || 'none'} onChange={e => onEng(c.nif, e.target.value)}>
            {window.ENGAGEMENT.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </label>
        <label className="tp-f">
          <span>Gatekeeper <em>quién coge el teléfono</em></span>
          <input value={t.gk || ''} onChange={e => set('gk', e.target.value)} placeholder="nombre de recepción"/>
        </label>
        <label className="tp-f">
          <span>LinkedIn</span>
          <select value={t.linkedin} onChange={e => set('linkedin', e.target.value)}>
            {window.LINKEDIN.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </label>
      </div>

      <div className="tp-inb">
        <span className="tp-k">Impacto de inbound</span>
        <div className="tp-chips">
          {window.INBOUND.map(x => (
            <button key={x.id} className={`tp-chip ${(t.inbound || []).includes(x.id) ? 'on' : ''}`}
              onClick={() => toggleInb(x.id)}>{x.label}</button>
          ))}
        </div>
      </div>

      <label className="tp-f">
        <span>Notas de organización</span>
        <textarea value={t.note} onChange={e => set('note', e.target.value)}
          placeholder="Con quién hablar, cuándo volver, qué se le mandó…"/>
      </label>

      {tw.burned && (
        <div className="tp-burn">
          {t.emails} emails enviados y ninguna apertura. O el contacto está mal o el mensaje no funciona:
          entra por teléfono y aprovecha para validar la dirección.
        </div>
      )}
    </div>
  );
}

window.SprintPrep = function SprintPrep({ companies, list, onList, log, eng, onEng, callbacks, touches, onTouch, demo, onClearDemo, session, onResume, onDiscard, onStart, onSelectLead }) {
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('all');
  const [ccaa, setCcaa] = useState('all');
  const [campaign, setCampaign] = useState('all');
  const [onlyPhone, setOnlyPhone] = useState(true);
  const [onlyNamed, setOnlyNamed] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [openRow, setOpenRow] = useState(null);

  const ccaas = useMemo(() => [...new Set(companies.map(c => c.ccaa).filter(Boolean))].sort(), [companies]);
  const camps = useMemo(() => {
    const used = new Set(Object.values(touches).map(t => t && t.campaign).filter(Boolean));
    return [...new Set([...window.CAMPAIGNS, ...used])];
  }, [touches]);

  const ranked = useMemo(() => {
    return companies
      .map(c => ({ c, pr: window.callPriority(c, log, eng, callbacks, touches) }))
      .filter(x => !x.pr.out)
      .sort((a, b) => b.pr.p - a.pr.p);
  }, [companies, log, eng, callbacks, touches]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ranked.filter(({ c }) => {
      if (needle && !(`${c.empresa} ${c.nif} ${c.localidad || ''} ${c.sector || ''}`.toLowerCase().includes(needle))) return false;
      if (sector !== 'all' && window.classifySector(c.sector).id !== sector) return false;
      if (ccaa !== 'all' && c.ccaa !== ccaa) return false;
      if (campaign !== 'all' && ((touches[c.nif] || {}).campaign || '') !== campaign) return false;
      if (onlyPhone && !c.tel) return false;
      if (onlyNamed && !c.dm_saludo) return false;
      if (minScore && (c.g || 0) < minScore) return false;
      return true;
    });
  }, [ranked, q, sector, ccaa, campaign, onlyPhone, onlyNamed, minScore, touches]);

  const inList = nif => list.includes(nif);
  const toggle = nif => onList(inList(nif) ? list.filter(x => x !== nif) : [...list, nif]);
  const addTop = n => {
    const add = filtered.map(x => x.c.nif).filter(nif => !inList(nif)).slice(0, n);
    onList([...list, ...add]);
  };

  const picked = list.map(nif => companies.find(c => c.nif === nif)).filter(Boolean);
  const stats = {
    total: picked.length,
    phone: picked.filter(c => c.tel).length,
    named: picked.filter(c => c.dm_saludo).length,
    gk: picked.filter(c => c.tel && !c.dm_saludo).length,
    warm: picked.filter(c => window.engById(eng[c.nif] || 'none').w > 0).length,
    li: picked.filter(c => window.liById((touches[c.nif] || {}).linkedin).w > 0).length,
    inb: picked.filter(c => ((touches[c.nif] || {}).inbound || []).length > 0).length,
    burned: picked.filter(c => window.touchWeight(touches[c.nif], eng[c.nif]).burned).length,
    due: picked.filter(c => window.callPriority(c, log, eng, callbacks, touches).urgent).length,
  };
  const pct = Math.min(100, (stats.total / window.SPRINT_GOAL.calls) * 100);
  const ready = stats.total >= 20;

  // Un sprint con llamadas registradas y sin cerrar se puede retomar con su mismo id
  const open_ = useMemo(() => {
    if (!session || session.active) return null;
    const hits = list.flatMap(nif => (log[nif] || []).filter(h => h.sprint === session.id));
    if (!hits.length) return null;
    const touched = new Set(list.filter(nif => (log[nif] || []).some(h => h.sprint === session.id)));
    return {
      calls: hits.length,
      deals: hits.filter(h => h.outcome === 'dm_meeting').length,
      left: list.filter(nif => !touched.has(nif)).length,
      elapsed: session.frozenAt || 0,
    };
  }, [session, list, log]);

  return (
    <div className="ws-inner prep" data-screen-label="Preparar sprint">
      <header className="prep-head">
        <div>
          <div className="crumbs"><span>Hunting sprint</span><span className="sep">›</span><span>Preparación</span></div>
          <h1 className="company-name">Preparar la lista</h1>
          <p className="prep-lede">
            Dos horas sin interrupciones. El objetivo es levantar {window.SPRINT_GOAL.deals} reuniones;
            el suelo aceptable es haber hecho {window.SPRINT_GOAL.calls} llamadas. La lista se prepara antes,
            porque durante el sprint no se decide a quién llamar.
          </p>
        </div>
        <div className="prep-launch">
          <div className="prep-gauge">
            <div className="prep-gauge-num tabular">{stats.total}</div>
            <div className="prep-gauge-of">de {window.SPRINT_GOAL.calls} leads</div>
            <div className="prep-gauge-bar"><div style={{width: `${pct}%`}}/></div>
          </div>
          <button className={`btn lg ${open_ ? '' : 'gold'}`} disabled={!ready} onClick={onStart}>
            {open_ ? 'Empezar uno nuevo' : 'Empezar sprint'}
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          {!ready && <span className="prep-warn">Añade al menos 20 leads</span>}
        </div>
      </header>

      {open_ && (
        <div className="prep-resume">
          <div className="pr-l">
            <span className="pr-k">Sprint sin cerrar</span>
            <div className="pr-n">
              <b className="tabular">{open_.calls}</b> llamadas ·
              <b className="tabular"> {open_.deals}</b> reuniones ·
              <b className="tabular"> {open_.left}</b> leads sin tocar
              {open_.elapsed > 0 && <> · llevas <b className="tabular">{Math.round(open_.elapsed / 60000)} min</b></>}
            </div>
          </div>
          <div className="pr-r">
            <button className="btn gold" onClick={onResume}>Reanudar donde lo dejaste</button>
            <button className="btn ghost" onClick={onDiscard} title="Las llamadas registradas se conservan">Cerrarlo</button>
          </div>
        </div>
      )}

      {demo && (
        <div className="prep-demo">
          <span>Los datos de campaña, LinkedIn, inbound y notas son <b>de ejemplo</b>, cargados para poder juzgar la interfaz con la tabla llena. Los datos financieros y los scores son reales.</span>
          <button className="btn ghost" onClick={onClearDemo}>Vaciar ejemplo</button>
        </div>
      )}

      <div className="prep-stats">
        <div className="ps"><span className="ps-k">Con teléfono</span><b className="tabular">{stats.phone}</b><em>llamables hoy</em></div>
        <div className="ps"><span className="ps-k">Con nombre</span><b className="tabular">{stats.named}</b><em>entrada directa</em></div>
        <div className="ps"><span className="ps-k">Vía gatekeeper</span><b className="tabular">{stats.gk}</b><em>hay que pasar filtro</em></div>
        <div className="ps"><span className="ps-k">Señal de email</span><b className="tabular">{stats.warm}</b><em>abrió o respondió</em></div>
        <div className="ps"><span className="ps-k">LinkedIn</span><b className="tabular">{stats.li}</b><em>contacto abierto</em></div>
        <div className="ps"><span className="ps-k">Inbound</span><b className="tabular">{stats.inb}</b><em>ya nos conocen</em></div>
        <div className={`ps ${stats.burned ? 'warn' : ''}`}><span className="ps-k">Email quemado</span><b className="tabular">{stats.burned}</b><em>entra por teléfono</em></div>
        <div className={`ps ${stats.due ? 'hot' : ''}`}><span className="ps-k">Callbacks vencidos</span><b className="tabular">{stats.due}</b><em>llaman primero</em></div>
      </div>

      <div className="prep-tools">
        <div className="search">
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
          <input placeholder="Buscar empresa, NIF, localidad…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <select value={sector} onChange={e => setSector(e.target.value)}>
          <option value="all">Todos los sectores</option>
          {window.SECTOR_GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
        </select>
        <select value={ccaa} onChange={e => setCcaa(e.target.value)}>
          <option value="all">Toda España</option>
          {ccaas.map(x => <option key={x} value={x}>{x}</option>)}
        </select>
        <select value={campaign} onChange={e => setCampaign(e.target.value)}>
          <option value="all">Cualquier campaña</option>
          <option value="">Sin campaña</option>
          {camps.map(x => <option key={x} value={x}>{x}</option>)}
        </select>
        <label className="chk"><input type="checkbox" checked={onlyPhone} onChange={e => setOnlyPhone(e.target.checked)}/> Con teléfono</label>
        <label className="chk"><input type="checkbox" checked={onlyNamed} onChange={e => setOnlyNamed(e.target.checked)}/> Con nombre</label>
        <label className="rng">Score mín <b className="tabular">{minScore}</b>
          <input type="range" min="0" max="1300" step="50" value={minScore} onChange={e => setMinScore(+e.target.value)}/>
        </label>
        <div className="prep-tools-sp"/>
        <button className="btn" onClick={() => addTop(25)}>+25 mejores</button>
        <button className="btn primary" onClick={() => addTop(window.SPRINT_GOAL.calls - stats.total)}>Completar a {window.SPRINT_GOAL.calls}</button>
        {list.length > 0 && <button className="btn ghost" onClick={() => onList([])}>Vaciar</button>}
      </div>

      <div className="prep-table">
        <div className="pt-head">
          <span/><span>#</span><span>Empresa</span><span>Entrada</span><span className="ta-r">Score</span>
          <span>Campaña</span><span className="ta-c">Envíos</span><span>Señales</span><span className="ta-r">Llamadas</span><span/>
        </div>
        {filtered.slice(0, 150).map(({ c, pr }, i) => {
          const rd = window.callReadiness(c);
          const hist = log[c.nif] || [];
          const sel = inList(c.nif);
          const t = touches[c.nif];
          const e = window.engById(eng[c.nif] || 'none');
          const li = window.liById((t || {}).linkedin);
          const cb = window.cbWhen((callbacks[c.nif] || {}).when);
          const open = openRow === c.nif;
          return (
            <React.Fragment key={c.nif}>
              <div className={`pt-row ${sel ? 'sel' : ''} ${pr.urgent ? 'urgent' : ''} ${open ? 'open' : ''}`}>
                <label className="pt-chk"><input type="checkbox" checked={sel} onChange={() => toggle(c.nif)}/></label>
                <span className="pt-i tabular">{i + 1}</span>
                <button className="pt-name" onClick={() => onSelectLead(c.nif)} title="Ver ficha completa">
                  <b>{c.empresa}</b>
                  <em>{c.localidad || c.ccaa} · {(c.sector || '').replace(/^[A-Z]\s*[–-]\s*/, '').slice(0, 30)}</em>
                </button>
                <span className={`pt-rd ${rd.tone}`}>{rd.label}</span>
                <span className="pt-sc tabular">{window.fmt.score(c.g)}</span>
                <span className={`pt-camp ${t && t.campaign ? '' : 'none'}`} title={(t && t.campaign) || 'Sin campaña asignada'}>
                  {(t && t.campaign) || 'Sin campaña'}
                </span>
                <span className={`pt-em tabular ${pr.burned ? 'burn' : ''}`}
                  title={pr.burned ? `${t.emails} enviados sin ninguna apertura` : t && t.emails ? `${t.emails} emails enviados` : 'Sin envíos'}>
                  {t && t.emails > 0 ? t.emails : '·'}
                </span>
                <div className="pt-tt">
                  {e.w > 0 && <span className="tt warm" title={e.label}>{e.id === 'pos' ? 'resp ★' : 'abrió'}</span>}
                  {e.id === 'neg' && <span className="tt burn" title={e.label}>resp ✕</span>}
                  {li.w > 0 && <span className="tt li" title={li.label}>{li.id === 'replied' ? 'in ★' : 'in'}</span>}
                  {t && (t.inbound || []).length > 0 && <span className="tt inb" title={(t.inbound || []).map(id => (window.INBOUND.find(x => x.id === id) || {}).label).join(' · ')}>inbound</span>}
                  {pr.burned && <span className="tt burn" title="Muchos envíos sin apertura">quemado</span>}
                  {t && t.gk && <span className="tt gk" title={'Gatekeeper: ' + t.gk}>{t.gk.split(' ')[0]}</span>}
                  {cb && cb.texto && <span className={`tt cb ${cb.vencido ? 'due' : ''}`} title={(callbacks[c.nif] || {}).note || ''}>{cb.vencido ? 'llamar ya' : cb.texto}</span>}
                  {t && t.note && <span className="tt note" title={t.note}>nota</span>}
                  {!e.w && !li.w && !cb && !(t && ((t.inbound || []).length || t.note || t.gk)) && <span className="tt none">sin tocar</span>}
                </div>
                <span className="pt-at tabular">{hist.length || '—'}</span>
                <button className="pt-exp" onClick={() => setOpenRow(open ? null : c.nif)} title="Contactos y notas">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              {open && (
                <div className="pt-panel">
                  <TouchPanel c={c} touch={t} onTouch={onTouch} engId={eng[c.nif] || 'none'} onEng={onEng}/>
                </div>
              )}
            </React.Fragment>
          );
        })}
        {!filtered.length && <div className="pt-empty">Ningún lead cumple estos filtros.</div>}
      </div>
    </div>
  );
};
