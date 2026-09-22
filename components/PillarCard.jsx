// Pillar card — el VALOR y sus partidas en € mandan; el score queda como marcador de prioridad
const { useState } = React;

function CatChip({ cat, small }) {
  if (!cat) return null;
  const m = window.CAT_META[cat];
  if (!m) return null;
  return <span className={`cat cat-${cat} ${small ? 'sm' : ''}`} title={m.desc}>{m.label}</span>;
}

function VarRow({ v, c, pillarId, validation, onValidate }) {
  const [open, setOpen] = useState(false);
  const a = window.auditVar(v, c);
  const f = window.fmt;
  const cat = c[v.ck];
  const ing = window.VAR_PARTS[v.id];
  const span = v.mMax - v.mMin;
  const neg = a.m < 0;

  const pv = (p) => {
    const val = window.partValue(p, c);
    if (val == null || isNaN(val)) return '—';
    if (p.fmt === 'raw') return String(Math.round(val));
    return f[p.fmt || ing.unit](val);
  };

  return (
    <div className={`vrow ${open ? 'open' : ''} ${a.missing ? 'missing' : ''}`}>
      <div className="vrow-head" onClick={() => setOpen(!open)}>
        <svg className="vrow-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="9 18 15 12 9 6"/></svg>

        <div className="vrow-main">
          <div className="vrow-name">{v.label}</div>
          <div className="vrow-parts">
            {a.missing ? <span className="vp-none">sin dato en SABI</span> : (ing?.parts || []).map((p, i) => (
              <span className="vp" key={i}>
                {p.op && <em className="vp-op">{p.op}</em>}
                <span className="vp-k">{p.label}</span>
                <span className="vp-v tabular">{pv(p)}{p.est && p.est(c) ? <sup className="vp-est" title="Estimado: SABI no publica el dato">e</sup> : null}</span>
              </span>
            ))}
            {!a.missing && ing?.over && (
              <span className="vp">
                <em className="vp-op">÷</em>
                <span className="vp-k">{ing.over.label}</span>
                <span className="vp-v tabular">{pv(ing.over)}</span>
              </span>
            )}
          </div>
        </div>

        <div className="vrow-val">
          <div className="vrow-val-num tabular">{a.missing ? '—' : f[v.fmt](a.raw)}</div>
          {ing?.resultKey && c[ing.resultKey] != null && (
            <div className="vrow-val-sub tabular">{ing.resultLabel} {f.eur(c[ing.resultKey])}</div>
          )}
        </div>

        <div className="vrow-sig" title={`${Math.round(a.pct)}% de la escala · ${Math.round(a.m)} de ${span} puntos`}>
          <div className="vrow-sigtop">
            <CatChip cat={cat} small/>
            <span className={`vrow-m tabular ${neg ? 'neg' : ''}`}>{a.missing ? '—' : Math.round(a.m)}</span>
          </div>
          <div className="vrow-sigbar"><div className={neg ? 'neg' : 'pos'} style={{width: `${a.missing ? 0 : a.pct}%`}}/></div>
        </div>

        <div className="vrow-ticks" onClick={e => e.stopPropagation()}>
          <button className={`tick ${validation === 'confirm' ? 'on confirm' : ''}`} title="Confirmado por el cliente"
            onClick={() => onValidate(`${pillarId}-${v.id}`, validation === 'confirm' ? null : 'confirm')}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button className={`tick ${validation === 'deny' ? 'on deny' : ''}`} title="El dato no se sostiene"
            onClick={() => onValidate(`${pillarId}-${v.id}`, validation === 'deny' ? null : 'deny')}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div className="vrow-body">
        {!a.missing && ing && !ing.internal && (
          <div className="vsay">
            <span className="vsay-label">Dilo así</span>
            <p>{ing.say(c, f)}</p>
          </div>
        )}

        {!a.missing && ing && (
          <div className="veq">
            {(ing.parts || []).map((p, i) => (
              <div className="veq-term" key={i}>
                {p.op && <span className="veq-op">{p.op}</span>}
                <div className="veq-box">
                  <span className="veq-k">{p.label}{p.est && p.est(c) ? <sup className="vp-est">e</sup> : null}</span>
                  <span className="veq-v tabular">{pv(p)}</span>
                </div>
              </div>
            ))}
            {ing.over && (
              <div className="veq-term">
                <span className="veq-op">÷</span>
                <div className="veq-box">
                  <span className="veq-k">{ing.over.label}</span>
                  <span className="veq-v tabular">{pv(ing.over)}</span>
                </div>
              </div>
            )}
            <div className="veq-term">
              <span className="veq-op">=</span>
              <div className="veq-box result">
                <span className="veq-k">{v.label}</span>
                <span className="veq-v tabular">{f[v.fmt](a.raw)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="vmeta">
          <div className="vmeta-read">{v.read}</div>
          <details className="vcalc">
            <summary>Cómo puntúa · {Math.round(a.m)} de {span} puntos</summary>
            <div className="vcalc-body">
              <code className="vformula">{v.formula}</code>
              <div className="vscale">
                <div className="vscale-track">
                  <div className="vscale-fill" style={{width: `${a.missing ? 0 : a.pct}%`}}/>
                  {!a.missing && <div className="vscale-pin" style={{left: `${a.pct}%`}}/>}
                </div>
                <div className="vscale-ends">
                  <span><em>umbral 0%</em> {f[v.fmt](v.t0)}</span>
                  <span className="vscale-pct tabular">percentil {a.missing ? '—' : Math.round(a.pct) + '%'}</span>
                  <span>{f[v.fmt](v.t100)} <em>umbral 100%</em></span>
                </div>
              </div>
              {(ing?.parts || []).some(pp => pp.est && pp.est(c)) && (
                <div className="vcalc-note">Las cifras marcadas <sup className="vp-est">e</sup> son estimadas; SABI no las publica y el modelo las computó como 0 al puntuar.</div>
              )}
              <div className="vcalc-m tabular">
                {v.transform === 'log_10' && a.tx != null && <>log₁₀ aplicado · </>}
                {v.mMin} + {a.missing ? 0 : Math.round(a.pct)}% × {span} = <strong className={neg ? 'neg' : 'pos'}>{a.missing ? 0 : Math.round(a.m)}</strong> puntos
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

window.PillarCard = function PillarCard({ pillar, c, validations, onValidate, pillarAdj }) {
  const f = window.fmt;
  const score = c[pillar.key] || 0;
  const cat = c[pillar.catKey];
  const adj = pillarAdj || {};
  const hasDelta = adj.delta != null && Math.abs(adj.delta) > 0.001;
  const [lo, hi] = pillar.range;
  const zero = Math.max(0, Math.min(100, (0 - lo) / (hi - lo) * 100));
  const pos = Math.max(0, Math.min(100, (score - lo) / (hi - lo) * 100));

  return (
    <div className="pillar">
      <div className="pillar-head">
        <div className="pillar-name">
          <div className={`pillar-tag ${pillar.id}`}/>
          <div>
            <h3 className="pillar-title">{pillar.title} <CatChip cat={cat}/></h3>
            <div className="pillar-sub">{pillar.subtitle}</div>
          </div>
        </div>
        <div className="pillar-score">
          <div className={`pillar-score-num tabular ${score < 0 ? 'neg' : ''}`}>{f.score(score)}</div>
          {hasDelta && (
            <div className={`pillar-adj tabular ${adj.delta > 0 ? 'up' : 'down'}`}>
              {adj.delta > 0 ? '↑' : '↓'} {f.score(adj.adjusted)} validado
            </div>
          )}
          <div className={`pillar-score-bar ${pillar.id}`}>
            <div className="psb-zero" style={{left: `${zero}%`}}/>
            <div className="psb-fill" style={{left: `${Math.min(zero, pos)}%`, width: `${Math.abs(pos - zero)}%`}}/>
          </div>
          <div className="pillar-score-label">prioridad · {lo} a {hi}</div>
        </div>
      </div>

      <p className="pillar-intro">{pillar.intro}</p>
      <div className="vtable">
        {pillar.vars.map(v => (
          <VarRow key={v.id} v={v} c={c} pillarId={pillar.id}
            validation={validations[`${pillar.id}-${v.id}`]} onValidate={onValidate}/>
        ))}
      </div>
    </div>
  );
};
