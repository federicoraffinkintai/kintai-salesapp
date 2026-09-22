// Board septiembre 2026: qué pasó con la ronda, dónde acaba el año y por qué diciembre vuelve a la senda del BP
const { useState } = React;

const bdN = (v) => window.pfFmt.n(v);
const bdK = (v) => v == null ? '—' : (v < 0 ? '−' : '') + bdN(Math.abs(Math.round(v / 1e3))) + 'k€';
const bdM = (v) => v == null ? '—' : (v < 0 ? '−' : '') + (Math.abs(v) / 1e6).toFixed(1).replace('.', ',') + 'M€';
const bdV = (v, fmt) => fmt === 'M' ? bdM(v) : bdK(v);
// La diferencia se escribe en la unidad de la propia diferencia, no en la de la fila:
// 49k€ sobre un loanbook en millones saldría como "+0,0M€" y se leería como celda vacía.
const bdAbs = (v, fmt) => {
  if (v == null) return '—';
  const u = fmt === 'M' && Math.abs(v) >= 1e5 ? 'M' : 'k';
  return (v >= 0 ? '+' : '') + bdV(v, u);
};
// Bajo medio punto la cifra redondeada sale "+0%" y en una tabla de board eso se lee
// como error de cálculo: por debajo de ese umbral se dice en palabras, y hasta el 10% con decimal.
const bdPct = (v) => {
  if (v == null || !isFinite(v)) return '—';
  const a = Math.abs(v);
  if (a < 0.005) return 'en línea';
  return (v >= 0 ? '+' : '−') + (a * 100).toFixed(a < 0.0995 ? 1 : 0).replace('.', ',') + '%';
};

// En las filas de coste la desviación se lee en términos de coste: el signo compara
// magnitudes (+ = gastamos más, rojo; − = gastamos menos, verde). En las de ingreso o
// resultado, el signo es el del impacto en P&L. El verde significa siempre "mejor".
const bdDelta = (fc, bp, coste) => {
  if (fc == null || bp == null) return null;
  const abs = coste ? Math.abs(fc) - Math.abs(bp) : fc - bp;
  const mejor = coste ? abs <= 0 : abs >= 0;
  const rel = bp === 0 ? null : abs / Math.abs(bp);
  // Si la desviación no llega a medio punto se declara "en línea": sin semáforo,
  // porque un "en línea" en rojo se lee como alarma sobre una cifra que está plana.
  const plana = rel != null && Math.abs(rel) < 0.005;
  return { abs, rel, plana, c: plana ? '#5B6478' : mejor ? '#1F5C42' : '#B23A3A' };
};

function BdLines({ serie, fmt, unidad }) {
  const W = 960, H = 250, ML = 52, MR = 14, MT = 14, MB = 26;
  const all = [].concat(serie.bp, serie.may, serie.fc).filter(v => v != null);
  const max = Math.max.apply(null, all) * 1.06;
  const x = (i) => ML + i * (W - ML - MR) / 11;
  const y = (v) => MT + (1 - v / max) * (H - MT - MB);
  const path = (arr) => arr.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => f * max);
  const cut = window.BD_REAL_HASTA;
  return (
    <div className="bdr-chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="bdr-svg" role="img" aria-label={'Evolución mensual 2026 en ' + unidad}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={ML} x2={W - MR} y1={y(t)} y2={y(t)} stroke="#E6E2D6" strokeWidth="1"/>
            <text x={ML - 8} y={y(t) + 3.5} textAnchor="end" className="bdr-ax">{fmt === 'M' ? t.toFixed(0) : bdN(Math.round(t))}</text>
          </g>
        ))}
        <rect x={x(cut)} y={MT} width={W - MR - x(cut)} height={H - MT - MB} fill="#0B1220" opacity="0.035"/>
        <text x={x(cut) + 6} y={MT + 12} className="bdr-ax">forecast</text>
        {window.BD_MESES.map((m, i) => (
          <text key={m} x={x(i)} y={H - 8} textAnchor="middle" className="bdr-ax">{m}</text>
        ))}
        {window.BD_COLS.map(c => (
          <path key={c.id} d={path(serie[c.id])} fill="none" stroke={c.color} strokeWidth={c.id === 'fc' ? 2.4 : 1.6}
            strokeDasharray={c.id === 'may' ? '5 4' : undefined} strokeLinejoin="round"/>
        ))}
        {window.BD_COLS.map(c => (
          <g key={c.id}>{serie[c.id].map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r={c.id === 'fc' ? 2.6 : 1.8} fill={c.color}/>
          ))}</g>
        ))}
      </svg>
      <div className="bdr-leg">
        {window.BD_COLS.map(c => (
          <span key={c.id}><i style={{ background: c.color }}/>{c.label}
            <em>{fmt === 'M' ? serie[c.id][11].toFixed(1).replace('.', ',') + 'M€' : bdN(Math.round(serie[c.id][11])) + 'k€'} en dic</em>
          </span>
        ))}
      </div>
    </div>
  );
}

