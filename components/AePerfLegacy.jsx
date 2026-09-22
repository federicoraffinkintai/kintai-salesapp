// Versión anterior de la pestaña (histórico medido en HubSpot): ranking por
// métrica, récords, insignias y ficha por AE. Se mantiene debajo del rediseño
// como referencia — no es objetivo, es lo que ya pasó.
const { useState: lUseState, useMemo: lUseMemo } = React;

const lN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
const l1 = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(1).replace('.', ',');
const lP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 1 : d).replace('.', ',') + '%';
const lEur = (v) => v == null ? '—' : v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + 'M€'
  : v >= 1e3 ? Math.round(v / 1e3) + 'k€' : lN(v) + '€';

window.AePerfLegacy = function AePerfLegacy() {
  const perf = lUseMemo(() => window.aePerf({ desde: '2025-01' }), []);
  const [met, setMet] = lUseState('eurW');
  const [sel, setSel] = lUseState(perf.list[0].key);
  const [soloActivos, setSoloActivos] = lUseState(true);

  const rank = window.AE_RANKS.find(r => r.id === met);
  const base = soloActivos ? perf.activos : perf.list;
  const orden = lUseMemo(() => {
    const v = base.slice();
    v.sort((a, b) => {
      const x = rank.get(a), y = rank.get(b);
      if (x == null) return 1; if (y == null) return -1;
      return rank.mejor === 'bajo' ? x - y : y - x;
    });
    return v;
  }, [met, soloActivos]);
  const a = perf.list.find(x => x.key === sel) || perf.list[0];
  const maxMes = Math.max(1, ...perf.totalRows.map(r => r.w));

  const segsDe = (obj) => {
    const tot = Object.values(obj || {}).reduce((x, y) => x + y, 0) || 1;
    return window.AE_SEGS.filter(s => (obj || {})[s.id]).map(s => ({ ...s, n: obj[s.id], pct: obj[s.id] / tot }));
  };
  const canalesDe = (obj) => {
    const tot = Object.keys(obj || {}).filter(k => k !== '—').reduce((x, k) => x + obj[k], 0) || 1;
    return window.AE_CANALES.filter(c => (obj || {})[c.id]).map(c => ({ ...c, n: obj[c.id], pct: obj[c.id] / tot }));
  };

  return (
    <div className="ap" data-screen-label="11b Performance AE · versión anterior">
      <div className="bk-lvl-h">Versión anterior · histórico medido (referencia)</div>
      <div className="bk-lvl2-n" style={{marginBottom:'12px'}}>
        Esta es la pestaña tal como estaba antes del rediseño: mira <b>atrás</b>, no adelante. Ranking por métrica sobre el {window.AE_META.fuente}, con insignias y récords de equipo. {window.AE_META.nota} Se queda aquí como inspiración mientras decidimos qué partes valen la pena en la versión nueva.
      </div>

      {/* ===== RÉCORDS DEL EQUIPO ===== */}
      <div className="ap-records">
        {window.AE_RECORDS.map(r => {
          const v = r.get(perf.list);
          return (
            <div key={r.id} className="ap-rec">
              <div className="ap-rec-l">{r.label}</div>
              <div className="ap-rec-n">{!isFinite(v) ? '—' : r.eur ? lEur(v) : r.pct ? lP(v, 1) : lN(v) + (r.unit || '')}</div>
            </div>
          );
        })}
      </div>

      {/* ===== RANKING ===== */}
      <div className="ob-lv">
        <label>Ordenar por</label>
        <div className="bk-fg">
          {window.AE_RANKS.map(r => (
            <button key={r.id} className={met === r.id ? 'on' : ''} onClick={() => setMet(r.id)}>{r.label}</button>
          ))}
        </div>
        <div className="bk-fg" style={{marginLeft:'auto'}}>
          <button className={soloActivos ? 'on' : ''} onClick={() => setSoloActivos(!soloActivos)}>Solo AE activos</button>
        </div>
      </div>
      {rank.imputado && <div className="bk-lvl2-n" style={{marginBottom:'10px'}}><b>Métrica imputada.</b> {rank.nota}</div>}
      <div className="ap-podio">
        {orden.map((x, i) => (
          <div key={x.key} className={'ap-card' + (i === 0 ? ' first' : '') + (sel === x.key ? ' on' : '')} onClick={() => setSel(x.key)}>
            <div className="ap-pos">{i + 1}</div>
            <div className="ap-card-b">
              <div className="ap-nom">{x.nombre}{!x.activo && <em className="ap-off">baja</em>}</div>
              <div className="ap-metric">{rank.fmt(rank.get(x))}<span>{rank.label.toLowerCase()}</span></div>
              <div className="ap-mini"><span>{lN(x.w)} ganados</span><span>{lP(x.wr, 0)} cierre</span><span>{x.ticket ? lEur(x.ticket) : '—'} ticket</span></div>
              <div className="ap-badges">
                {x.badges.map(b => {
                  const bd = window.AE_BADGES.find(y => y.id === b);
                  return <span key={b} className="ap-badge" title={bd.name + ' · ' + bd.desc}>{bd.icon}</span>;
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== TABLA COMPLETA ===== */}
      <div className="bk-lvl2">
        <table className="bk-table">
          <thead><tr>
            <th>AE</th><th className="num">Deals</th><th className="num">Ganados</th><th className="num">Perdidos</th>
            <th className="num">Abiertos</th><th className="num">Tasa de cierre</th><th className="num">Volumen ganado</th>
            <th className="num">Ticket medio</th><th className="num">Ciclo (mediana)</th><th className="num">Deals / mes</th>
            <th className="num">Deals por cliente</th><th className="num">Meses cerrando</th>
          </tr></thead>
          <tbody>
            {base.map(x => (
              <tr key={x.key} className={sel === x.key ? 'on' : ''} onClick={() => setSel(x.key)}>
                <td className="bk-nom"><b>{x.nombre}</b><em>{x.first} → {x.last}{x.activo ? '' : ' · baja'}</em></td>
                <td className="num mono">{lN(x.d)}</td>
                <td className="num mono"><b>{lN(x.w)}</b></td>
                <td className="num mono">{lN(x.l)}</td>
                <td className="num mono">{lN(x.o)}</td>
                <td className="num mono"><span className="k-ach" style={{'--c': x.wr >= 0.25 ? '#1F5C42' : x.wr >= 0.12 ? '#B8731F' : '#B23A3A'}}>{lP(x.wr, 1)}</span></td>
                <td className="num mono">{lEur(x.eurW)}</td>
                <td className="num mono">{x.ticket ? lEur(x.ticket) : <span className="bk-none">—</span>}</td>
                <td className="num mono">{x.ciclo ? lN(x.ciclo.med) + ' d' : <span className="bk-none">—</span>}</td>
                <td className="num mono">{l1(x.ritmo)}</td>
                <td className="num mono">{x.dealsPorCliente ? l1(x.dealsPorCliente) : <span className="bk-none">—</span>}</td>
                <td className="num mono">{lN(x.mesesConCliente)}</td>
              </tr>
            ))}
            <tr className="bk-row-tot">
              <td>Equipo<em className="ap-pop">{base.length} AE</em></td>
              <td className="num mono">{lN(perf.tot.d)}</td>
              <td className="num mono">{lN(perf.tot.w)}</td>
              <td/><td/>
              <td className="num mono">{lP(perf.tot.wr, 1)}</td>
              <td className="num mono">{lEur(perf.tot.eurW)}</td>
              <td className="num mono">{lEur(perf.tot.eurW / perf.tot.w)}</td>
              <td/><td/><td/><td/>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ===== SERIE MENSUAL ===== */}
      <section className="bk-block">
        <div className="bk-bh">
          <span className="bk-chip">Clientes ganados por mes</span>
          <span className="bk-bh-d">Desde enero de 2025 hasta el corte de {window.AE_META.corte}. La fila del AE seleccionado se resalta; los meses en blanco son meses sin cierre.</span>
          <span className="bk-bh-k mono">{lN(perf.tot.w)} ganados</span>
        </div>
        <div className="bk-scroll">
          <table className="bk-plan">
            <thead><tr>
              <th className="k-rl">AE</th>
              {perf.months.map(mo => <th key={mo.id} className={mo.m === 12 ? 'k-yr' : ''}>{mo.label}{mo.m % 3 === 1 && <em className="k-q">{mo.q}</em>}</th>)}
              <th className="k-tot">Total</th>
            </tr></thead>
            <tbody>
              {base.map(x => (
                <tr key={x.key} className={sel === x.key ? 'ap-on' : ''} onClick={() => setSel(x.key)}>
                  <th className="k-rl"><b>{x.nombre}</b><em>{lP(x.wr, 0)} de cierre</em></th>
                  {x.rows.map(r => <td key={r.id} className="mono">{r.w ? r.w : <span className="bk-none">·</span>}</td>)}
                  <td className="k-tot mono">{lN(x.w)}</td>
                </tr>
              ))}
              <tr className="k-strong">
                <th className="k-rl"><b>Equipo</b><em>clientes del mes</em></th>
                {perf.totalRows.map(r => (
                  <td key={r.id} className="mono" style={{background: r.w ? 'color-mix(in oklch, var(--kin) ' + Math.round(r.w / maxMes * 55) + '%, transparent)' : 'transparent'}}>{r.w || '·'}</td>
                ))}
                <td className="k-tot mono">{lN(perf.tot.w)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== FICHA DEL AE ===== */}
      <section className="bk-block">
        <div className="bk-bh">
          <span className="bk-chip">{a.nombre}{!a.activo && ' · baja'}</span>
          <span className="bk-bh-d">{lN(a.d)} deals trabajados desde {a.first}, {lN(a.w)} ganados por {lEur(a.eurW)} y ticket medio de {a.ticket ? lEur(a.ticket) : '—'}. Ciclo mediano de {a.ciclo ? lN(a.ciclo.med) : '—'} días y {lN(a.mesesConCliente)} meses distintos con al menos un cierre.</span>
          <span className="bk-bh-k mono">{lP(a.wr, 1)} de cierre</span>
        </div>
        <div className="ap-ficha">
          <div className="ap-f-box">
            <div className="ap-f-t">Mezcla de segmentos · deals ganados</div>
            {segsDe(a.wsegs).map(s => (
              <div key={s.id} className="ap-f-bar">
                <span>{s.label}</span>
                <div><i style={{width:(s.pct * 100) + '%', background:s.color}}/></div>
                <b className="mono">{lN(s.n)}</b>
              </div>
            ))}
            {!segsDe(a.wsegs).length && <div className="bk-none">sin cierres con segmento</div>}
          </div>
          <div className="ap-f-box">
            <div className="ap-f-t">Origen de sus deals</div>
            {canalesDe(a.src).map(c => (
              <div key={c.id} className="ap-f-bar">
                <span>{c.label}</span>
                <div><i style={{width:(c.pct * 100) + '%', background:c.color}}/></div>
                <b className="mono">{lP(c.pct, 0)}</b>
              </div>
            ))}
          </div>
          <div className="ap-f-box">
            <div className="ap-f-t">Números de la ficha</div>
            <dl>
              <div><dt>Ciclo de venta</dt><dd className="ap-ciclo">{a.ciclo ? <><em>{a.ciclo.p25}</em><b>{a.ciclo.med}</b><em>{a.ciclo.p75} d</em></> : '—'}</dd></div>
              <div><dt>Deals por cliente</dt><dd className="mono">{l1(a.dealsPorCliente)}</dd></div>
              <div><dt>Deals por mes activo</dt><dd className="mono">{l1(a.ritmo)}</dd></div>
              <div><dt>Deals por semana</dt><dd className="mono">{l1(a.semanal)}</dd></div>
              <div><dt>Mejor mes</dt><dd className="mono">{lN(a.mejorMes)} clientes · {lEur(a.mejorEur)}</dd></div>
              <div><dt>Racha máxima</dt><dd className="mono">{lN(a.racha)} meses</dd></div>
              <div><dt>Precio por deal (imputado)</dt><dd className="mono">{a.pricing ? lN(a.pricing) + '€' : '—'}</dd></div>
              <div><dt>TAE cerrada (imputada)</dt><dd className="mono">{lP(a.tae, 1)}</dd></div>
            </dl>
          </div>
          <div className="ap-f-box">
            <div className="ap-f-t">Insignias</div>
            <div className="ap-f-badges">
              {window.AE_BADGES.map(b => (
                <div key={b.id} className={'ap-fb' + (a.badges.includes(b.id) ? ' on' : '')}>
                  <span className="ap-badge">{b.icon}</span>
                  <div><b>{b.name}</b><em>{b.desc}</em></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="bk-foot">
        Histórico del {window.AE_META.fuente}. El ciclo es la mediana de días entre creación y cierre de los deals ganados, con p25 y p75 alrededor. Precio por deal y TAE son imputaciones por mezcla de segmento, no tarifas reales del CRM.
      </div>
    </div>
  );
};
