// Marcador: rendimiento propio, récords, equipo y logros.
const { useMemo, useState } = React;

const nfmt = v => (v == null ? '—' : Math.round(v).toLocaleString('es-ES'));
const pfmt = v => (v == null ? '—' : v.toFixed(1).replace('.', ',') + '%');

window.Dashboard = function Dashboard({ history, log, callbacks, touches, sdrName, session, onGoPrep, onResume }) {
  const [rank, setRank] = useState('meetings');

  const mine = useMemo(() => {
    const s = history.map(h => ({ ...h, ...window.sprintStats(h.id, log, callbacks) }));
    const agg = s.reduce((a, x) => ({
      calls: a.calls + x.calls, gk: a.gk + x.gk, gkPassed: a.gkPassed + x.gkPassed,
      dm: a.dm + x.dm, meetings: a.meetings + x.meetings, minutes: a.minutes + (x.minutes || 0),
    }), { calls:0, gk:0, gkPassed:0, dm:0, meetings:0, minutes:0 });
    agg.sprints = s.length;
    agg.gkNames = Object.values(touches || {}).filter(t => t && t.gk).length;
    return { sprints: s, agg };
  }, [history, log, callbacks, touches]);

  const me = { ...mine.agg, name: sdrName || 'Tú', self: true };
  const team = useMemo(() => window.TEAM_DEMO.map(m => (m.self ? { ...me, id:'me', badges: null } : m)), [me]);
  const ranked = useMemo(() => {
    const r = window.TEAM_RANKS.find(x => x.id === rank);
    return [...team].sort((a, b) => r.get(b) - r.get(a));
  }, [team, rank]);
  const rankDef = window.TEAM_RANKS.find(x => x.id === rank);
  const myPos = ranked.findIndex(m => m.self) + 1;

  // Agregado del equipo: la suma de los SDR de la temporada.
  const eq = useMemo(() => team.reduce((a, m2) => ({
    sprints: a.sprints + (m2.sprints || 0), calls: a.calls + (m2.calls || 0),
    gk: a.gk + (m2.gk || 0), gkPassed: a.gkPassed + (m2.gkPassed || 0),
    dm: a.dm + (m2.dm || 0), meetings: a.meetings + (m2.meetings || 0),
  }), { sprints:0, calls:0, gk:0, gkPassed:0, dm:0, meetings:0 }), [team]);

  // Porcentaje con coma decimal, como el resto de la aplicación.
  const pc = (v, d) => v == null || isNaN(v) ? '—' : v.toFixed(d == null ? 1 : d).replace('.', ',') + '%';

  const earned = window.BADGES.filter(b => { try { return b.test(mine.sprints, mine.agg); } catch { return false; } });
  const earnedIds = new Set(earned.map(b => b.id));

  const last = mine.sprints[mine.sprints.length - 1];
  const conv = window.rate(mine.agg.meetings, mine.agg.calls);
  const gkRate = window.rate(mine.agg.gkPassed, mine.agg.gk);
  const openSprint = session && !session.active;

  return (
    <div className="ws-inner dash" data-screen-label="05 Performance SDR">
      <header className="dash-head">
        <div className="crumbs"><span>Hunting</span><span className="sep">›</span><span>Performance SDR</span></div>
        <h1 className="company-name">Performance SDR</h1>
        <div className="dash-head-d">Agregado del equipo y clasificación arriba; abajo, el dashboard de cada SDR y tu detalle personal.</div>
      </header>


      <section className="bk-block sdr-equipo">
        <div className="bk-bh">
          <span className="bk-chip">Equipo SDR</span>
          <span className="bk-bh-d">Agregado de los {team.length} SDR de la temporada: actividad, paso de gatekeeper y reuniones conseguidas.</span>
          <span className="bk-bh-k mono">{eq.calls.toLocaleString('es-ES')} llamadas · {eq.meetings} reuniones</span>
        </div>
        <div className="ap-eq">
          {[
            { l:'Sprints', v:eq.sprints, s:'cerrados por el equipo' },
            { l:'Llamadas', v:eq.calls.toLocaleString('es-ES'), s:(eq.sprints ? Math.round(eq.calls / eq.sprints) : 0) + ' por sprint' },
            { l:'Gatekeeper', v:eq.gk.toLocaleString('es-ES'), s:pc(window.rate(eq.gkPassed, eq.gk), 0) + ' superado' },
            { l:'Decisores', v:eq.dm.toLocaleString('es-ES'), s:pc(window.rate(eq.dm, eq.calls), 0) + ' de las llamadas' },
            { l:'Reuniones', v:eq.meetings, s:pc(window.rate(eq.meetings, eq.calls)) + ' de conversión' },
            { l:'Llamadas por reunión', v:eq.meetings ? Math.round(eq.calls / eq.meetings) : '—', s:'lo que cuesta una reunión' },
            { l:'Reuniones por sprint', v:eq.sprints ? (eq.meetings / eq.sprints).toFixed(1).replace('.', ',') : '—', s:'ritmo del equipo' },
          ].map(k => (
            <div key={k.l} className="ap-eq-k">
              <div className="ap-eq-l">{k.l}</div>
              <div className="ap-eq-n mono">{k.v}</div>
              <div className="ap-eq-s">{k.s}</div>
            </div>
          ))}
        </div>
        <div className="bk-bn">
          <span className="bk-use">{pc(window.rate(eq.meetings, eq.calls))} de llamada a reunión</span>
          <span className="bk-use">{pc(window.rate(eq.gkPassed, eq.gk), 0)} de paso de gatekeeper</span>
          El cuello del equipo está {window.rate(eq.gkPassed, eq.gk) < 30 ? 'en el gatekeeper: de cada diez porteros solo pasan ' + (window.rate(eq.gkPassed, eq.gk) / 10).toFixed(1).replace('.', ',') + '.' : 'después del gatekeeper, en la conversación con el decisor.'}
        </div>
      </section>

      <div className="dash-fn">
        <window.FunnelBlock canal="Outbound" fases={window.FN_SDR}
          titulo="Embudo del SDR" tone="#2E7D5B"
          nota="Prospección → cualificación → deal, sobre los deals de origen outbound. El SDR entrega en discovery: de ahí en adelante es del AE."/>
      </div>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Clasificación del equipo</h2>
          <div className="dash-tabs">
            {window.TEAM_RANKS.map(r => (
              <button key={r.id} className={`chip ${rank === r.id ? 'active' : ''}`} onClick={() => setRank(r.id)}>{r.label}</button>
            ))}
          </div>
        </div>
        <div className="dash-board">
          {ranked.map((m, i) => {
            const v = rankDef.get(m);
            const top = rankDef.get(ranked[0]) || 1;
            return (
              <div className={`db-row ${m.self ? 'me' : ''} ${i === 0 ? 'first' : ''}`} key={m.id || m.name}>
                <span className={`db-pos tabular ${i < 3 ? 'podio' : ''}`}>{i + 1}</span>
                <span className="db-name">{m.name}{m.self && <em>tú</em>}</span>
                <div className="db-bar"><div style={{width: `${Math.min(100, (v / top) * 100)}%`}}/></div>
                <span className="db-v tabular">{rankDef.fmt(v)}</span>
                <span className="db-sub tabular">{m.sprints || 0} sprints</span>
              </div>
            );
          })}
        </div>
        <div className="sdr-detalle">
          <table className="bk-table">
            <thead><tr>
              <th>SDR</th><th className="num">Sprints</th><th className="num">Llamadas</th>
              <th className="num">Gatekeeper</th><th className="num">Paso GK</th>
              <th className="num">Decisores</th><th className="num">Reuniones</th>
              <th className="num">Conversión</th><th className="num">Llamadas por reunión</th><th className="num">Reuniones por sprint</th>
            </tr></thead>
            <tbody>
              {ranked.map(m2 => (
                <tr key={m2.id || m2.name} className={m2.self ? 'on' : ''}>
                  <td className="bk-nom"><b>{m2.name}</b>{m2.self && <em>tú · cifras reales</em>}</td>
                  <td className="num mono">{m2.sprints || 0}</td>
                  <td className="num mono">{(m2.calls || 0).toLocaleString('es-ES')}</td>
                  <td className="num mono">{(m2.gk || 0).toLocaleString('es-ES')}</td>
                  <td className="num mono">{m2.gk ? pc(window.rate(m2.gkPassed, m2.gk), 0) : '—'}</td>
                  <td className="num mono">{(m2.dm || 0).toLocaleString('es-ES')}</td>
                  <td className="num mono"><b>{m2.meetings || 0}</b></td>
                  <td className="num mono">{m2.calls
                    ? <span className="k-ach" style={{'--c': window.rate(m2.meetings, m2.calls) >= 3 ? '#1F5C42' : window.rate(m2.meetings, m2.calls) >= 2 ? '#B8731F' : '#B23A3A'}}>{pc(window.rate(m2.meetings, m2.calls))}</span>
                    : '—'}</td>
                  <td className="num mono">{m2.meetings ? Math.round(m2.calls / m2.meetings) : '—'}</td>
                  <td className="num mono">{m2.sprints ? (m2.meetings / m2.sprints).toFixed(1).replace('.', ',') : '—'}</td>
                </tr>
              ))}
              <tr className="bk-row-tot">
                <td>Equipo</td>
                <td className="num mono">{eq.sprints}</td>
                <td className="num mono">{eq.calls.toLocaleString('es-ES')}</td>
                <td className="num mono">{eq.gk.toLocaleString('es-ES')}</td>
                <td className="num mono">{pc(window.rate(eq.gkPassed, eq.gk), 0)}</td>
                <td className="num mono">{eq.dm.toLocaleString('es-ES')}</td>
                <td className="num mono">{eq.meetings}</td>
                <td className="num mono">{pc(window.rate(eq.meetings, eq.calls))}</td>
                <td className="num mono">{eq.meetings ? Math.round(eq.calls / eq.meetings) : '—'}</td>
                <td className="num mono">{eq.sprints ? (eq.meetings / eq.sprints).toFixed(1).replace('.', ',') : '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="dash-note">
          Los compañeros son <b>datos de ejemplo</b> para poder juzgar el marcador. Tus cifras sí son reales,
          calculadas a partir de los sprints que cierras.
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Dashboards individuales</h2>
          <span className="section-hint">Uno por SDR. El tuyo lleva tus cifras reales; el resto son datos de ejemplo.</span>
        </div>
        <div className="sdr-cards">
          {ranked.map((m2, i) => {
            const conv = m2.calls ? window.rate(m2.meetings, m2.calls) : null;
            const gkp = m2.gk ? window.rate(m2.gkPassed, m2.gk) : null;
            const bd = m2.self ? earned.map(b => b.id) : (m2.badges || []);
            return (
              <div className={`sdr-card ${m2.self ? "me" : ""}`} key={m2.id || m2.name}>
                <div className="sdr-card-h">
                  <span className="sdr-pos mono">{i + 1}</span>
                  <div>
                    <div className="sdr-nom">{m2.name}{m2.self && <em>tú</em>}</div>
                    <div className="sdr-sub">{m2.sprints || 0} sprints · {(m2.calls || 0).toLocaleString("es-ES")} llamadas</div>
                  </div>
                  <span className="sdr-meet mono">{m2.meetings || 0}<em>reuniones</em></span>
                </div>
                <div className="sdr-kpis">
                  {[
                    { l:"Conversión", v:conv != null ? pc(conv) : "—", s:"llamada a reunión" },
                    { l:"Paso GK", v:gkp != null ? pc(gkp, 0) : "—", s:(m2.gk || 0).toLocaleString("es-ES") + " porteros" },
                    { l:"Decisores", v:(m2.dm || 0).toLocaleString("es-ES"), s:m2.calls ? pc(window.rate(m2.dm, m2.calls), 0) + " de llamadas" : "—" },
                    { l:"Llamadas por reunión", v:m2.meetings ? Math.round(m2.calls / m2.meetings) : "—", s:"coste de una reunión" },
                    { l:"Reuniones por sprint", v:m2.sprints ? (m2.meetings / m2.sprints).toFixed(1).replace(".", ",") : "—", s:"ritmo" },
                  ].map(k => (
                    <div className="sdr-k" key={k.l}>
                      <span className="sdr-k-l">{k.l}</span>
                      <span className="sdr-k-n mono">{k.v}</span>
                      <span className="sdr-k-s">{k.s}</span>
                    </div>
                  ))}
                </div>
                <div className="sdr-embudo">
                  {[["Llamadas", m2.calls || 0], ["Gatekeeper", m2.gk || 0], ["Decisores", m2.dm || 0], ["Reuniones", m2.meetings || 0]].map(([l, v]) => (
                    <div className="sdr-e" key={l}>
                      <span>{l}</span>
                      <div><i style={{width: Math.min(100, (v / Math.max(1, m2.calls || 1)) * 100) + "%"}}/></div>
                      <b className="mono">{v.toLocaleString("es-ES")}</b>
                    </div>
                  ))}
                </div>
                <div className="sdr-badges">
                  {bd.length ? bd.map(id => {
                    const b = window.BADGES.find(x => x.id === id);
                    return b ? <span className="ap-badge" key={id} title={b.name + " · " + b.desc}>{b.icon}</span> : null;
                  }) : <span className="sdr-nobadge">Sin insignias todavía</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="dash-mine-h">
        <h2 className="section-title">Tu detalle</h2>
        <span className="section-hint">Tus cifras, tus récords y tu historial de sprints.</span>
      </div>

      <header className="dash-hero">
        <div className="dh-l">
          <h2 className="section-title">{sdrName || 'Tú'} · temporada actual</h2>
          <div className="dh-pos">
            {mine.agg.sprints === 0
              ? <>Aún no has cerrado ningún sprint. El marcador se llena solo en cuanto cierres el primero.</>
              : <>Vas <b>{myPos}º de {ranked.length}</b> por {rankDef.label.toLowerCase()} · <b>{mine.agg.sprints}</b> sprints cerrados</>}
          </div>
        </div>
        <div className="dh-r">
          {openSprint
            ? <button className="btn gold lg" onClick={onResume}>Reanudar sprint abierto</button>
            : <button className="btn gold lg" onClick={onGoPrep}>Preparar un sprint</button>}
        </div>
      </header>
      <div className="dash-kpis">
        <div className="dk big">
          <span className="dk-k">Reuniones</span>
          <b className="tabular">{nfmt(mine.agg.meetings)}</b>
          <em>{last ? `${last.meetings} en el último sprint` : 'sin sprints todavía'}</em>
        </div>
        <div className="dk">
          <span className="dk-k">Llamadas</span>
          <b className="tabular">{nfmt(mine.agg.calls)}</b>
          <em>{mine.agg.sprints ? `${Math.round(mine.agg.calls / mine.agg.sprints)} por sprint` : '—'}</em>
        </div>
        <div className="dk">
          <span className="dk-k">Conversión</span>
          <b className="tabular">{pfmt(conv)}</b>
          <em>llamada → reunión</em>
        </div>
        <div className="dk">
          <span className="dk-k">Paso de filtro</span>
          <b className="tabular">{gkRate ? Math.round(gkRate) + '%' : '—'}</b>
          <em>{nfmt(mine.agg.gkPassed)} de {nfmt(mine.agg.gk)} gatekeepers</em>
        </div>
        <div className="dk">
          <span className="dk-k">Decisores</span>
          <b className="tabular">{nfmt(mine.agg.dm)}</b>
          <em>conversaciones reales</em>
        </div>
        <div className="dk">
          <span className="dk-k">Tiempo</span>
          <b className="tabular">{mine.agg.minutes ? Math.round(mine.agg.minutes / 60) + 'h' : '—'}</b>
          <em>en modo caza</em>
        </div>
      </div>
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Tus récords</h2>
          <span className="section-hint">Lo que hay que batir la próxima vez.</span>
        </div>
        <div className="dash-recs">
          {window.RECORDS.map(r => {
            const v = mine.sprints.length ? r.get(mine.sprints) : 0;
            const best = Math.max(...window.TEAM_DEMO.filter(m => !m.self).map(m =>
              r.id === 'meetings' ? Math.ceil(m.meetings / m.sprints * 1.8)
              : r.id === 'calls' ? Math.round(m.calls / m.sprints * 1.25)
              : r.id === 'gk' ? Math.round(m.gkPassed / m.sprints * 1.6)
              : window.rate(m.meetings, m.calls) * 1.7));
            const pct = best > 0 ? Math.min(100, (v / best) * 100) : 0;
            return (
              <div className="dr" key={r.id}>
                <span className="dr-k">{r.label}</span>
                <b className="tabular">{r.unit === '%' ? pfmt(v) : nfmt(v)}</b>
                <div className="dr-bar"><div style={{width: `${pct}%`}}/></div>
                <em>mejor del equipo {r.unit === '%' ? pfmt(best) : nfmt(best)}</em>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Logros</h2>
          <span className="section-hint">{earned.length} de {window.BADGES.length} conseguidos.</span>
        </div>
        <div className="dash-badges">
          {window.BADGES.map(b => (
            <div className={`bg ${earnedIds.has(b.id) ? 'on' : ''}`} key={b.id}>
              <span className="bg-i">{b.icon}</span>
              <div className="bg-c">
                <div className="bg-n">{b.name}</div>
                <div className="bg-d">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {mine.sprints.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Historial</h2>
            <span className="section-hint">Tus sprints cerrados.</span>
          </div>
          <div className="dash-hist">
            <div className="dhh">
              <span>Fecha</span><span className="ta-r">Duración</span><span className="ta-r">Llamadas</span>
              <span className="ta-r">Gatekeepers</span><span className="ta-r">Decisores</span>
              <span className="ta-r">Reuniones</span><span className="ta-r">Conversión</span>
            </div>
            {[...mine.sprints].reverse().map(s => (
              <div className="dhr" key={s.id}>
                <span>{new Date(s.closedAt || s.id.replace('sp-', '') * 1).toLocaleDateString('es-ES', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                <span className="ta-r tabular">{s.minutes ? Math.round(s.minutes) + ' min' : '—'}</span>
                <span className="ta-r tabular">{s.calls}</span>
                <span className="ta-r tabular">{s.gkPassed}/{s.gk}</span>
                <span className="ta-r tabular">{s.dm}</span>
                <span className={`ta-r tabular ${s.meetings > 0 ? 'win' : ''}`}>{s.meetings}</span>
                <span className="ta-r tabular">{pfmt(window.rate(s.meetings, s.calls))}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
