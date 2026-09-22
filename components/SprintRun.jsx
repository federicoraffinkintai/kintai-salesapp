// Sprint en marcha: modo foco para encadenar llamadas.
const { useState, useEffect, useMemo, useRef } = React;

function useTimer(session, onTick) {
  useEffect(() => {
    if (!session || !session.active) return;
    const t = setInterval(onTick, 1000);
    return () => clearInterval(t);
  }, [session && session.active, onTick]);
}

const fmtClock = ms => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

window.SprintRun = function SprintRun({ companies, list, log, onLog, eng, callbacks, onCallback, touches, onTouch, notes, onNote, onClose, session, onSession, onExit, onSelectLead, validations, onValidate, callState, onCall, feedback, onFeedback, pains, onPain, sdrName, onSdrName }) {
  const [showCal, setShowCal] = useState(true);
  const [calTab, setCalTab] = useState('script');
  const [tick, setTick] = useState(0);
  const [note, setNote] = useState('');
  const [showGk, setShowGk] = useState(true);
  const [cbWhen, setCbWhen] = useState('');
  useEffect(() => { setCbWhen(''); setNote(''); }, [cur && cur.nif]);
  const noteRef = useRef(null);

  useTimer(session, () => setTick(t => t + 1));

  const queue = useMemo(() => {
    const doneThisSprint = new Set(
      list.filter(nif => (log[nif] || []).some(h => h.sprint === session.id))
    );
    return list
      .map(nif => companies.find(c => c.nif === nif))
      .filter(Boolean)
      .map(c => ({ c, pr: window.callPriority(c, log, eng, callbacks, touches || {}) }))
      .filter(x => {
        if (x.pr.out) return false;
        // Ya trabajado en este sprint: solo vuelve si dejó callback con hora futura
        if (doneThisSprint.has(x.c.nif)) {
          const cb = callbacks && callbacks[x.c.nif];
          const due = cb && cb.when ? new Date(cb.when).getTime() : NaN;
          return !isNaN(due) && due > Date.now();
        }
        return true;
      })
      .sort((a, b) => b.pr.p - a.pr.p);
  }, [list, companies, log, eng, callbacks, touches, session.id]);

  const done = useMemo(() => {
    const all = list.flatMap(nif => (log[nif] || []).filter(h => h.sprint === session.id));
    return {
      calls: all.length,
      gk: all.filter(h => /^gk_/.test(h.outcome)).length,
      dm: all.filter(h => { const o = window.outcomeById(h.outcome); return o && o.reachesDM; }).length,
      deals: all.filter(h => h.outcome === 'dm_meeting').length,
      info: all.filter(h => h.outcome === 'gk_info').length,
    };
  }, [list, log, session.id]);

  const cur = queue[0] ? queue[0].c : null;
  const pr = queue[0] ? queue[0].pr : null;
  const elapsed = session.active ? Date.now() - session.startedAt - (session.pausedMs || 0) : (session.frozenAt || 0);
  const remaining = window.SPRINT_GOAL.minutes * 60000 - elapsed;
  const ind = cur ? window.getIndustry(cur.cnae) : null;
  const gk = cur ? window.gkPath(cur) : null;
  const livePains = cur && ind ? ind.pains.filter(p => { try { return p.test(cur); } catch { return false; } }) : [];
  const curTouch = (cur && touches && touches[cur.nif]) || null;
  const curCb = (cur && callbacks && callbacks[cur.nif]) || {};
  const cb = window.cbWhen(curCb.when);
  const setGk = v => cur && onTouch(cur.nif, { ...(curTouch || window.emptyTouch()), gk: v });

  const record = (outcomeId) => {
    if (!cur) return;
    const o = window.outcomeById(outcomeId);
    const entry = { outcome: outcomeId, ts: Date.now(), sprint: session.id, note: note.trim() || undefined };
    onLog(cur.nif, entry);
    if (note.trim()) onNote(cur.nif, `${(notes[cur.nif] || '').trim()}\n[${new Date().toLocaleDateString('es-ES')} · ${o.short}] ${note.trim()}`.trim());
    if (o.schedules && cbWhen) onCallback(cur.nif, { when: cbWhen, note: note.trim() || null });
    setNote(''); setCbWhen('');
  };

  // Atajos de teclado: el sprint se lleva con una mano
  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      const o = window.OUTCOMES.find(x => x.key === e.key);
      if (o) { e.preventDefault(); record(o.id); }
      if (e.key === 'n') { e.preventDefault(); noteRef.current && noteRef.current.focus(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [cur, note, cbWhen, session.id]);

  const goalHit = done.deals >= window.SPRINT_GOAL.deals;
  const floorHit = done.calls >= window.SPRINT_GOAL.calls;

  return (
    <div className="sprint" data-screen-label="Sprint en marcha">
      <header className="sp-bar">
        <div className="sp-clock">
          <div className={`sp-time tabular ${remaining < 0 ? 'over' : remaining < 600000 ? 'warn' : ''}`}>
            {remaining < 0 ? '+' + fmtClock(-remaining) : fmtClock(remaining)}
          </div>
          <span className="sp-clock-k">{remaining < 0 ? 'tiempo cumplido' : 'restante'}</span>
        </div>

        <div className="sp-counts">
          <div className={`sc ${goalHit ? 'hit' : ''}`}>
            <b className="tabular">{done.deals}</b><span>/{window.SPRINT_GOAL.deals} reuniones</span>
          </div>
          <div className={`sc ${floorHit ? 'hit' : ''}`}>
            <b className="tabular">{done.calls}</b><span>/{window.SPRINT_GOAL.calls} llamadas</span>
          </div>
          <div className="sc"><b className="tabular">{done.dm}</b><span>decisores</span></div>
          <div className="sc"><b className="tabular">{done.gk}</b><span>gatekeepers</span></div>
          <div className="sc"><b className="tabular">{queue.length}</b><span>en cola</span></div>
        </div>

        <div className="sp-ctl">
          <button className="btn" onClick={() => onSession(session.active
            ? { ...session, active:false, frozenAt: elapsed }
            : { ...session, active:true, startedAt: Date.now() - elapsed, pausedMs:0 })}>
            {session.active ? 'Pausar' : 'Reanudar'}
          </button>
          <button className="btn ghost" onClick={() => onExit(elapsed)}>Salir del sprint</button>
        </div>
      </header>

      {(goalHit || floorHit) && (
        <div className={`sp-banner ${goalHit ? 'win' : ''}`}>
          {goalHit
            ? `Objetivo cumplido: ${done.deals} reuniones levantadas. Puedes cerrar el sprint o seguir mientras dure el tiempo.`
            : `${done.calls} llamadas hechas. Has cumplido el suelo del sprint aunque no hayan salido reuniones.`}
        </div>
      )}

      {!cur ? (
        <div className="sp-empty">
          <div className="empty-icon">K</div>
          <h2>Cola vacía</h2>
          <p>Has trabajado los {list.length} leads de la lista. {done.deals} reuniones y {done.calls} llamadas en este sprint.</p>
          <button className="btn gold" onClick={() => onClose(elapsed)}>Cerrar sprint</button>
        </div>
      ) : (
        <div className="sp-body">
          <div className="sp-main">
            <div className="sp-lead">
              <div className="sp-lead-top">
                <div>
                  {cb && (
                    <div className={`sp-cbnote ${cb.vencido ? 'due' : ''}`}>
                      <span className="sp-cbnote-k">{cb.vencido ? 'Callback vencido' : 'Callback'} · {cb.texto}</span>
                      {curCb.note && <p>{curCb.note}</p>}
                    </div>
                  )}
                  <h2 className="sp-name">{cur.empresa}</h2>
                  <div className="sp-meta">
                    <span>{cur.localidad || cur.ccaa}</span><span className="sep">·</span>
                    <span>{(cur.sector || '').replace(/^[A-Z]\s*[–-]\s*/, '')}</span><span className="sep">·</span>
                    <span className="mono">{cur.nif}</span>
                  </div>
                  <div className="sp-hook">{window.callHook(cur)} · score {window.fmt.score(cur.g)}</div>
                </div>
                <div className="sp-dial">
                  {cur.tel
                    ? <a className="sp-tel mono" href={`tel:${cur.tel.replace(/[^+\d]/g, '')}`}>{cur.tel}</a>
                    : <span className="sp-tel none">Sin teléfono</span>}
                  <div className="sp-who">
                    {cur.dm_nombre
                      ? <>Pide por <b>{cur.dm_nombre}</b>{cur.dm_cargo ? ` · ${cur.dm_cargo}` : ''}</>
                      : 'Sin nombre: hay que sacarlo del gatekeeper'}
                  </div>
                  <div className="sp-gkname">
                    <span>Contesta</span>
                    <input value={(curTouch && curTouch.gk) || ''} onChange={e => setGk(e.target.value)}
                      placeholder="nombre de recepción"/>
                  </div>
                  <button className="sp-open" onClick={() => onSelectLead(cur.nif)}>Abrir ficha y guión completo →</button>
                </div>
              </div>

              {(touches && touches[cur.nif] && (touches[cur.nif].note || touches[cur.nif].campaign)) && (
                <div className="sp-prep">
                  {touches[cur.nif].campaign && <span className="sp-camp">{touches[cur.nif].campaign}</span>}
                  {touches[cur.nif].emails > 0 && <span className="sp-camp q">{touches[cur.nif].emails} emails enviados</span>}
                  {window.liById(touches[cur.nif].linkedin).w > 0 && <span className="sp-camp q">{window.liById(touches[cur.nif].linkedin).label}</span>}
                  {touches[cur.nif].note && <p className="sp-prep-note">{touches[cur.nif].note}</p>}
                </div>
              )}

              {(log[cur.nif] || []).length > 0 && (
                <div className="sp-hist">
                  <span className="sp-hist-k">Historial</span>
                  {(log[cur.nif] || []).slice(-4).map((h, i) => {
                    const o = window.outcomeById(h.outcome);
                    return <span className={`sp-h ${o ? o.tone : ''}`} key={i}>
                      {o ? o.short : h.outcome} · {new Date(h.ts).toLocaleDateString('es-ES')}
                    </span>;
                  })}
                </div>
              )}
            </div>

            <div className={`sp-gk ${showGk ? 'open' : ''}`}>
              <button className="sp-gk-head" onClick={() => setShowGk(!showGk)}>
                <span className="sp-gk-k">Gatekeeper · {gk.label}</span>
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div className="sp-gk-body">
                <p className="sp-gk-say">{window.gkSay(cur, curTouch && curTouch.gk)}</p>
                <div className="sp-gk-tip">{gk.tip}</div>
                <div className="sp-gk-exits">
                  <span className="sp-gk-k">Si no te pasa, sal con una de estas tres</span>
                  <div className="sp-gk-exits-l">
                    {window.GATEKEEPER.exits.map(e => <span className="sp-exit" key={e}>{e}</span>)}
                  </div>
                </div>
                <div className="sp-gk-obj">
                  {window.GATEKEEPER.objections.map((ob, i) => (
                    <details className="sp-ob" key={i}>
                      <summary>{ob.o}{ob.wins && <em>saca {ob.wins}</em>}</summary>
                      <p>{ob.r}</p>
                      <span className="sp-ob-why">{ob.why}</span>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {livePains.length > 0 && (
              <div className="sp-pains">
                <span className="sp-gk-k">Si te pasa, entras por aquí</span>
                <div className="sp-pains-l">
                  {livePains.slice(0, 3).map((p, i) => <span className="sp-pain" key={i}><b>{i + 1}</b>{p.t}</span>)}
                </div>
              </div>
            )}

            {window.Calificacion && (
              <div className="sp-cal">
                <button className="sp-cal-h" onClick={() => setShowCal(v => !v)}>
                  <span>Con el decisor · {cur.empresa}</span>
                  <em>{showCal ? 'ocultar' : 'mostrar'}</em>
                </button>
                {showCal && (
                  <div className="sp-cal-b" key={cur.nif}>
                    <div className="sp-cal-tabs">
                      <button className={calTab === 'script' ? 'on' : ''} onClick={() => setCalTab('script')}>Guion del decisor</button>
                      <button className={calTab === 'cal' ? 'on' : ''} onClick={() => setCalTab('cal')}>Calificación y encaje</button>
                    </div>
                    {calTab === 'script' && window.CallFlow && (
                      <window.CallFlow
                        activeBlock={null}
                        c={cur} sdrName={sdrName} onSdrName={onSdrName}
                        state={(callState || {})[cur.nif] || {}}
                        onState={(k, v) => onCall && onCall(cur.nif, k, v)}
                        validations={(validations || {})[cur.nif] || {}}
                        onValidate={(k, v) => onValidate && onValidate(cur.nif, k, v)}
                        painState={(pains || {})[cur.nif] || {}}
                        onPain={(k, v) => onPain && onPain(cur.nif, k, v)}
                        feedback={(feedback || {})[cur.nif] || {}}
                        onFeedback={(p, i, v) => onFeedback && onFeedback(cur.nif, p, i, v)}/>
                    )}
                    {calTab === 'cal' && (
                      <window.Calificacion c={cur}
                        validations={(validations || {})[cur.nif] || {}}
                        onValidate={(k, v) => onValidate && onValidate(cur.nif, k, v)}
                        callState={(callState || {})[cur.nif] || {}}
                        onCall={(k, v) => onCall && onCall(cur.nif, k, v)}
                        feedback={(feedback || {})[cur.nif] || {}}
                        onFeedback={(p, i, v) => onFeedback && onFeedback(cur.nif, p, i, v)}/>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="sp-side">
            <div className="sp-note">
              <span className="sp-side-k">Nota <em>tecla N</em></span>
              <textarea ref={noteRef} value={note} onChange={e => setNote(e.target.value)}
                placeholder="Nombre que te dio el gatekeeper, hora buena, objeción…"/>
            </div>

            <div className="sp-cb">
              <span className="sp-side-k">Si queda en llamar luego</span>
              <input type="datetime-local" value={cbWhen} onChange={e => setCbWhen(e.target.value)}/>
            </div>

            <div className="sp-out">
              <span className="sp-side-k">Resultado <em>teclas 1-8</em></span>
              {['sin contacto', 'gatekeeper', 'decisor'].map(g => (
                <div className="sp-out-g" key={g}>
                  <span className="sp-out-gk">{g}</span>
                  {window.OUTCOMES.filter(o => o.group === g).map(o => (
                    <button className={`sp-o ${o.tone} ${o.isDeal ? 'deal' : ''}`} key={o.id} onClick={() => record(o.id)}>
                      <kbd>{o.key}</kbd>{o.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="sp-next">
              <span className="sp-side-k">Siguientes</span>
              {queue.slice(1, 5).map(({ c }) => (
                <div className="sp-nx" key={c.nif}>
                  <b>{c.empresa}</b>
                  <em>{window.callReadiness(c).label} · {window.fmt.score(c.g)}</em>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