window.Board = function Board() {
  const [serie, setSerie] = useState('lb');
  const [anexo, setAnexo] = useState(false);
  const R = window.BD_ROWS, C = window.BD_COLS, B = window.BD_BRIDGE;
  const rev = R.find(r => r.id === 'rev'), lb = R.find(r => r.id === 'lbeop');
  const ebc = R.find(r => r.id === 'ebcso');
  const dRev = bdDelta(rev.d.fc, rev.d.bp), aRev = bdDelta(rev.a.fc, rev.a.bp);

  return (
    <div className="bdr bk" data-screen-label="Board sept 2026">
      <div className="bk-head">
        <div>
          <h1 className="bk-h1">Board · septiembre 2026</h1>
          <div className="bk-sub">
            La ronda entró cuatro meses tarde y la deuda de Unicredit se cayó: el <b>año</b> ya no llega al revenue del BP.
            Pero <b>diciembre sí</b>. Cerramos el mes con {bdM(lb.d.fc)} de loanbook —el objetivo del BP— y {bdK(rev.d.fc)} de revenue, {bdPct(dRev.rel)} sobre el BP.
            Volvemos a la senda; lo que se ha perdido es el acumulado del primer semestre, no el punto de salida.
          </div>
        </div>
        <div className="bk-kpis">
          <div className="bk-kpi"><b className="mono">{bdM(rev.a.fc)}</b><span>revenue 2026 · {bdPct(aRev.rel)} vs BP</span></div>
          <div className="bk-kpi accent"><b className="mono">{bdK(rev.d.fc)}</b><span>revenue dic · {bdPct(dRev.rel)} vs BP</span></div>
          <div className="bk-kpi accent"><b className="mono">{bdM(lb.d.fc)}</b><span>loanbook dic · BP {bdM(lb.d.bp)}</span></div>
          <div className="bk-kpi"><b className="mono">{bdK(ebc.d.fc)}</b><span>EBITDA cash dic sin one-off</span></div>
        </div>
      </div>

      {/* ===== RELATO ===== */}
      <div className="bdr-story">
        {window.BD_STORY.map(s => (
          <div className="bdr-st" key={s.n}>
            <div className="bdr-st-n mono">{s.n}</div>
            <div className="bdr-st-t">{s.t}</div>
            <p className="bdr-st-d">{s.d}</p>
            <div className="bdr-st-m mono">{s.m}</div>
          </div>
        ))}
      </div>

      {/* ===== COMPARATIVA ===== */}
      <div className="bk-lvl-h">Los tres planes, en el año y en diciembre</div>
      <div className="cv bdr-wide">
        <table className="bk-table bdr-comp">
          <thead>
            <tr>
              <th rowSpan="2">Concepto</th>
              <th className="num grp" colSpan="5">Año 2026</th>
              <th className="num grp g2" colSpan="5">Diciembre 2026</th>
            </tr>
            <tr>
              {C.map(c => <th key={'a' + c.id} className={'num' + (c.id === 'bp' ? ' grp' : '')}>{c.label}<em className="bdr-th-sub">{c.sub}</em></th>)}
              <th className="num">Fcst vs BP<em className="bdr-th-sub">en euros</em></th>
              <th className="num">Fcst vs BP<em className="bdr-th-sub">en %</em></th>
              {C.map(c => <th key={'d' + c.id} className={'num' + (c.id === 'bp' ? ' grp' : '')}>{c.label}<em className="bdr-th-sub">{c.sub}</em></th>)}
              <th className="num">Fcst vs BP<em className="bdr-th-sub">en %</em></th>
              <th className="num bdr-ann">Dic ×12<em className="bdr-th-sub">run-rate de salida</em></th>
            </tr>
          </thead>
          <tbody>
            {window.BD_GRUPOS.map(g => {
              const rows = R.filter(r => r.g === g);
              return rows.map((r, i) => {
                const da = bdDelta(r.a.fc, r.a.bp, r.neg), dd = bdDelta(r.d.fc, r.d.bp, r.neg);
                const est = (per, id) => r.est && r.est[per] && r.est[per].indexOf(id) >= 0;
                return (
                  <tr key={r.id} className={(r.hero ? 'bdr-hero ' : '') + (i === 0 ? 'bdr-gtop' : '')}>
                    <td className="bdr-k">
                      {i === 0 && <span className="bdr-g">{g}</span>}
                      <b className={r.sub ? 'bdr-subk' : ''}>{r.label}</b>
                    </td>
                    {['a', 'd'].map(per => [
                      ...C.map(c => (
                        <td key={per + c.id} className={'num mono' + (c.id === 'bp' ? ' grp' : '') + (c.id === 'fc' ? ' bdr-fc' : '')}>
                          {r[per][c.id] == null ? <span className="bk-none">—</span> : bdV(r[per][c.id], r.fmt)}
                          {est(per, c.id) && <em className="bdr-est">est.</em>}
                        </td>
                      )),
                      per === 'a' ? (
                        <td key="ae" className="num mono">
                          {da == null ? <span className="bk-none">—</span>
                            : <b style={{ color: da.c }}>{bdAbs(da.abs, r.fmt)}</b>}
                        </td>
                      ) : null,
                      <td key={per + 'd'} className="num mono">
                        {(per === 'a' ? da : dd) == null ? <span className="bk-none">—</span>
                          : <span className={'k-ach' + ((per === 'a' ? da : dd).plana ? ' plana' : '')} style={{ '--c': (per === 'a' ? da : dd).c }}>{bdPct((per === 'a' ? da : dd).rel)}</span>}
                      </td>,
                      per === 'd' ? (
                        <td key="ann" className="num mono bdr-ann">
                          {r.d.fc == null ? <span className="bk-none">—</span>
                            : r.fmt === 'M' ? <span className="bdr-stock">{bdV(r.d.fc, r.fmt)}<em className="bdr-est">saldo</em></span>
                            : <b>{bdV(r.d.fc * 12, r.fmt)}</b>}
                        </td>
                      ) : null,
                    ])}
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
        <div className="cv-note">
          La columna <b>Fcst vs BP</b> compara el forecast de septiembre con el BP de la Serie A. En las filas de coste el signo compara importes de coste —positivo y rojo si gastamos más, negativo y verde si gastamos menos—; en las de ingreso y resultado, el signo es el del impacto en la cuenta. El verde significa siempre mejor.
          En el año el forecast pierde {bdPct(aRev.rel)} de revenue contra el BP. En diciembre lo gana: {bdPct(dRev.rel)}, con el mismo loanbook de cierre.
          La última columna <b>anualiza diciembre</b> multiplicando por doce: es el run-rate con el que se entra en 2027, no una previsión de 2027. El loanbook no se anualiza porque es un saldo, no un flujo.
          La línea que se lee es el <b>EBITDA sin one-off</b>, con la versión contable debajo: el año lleva {bdK(Math.abs(R.find(x => x.id === 'oneoff').a.fc))} de coste extraordinario por las rescisiones y por rehacer la financiación.
        </div>
      </div>

      {/* ===== PUENTE DE REVENUE ===== */}
      <div className="bk-lvl-h">De dónde salen los {bdM(B.total)} de revenue anual</div>
      <div className="bdr-bridge">
        {[
          { k: 'Revenue BP 2026', v: B.revBp, t: 'base', d: 'Loanbook medio de ' + bdM(B.lbBp) + ' a una TAE del ' + (B.taeBp * 100).toFixed(1).replace('.', ',') + '%' },
          { k: 'Menos loanbook', v: B.volumen, t: 'neg', d: 'El loanbook medio del año se queda en ' + bdM(B.lbFc) + ': ' + bdM(B.lbFc - B.lbBp) + ' por el semestre sin capital' },
          { k: 'Mejor pricing', v: B.precio, t: 'pos', d: 'La TAE efectiva sube al ' + (B.taeFc * 100).toFixed(1).replace('.', ',') + '%: originamos menos, pero mejor pagado' },
          { k: 'Revenue forecast', v: B.revFc, t: 'base', d: 'Real ene-ago más forecast sep-dic' },
        ].map(s => (
          <div className={'bdr-br ' + s.t} key={s.k}>
            <div className="bdr-br-k">{s.k}</div>
            <div className="bdr-br-v mono">{s.t === 'base' ? bdM(s.v) : (s.v >= 0 ? '+' : '') + bdM(s.v)}</div>
            <div className="bdr-br-bar"><i style={{ width: Math.min(100, Math.abs(s.v) / B.revBp * 100) + '%' }}/></div>
            <div className="bdr-br-d">{s.d}</div>
          </div>
        ))}
      </div>
      <div className="bdr-note">
        Todo el puente se calcula contra el <b>BP de la Serie A</b>, la misma base que la tabla de arriba. La columna «BP 2026» del propio fichero de forecast da 10,1M€ de revenue y 34,4M€ de loanbook medio por una reexpresión posterior; usarla aquí descuadraría el puente en 130k€, así que no se usa.
        El hueco no es de precio ni de demanda: es de <b>volumen</b>. Con {bdM(Math.abs(B.lbFc - B.lbBp))} menos de loanbook medio se pierden {bdM(Math.abs(B.volumen))}, y el pricing devuelve {bdM(B.precio)}.
        Por eso el punto de salida importa más que el acumulado: la máquina de precio funciona, lo que faltó fue balance.
      </div>

      {/* ===== SERIE MENSUAL ===== */}
      <div className="bk-lvl-h">Mes a mes de 2026: real hasta agosto, forecast de septiembre a diciembre</div>
      <div className="bdr-seg">
        <button className={serie === 'lb' ? 'on' : ''} onClick={() => setSerie('lb')}>Loanbook medio (M€)</button>
        <button className={serie === 'rev' ? 'on' : ''} onClick={() => setSerie('rev')}>Revenue (k€)</button>
      </div>
      <BdLines serie={window.BD_SERIES[serie]} fmt={serie === 'lb' ? 'M' : 'k'} unidad={serie === 'lb' ? 'millones de euros' : 'miles de euros'}/>
      <div className="bdr-note">
        La línea del forecast se queda plana ocho meses: sin capital no hay originación. A partir de octubre, con el nuevo proveedor de deuda operativo,
        la pendiente recupera la del BP y cruza en diciembre. La curva de mayo —el plan de 65M€— es la que ya no es alcanzable: exigía que la deuda entrase en julio.
      </div>

      <window.Plan50/>

      {/* ===== 2027 ===== */}
      <div className="bk-lvl-h">La salida a 2027 sigue por debajo del BP</div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr><th>Concepto</th><th className="num">BP Serie A</th><th className="num">Forecast sept</th><th className="num">Diferencia</th></tr></thead>
          <tbody>
            {window.BD_2027.map(r => {
              const d = bdDelta(r.fc, r.bp);
              return (
                <tr key={r.k}>
                  <td><b>{r.k}</b></td>
                  <td className="num mono muted">{bdV(r.bp, r.fmt)}</td>
                  <td className="num mono"><b>{bdV(r.fc, r.fmt)}</b></td>
                  <td className="num mono"><span className="k-ach" style={{ '--c': d.c }}>{bdPct(d.rel)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="cv-note">
          Volver a la senda en diciembre de 2026 no cierra sola la brecha de 2027: el BP pedía {bdM(window.BD_2027[0].bp)} de loanbook a dic-27 y el forecast dibuja {bdM(window.BD_2027[0].fc)}.
          La diferencia es capacidad de deuda, no demanda. Es la decisión que conviene poner sobre la mesa del board, con el proveedor nuevo ya en marcha.
        </div>
      </div>

      {/* ===== CAJA ===== */}
      <div className="bk-lvl-h">Caja</div>
      <div className="bdr-cash">
        <div className="bdr-cash-n">
          <div className="bdr-cash-v mono">{bdK(window.BD_CAJA.dic26)}</div>
          <div className="bdr-cash-l">caja a cierre de 2026</div>
        </div>
<div className="bdr-cash-s">
          {(() => {
            // Las negativas crecen hacia abajo desde una línea de cero real: con todas
            // las barras hacia arriba, febrero y marzo parecían recuperación.
            const s = window.BD_CAJA.serie;
            const top = Math.max.apply(null, s), bot = Math.min.apply(null, s);
            const HP = 60, HN = Math.round(HP * Math.abs(bot) / top);
            return s.map((v, i) => (
              <div className={'bdr-cs' + (v < 0 ? ' neg' : '')} key={i}>
                <div className="bdr-cs-v mono">{bdK(v)}</div>
                <div className="bdr-cs-pos" style={{ height: HP + 'px' }}>
                  {v >= 0 && <i style={{ height: Math.max(2, v / top * HP) + 'px' }}/>}
                </div>
                <div className="bdr-cs-zero"/>
                <div className="bdr-cs-neg" style={{ height: HN + 'px' }}>
                  {v < 0 && <i style={{ height: Math.max(2, Math.abs(v) / Math.abs(bot) * HN) + 'px' }}/>}
                </div>
                <div className="bdr-cs-m">{window.BD_CAJA.serieMeses[i]}</div>
              </div>
            ));
          })()}
        </div>
      </div>
      <div className="bdr-note warn">
        El año cierra con {bdK(window.BD_CAJA.dic26)}, y el escenario actual pasa a negativo entre febrero y abril de 2027, con un mínimo de {bdK(window.BD_CAJA.min27)} en {window.BD_CAJA.min27Mes}.
        No es un problema de diciembre: es la consecuencia de haber quemado el colchón de la ronda en el semestre sin originación. Requiere decisión antes de cerrar el año.
      </div>

      {/* ===== ANEXO ===== */}
      <div className="bk-lvl-h">Anexo · detalle mensual del forecast</div>
      <button className="bdr-toggle" onClick={() => setAnexo(!anexo)}>
        {anexo ? 'Ocultar' : 'Ver'} la tabla completa mes a mes
      </button>
      {anexo && (
        <div className="cv bdr-wide">
          <table className="bk-table bdr-mens">
            <thead><tr>
              <th>Concepto</th>
              {window.BD_MESES.map((m, i) => <th key={m} className={'num' + (i === window.BD_REAL_HASTA ? ' grp' : '')}>{m}<em className="bdr-th-sub">{i < window.BD_REAL_HASTA ? 'real' : 'fcst'}</em></th>)}
              <th className="num grp">2026</th>
            </tr></thead>
            <tbody>
              {window.BD_MENSUAL.map(r => (
                <tr key={r.k}>
                  <td className="bdr-k"><b>{r.k}</b></td>
                  {r.v.map((v, i) => (
                    <td key={i} className={'num mono' + (i === window.BD_REAL_HASTA ? ' grp' : '')}>
                      {v == null ? <span className="bk-none">—</span> : bdV(v, r.fmt)}
                    </td>
                  ))}
                  <td className="num mono grp"><b>{bdV(r.tot, r.fmt)}</b>{r.totLabel && <em className="bdr-est">{r.totLabel}</em>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cv-note">{window.BD_MENSUAL_NOTA}</div>
        </div>
      )}

      <div className="bk-foot">
        <div className="bk-foot-n">{window.BD_FUENTES}</div>
      </div>
    </div>
  );
};
