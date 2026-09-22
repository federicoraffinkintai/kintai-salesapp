// Mid Market · matriz trimestral: actual contra target, la cascada completa en una tabla.
const mqF = (v, f) => {
  if (v == null) return '—';
  const s = v < 0 ? '−' : '', a = Math.abs(v);
  if (f === 'M') return s + (a / 1e6).toFixed(1).replace('.', ',') + 'M€';
  if (f === 'k') return s + window.pfFmt.n(Math.round(a / 1e3)) + 'k€';
  if (f === 'pct') return s + (a * 100).toFixed(1).replace('.', ',') + '%';
  if (f === 'n') return s + (a % 1 ? a.toFixed(1).replace('.', ',') : window.pfFmt.n(a));
  return v;
};
// Desviación: en puntos si la fila es un porcentaje, en relativo si no.
const mqD = (real, target, f, dabs, dir) => {
  if (real == null || target == null) return null;
  const mejor = (v) => dir === 'bajo' ? v <= 0 : v >= 0;
  // En las filas que cambian de signo el porcentaje no informa: −1 contra 0,6 sale
  // como −267% y se lee como un error. Esas van en diferencia absoluta.
  if (dabs) {
    const v = real - target;
    if (v === 0) return { t: 'en línea', c: '#5B6478', plana: true };
    return { t: (v > 0 ? '+' : '') + mqF(v, f), c: mejor(v) ? '#1F5C42' : '#B23A3A', plana: false };
  }
  if (f === 'pct') {
    const pp = real - target;
    return { t: (pp >= 0 ? '+' : '−') + (Math.abs(pp) * 100).toFixed(1).replace('.', ',') + ' pp', c: mejor(pp) ? '#1F5C42' : '#B23A3A', plana: Math.abs(pp) < 0.005 };
  }
  if (target === 0) return null;
  const rel = real / Math.abs(target) - 1;
  const plana = Math.abs(rel) < 0.005;
  return { t: plana ? 'en línea' : (rel >= 0 ? '+' : '−') + (Math.abs(rel) * 100).toFixed(0) + '%', c: plana ? '#5B6478' : mejor(rel) ? '#1F5C42' : '#B23A3A', plana };
};

// Acumulado del año: cada fila dice cómo se suma. Los saldos y los ratios toman el
// último corte, los flujos se suman y la conversión se recalcula sobre los acumulados.
const mqAgg = (r, k, rows) => {
  const v = r[k];
  if (r.agg === 'first') return v[0];
  if (r.agg === 'last') return v[2];
  if (r.agg === 'conv') {
    // El objetivo es un ratio del plan, el mismo los tres trimestres: no se recalcula
    // como cociente de acumulados, porque numerador y denominador van a cortes distintos.
    if (k === 'target') return v[0];
    const cli = rows.find(x => x.id === 'cli'), d = rows.find(x => x.id === 'deals');
    const nd = d[k].reduce((a, b) => a + b, 0);
    return nd ? cli[k].reduce((a, b) => a + b, 0) / nd : null;
  }
  return v.reduce((a, b) => a + b, 0);
};

window.MmQ = function MmQ() {
  const C = window.MMQ_COLS, R = window.MMQ_ROWS, M = window.MMQ_META, T = window.MMQ_TOT;
  return (
    <div className="mmq">
      <div className="bk-lvl-h">Mid Market, trimestre a trimestre: actual contra target</div>
      <div className="bdr-note">
        La cascada entera en una tabla: del loanbook de partida a los deals, de los deals a los clientes, y de los clientes al loanbook de cierre.
        Leída de arriba abajo dice exactamente en qué escalón se rompe el plan. {M.rebase}
      </div>

      <div className="cv bdr-wide" style={{ marginTop: 10 }}>
        <table className="bk-table mmq-t">
          <thead>
            <tr>
              <th rowSpan="2">Driver</th>
              {C.map(c => (
                <th key={c.id} className={'num grp' + (c.parcial ? ' mmq-par' : '')} colSpan="3">{c.label}<em className="bdr-th-sub">{c.sub}</em></th>
              ))}
              <th className="num grp mmq-tot" colSpan="3">{T.label}<em className="bdr-th-sub">{T.sub}</em></th>
            </tr>
            <tr>
              {C.map(c => [
                <th key={c.id + 'a'} className="num grp">Actual</th>,
                <th key={c.id + 't'} className="num">Target</th>,
                <th key={c.id + 'd'} className="num">Desv.</th>,
              ])}
              <th className="num grp mmq-tot">Actual</th>
              <th className="num mmq-tot">Target</th>
              <th className="num mmq-tot">Desv.</th>
            </tr>
          </thead>
          <tbody>
            {R.map(r => (
              <tr key={r.id} className={(r.hero ? 'mmq-hero ' : '') + (r.tipo === 'saldo' ? 'mmq-saldo' : '')}>
                <td className="mmq-k">
                  <b>{r.label}</b>
                  {r.est && <em className="bdr-est">est.</em>}
                  {r.formula && <em className="mmq-f">{r.formula}</em>}
                  {window.MMQ_NOTAS[r.id] && <em className="mmq-n">{window.MMQ_NOTAS[r.id]}{r.id === 'util' && ' ' + C.map((q, i) => mqD(r.real[i], r.target[i], r.fmt, r.dabs, r.dir).t).join(' / ') + '.'}</em>}
                </td>
                {C.map((c, i) => {
                  const d = r.id === 'bop' ? null : mqD(r.real[i], r.target[i], r.fmt, r.dabs, r.dir);
                  return [
                    <td key={c.id + 'a'} className="num mono grp mmq-a"><b>{mqF(r.real[i], r.fmt)}</b></td>,
                    <td key={c.id + 't'} className="num mono muted">
                      {mqF(r.target[i], r.fmt)}
                      {c.parcial && r.corte && <em className="q26-corte">{r.corte}</em>}
                    </td>,
                    <td key={c.id + 'd'} className="num mono">
                      {d == null ? <span className="bk-none">—</span>
                        : <span className={'k-ach' + (d.plana ? ' plana' : '')} style={{ '--c': d.c }}>{d.t}</span>}
                    </td>,
                  ];
                })}
                {(() => {
                  const ra = mqAgg(r, 'real', R), ta = mqAgg(r, 'target', R);
                  const d = r.id === 'bop' ? null : mqD(ra, ta, r.fmt, r.dabs, r.dir);
                  return [
                    <td key="ta" className="num mono grp mmq-tot"><b>{mqF(ra, r.fmt)}</b></td>,
                    <td key="tt" className="num mono muted mmq-tot">{mqF(ta, r.fmt)}</td>,
                    <td key="td" className="num mono mmq-tot">
                      {d == null ? <span className="bk-none">—</span>
                        : <span className={'k-ach' + (d.plana ? ' plana' : '')} style={{ '--c': d.c }}>{d.t}</span>}
                    </td>,
                  ];
                })()}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cv-note">{M.perimetro} {M.q3} {M.deals} {M.fuente}</div>
      </div>

      <div className="mmq-ver">
        {window.MMQ_VEREDICTO.map(v => (
          <div className={'mmq-v ' + v.v} key={v.k}>
            <div className="mmq-v-h"><span>{v.k}</span><b className="mono">{v.t}</b></div>
            <p>{v.d}</p>
          </div>
        ))}
      </div>
      <div className="bdr-note warn">{window.MMQ_CIERRE}</div>
    </div>
  );
};
