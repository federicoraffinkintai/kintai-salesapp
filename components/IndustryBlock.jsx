// Industry context block: benchmark vs won clients + auto-flagged pain points
window.IndustryBlock = function IndustryBlock({ c, painState, onPain, part }) {
  const ind = window.getIndustryFor(c);
  const f = window.fmt;
  const [tab, setTab] = React.useState('pains');

  const pmp = c.pmp;
  const margen = c.ventas ? (c.ebitda / c.ventas) * 100 : null;

  const rows = [
    { k: 'PMC · cobro', mine: c.pmc, bench: ind.bench.pmc, unit: 'd', worseWhenHigher: true },
    { k: 'PMP · pago', mine: pmp, bench: ind.bench.pmp, unit: 'd', worseWhenHigher: true },
    { k: 'Margen EBITDA', mine: margen, bench: ind.bench.margen, unit: '%', worseWhenHigher: false },
    { k: 'Facturación', mine: c.ventas ? c.ventas / 1000 : null, bench: ind.bench.ventas, unit: 'k€', worseWhenHigher: false },
  ];

  const activePains = ind.pains.filter(p => { try { return p.test(c); } catch { return false; } });

  const showPains = !part || part === 'pains';
  const showBench = !part || part === 'bench';

  if (part === 'bench') {
    return (
      <div className="ind-block">
        <div className="ind-bench solo">
          <div className="ind-bench-label">{ind.label} · este prospect frente a los clientes que ya hemos ganado</div>
          {rows.map(r => {
            const has = r.mine != null && !isNaN(r.mine);
            const max = Math.max(Math.abs(r.mine || 0), Math.abs(r.bench)) * 1.15 || 1;
            const gap = has ? r.mine - r.bench : null;
            const worse = has && (r.worseWhenHigher ? gap > 0 : gap < 0);
            const neg = has && r.mine < 0;
            return (
              <div className="bench-row" key={r.k}>
                <div className="bench-k">{r.k}</div>
                <div className="bench-bars">
                  <div className={`bench-bar mine ${neg ? 'neg' : ''}`}><div style={{width: `${has ? Math.min(100, Math.abs(r.mine) / max * 100) : 0}%`}}/></div>
                  <div className="bench-bar peer"><div style={{width: `${Math.min(100, Math.abs(r.bench) / max * 100)}%`}}/></div>
                </div>
                <div className="bench-nums">
                  <span className={`bench-mine tabular ${worse ? 'flag' : ''}`}>{has ? Math.round(r.mine).toLocaleString('es-ES') + r.unit : '—'}</span>
                  <span className="bench-peer tabular">{Math.round(r.bench).toLocaleString('es-ES') + r.unit}</span>
                </div>
              </div>
            );
          })}
          <div className="bench-legend">
            <span><i className="sw mine"/>Este prospect</span>
            <span><i className="sw peer"/>Mediana de {ind.wins} clientes ganados</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ind-block">
      <div className="ind-pains-head">
        <span className="ind-pains-title">Pain points del sector</span>
        <span className="ind-pains-note">
          <i className="dot-live"/>{activePains.length} de {ind.pains.length} se confirman en los números de esta empresa
        </span>
      </div>

      <div className="ind-pains">
        {ind.pains.map((p, i) => {
          const live = activePains.includes(p);
          const st = painState[`${ind.id}-${i}`];
          return (
            <div className={`pain ${live ? 'live' : ''} ${st ? 'st-' + st : ''}`} key={i}>
              <div className="pain-head">
                <span className={`pain-flag ${live ? 'on' : ''}`}>{live ? 'En sus números' : 'Genérico'}</span>
                <div className="pain-marks">
                  <button className={`tick ${st === 'hit' ? 'on confirm' : ''}`} title="Le duele" onClick={() => onPain(`${ind.id}-${i}`, st === 'hit' ? null : 'hit')}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                  <button className={`tick ${st === 'miss' ? 'on deny' : ''}`} title="No le aplica" onClick={() => onPain(`${ind.id}-${i}`, st === 'miss' ? null : 'miss')}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
              <div className="pain-t">{p.t}</div>
              <div className="pain-d">{p.d}</div>
              <div className="pain-ask"><span className="pain-tagline">Pregunta</span>{p.ask}</div>
              <div className="pain-say"><span className="pain-tagline gold">Dilo así</span>{p.say}</div>
            </div>
          );
        })}
      </div>
      <div className="ind-opener">
        <span className="ind-opener-label">Apertura de industria</span>
        <p>{ind.opener}</p>
      </div>

      <div className="ind-top">
        <div className="ind-id">
          <div className="ind-eyebrow">Contexto de industria</div>
          <h3 className="ind-name">{ind.label}</h3>
          <div className="ind-stats">
            <span className="ind-stat"><strong className="tabular">{ind.wins}</strong> clientes ganados</span>
            <span className="ind-stat-sep"/>
            <span className="ind-stat"><strong className="tabular">{ind.share.toFixed(1)}%</strong> del book</span>
            {ind.ticket > 0 && <><span className="ind-stat-sep"/>
            <span className="ind-stat">ticket medio <strong className="tabular">{Math.round(ind.ticket / 1000)}k€</strong></span></>}
          </div>
          {ind.refs.length > 0 && (
            <div className="ind-refs">
              <span className="ind-refs-label">Referencias para nombrar</span>
              <div className="ind-refs-list">
                {ind.refs.map(r => <span className="ind-ref" key={r}>{r}</span>)}
              </div>
            </div>
          )}
        </div>

        {showBench && <div className="ind-bench">
          <div className="ind-bench-label">Este prospect vs. clientes ganados del sector</div>
          {rows.map(r => {
            const has = r.mine != null && !isNaN(r.mine);
            const max = Math.max(Math.abs(r.mine || 0), Math.abs(r.bench)) * 1.15 || 1;
            const gap = has ? r.mine - r.bench : null;
            const worse = has && (r.worseWhenHigher ? gap > 0 : gap < 0);
            const neg = has && r.mine < 0;
            const mineW = has ? Math.min(100, Math.abs(r.mine) / max * 100) : 0;
            return (
              <div className="bench-row" key={r.k}>
                <div className="bench-k">{r.k}</div>
                <div className="bench-bars">
                  <div className={`bench-bar mine ${neg ? 'neg' : ''}`}><div style={{width: `${mineW}%`}}/></div>
                  <div className="bench-bar peer"><div style={{width: `${Math.min(100, Math.abs(r.bench) / max * 100)}%`}}/></div>
                </div>
                <div className="bench-nums">
                  <span className={`bench-mine tabular ${worse ? 'flag' : ''}`}>{has ? Math.round(r.mine).toLocaleString('es-ES') + r.unit : '—'}</span>
                  <span className="bench-peer tabular">{Math.round(r.bench).toLocaleString('es-ES') + r.unit}</span>
                </div>
              </div>
            );
          })}
          <div className="bench-legend">
            <span><i className="sw mine"/>Este prospect</span>
            <span><i className="sw peer"/>Mediana clientes ganados</span>
          </div>
        </div>}
      </div>

    </div>
  );
};
