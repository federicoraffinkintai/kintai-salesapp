// Discovery: el onesheet convertido en herramienta de llamada.
const { useState } = React;

function DvSay({ text, id, st, onSt, label, hint, big }) {
  return (
    <div className="cs-say-wrap">
      {label && <div className="cs-say-k">{label}{hint && <em>{hint}</em>}</div>}
      <div className={`cs-say ${big ? 'big' : ''}`}>
        {text.split('\n\n').map((p, i) => (
          <p key={i}>{p.split(/(\[[^\]]+\])/g).map((f, j) =>
            /^\[.+\]$/.test(f) ? <span className="cs-slot" key={j}>{f.slice(1, -1)}</span> : f)}</p>
        ))}
        <button className="cs-copy" onClick={() => { navigator.clipboard?.writeText(text); onSt(`cp-${id}`, Date.now()); }}>
          {st[`cp-${id}`] ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}

function DvStep({ n, title, goal, children, st, onSt, id }) {
  const done = st[`done-${id}`];
  return (
    <div className={`dv-step ${done ? 'done' : ''}`}>
      <div className="cs-head">
        <span className="cs-n">{n}</span>
        <div className="cs-title-wrap">
          <div className="cs-title">{title}</div>
          {goal && <div className="cs-goal">{goal}</div>}
        </div>
        <button className={`cs-check ${done ? 'on' : ''}`} onClick={() => onSt(`done-${id}`, !done)} title="Hecho">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </div>
      {children}
    </div>
  );
}

window.Discovery = function Discovery({ c, state, onState, collateral, onCollateral, aeName, onAeName }) {
  const st = state || {};
  const onSt = (k, v) => onState({ ...st, [k]: v });
  const [variant, setVariant] = useState(null);
  const f = window.fmt;

  const P = window.DISCOVERY_PITCH;
  const v = P.variants.find(x => x.id === variant);
  const pitch4 = P.blocks[3].replace('[PERSONALIZAR]', v ? v.say : '[lo que te acaba de contar]');

  return (
    <div className="ws-inner dv" data-screen-label="Discovery">
      <header className="dv-hero">
        <div>
          <div className="crumbs"><span>Discovery</span><span className="sep">›</span><span>{c.localidad || c.ccaa}</span><span className="sep">›</span><span className="mono">{c.nif}</span></div>
          <h1 className="company-name">{c.empresa}</h1>
          <div className="dv-sub">
            Llamada del AE. El objetivo es salir con la cartera estructurada y la documentación pedida.
          </div>
        </div>
        <div className="dv-who">
          <span className="cs-who-k">AE</span>
          <input className="cs-who-i" value={aeName} onChange={e => onAeName(e.target.value)} placeholder="tu nombre"/>
          {c.web && <a className="dv-web" href={c.web.startsWith('http') ? c.web : 'https://' + c.web} target="_blank" rel="noopener">{c.web}</a>}
        </div>
      </header>

      {/* 1 · PREPARACIÓN */}
      <DvStep n="1" id="prep" title="Preparación" goal="Antes de marcar. Diez minutos que deciden la llamada." st={st} onSt={onSt}>
        <div className="dv-prep">
          {window.DISCOVERY_PREP.map(b => (
            <div className={`dvp ${st[`p-${b.id}`] ? 'on' : ''}`} key={b.id}>
              <label className="dvp-h">
                <input type="checkbox" checked={!!st[`p-${b.id}`]} onChange={e => onSt(`p-${b.id}`, e.target.checked)}/>
                <div>
                  <b>{b.label}</b>
                  <em>{b.sub}</em>
                </div>
              </label>
              {b.items.length > 0 && (
                <dl className="dvp-l">
                  {b.items.map(it => <React.Fragment key={it.k}><dt>{it.k}</dt><dd>{it.v}</dd></React.Fragment>)}
                </dl>
              )}
              {b.formulas && <div className="dvp-f">{b.formulas.map(x => <code key={x}>{x}</code>)}</div>}
            </div>
          ))}
        </div>

        <div className="dv-live">
          <span className="cl-k">Lo que ya sabes de la ficha</span>
          <div className="dv-figs">
            <span><em>Facturación</em><b className="tabular">{f.eur(c.ventas)}</b></span>
            <span><em>NOF</em><b className="tabular">{f.eur(c.nof_est)}</b></span>
            <span><em>Deudores</em><b className="tabular">{f.eur(c.deudores_est)}</b></span>
            <span><em>PMC</em><b className="tabular">{c.pmc_ok ? Math.round(c.pmc) + ' d' : '—'}</b></span>
            <span><em>Deuda/EBITDA</em><b className="tabular">{c.v_deuda_ebitda != null ? f.x(c.v_deuda_ebitda) : 'n/a'}</b></span>
            <span><em>Solvencia</em><b className="tabular">{c.v_solv != null ? f.pct(c.v_solv) : '—'}</b></span>
          </div>
        </div>

        <div className="dv-swans">
          <span className="cl-k">Black swans · prepara ya la negociación</span>
          {window.DISCOVERY_SWANS.map(s => (
            <label className="dv-sw" key={s.id}>
              <span>{s.q}</span>
              <textarea value={st[`sw-${s.id}`] || ''} onChange={e => onSt(`sw-${s.id}`, e.target.value)} placeholder={s.ph}/>
            </label>
          ))}
        </div>
      </DvStep>

      {/* 2 · INTRODUCCIÓN */}
      <DvStep n="2" id="intro" title="Introducción" goal="Agenda clara, producto en dos minutos, y la palabra al cliente." st={st} onSt={onSt}>
        <ol className="dv-agenda">
          {window.DISCOVERY_OPEN.agenda.map(a => <li key={a}>{a}</li>)}
        </ol>
        <DvSay text={window.DISCOVERY_OPEN.say} id="apertura" st={st} onSt={onSt} label="Guión de apertura"/>
      </DvStep>

      {/* 3 · PREGUNTAS */}
      <DvStep n="3" id="preg" title="Preguntas al cliente" goal="Que hable él. Aquí sale la cartera que luego estructuras." st={st} onSt={onSt}>
        {window.DISCOVERY_QUESTIONS.map(g => (
          <div className="dv-qg" key={g.id}>
            <span className="cl-k">{g.label}</span>
            {g.qs.map((q, i) => (
              <div className="dv-q" key={i}>
                <p>{q}</p>
                <textarea value={st[`q-${g.id}-${i}`] || ''} onChange={e => onSt(`q-${g.id}-${i}`, e.target.value)} placeholder="Lo que responde…"/>
              </div>
            ))}
          </div>
        ))}
      </DvStep>

      {/* 4 · PITCH */}
      <DvStep n="4" id="pitch" title="Pitch · factoring estadístico" goal="Personaliza el corchete con lo que te acaba de contar." st={st} onSt={onSt}>
        <p className="dv-note">{P.intro}</p>
        <div className="dv-vars">
          <span className="cl-k">Elige el corchete</span>
          <div className="dv-varl">
            {P.variants.map(x => (
              <button key={x.id} className={`dv-var ${variant === x.id ? 'on' : ''}`} onClick={() => setVariant(variant === x.id ? null : x.id)}>
                {x.when}
              </button>
            ))}
          </div>
        </div>
        <DvSay text={P.blocks.slice(0, 3).join('\n\n')} id="p1" st={st} onSt={onSt} big/>
        <DvSay text={pitch4} id="p2" st={st} onSt={onSt} label="Con el corchete personalizado" big/>
        <p className="dv-lead">{P.blocks[4]}</p>
        <div className="dv-pill">
          {P.pillars.map((p, i) => (
            <div className="dvpl" key={i}><span className="dvpl-n">{i + 1}</span><div><b>{p.t}</b><em>{p.d}</em></div></div>
          ))}
        </div>
        <DvSay text={P.close.join('\n\n')} id="p3" st={st} onSt={onSt} big/>
      </DvStep>

      {/* 5 · COLATERAL */}
      <DvStep n="5" id="colateral" title="Encaje de producto · estructurar la cartera" goal="De aquí sale el número que llevas a Riesgos." st={st} onSt={onSt}>
        <window.Collateral state={collateral} onState={onCollateral}/>
      </DvStep>

      {/* 6 · CIERRE */}
      <DvStep n="6" id="cierre" title="Timings y cierre" goal="Salir con fecha y con la documentación pedida." st={st} onSt={onSt}>
        <DvSay text={window.DISCOVERY_CLOSE.urgencia} id="urg" st={st} onSt={onSt} label="Pregunta por la urgencia"/>
        <ul className="dv-plazos">{window.DISCOVERY_CLOSE.plazos.map(p => <li key={p}>{p}</li>)}</ul>
        <DvSay text={window.DISCOVERY_CLOSE.cierre} id="cie" st={st} onSt={onSt} label="Cierre"/>
        <div className="dv-pasos">
          {window.DISCOVERY_CLOSE.pasos.map(p => (
            <label className="dv-sw" key={p.id}>
              <span>{p.q}</span>
              <textarea value={st[`ps-${p.id}`] || ''} onChange={e => onSt(`ps-${p.id}`, e.target.value)}/>
            </label>
          ))}
        </div>
      </DvStep>

      {/* 7 · RIESGOS */}
      <DvStep n="7" id="riesgos" title="Presentación a Riesgos" goal="El expediente se prepara ahora, no mañana." st={st} onSt={onSt}>
        <div className="dv-res">
          <span className="cl-k">Resumen de la reunión</span>
          {window.RIESGOS_RESUMEN.map(r => (
            <label className="dv-sw" key={r.id}>
              <span>{r.label}</span>
              <textarea value={st[`r-${r.id}`] || ''} onChange={e => onSt(`r-${r.id}`, e.target.value)}/>
            </label>
          ))}
        </div>
        <div className="dv-docs">
          {window.DISCOVERY_DOCS.map(g => (
            <div className={`dvd ${g.req ? 'req' : ''}`} key={g.g}>
              <div className="dvd-h">{g.g}{g.note && <em>{g.note}</em>}</div>
              {g.items.map(it => (
                <label className="dvd-i" key={it}>
                  <input type="checkbox" checked={!!st[`d-${it}`]} onChange={e => onSt(`d-${it}`, e.target.checked)}/>
                  <span>{it}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </DvStep>

      {/* MOTIVOS DE PÉRDIDA */}
      <div className="dv-lost">
        <span className="cl-k">Si no encaja, di por qué</span>
        <p>Esto es lo que permite saber qué producto falta por construir.</p>
        <div className="dv-lostg">
          {window.LOST_REASONS.map(g => (
            <div className="dvl" key={g.id}>
              <span className="dvl-k">{g.g}</span>
              <div className="dvl-o">
                {g.opts.map(o => {
                  const on = (st[`lost-${g.id}`] || []).includes(o.id);
                  return (
                    <button key={o.id} className={`tp-chip ${on ? 'on' : ''}`} onClick={() => {
                      const cur = st[`lost-${g.id}`] || [];
                      onSt(`lost-${g.id}`, on ? cur.filter(x => x !== o.id) : [...cur, o.id]);
                    }}>{o.label}</button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
