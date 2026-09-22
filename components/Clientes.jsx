// Cartera cliente a cliente: quién suma el loanbook, con filtro de corte y de segmento.
const { useState: cliUseState, useMemo: cliUseMemo } = React;
const cliK = (v) => v == null ? '—' : (v < 0 ? '−' : '') + window.pfFmt.n(Math.round(Math.abs(v) / 1e3)) + 'k€';
const cliM = (v) => v == null ? '—' : (v < 0 ? '−' : '') + (Math.abs(v) / 1e6).toFixed(1).replace('.', ',') + 'M€';
const cliP = (v) => v == null || !isFinite(v) ? '—' : (v * 100).toFixed(0) + '%';

window.Clientes = function Clientes() {
  const [corte, setCorte] = cliUseState(3);
  const [seg, setSeg] = cliUseState([]);   // vacío = todos
  const [solo, setSolo] = cliUseState('activos');
  const [coh, setCoh] = cliUseState([]);   // vacío = todos
  // Multi-selección: cada chip alterna; el botón "todos" vacía la lista. El updater
  // tiene que ser funcional: con la forma directa, dos clics seguidos leen el mismo
  // array del closure y el segundo pisa al primero.
  const alterna = (set) => (v) => set(prev => prev.indexOf(v) >= 0 ? prev.filter(x => x !== v) : prev.concat([v]));
  const R = window.CLI_ROWS, SEG = window.CLI_SEG, COLOR = window.CLI_SEG_COLOR;

  const filas = cliUseMemo(() => {
    const prev = corte > 0 ? corte - 1 : 0;
    return R
      .map(r => {
        const lin = r[3][corte], out = r[4][corte], coll = r[5][corte];
        return { nom: r[0], seg: r[1], est: r[2], lin, out, coll,
          rec: r[6],
          sana: coll >= 0 && coll < window.CLI_SANA,
          util: lin ? out / lin : null,
          libre: Math.max(0, lin - out),
          delta: out - r[4][prev] };
      })
      .filter(x => !seg.length || seg.indexOf(x.seg) >= 0)
      .filter(x => !coh.length || coh.indexOf(x.rec) >= 0)
      .filter(x => solo === 'todos' || x.out > 0 || x.lin > 0)
      .sort((a, b) => b.out - a.out || b.lin - a.lin);
  }, [corte, seg.join(), solo, coh.join()]);

  const t = filas.reduce((a, x) => ({
    lin: a.lin + x.lin, out: a.out + x.out, libre: a.libre + x.libre,
    sana: a.sana + (x.sana ? x.out : 0), delta: a.delta + x.delta,
    conOut: a.conOut + (x.out > 0 ? 1 : 0), conLin: a.conLin + (x.lin > 0 ? 1 : 0),
  }), { lin: 0, out: 0, libre: 0, sana: 0, delta: 0, conOut: 0, conLin: 0 });

  return (
    <div className="cli">
      <div className="bk-lvl-h">Quién suma el loanbook, cliente a cliente</div>
      <div className="bdr-note">
        El detalle que hay detrás de los agregados: cada cliente con su línea concedida, lo que tiene dispuesto y su utilización, en los cuatro cortes.
        Ordenado por outstanding. Se puede separar la cartera <b>recurrente</b> de los <b>clientes nuevos de 2026</b>: 35 empresas con primera línea firmada este año,
        14,0M€ concedidos y 5,1M€ dispuestos, un 36% de utilización. <b>{window.CLI_META.hallazgo}</b> {window.CLI_META.nota}
      </div>

      <div className="cli-bar">
        <div className="bdr-seg">
          {window.CLI_CORTES.map((c, i) => (
            <button key={c.id} className={corte === i ? 'on' : ''} onClick={() => setCorte(i)}>{c.label}<em>{c.sub}</em></button>
          ))}
        </div>
        <div className="bdr-seg multi">
          <button className={!seg.length ? 'on' : ''} onClick={() => setSeg([])}>Todos</button>
          {SEG.map((s, i) => (
            <button key={s} className={seg.indexOf(i) >= 0 ? 'on' : ''} onClick={() => alterna(setSeg)(i)}>
              <span className="bk-dot" style={{ background: COLOR[i] }}/>{s}
            </button>
          ))}
        </div>
        <div className="bdr-seg multi">
          <button className={!coh.length ? 'on' : ''} onClick={() => setCoh([])}>Toda la cartera</button>
          <button className={coh.indexOf(0) >= 0 ? 'on' : ''} onClick={() => alterna(setCoh)(0)}>Nuevos 2026<em>1ª línea en 2026</em></button>
          <button className={coh.indexOf(1) >= 0 ? 'on' : ''} onClick={() => alterna(setCoh)(1)}>Recurrentes<em>línea anterior a 2026</em></button>
        </div>
        <div className="bdr-seg">
          <button className={solo === 'activos' ? 'on' : ''} onClick={() => setSolo('activos')}>Con línea o saldo</button>
          <button className={solo === 'todos' ? 'on' : ''} onClick={() => setSolo('todos')}>Todos los históricos</button>
        </div>
      </div>

      <div className="cli-tot">
        <div className="cli-t"><b className="mono">{t.conOut}</b><span>clientes con saldo vivo</span></div>
        <div className="cli-t"><b className="mono">{t.conLin}</b><span>clientes con línea</span></div>
        <div className="cli-t"><b className="mono">{cliM(t.lin)}</b><span>líneas concedidas</span></div>
        <div className="cli-t accent"><b className="mono">{cliM(t.out)}</b><span>outstanding total</span></div>
        <div className="cli-t"><b className="mono">{cliM(t.sana)}</b><span>del que sano, hasta 60 días</span></div>
        <div className="cli-t"><b className="mono">{cliP(t.lin ? t.out / t.lin : null)}</b><span>utilización media</span></div>
        <div className="cli-t"><b className="mono">{cliM(t.libre)}</b><span>línea concedida sin disponer</span></div>
      </div>

      <div className="cv bk-scroll cli-scroll">
        <table className="bk-table cli-t-tab">
          <thead><tr>
            <th>Cliente</th>
            <th>Segmento</th>
            <th className="num">Línea</th>
            <th className="num">Outstanding</th>
            <th className="num">Utilización</th>
            <th className="num">Sin disponer</th>
            <th className="num">Var. vs corte anterior</th>
            <th>Cobro</th>
          </tr></thead>
          <tbody>
            {filas.map((x, i) => (
              <tr key={x.nom + i} className={x.out === 0 ? 'cli-zero' : ''}>
                <td className="cli-nom"><b>{x.nom}</b><em>{window.CLI_EST[x.est] || '—'}{x.rec ? '' : ' · nuevo 2026'}</em></td>
                <td className="cli-seg"><span className="bk-dot" style={{ background: COLOR[x.seg] || '#767D8C' }}/>{SEG[x.seg] || '—'}</td>
                <td className="num mono">{x.lin ? cliK(x.lin) : <span className="bk-none">—</span>}</td>
                <td className="num mono"><b>{x.out ? cliK(x.out) : <span className="bk-none">—</span>}</b></td>
                <td className="num mono">{x.util == null ? <span className="bk-none">—</span>
                  : <span className="k-ach" style={{ '--c': x.util >= 0.7 ? '#1F5C42' : x.util >= 0.4 ? '#B8731F' : '#B23A3A' }}>{cliP(x.util)}</span>}</td>
                <td className="num mono muted">{x.libre ? cliK(x.libre) : <span className="bk-none">—</span>}</td>
                <td className="num mono">{corte === 0 ? <span className="bk-none">—</span>
                  : <span style={{ color: x.delta > 0 ? '#1F5C42' : x.delta < 0 ? '#B23A3A' : 'var(--muted-2)' }}>{x.delta ? (x.delta > 0 ? '+' : '') + cliK(x.delta) : '—'}</span>}</td>
                <td><span className={'cli-coll' + (x.coll < 0 ? ' n' : x.coll < 3 ? ' ok' : ' bad')}>{window.CLI_COLL[x.coll] || '—'}</span></td>
              </tr>
            ))}
            <tr className="bk-row-tot">
              <td><b>Total · {filas.length} con línea o saldo</b></td>
              <td/>
              <td className="num mono"><b>{cliM(t.lin)}</b></td>
              <td className="num mono"><b>{cliM(t.out)}</b></td>
              <td className="num mono"><b>{cliP(t.lin ? t.out / t.lin : null)}</b></td>
              <td className="num mono"><b>{cliM(t.libre)}</b></td>
              <td className="num mono"><b>{corte === 0 ? '—' : (t.delta > 0 ? '+' : '') + cliM(t.delta)}</b></td>
              <td/>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="cv-note" style={{ border: '1px solid var(--line)', borderTop: 0, borderRadius: '0 0 var(--radius) var(--radius)' }}>
        {window.CLI_META.fuente} La columna de variación compara con el corte inmediatamente anterior, no con el mismo mes del año pasado. {window.CLI_META.nuevos}
      </div>
    </div>
  );
};
