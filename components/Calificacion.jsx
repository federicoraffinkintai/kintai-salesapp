// Calificación de cartera: las preguntas que estrechan el encaje
const { useState } = React;

window.Calificacion = function Calificacion({ c, validations, onValidate, callState, onCall, feedback, onFeedback, q: qProp, onQ }) {
  const [todo, setTodo] = useState(() => window.calGet());
  const [qOwn, setQOwn] = useState('');
  const externa = typeof onQ === 'function';
  const q = externa ? (qProp || '') : qOwn;
  const setQ = externa ? onQ : setQOwn;
  const R = todo[c.nif] || {};
  const set = (campo, valor) => setTodo(window.calSet(c.nif, campo, valor));
  const st = callState || {};
  const PL = id => (window.PILLARS || []).find(p => p.id === id);

  const N = (v) => window.pfFmt.n(v);
  const P = (v, d) => v == null || isNaN(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d).replace('.', ',') + '%';
  const enc = window.calEncaje(c.enc, R);
  const sig = window.calSiguiente(R);
  const campos = window.CAL_CAMPOS.filter(x => !x.soloSi || x.soloSi(R));
  const norm = s => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const qn = norm(q.trim());
  const visibles = !qn ? campos : campos.filter(campo => {
    const ops = (campo.opciones || []).map(o => o.label + ' ' + (o.nota || '')).join(' ');
    return norm([campo.label, campo.pregunta, campo.porque, ops].join(' ')).indexOf(qn) >= 0;
  });

  const PCT = [0, 0.2, 0.4, 0.6, 0.8, 1];

  return (
    <section className="section cal">
      {!externa && <div className="cal-search-bar">
        <label className="cal-search">
          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><circle cx="6.8" cy="6.8" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M10.2 10.2 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar campo, pregunta o respuesta de calificación"/>
          {q && <button type="button" className="cal-search-x" onClick={() => setQ('')} aria-label="Limpiar búsqueda">×</button>}
        </label>
        {qn && <span className="cal-search-n">{visibles.length} de {campos.length} campos</span>}
      </div>}
      <div className="section-head">
        <h2 className="section-title">Encaje avanzado</h2>
        <span className="section-hint">A priori solo tenemos el periodo medio de cobro. El resto del encaje se descubre hablando</span>
        <div className={'cal-score ' + (enc.delta > 0 ? 'up' : enc.delta < 0 ? 'down' : '')}>
          <span className="cal-score-b mono">{N(enc.base)}</span>
          <span className="cal-score-a">→</span>
          <span className="cal-score-n mono">{N(enc.ajustado)}</span>
          <em>{enc.delta > 0 ? '+' : ''}{N(enc.delta)} sobre el pilar de encaje (eje {N(enc.rango[0])} a {N(enc.rango[1])}){!enc.fiable && enc.respondidos > 0 ? ' · provisional' : ''}{enc.topado ? ' · topado en el máximo' : ''}</em>
        </div>
      </div>

      <div className="cal-enc">
        <div className="cal-enc-k">
          <span className="cf-col-k">Punto de partida · lo único que sabe SABI de su cartera</span>
          <em>Una sola variable, el plazo de cobro. El resto del encaje se pregunta abajo, en la calificación de cartera.</em>
        </div>
        {PL('fit') && <window.PillarCard pillar={PL('fit')} c={c} validations={validations || {}} onValidate={onValidate || (() => {})}/>}
      </div>

      <div className="cal-body">
        <div className="cal-enc-k">
          <span className="cf-col-k">Calificación de cartera · lo que no está en ninguna base de datos</span>
          <em>A cuántos clientes factura, de qué tamaño, si repiten, si son empresas y cómo cobran. Sale de la conversación y mueve la misma cifra de arriba.</em>
        </div>
        <div className="cal-prog">
          <div className="cal-prog-bar"><i style={{width: (enc.cobertura * 100) + '%'}}/></div>
          <span>{enc.respondidos} de {enc.campos} campos · {P(enc.cobertura)} del peso de calificación</span>
          {sig && <span className="cal-next">Siguiente: <b>{sig.label}</b></span>}
        </div>

        <div className="cal-grid">
        {visibles.map(campo => {
          const v = R[campo.id];
          const hecho = v != null && (!Array.isArray(v) || v.length > 0);
          const det = enc.detalle.find(d => d.id === campo.id);
          return (
            <div className={'cal-c ' + (hecho ? 'done' : '') + (sig && sig.id === campo.id ? ' next' : '')} key={campo.id}>
              <div className="cal-c-h">
                <b>{campo.label}</b>
                <span className="cal-peso mono" title="Peso sobre el ajuste de encaje">{campo.peso}</span>
              </div>
              <div className="cal-q">{campo.pregunta}</div>

              {campo.tipo === 'pct' ? (
                <div className="cal-opts">
                  {PCT.map(x => (
                    <button key={x} className={v === x ? 'on' : ''} onClick={() => set(campo.id, x)}>{P(x)}</button>
                  ))}
                </div>
              ) : campo.tipo === 'multi' ? (
                <div className="cal-opts">
                  {campo.opciones.map(o => {
                    const sel = Array.isArray(v) && v.indexOf(o.id) >= 0;
                    return (
                      <button key={o.id} className={sel ? 'on' : ''} title={o.nota}
                        onClick={() => {
                          const cur = Array.isArray(v) ? v.slice() : [];
                          const i = cur.indexOf(o.id);
                          if (i >= 0) cur.splice(i, 1); else cur.push(o.id);
                          set(campo.id, cur);
                        }}>{o.label}</button>
                    );
                  })}
                </div>
              ) : (
                <div className="cal-opts">
                  {campo.opciones.map(o => (
                    <button key={o.id} className={v === o.id ? 'on' : ''} title={o.nota}
                      onClick={() => set(campo.id, o.id)}>{o.label}</button>
                  ))}
                </div>
              )}

              {det ? (
                <div className={'cal-efecto ' + (det.delta > 0 ? 'up' : det.delta < 0 ? 'down' : '')}>
                  <b className="mono">{det.delta > 0 ? '+' : ''}{N(det.delta)}</b>
                  <span>{det.nota}</span>
                </div>
              ) : (
                <div className="cal-porque">{campo.porque}</div>
              )}
            </div>
          );
        })}
        </div>
        {qn && visibles.length === 0 && <div className="cal-search-empty">Ningún campo de calificación coincide con «{q.trim()}».</div>}
      </div>

      <div className="cal-foot">
        {window.CAL_META.base} De la cartera solo deja inferir el <b>periodo medio de cobro</b> ({c.pmc ? Math.round(c.pmc) + ' días' : 'sin dato'}), así que el encaje de partida ignora a cuántos clientes factura, de qué tamaño, si repiten y cómo cobra.
        {' '}{window.CAL_META.aviso} La cifra de arriba es <b>el mismo pilar de encaje</b> que muestra la tarjeta de scoring, con el ajuste de cartera aplicado: parte de {N(enc.base)} y se mueve dentro del eje del pilar, de {N(enc.rango[0])} a {N(enc.rango[1])}.
        {enc.topado && <> El ajuste bruto sería {N(enc.deltaCrudo)} pero el pilar no pasa de {N(enc.rango[1])}, así que se muestra topado.</>}
        {enc.respondidos > 0 && !enc.fiable && <> Con {P(enc.cobertura)} del peso contestado el ajuste de <b>{N(enc.delta)}</b> es provisional: falta {sig ? sig.label.toLowerCase() : 'algún campo de peso'}.</>}
      </div>

      <div className="cal-bud">
        <div className="cal-bud-h">
          <span className="cf-col-k">Budget · le compensa pagar por el circulante</span>
          <span className="cal-bud-w">Opcional. Para cuando el precio es la objeción</span>
          <button className="cal-adv-t" onClick={() => onCall && onCall('adv', !st.adv)}>{st.adv ? 'Ocultar' : 'Abrir'}</button>
        </div>
        {st.adv && (
          <div className="cf-two">
            <aside className="cf-col-ev">
              {PL('budget') && <window.PillarCard pillar={PL('budget')} c={c} validations={validations || {}} onValidate={onValidate || (() => {})}/>}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
};
