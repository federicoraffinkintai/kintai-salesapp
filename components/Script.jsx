// Conversation script — guided questions per pillar with feedback loop
window.ScriptBlock = function ScriptBlock({ pillar, idx, isOpen, onToggle, feedback, onFeedback, isActive }) {
  const handleVote = (qIdx, vote) => {
    onFeedback(pillar.id, qIdx, { ...(feedback[`${pillar.id}-${qIdx}`] || {}), vote });
  };
  const handleNote = (qIdx, note) => {
    onFeedback(pillar.id, qIdx, { ...(feedback[`${pillar.id}-${qIdx}`] || {}), note });
  };

  const askedCount = pillar.script.questions.filter((_, i) => feedback[`${pillar.id}-${i}`]?.vote).length;
  const total = pillar.script.questions.length;

  return (
    <div className={`script-block ${isOpen ? 'open' : ''} ${isActive ? 'active' : ''}`}>
      <div className="script-head" onClick={onToggle}>
        <div className={`script-num ${pillar.id}`}>{idx + 1}</div>
        <div className="script-title-row">
          <div className="script-title">Preguntas de calificación · {pillar.title}</div>
          <div className="script-meta">{pillar.script.blurb}</div>
        </div>
        <div className="script-pulse tabular">{askedCount}/{total}</div>
        <svg className="script-chev icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <div className="script-body">
        {pillar.script.questions.map((q, i) => {
          const fb = feedback[`${pillar.id}-${i}`] || {};
          return (
            <div className="q-block" key={i}>
              <div className="q-prompt">{q.q}</div>
              <div className="q-meta">
                <strong>Buscamos:</strong> {q.purpose}
              </div>
              <div className="q-listen-list">
                <span className="q-meta" style={{margin: 0}}><strong>Pistas a escuchar →</strong></span>
                {q.listen.map((l, j) => (
                  <span key={j} className="q-listen-pill">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>
                    {l}
                  </span>
                ))}
              </div>
              <div className="q-feedback">
                <span style={{fontSize: '11px', color: 'var(--muted)'}}>Feedback al score →</span>
                <div className="q-vote">
                  <button className={fb.vote === 'up' ? 'on up' : ''} onClick={() => handleVote(i, fb.vote === 'up' ? null : 'up')}>
                    ↑ Confirma
                  </button>
                  <button className={fb.vote === 'same' ? 'on same' : ''} onClick={() => handleVote(i, fb.vote === 'same' ? null : 'same')}>
                    = Match
                  </button>
                  <button className={fb.vote === 'down' ? 'on down' : ''} onClick={() => handleVote(i, fb.vote === 'down' ? null : 'down')}>
                    ↓ Contradice
                  </button>
                </div>
              </div>
              <textarea
                placeholder="Notas literales del cliente…"
                value={fb.note || ''}
                onChange={e => handleNote(i, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

window.CallBar = function CallBar({ inCall, currentStep, totalSteps, onPrev, onNext, onEnd }) {
  if (!inCall) return null;
  const steps = Array.from({length: totalSteps});
  return (
    <div className="call-bar">
      <div className="call-stage">
        <span className="call-stage-dot"/>
        <span>En llamada · {currentStep + 1} de {totalSteps} — <strong>{((window.CALL_FLOW || [])[currentStep] || {}).title || ''}</strong></span>
      </div>
      <div className="call-progress">
        {steps.map((_, i) => (
          <div key={i} className={`call-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}/>
        ))}
      </div>
      <div className="call-cta">
        <button className="btn" onClick={onPrev} disabled={currentStep === 0}>← Anterior</button>
        {currentStep < totalSteps - 1
          ? <button className="btn gold" onClick={onNext}>Siguiente →</button>
          : <button className="btn gold" onClick={onEnd}>Cerrar llamada ✓</button>
        }
      </div>
    </div>
  );
};

window.Recommendation = function Recommendation({ c, validations, feedback, adjustment }) {
  const prio = window.classifyPriority(c.g);
  const f = window.fmt;
  const tier = window.classifyTier(c.ventas);
  const drivers = [];
  if ((c.pmc || 0) > 90) drivers.push(`cobra a ${Math.round(c.pmc)} días`);
  if ((c.v_crec || 0) > 0.25) drivers.push(`crece ${Math.round(c.v_crec * 100)}%`);
  if ((c.ebitda || 0) < 0) drivers.push('EBITDA negativo');
  else if ((c.v_deuda_ebitda || 0) > 7) drivers.push(`deuda ${f.x(c.v_deuda_ebitda)} EBITDA`);
  if ((c.v_solv || 1) < 0.2) drivers.push('solvencia bajo mínimos');
  if ((c.v_nof_fact || 0) > 0.5) drivers.push('NOF por encima de medio año de ventas');

  const top = window.PILLARS
    .map(p => ({ p, v: c[p.key] || 0, span: p.range[1] - p.range[0] }))
    .filter(x => x.span > 0)
    .sort((a, b) => (b.v - b.p.range[0]) / b.span - (a.v - a.p.range[0]) / a.span)[0];

  return (
    <div className="recommendation">
      <div>
        <div className="rec-title">RECOMENDACIÓN SDR · {tier.id} · {prio.label.toUpperCase()}</div>
        <p className="rec-line">
          {drivers.length
            ? <>Entra por <strong>{top.p.title.toLowerCase()}</strong>: {drivers.slice(0, 3).join(', ')}.</>
            : <>Perfil sin señales fuertes. Validar en llamada antes de invertir tiempo.</>}
        </p>
        <div className="rec-meta">
          Línea potencial <strong>{f.eur(c.linea)}</strong> · revenue esperado <strong>{f.eur(c.revenue)}</strong>
          {adjustment && adjustment.totalSignals > 0 && <> · <strong>{adjustment.totalSignals}</strong> {adjustment.totalSignals === 1 ? 'señal validada' : 'señales validadas'}</>}
        </div>
      </div>
      <div className="rec-cta"><button className="btn gold">{prio.cta} →</button></div>
    </div>
  );
};
