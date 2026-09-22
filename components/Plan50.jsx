// Cómo se llega a los 50M€ de diciembre: drivers, desajuste y plan de acción.
const p50M = (v) => v == null ? '—' : (v < 0 ? '−' : '+') + (Math.abs(v) / 1e6).toFixed(1).replace('.', ',') + 'M€';
const p50Abs = (v) => v == null ? '—' : (v < 0 ? '−' : '') + (Math.abs(v) / 1e6).toFixed(1).replace('.', ',') + 'M€';
const p50K = (v) => v == null ? '—' : window.pfFmt.n(Math.round(v / 1e3)) + 'k€';
const p50Pct = (v) => v == null ? '—' : (v * 100).toFixed(0) + '%';
// El puente invita a sumar, así que se imprime con dos decimales: con uno solo,
// los redondeos de los cinco tramos no cuadran con el total y parece un error.
const p50M2 = (v) => v == null ? '—' : (v < 0 ? '−' : '+') + (Math.abs(v) / 1e6).toFixed(2).replace('.', ',') + 'M€';
const p50A2 = (v) => v == null ? '—' : (v < 0 ? '−' : '') + (Math.abs(v) / 1e6).toFixed(2).replace('.', ',') + 'M€';

window.Plan50 = function Plan50() {
  const D = window.P50_DRIVERS, G = window.P50_GAP, P = window.P50_PUENTE;
  const gTot = G.reduce((a, s) => ({ cli: a.cli + s.cli, lin: a.lin + s.lin, uti: a.uti + s.uti, total: a.total + s.total }), { cli: 0, lin: 0, uti: 0, total: 0 });
  const maxEf = Math.max.apply(null, [gTot.cli, gTot.lin, gTot.uti].map(Math.abs));
  const maxP = Math.max.apply(null, P.map(x => Math.abs(x.v)));

  return (
    <div className="p50">
      <div className="bk-lvl-h">Cómo se llega a los 50M€ de diciembre</div>
      <div className="bdr-note">
        Todo el loanbook se explica con tres números por segmento: <b>clientes × línea media × utilización</b>. Y los clientes salen de deals generados por la conversión real.
        Puesto así, el desajuste deja de ser una cifra y pasa a tener responsable. Sólo <b>Mid Market</b> y <b>SME Big</b>: son el 86% de la cartera y toda la diferencia contra el plan.
      </div>

      <window.MmQ/>
      <window.Clientes/>
      <window.Q26/>

      {/* ===== DRIVERS ===== */}
      <div className="bk-lvl-h sub">El detalle por segmento, a julio</div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr>
            <th>Segmento</th>
            <th className="num grp">Clientes<em className="bdr-th-sub">con línea firmada</em></th>
            <th className="num">Línea media</th>
            <th className="num">Utilización</th>
            <th className="num">Loanbook</th>
          </tr></thead>
          <tbody>
            {D.map(s => [
              <tr key={s.id + 'bp'} className="p50-top">
                <td rowSpan="3" className="p50-seg"><span className="bk-dot" style={{ background: s.color }}/><b>{s.label}</b></td>
                <td className="num mono muted grp">{s.bp.cli}</td>
                <td className="num mono muted">{p50K(s.bp.linea)}</td>
                <td className="num mono muted">{p50Pct(s.bp.util)}</td>
                <td className="num mono muted">{p50Abs(s.bp.lb)} <em className="p50-tag">BP a jul-26</em></td>
              </tr>,
              <tr key={s.id + 'r'} className="p50-real">
                <td className="num mono grp"><b>{s.real.cli}</b><em className="p50-sub">{s.cliOut} con disposición</em></td>
                <td className="num mono"><b>{p50K(s.real.linea)}</b></td>
                <td className="num mono"><b>{p50Pct(s.real.util)}</b></td>
                <td className="num mono"><b>{p50Abs(s.real.lb)}</b> <em className="p50-tag">real a jul-26</em></td>
              </tr>,
              <tr key={s.id + 'o'} className="p50-obj">
                <td className="num mono grp">{s.obj.cli}</td>
                <td className="num mono">{p50K(s.obj.linea)}</td>
                <td className="num mono">{p50Pct(s.obj.util)}</td>
                <td className="num mono">{p50Abs(s.obj.lb)} <em className="p50-tag">necesario a dic-26</em></td>
              </tr>,
            ])}
          </tbody>
        </table>
        <div className="cv-note">
          Dos de los tres drivers están <b>por encima</b> del plan: la línea media real supera a la del BP un 9% en Mid Market y un 56% en SME Big.
          Los que fallan son <b>clientes</b> y <b>utilización</b>, y los dos tienen la misma causa: sin capital no se firman clientes nuevos ni se fondean las disposiciones de los que ya están.
          {' '}{window.P50_META.aviso}
        </div>
      </div>

      {/* ===== DESCOMPOSICIÓN ===== */}
      <div className="bk-lvl-h sub">De dónde vienen los {p50Abs(gTot.total)} de desajuste a julio</div>
      <div className="p50-gap">
        {[
          { k: 'Clientes que no se firmaron', v: gTot.cli, d: '43 clientes con línea en los dos segmentos, cuando el BP pedía 69 a julio' },
          { k: 'Línea media', v: gTot.lin, d: 'El ticket real bate al del plan en los dos segmentos y devuelve parte del hueco' },
          { k: 'Utilización', v: gTot.uti, d: 'Del 71% implícito en el BP de julio al 45% real: 15,2M€ concedidos sin disponer en los dos segmentos' },
        ].map(e => (
          <div className={'p50-ge ' + (e.v >= 0 ? 'pos' : 'neg')} key={e.k}>
            <div className="p50-ge-k">{e.k}</div>
            <div className="p50-ge-v mono">{p50M(e.v)}</div>
            <div className="p50-ge-bar"><i style={{ width: Math.abs(e.v) / maxEf * 100 + '%' }}/></div>
            <div className="p50-ge-d">{e.d}</div>
          </div>
        ))}
      </div>

      {/* ===== HUBSPOT ===== */}
      <div className="bk-lvl-h sub">Qué dice HubSpot de la máquina comercial</div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr><th>Indicador</th><th>Lo que suponía el plan</th><th>Lo que dice el dato real</th></tr></thead>
          <tbody>
            {window.P50_HS.map(h => (
              <tr key={h.k}>
                <td className="p50-hk"><b>{h.k}</b><em>{h.d}</em></td>
                <td className="muted">{h.bp}</td>
                <td><span className={'p50-v ' + h.v}>{h.real}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cv-note">
          La lectura para el board: <b>lo comercial funciona mejor de lo planificado y lo financiero peor</b>. La conversión triplica el supuesto y el ticket lo supera;
          lo que falta es capital disponible y disciplina de utilización. Por eso el plan de recuperación carga el peso en activar lo firmado antes que en vender más.
        </div>
      </div>

      {/* ===== PUENTE ===== */}
      <div className="bk-lvl-h sub">El puente hasta los 50M€</div>
      <div className="p50-br">
        {P.map((s, i) => (
          <div className={'p50-brr ' + s.t} key={s.k}>
            <div className="p50-brr-n mono">{s.t === 'pos' ? i : ''}</div>
            <div className="p50-brr-k">{s.k}<em>{s.d}</em></div>
            <div className="p50-brr-bar"><i style={{ width: Math.abs(s.v) / maxP * 100 + '%' }}/></div>
            <div className="p50-brr-v mono">{s.t === 'pos' ? p50M2(s.v) : p50A2(s.v)}</div>
          </div>
        ))}
      </div>

      {/* ===== PLAN ===== */}
      <div className="bk-lvl-h sub">Plan de acción a diciembre</div>
      <div className="p50-plan">
        {window.P50_PLAN.map(a => (
          <div className="p50-ac" key={a.n}>
            <div className="p50-ac-h">
              <span className="p50-ac-n mono">{a.n}</span>
              <div className="p50-ac-t">{a.t}<em>{a.dueno} · {a.cuando}</em></div>
              <span className="p50-ac-q mono">{a.pi != null ? p50M2(P[a.pi].v) : a.q}</span>
            </div>
            <p className="p50-ac-d">{a.d}</p>
            <div className="p50-ac-r"><span>Riesgo</span>{a.riesgo}</div>
          </div>
        ))}
      </div>

      <div className="bdr-note warn">
        Lo que hay que llevarse del bloque: de los {p50A2(P[1].v + P[2].v + P[3].v)} que faltan,
        <b> {p50A2(P[1].v + P[2].v)} salen de clientes que ya son clientes</b> —disponer lo firmado y ampliar límite— y {p50A2(P[3].v)} de negocio nuevo,
        que además ya está en el pipeline abierto. El plan no pide un salto de conversión ni de ticket: pide capital disponible en octubre y ejecución de cartera.
      </div>
    </div>
  );
};
