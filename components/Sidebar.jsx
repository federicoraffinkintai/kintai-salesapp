// Sidebar with company list
const { useState, useMemo, useEffect } = React;

window.Sidebar = function Sidebar({ companies, selectedNif, onSelect, statuses }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, hot, contacted, qualified

  const filtered = useMemo(() => {
    let list = companies;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(c =>
        c.empresa.toLowerCase().includes(q) ||
        (c.localidad || '').toLowerCase().includes(q) ||
        (c.sector || '').toLowerCase().includes(q) ||
        c.nif.toLowerCase().includes(q)
      );
    }
    if (filter === 'hot') list = list.filter(c => c.g >= 1000);
    if (filter === 'contacted') list = list.filter(c => statuses[c.nif] === 'contacted');
    if (filter === 'qualified') list = list.filter(c => statuses[c.nif] === 'qualified');
    return list;
  }, [companies, query, filter, statuses]);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <div className="brand-glyph">K</div>
          <div>
            <div className="brand-name">Kintai <em>Segment</em></div>
            <div className="brand-meta">Outbound · SDR Console</div>
          </div>
        </div>
      </div>

      <div className="sidebar-tools">
        <div className="search">
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/>
          </svg>
          <input
            placeholder="Buscar empresa, NIF, sector…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="filter-row">
          <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            Todos <span className="tabular" style={{opacity: 0.6}}>{companies.length}</span>
          </button>
          <button className={`chip ${filter === 'hot' ? 'active' : ''}`} onClick={() => setFilter('hot')}>
            <span className="chip-dot"/> Hot
          </button>
          <button className={`chip ${filter === 'contacted' ? 'active' : ''}`} onClick={() => setFilter('contacted')}>
            Contactados
          </button>
          <button className={`chip ${filter === 'qualified' ? 'active' : ''}`} onClick={() => setFilter('qualified')}>
            Cualificados
          </button>
        </div>
      </div>

      <div className="list-header">
        <strong>Top leads</strong>
        <span>{filtered.length} resultados</span>
      </div>

      <div className="lead-list">
        {filtered.map((c, i) => {
          const isActive = c.nif === selectedNif;
          const pct = Math.min(100, (c.g / window.SCORE_MAX) * 100);
          const status = statuses[c.nif];
          return (
            <div
              key={c.nif}
              className={`lead ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(c.nif)}
            >
              <span className={`lead-status-dot ${status || ''}`}/>
              <div className="lead-rank">{String(i + 1).padStart(2, '0')}</div>
              <div className="lead-body">
                <div className="lead-name">{c.empresa}</div>
                <div className="lead-sub">
                  <span>{c.localidad || c.ccaa || '—'}</span>
                  <span className="sep">·</span>
                  <span>{(c.sector || '').replace(/^[A-Z]\s*[–-]\s*/, '').slice(0, 24)}</span>
                </div>
              </div>
              <div className="lead-score">
                <div className="lead-score-num">{window.fmt.score(c.g)}</div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{width: `${pct}%`}}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
