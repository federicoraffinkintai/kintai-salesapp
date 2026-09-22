// Evolución trimestral de los drivers comerciales y cobertura de pipeline para Q4.
const q26N = (v) => v == null ? '—' : window.pfFmt.n(v);
const q26F = (v, f) => {
  if (v == null) return '—';
  // Un solo signo menos en toda la tabla: pfFmt.n antepone guion ASCII y el resto
  // de la pestaña usa el menos tipográfico.
  const s = v < 0 ? '−' : '', a = Math.abs(v);
  if (f === 'n') return s + window.pfFmt.n(a);
  if (f === 'k') return s + window.pfFmt.n(Math.round(a / 1e3)) + 'k€';
  if (f === 'M') return s + (a / 1e6).toFixed(1).replace('.', ',') + 'M€';
  if (f === 'pct' || f === 'pct1') return s + (a * 100).toFixed(1).replace('.', ',') + '%';
  return v;
};
// Desviación relativa contra objetivo; en los porcentajes se da en puntos.
const q26D = (real, obj, f) => {
  if (real == null || obj == null || obj === 0) return null;
  const punt = f === 'pct' || f === 'pct1';
  const rel = punt ? real - obj : real / obj - 1;
  const txt = punt
    ? (rel >= 0 ? '+' : '−') + (Math.abs(rel) * 100).toFixed(1).replace('.', ',') + ' pp'
    : (rel >= 0 ? '+' : '−') + (Math.abs(rel) * 100).toFixed(0) + '%';
  return { txt, c: rel >= 0 ? '#1F5C42' : '#B23A3A' };
};

window.Q26 = function Q26() {
  const Q = window.Q26_QS, R = window.Q26_ROWS, Q4 = window.Q26_Q4;
  const filas = Q4.filas.map(f => ({ ...f, cli: Math.round(f.deals * f.wr * f.cierre), pot: Math.round(f.deals * f.wr) }));
  const totCli = filas.reduce((a, f) => a + f.cli, 0);
  const cobertura = totCli / Q4.necesarios;

  return (
    <div className="q26">
      {/* ===== Q4 ===== */}
      <div className="bk-lvl-h">Q4: de dónde salen los {Q4.necesarios} clientes que faltan</div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr>
            <th>Origen</th>
            <th className="num">Deals en foco</th>
            <th className="num">Win rate real</th>
            <th className="num">Clientes que promete</th>
            <th className="num">Cierra en Q4</th>
            <th className="num">Clientes en 2026</th>
          </tr></thead>
          <tbody>
            {filas.map(f => (
              <tr key={f.k}>
                <td className="q26-k"><b>{f.k}</b><em className="q26-sub">{f.d}</em></td>
                <td className="num mono">{q26N(f.deals)}</td>
                <td className="num mono muted">{(f.wr * 100).toFixed(1).replace('.', ',')}%</td>
                <td className="num mono muted">{q26N(f.pot)}</td>
                <td className="num mono muted">{Math.round(f.cierre * 100)}%</td>
                <td className="num mono"><b>{q26N(f.cli)}</b></td>
              </tr>
            ))}
            <tr className="bk-row-tot">
              <td><b>Total previsto</b></td>
              <td className="num mono">{q26N(filas.reduce((a, f) => a + f.deals, 0))}</td>
              <td className="num mono">—</td>
              <td className="num mono">{q26N(filas.reduce((a, f) => a + f.pot, 0))}</td>
              <td className="num mono">—</td>
              <td className="num mono"><b>{totCli}</b></td>
            </tr>
          </tbody>
        </table>
        <div className="cv-note">{window.Q26_Q4_NOTA}</div>
      </div>
      <div className="q26-cob">
        <div className="q26-cob-n mono">×{cobertura.toFixed(1).replace('.', ',')}</div>
        <div className="q26-cob-d">
          <b>Cobertura del pipeline sobre lo que hace falta.</b> El plan necesita {Q4.necesarios} clientes nuevos de foco en el trimestre y el pipeline
          —el abierto más el que se genere— promete {totCli}. No hace falta que salga todo: hace falta que salga la mitad larga,
          y que la etapa tardía, que son {filas[0].deals} deals ya en negociación o en riesgos, no se atasque en aprobación.
        </div>
      </div>
    </div>
  );
};
