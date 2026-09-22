// Flujo de llamada en 3 bloques, con la evidencia dentro del bloque que la usa.
const { useState } = React;

function Objections({ list, c, ind, blockId, state, onState }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="cs-obj">
      <div className="cs-obj-k">Si te dice…</div>
      <div className="cs-obj-grid">
        {list.map((ob, i) => {
          const key = `${blockId}-${i}`;
          const isOpen = open === key;
          const hit = state[`obj-${key}`];
          return (
            <div className={`ob ${isOpen ? 'open' : ''} ${hit ? 'hit' : ''} ${ob.good ? 'good' : ''}`} key={i}>
              <button className="ob-q" onClick={() => setOpen(isOpen ? null : key)}>
                <span>{ob.o}</span>
                <svg className="ob-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div className="ob-body">
                <p className="ob-r">{typeof ob.r === 'function' ? ob.r(c, ind) : ob.r}</p>
                <div className="ob-why"><strong>Por qué</strong> {ob.why}</div>
                <button className={`ob-mark ${hit ? 'on' : ''}`} onClick={() => onState(`obj-${key}`, !hit)}>
                  {hit ? 'Salió en la llamada' : 'Marcar si sale'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Say({ text, id, state, onState, label, hint }) {
  return (
    <div className="cs-say-wrap">
      {label && <div className="cs-say-k">{label}{hint && <em>{hint}</em>}</div>}
      <div className="cs-say">
        {text.split('\n\n').map((p, i) => (
          <p key={i}>{p.split(/(\[[^\]]+\])/g).map((frag, j) =>
            /^\[.+\]$/.test(frag) ? <span className="cs-slot" key={j}>{frag.slice(1, -1)}</span> : frag
          )}</p>
        ))}
        <button className="cs-copy" onClick={() => { navigator.clipboard?.writeText(text); onState(`copied-${id}`, Date.now()); }}>
          {state[`copied-${id}`] ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}

// Escalera de preguntas del bloque 03. Cada respuesta se captura con un toque
// y se puede copiar entera para el AE: si no sale del navegador, no sirve.
function AltAsk({ state, onState, c }) {
  const list = window.ALT_ASK || [];
  const qOf = (a) => (a.build ? a.build(c) : a.q);
  const [open, setOpen] = useState(list[0] ? list[0].id : null);
  const hechas = list.filter(a => (state[`alt-${a.id}`] || []).length || state[`altn-${a.id}`]).length;

  const copiar = () => {
    const txt = list.map(a => {
      const picks = state[`alt-${a.id}`] || [];
      const nota = state[`altn-${a.id}`];
      if (!picks.length && !nota) return null;
      return `${qOf(a)}\n${[picks.join(', '), nota].filter(Boolean).join(' — ')}`;
    }).filter(Boolean).join('\n\n');
    navigator.clipboard?.writeText(txt || 'Sin respuestas registradas.');
    onState('alt-copied', Date.now());
  };

  return (
    <div className="cf-ask">
      <div className="cf-ask-h">
        <span className="cf-col-k">Escalera de preguntas · lo que el AE necesita saber</span>
        <span className="cf-ask-n mono">{hechas}/{list.length}</span>
        <button className="cf-ask-copy" onClick={copiar}>{state['alt-copied'] ? 'Copiado' : 'Copiar para el AE'}</button>
      </div>
      {list.map((a, i) => {
        const picks = state[`alt-${a.id}`] || [];
        const nota = state[`altn-${a.id}`] || '';
        const hecha = picks.length > 0 || !!nota;
        const isOpen = open === a.id;
        return (
          <div className={`cf-aq ${isOpen ? 'open' : ''} ${hecha ? 'done' : ''} ${a.retorica ? 'ret' : ''}`} key={a.id}>
            <button className="cf-aq-q" onClick={() => setOpen(isOpen ? null : a.id)}>
              <span className="cf-aq-n mono">{i + 1}</span>
              <span className="cf-aq-t">{qOf(a)}</span>
              {a.retorica && <span className="cf-aq-tag">retórica</span>}
              <svg className="ob-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="cf-aq-body">
              <div className="cf-aq-picks">
                {a.picks.map(p => (
                  <button key={p} className={picks.indexOf(p) >= 0 ? 'on' : ''}
                    onClick={() => {
                      const cur = picks.slice();
                      const j = cur.indexOf(p);
                      if (j >= 0) cur.splice(j, 1); else cur.push(p);
                      onState(`alt-${a.id}`, cur);
                    }}>{p}</button>
                ))}
              </div>
              <textarea className="cf-aq-note" placeholder="Lo que dijo, con sus palabras…"
                value={nota} onChange={e => onState(`altn-${a.id}`, e.target.value)}/>
              <div className="cf-aq-meta">
                <p><strong>Por qué</strong> {a.why}</p>
                <p><strong>Escucha</strong> {a.escucha}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Caja de presentación. El contenido se adapta al momento en que se coloca.
function Presentacion({ slot, state, onState }) {
  const p = window.CALL_PRESENT;
  const [abierto, setAbierto] = useState(false);
  const done = state['done-presentacion'];
  const mode = (window.CALL_MODES || []).find(m => m.id === slot);
  return (
    <div className={`cf-pres ${done ? 'done' : ''}`} data-block="presentacion">
      <div className="cf-pres-h">
        <span className="cf-pres-k">{p.title}</span>
        <span className="cf-pres-when">{mode ? mode.label.toLowerCase() : ''}</span>
        <button className={`cs-check ${done ? 'on' : ''}`} onClick={() => onState('done-presentacion', !done)} title="Presentado">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </div>
      <div className="cf-rule"><strong>Regla</strong> {p.rule}</div>
      <Say text={p.build(slot)} id={`pres-${slot}`} state={state} onState={onState}/>
      <div className="cf-pres-no"><strong>No sueltes aquí</strong> {p.evitar}</div>
      <button className="cf-pres-more" onClick={() => setAbierto(!abierto)}>
        {abierto ? 'Ocultar' : 'Si te pregunta más'}
      </button>
      {abierto && (
        <div className="cf-pres-facts">
          {p.facts.map(f => (
            <span className="cf-pres-fact" key={f.k}><em>{f.k}</em>{f.v}</span>
          ))}
        </div>
      )}
    </div>
  );
}

window.CallFlow = function CallFlow({ c, sdrName, onSdrName, state, onState, validations, onValidate, painState, onPain, feedback, onFeedback, activeBlock }) {
  const ind = window.getIndustry(c.cnae);
  const livePains = ind.pains.filter(p => { try { return p.test(c); } catch { return false; } });
  const pains = livePains.length ? livePains : ind.pains;
  const flow = window.CALL_FLOW || [];
  const P = id => window.PILLARS.find(p => p.id === id);
  const modes = window.CALL_MODES || [];

  // Cuándo se presenta. Es preferencia del SDR, no del lead: se recuerda entre
  // empresas para que no haya que reelegirla en cada llamada.
  const [mode, setMode] = useState(() => {
    try { return sessionStorage.getItem('kintai-callmode') || 'tarde'; } catch (e) { return 'tarde'; }
  });
  const pickMode = (id) => {
    setMode(id);
    try { sessionStorage.setItem('kintai-callmode', id); } catch (e) {}
  };
  const modeObj = modes.find(m => m.id === mode) || modes[0];

  // Plegado de bloques: en llamada solo queda abierto el bloque vivo, para que
  // el SDR no tenga que buscar entre tres pantallas de texto.
  const [shut, setShut] = useState({});
  const lastActive = React.useRef(null);
  React.useEffect(() => {
    if (activeBlock && activeBlock !== lastActive.current) {
      const next = {};
      flow.forEach(b => { if (b.id !== activeBlock) next[b.id] = true; });
      setShut(next);
      lastActive.current = activeBlock;
    }
    if (!activeBlock) lastActive.current = null;
  }, [activeBlock]);
  const soloAbierto = (id) => {
    const next = {};
    flow.forEach(b => { if (b.id !== id) next[b.id] = true; });
    setShut(next);
  };

  return (
    <div className="cf">
      <div className="cs-bar">
        <div className="cs-who">
          <span className="cs-who-k">Te presentas como</span>
          <input className="cs-who-i" value={sdrName} onChange={e => onSdrName(e.target.value)} placeholder="tu nombre"/>
        </div>
        <div className="cs-legend"><span className="cs-legend-i"><i className="cs-sw"/>Texto con sus cifras y su sector</span></div>
      </div>

      <div className="cf-modebar">
        <div className="cf-modebar-l">
          <span className="cs-who-k">Cuándo presentas Kintai</span>
          <div className="cf-seg">
            {modes.map(m => (
              <button key={m.id} className={mode === m.id ? 'on' : ''} onClick={() => pickMode(m.id)}>{m.label}</button>
            ))}
          </div>
        </div>
        {modeObj && (
          <p className="cf-modebar-why">{modeObj.why} <em>{modeObj.coste}</em></p>
        )}
      </div>

      <div className="cf-rail">
        {flow.reduce((acc, b) => {
          acc.push(b);
          if (b.id === 'apertura' && mode === 'pronto') acc.push({ id: 'presentacion', n: '·', title: 'Presentación', pres: true });
          if (b.id === 'necesidad' && mode === 'tarde') acc.push({ id: 'presentacion', n: '·', title: 'Presentación', pres: true });
          return acc;
        }, []).map(b => (
          <button key={b.id} className={`cf-rail-i ${b.pres ? 'pres' : ''} ${state[`done-${b.id}`] ? 'done' : ''} ${activeBlock === b.id ? 'live' : ''}`}
            onClick={() => b.pres ? null : soloAbierto(b.id)}>
            <span className="cf-rail-n">{b.n}</span>{b.title}
          </button>
        ))}
      </div>

      {flow.map(b => {
        const done = state[`done-${b.id}`];
        const cerrado = !!shut[b.id];
        return (<React.Fragment key={b.id}>
          <div className={`cf-block ${done ? 'done' : ''} ${b.optional ? 'opt' : ''} ${activeBlock === b.id ? 'live' : ''} ${cerrado ? 'shut' : ''}`} data-block={b.id}>
            <div className="cs-head">
              <span className="cs-n">{b.n}</span>
              <button className="cs-title-wrap cf-fold" onClick={() => setShut(s => ({ ...s, [b.id]: !s[b.id] }))}>
                <div className="cs-title">{b.title}{b.optional && <span className="cf-opt">solo si no cierras en 02</span>}
                  <svg className="cf-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div className="cs-goal">{b.goal}</div>
              </button>
              <button className={`cs-check ${done ? 'on' : ''}`} onClick={() => onState(`done-${b.id}`, !done)} title="Bloque superado">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>

            <div className="cf-body">
            <div className="cf-rule"><strong>Regla</strong> {b.rule}</div>

            {b.build && <Say text={b.build(c, sdrName || 'Ignasi', ind, pains)} id={b.id} state={state} onState={onState}/>}

            {b.id === 'necesidad' && (
              <>
                <div className="cf-two">
                  <aside className="cf-col-ev">
                    <div className="cf-col-k">Necesidad · scores y variables</div>
                    {P('need') && <window.PillarCard pillar={P('need')} c={c} validations={validations} onValidate={onValidate}/>}
                  </aside>

                  <div className="cf-col-say">
                    <div className="cf-live">
                      <div className="cf-live-figs">
                        <span className="cf-live-k">Lo que vas a decir</span>
                        {window.sayEur(c.existencias, window.fmt) && (
                          <span className="cf-fig"><em>Existencias</em><b className="tabular">{window.fmt.eur(c.existencias)}</b></span>
                        )}
                        {window.sayEur(c.deudores_est, window.fmt) && (
                          <span className="cf-fig"><em>Deudores</em><b className="tabular">{window.fmt.eur(c.deudores_est)}</b></span>
                        )}
                        {window.sayEur(c.prov_est, window.fmt) && (
                          <span className="cf-fig"><em>Proveedores</em><b className="tabular">{window.fmt.eur(c.prov_est)}</b></span>
                        )}
                        {c.pmc != null && (
                          <span className="cf-fig"><em>Cobran a</em><b className="tabular">{Math.round(c.pmc)} d</b></span>
                        )}
                        {c.pmp != null && (
                          <span className="cf-fig"><em>Pagan a</em><b className="tabular">{Math.round(c.pmp)} d</b></span>
                        )}
                        {c.rot != null && (
                          <span className="cf-fig"><em>Rotación stock</em><b className="tabular">{Math.round(c.rot)} d</b></span>
                        )}
                      </div>

                      <Say text={b.parts[0].build(c, sdrName, ind, pains)} id="espejo" state={state} onState={onState}/>

                      <div className="cf-live-pains">
                        <span className="cf-live-k">Rellena los huecos · {ind.label}</span>
                        <div className="cf-pnum">
                          {pains.slice(0, 3).map((p, i) => {
                            const k = `${ind.id}-${ind.pains.indexOf(p)}`;
                            const st = painState[k];
                            return (
                              <div className={`pn ${livePains.includes(p) ? 'live' : ''} ${st ? 'st-' + st : ''}`} key={i}>
                                <span className="pn-n">{i + 1}</span>
                                <div className="pn-c">
                                  <div className="pn-t">{p.t}</div>
                                  <div className="pn-d">{p.d}</div>
                                </div>
                                <div className="pn-marks">
                                  <button className={`tick ${st === 'hit' ? 'on confirm' : ''}`} title="Le duele"
                                    onClick={() => onPain(k, st === 'hit' ? null : 'hit')}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                  </button>
                                  <button className={`tick ${st === 'miss' ? 'on deny' : ''}`} title="No le aplica"
                                    onClick={() => onPain(k, st === 'miss' ? null : 'miss')}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {mode === 'pronto' && (
                  <>
                    <div className="cf-pres-moved">Kintai ya está presentado en el paso anterior. Aquí no repitas quién eres: pasa directo al cierre.</div>
                    <Say text={b.parts[2].build()} id="cierre" state={state} onState={onState}
                      label={b.parts[2].label} hint={b.parts[2].hint}/>
                  </>
                )}
                {mode === 'tarde' && (
                  <div className="cf-pres-moved">Con el «exacto» en la mano, ahora te presentas. El cierre de reunión con el AE va justo después de la presentación, abajo.</div>
                )}
              </>
            )}

            {b.id === 'alternativas' && (
              <div className="cf-two">
                <aside className="cf-col-ev">
                  <div className="cf-col-k">Alternativas · hasta dónde le llega la banca</div>
                  {P('alt') && <window.PillarCard pillar={P('alt')} c={c} validations={validations} onValidate={onValidate}/>}
                  <div className="cf-live-figs cf-figs-alt">
                    <span className="cf-live-k">Su pool, en cifras</span>
                    {window.sayEur(c.deuda_total != null ? c.deuda_total : (c.deuda_lp || 0) + (c.deuda_cp || 0), window.fmt) && (
                      <span className="cf-fig"><em>Deuda total</em><b className="tabular">{window.fmt.eur(c.deuda_total != null ? c.deuda_total : (c.deuda_lp || 0) + (c.deuda_cp || 0))}</b></span>
                    )}
                    {window.sayEur(c.deuda_cp, window.fmt) && (
                      <span className="cf-fig"><em>Vence a C/P</em><b className="tabular">{window.fmt.eur(c.deuda_cp)}</b></span>
                    )}
                    {c.v_deuda_ebitda != null && (
                      <span className="cf-fig"><em>Deuda / EBITDA</em><b className="tabular">{window.fmt.x(c.v_deuda_ebitda)}</b></span>
                    )}
                    {c.coste_deuda != null && (
                      <span className="cf-fig"><em>Coste de deuda</em><b className="tabular">{c.coste_deuda.toFixed(1).replace('.', ',')}%</b></span>
                    )}
                    {window.sayEur(c.gastos_fin, window.fmt) && (
                      <span className="cf-fig"><em>Gastos financieros</em><b className="tabular">{window.fmt.eur(c.gastos_fin)}</b></span>
                    )}
                    {c.v_solv != null && (
                      <span className="cf-fig"><em>Solvencia</em><b className="tabular">{window.fmt.pct(c.v_solv)}</b></span>
                    )}
                  </div>
                </aside>
                <div className="cf-col-say">
                  <AltAsk state={state} onState={onState} c={c}/>
                </div>
              </div>
            )}

            <Objections list={b.objections} c={c} ind={ind} blockId={b.id} state={state} onState={onState}/>

            {b.close && <Say text={b.close} id={`${b.id}-close`} state={state} onState={onState} label="Cierre desde aquí"/>}
            </div>
          </div>
          {b.id === 'apertura' && mode === 'pronto' && <Presentacion slot="pronto" state={state} onState={onState}/>}
          {b.id === 'necesidad' && mode === 'tarde' && (
            <>
              <Presentacion slot="tarde" state={state} onState={onState}/>
              <div className="cf-close-after" data-block="cierre">
                <div className="cf-col-k">Cierre de reunión con el AE · después de presentar Kintai</div>
                <Say text={b.parts[2].build()} id="cierre" state={state} onState={onState}
                  label={b.parts[2].label} hint={b.parts[2].hint}/>
              </div>
            </>
          )}
        </React.Fragment>);
      })}

      <div className="cs-close">
        <div className="cs-close-k">Si no cierras</div>
        <div className="cs-close-grid">
          {(window.CALL_FALLBACK || []).map(l => (
            <div className="cs-close-c" key={l.t}>
              <span className="cs-close-t">{l.t}</span>
              <p>{l.s}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
