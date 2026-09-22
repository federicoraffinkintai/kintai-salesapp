// Guión de llamada: 2 etapas con texto personalizado + objeciones
const { useState } = React;

window.CallScript = function CallScript({ c, sdrName, onSdrName, state, onState }) {
  const stages = window.CALL_STAGES || [];
  const closing = window.CALL_CLOSE || null;
  const ind = window.getIndustry(c.cnae);
  const livePains = ind.pains.filter(p => { try { return p.test(c); } catch { return false; } });
  const pains = livePains.length ? livePains : ind.pains;
  const [openObj, setOpenObj] = useState(null);

  const copy = (txt, key) => {
    navigator.clipboard?.writeText(txt);
    onState(`copied-${key}`, Date.now());
  };

  return (
    <div className="cs">
      <div className="cs-bar">
        <div className="cs-who">
          <span className="cs-who-k">Te presentas como</span>
          <input className="cs-who-i" value={sdrName} onChange={e => onSdrName(e.target.value)} placeholder="tu nombre"/>
        </div>
        <div className="cs-legend">
          <span className="cs-legend-i"><i className="cs-sw live"/>Texto personalizado con sus datos</span>
        </div>
      </div>

      {stages.map(st => {
        const txt = st.build(c, sdrName || 'Ignasi', ind, pains);
        const done = state[`done-${st.id}`];
        return (
          <div className={`cs-stage ${done ? 'done' : ''}`} key={st.id}>
            <div className="cs-head">
              <span className="cs-n">{st.n}</span>
              <div className="cs-title-wrap">
                <div className="cs-title">{st.title}</div>
                <div className="cs-goal">{st.goal}</div>
              </div>
              <button className={`cs-check ${done ? 'on' : ''}`} onClick={() => onState(`done-${st.id}`, !done)}
                title="Etapa superada">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>

            <div className="cs-say">
              {txt.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
              <button className="cs-copy" onClick={() => copy(txt, st.id)}>
                {state[`copied-${st.id}`] ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            <div className="cs-tip"><strong>Cómo decirlo</strong> {st.tip}</div>

            {st.id === 'pitch' && (
              <div className="cs-inject">
                <span className="cs-inject-k">Pain points inyectados · {ind.label}</span>
                <div className="cs-inject-list">
                  {pains.slice(0, 3).map((p, i) => (
                    <span className={`cs-pain ${livePains.includes(p) ? 'live' : ''}`} key={i}>{p.t}</span>
                  ))}
                </div>
                {ind.refs.length > 0 && (
                  <div className="cs-inject-refs">
                    <span className="cs-inject-k">Referencias que puedes nombrar</span>
                    <div className="cs-inject-list">
                      {ind.refs.slice(0, 3).map(r => <span className="cs-ref" key={r}>{r}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="cs-obj">
              <div className="cs-obj-k">Si te dice…</div>
              <div className="cs-obj-grid">
                {st.objections.map((ob, i) => {
                  const key = `${st.id}-${i}`;
                  const open = openObj === key;
                  const hit = state[`obj-${key}`];
                  return (
                    <div className={`ob ${open ? 'open' : ''} ${hit ? 'hit' : ''}`} key={i}>
                      <button className="ob-q" onClick={() => setOpenObj(open ? null : key)}>
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
          </div>
        );
      })}

      {closing && <div className="cs-close">
        <div className="cs-close-k">{closing.title}</div>
        <div className="cs-close-grid">
          {closing.lines.map(l => (
            <div className="cs-close-c" key={l.t}>
              <span className="cs-close-t">{l.t}</span>
              <p>{l.s}</p>
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
};
