// Scorecard de skills: cuatro competencias, matriz editable por AE,
// puntuación ponderada por perfil y prioridades de formación.
const { useState, useMemo, useEffect } = React;

const sN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
const s1 = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(1).replace('.', ',');

window.AeSkills = function AeSkills() {
  const [scores, setScores] = useState(() => window.skLoad());
  const [sel, setSel] = useState('paula');
  useEffect(() => { window.skSave(scores); }, [scores]);

  const sc = useMemo(() => window.skScore(scores), [scores]);
  const esc = window.SK_ESCALA;
  const cur = sc.list.find(a => a.key === sel) || sc.list[0];
  const set = (ae, comp, n) => setScores(s => ({ ...s, [ae]: { ...s[ae], [comp]: Math.max(0, Math.min(4, n)) } }));
  const cycle = (ae, comp, v, back) => set(ae, comp, back ? (v <= 0 ? 4 : v - 1) : (v >= 4 ? 0 : v + 1));
  const chip = (n) => { const e = esc[n]; return { background:e.color, color:e.fg, boxShadow: e.borde ? 'inset 0 0 0 1px ' + e.borde : 'none' }; };

  return (
    <div className="ap bk sk" data-screen-label="12 Skills AE">
      <div className="bk-head">
        <div>
          <h1 className="bk-h1">Scorecard de competencias</h1>
          <div className="bk-sub">Cuatro competencias explican el resultado de un AE: <b>descubrimiento</b>, <b>negociación</b>, <b>sastre financiero</b> y <b>ejecutor estratégico</b>. Se puntúan de 0 a 4 sobre conducta observada y pesan distinto según el perfil — Pymes carga en negociación y ejecución, Mid Market en descubrimiento y diagnóstico financiero. <b>Haz clic en cualquier celda para puntuar</b>: se guarda en este navegador.</div>
        </div>
        <div className="bk-kpis">
          <div className="bk-kpi accent"><b className="mono">{sN(sc.tot.media)}<em> / {sN(sc.tot.objetivo)}</em></b><span>puntuación media vs exigida</span></div>
          <div className="bk-kpi"><b className="mono">{sN(sc.list.filter(a => a.listo).length)}<em> / {sc.list.length}</em></b><span>AE en nivel de rol</span></div>
          <div className="bk-kpi"><b className="mono">{sN(sc.tot.brechas)}</b><span>brechas abiertas</span></div>
          <div className="bk-kpi"><b className="mono">{sN(sc.tot.referentes)}</b><span>competencias de referente</span></div>
        </div>
      </div>

      {/* ===== LAS CUATRO COMPETENCIAS ===== */}
      <div className="sk-defs">
        {window.SK_COMPS.map(c => (
          <section key={c.id} className="bk-block sk-def" style={{'--c': c.color}}>
            <div className="bk-bh">
              <span className="bk-chip">{c.label}</span>
              <span className="bk-bh-k mono">peso {c.peso.pymes} / {c.peso.midmkt}</span>
            </div>
            <div className="sk-def-b">
              <p className="sk-def-r">{c.resumen}</p>
              <ul className="sk-cond">{c.conductas.map((x, i) => <li key={i}>{x}</li>)}</ul>
              <div className="sk-def-f mono">nivel esperado {c.esp.pymes} en Pymes · {c.esp.midmkt} en Mid Market<u>media del equipo {s1(sc.porComp.find(p => p.id === c.id).med)}</u></div>
            </div>
          </section>
        ))}
      </div>

      {/* ===== SISTEMA DE PUNTUACIÓN ===== */}
      <section className="bk-block sk-sys">
        <div className="bk-bh">
          <span className="bk-chip">Cómo se puntúa</span>
          <span className="bk-bh-d">{window.SK_META.nota} La puntuación es la media ponderada de los cuatro niveles sobre 100, y se lee contra el nivel que pide el rol, no contra el resto del equipo.</span>
          <span className="bk-bh-k mono">{window.SK_META.version}</span>
        </div>
        <div className="sk-sys-g">
          <div className="sk-sys-b">
            <div className="ap-f-t">Escala de niveles</div>
            <ul className="sk-esc">
              {esc.map(e => (
                <li key={e.n}><b className="mono" style={chip(e.n)}>{e.n}</b>
                  <div><span>{e.label}</span><em>{e.desc}</em></div></li>
              ))}
            </ul>
          </div>
          <div className="sk-sys-b">
            <div className="ap-f-t">Peso por perfil</div>
            <table className="sk-peso">
              <thead><tr><th>Competencia</th><th className="num">Pymes</th><th className="num">Mid Market</th></tr></thead>
              <tbody>
                {window.SK_COMPS.map(c => (
                  <tr key={c.id}><td><s style={{background:c.color}}/>{c.label}</td>
                    <td className="num mono">{c.peso.pymes}</td><td className="num mono">{c.peso.midmkt}</td></tr>
                ))}
                <tr className="bk-row-tot"><td>Total</td><td className="num mono">100</td><td className="num mono">100</td></tr>
              </tbody>
            </table>
          </div>
          <div className="sk-sys-b">
            <div className="ap-f-t">Lectura del resultado</div>
            <p className="sk-p">Nivel entre 4, por el peso de la competencia: la suma de las cuatro es la puntuación sobre 100. Un AE está <b>en nivel de rol</b> cuando iguala la puntuación que exigen sus niveles esperados — no cuando llega a 100.</p>
            <ul className="sk-bandas">
              {window.SK_BANDAS.map(b => (
                <li key={b.label}><b style={{'--c': b.color}}>{b.label}</b><em>{b.min}+ · {b.desc}</em></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== RESULTADO POR AE ===== */}
      <div className="bk-lvl-h">Resultado por AE</div>
      <div className="sk-cards">
        {sc.list.map(a => (
          <div key={a.key} className={'bk-cn sk-card ' + (sel === a.key ? 'on' : '')} style={{'--c': a.banda.color}} onClick={() => setSel(a.key)}>
            <div className="bk-cn-h"><div className="bk-cn-t">{a.nombre}<span className="bk-cn-f">{a.unidadLabel}</span></div></div>
            <div className="sk-card-n">
              <b className="mono">{sN(a.punt)}</b>
              <div><span className="sk-banda" style={{'--c': a.banda.color}}>{a.banda.label}</span>
                <em>exige {sN(a.objetivo)} · {a.listo ? 'en nivel' : sN(a.objetivo - a.punt) + ' por debajo'}</em></div>
            </div>
            <div className="sk-card-bar"><i style={{width: Math.min(100, a.punt) + '%'}}/><u style={{left: Math.min(100, a.objetivo) + '%'}}/></div>
            <div className="sk-areas">
              {a.comps.map(c => (
                <div key={c.id} className="sk-area">
                  <span title={c.label}>{c.corto}</span>
                  <div className="sk-area-bar"><i style={{width:(c.pct * 100) + '%', background:c.color}}/><u style={{left:(c.espPct * 100) + '%'}}/></div>
                  <b className="mono">{c.n}</b>
                </div>
              ))}
            </div>
            <div className="sk-prio">
              <div className="ap-q4-mx-t">Prioridades de formación</div>
              {a.brechas.length
                ? <ol>{a.brechas.map(c => <li key={c.id}><span>{c.label}</span><em className="mono">{c.n} → {c.esp}</em></li>)}</ol>
                : <div className="sk-ok">Sin brechas: las cuatro competencias en el nivel que pide el rol.</div>}
            </div>
          </div>
        ))}
      </div>

      {/* ===== MATRIZ ===== */}
      <div className="bk-lvl-h">Matriz de puntuación</div>
      <div className="ob-lv">
        <label>Editar</label>
        <span className="ob-lv-n">Clic en una celda para subir un nivel, clic derecho para bajarlo. El punto de la celda marca el nivel que pide el rol de ese AE.</span>
        <button className="sk-reset" onClick={() => setScores(window.skReset())}>Restaurar puntuación inicial</button>
      </div>
      <div className="bk-lvl2">
        <table className="bk-table sk-matriz">
          <thead><tr>
            <th>Competencia</th><th className="num">Media</th>
            {sc.list.map(a => <th key={a.key} className={'num sk-th ' + (sel === a.key ? 'on' : '')} onClick={() => setSel(a.key)}>{a.nombre}<em>{a.perfil === 'pymes' ? 'Pymes' : 'Mid Mkt'}</em></th>)}
          </tr></thead>
          <tbody>
            {window.SK_COMPS.map(c => (
              <tr key={c.id}>
                <td className="bk-nom sk-comp"><b><s className="sm-dot" style={{background:c.color}}/>{c.label}</b><em>{c.resumen}</em></td>
                <td className="num mono">{s1(sc.porComp.find(p => p.id === c.id).med)}</td>
                {sc.list.map(a => {
                  const v = a.comps.find(x => x.id === c.id);
                  return (
                    <td key={a.key} className={'num sk-cell ' + (sel === a.key ? 'on' : '')}
                      onClick={() => cycle(a.key, c.id, v.n)}
                      onContextMenu={(ev) => { ev.preventDefault(); cycle(a.key, c.id, v.n, true); }}
                      title={a.nombre + ' · ' + c.label + ' · ' + esc[v.n].label + ' (esperado ' + v.esp + ')'}>
                      <span className="sk-n mono" style={chip(v.n)}>{v.n}<u style={{left:(v.esp / 4 * 100) + '%'}}/></span>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="bk-row-tot">
              <td>Puntuación 0-100<em className="ap-pop">ponderada por perfil</em></td>
              <td className="num mono">{sN(sc.tot.media)}</td>
              {sc.list.map(a => <td key={a.key} className="num mono"><b style={{color: a.banda.color}}>{sN(a.punt)}</b></td>)}
            </tr>
            <tr className="bk-row-tot sk-row-esp">
              <td>Nivel exigido por el rol</td>
              <td className="num mono">{sN(sc.tot.objetivo)}</td>
              {sc.list.map(a => <td key={a.key} className="num mono">{sN(a.objetivo)}</td>)}
            </tr>
          </tbody>
        </table>
      </div>

      <window.SkillMap/>

      {/* ===== PLAN DE FORMACIÓN ===== */}
      <div className="bk-lvl-h">Qué formar primero</div>
      <div className="sk-plan">
        <section className="bk-block">
          <div className="bk-bh"><span className="bk-chip">Formación de grupo</span>
            <span className="bk-bh-d">Competencias donde falla media plantilla: sale más a cuenta una sesión para todos que seis acompañamientos.</span></div>
          <table className="bk-table">
            <thead><tr><th>Competencia</th><th>Qué se entrena</th><th className="num">Media equipo</th><th className="num">AE con brecha</th><th className="num">Niveles a recuperar</th></tr></thead>
            <tbody>
              {sc.porComp.map(c => (
                <tr key={c.id}>
                  <td className="bk-nom"><b><s className="sm-dot" style={{background:c.color}}/>{c.label}</b><em>{c.resumen}</em></td>
                  <td className="sk-ancla">{c.conductas.slice(0, 2).join(' · ')}</td>
                  <td className="num mono">{s1(c.med)}</td>
                  <td className="num mono">{sN(c.conGap)}<em className="sk-of"> / {sc.list.length}</em></td>
                  <td className="num mono"><b>{sN(c.gapTot)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="bk-block" style={{'--c': cur.banda.color}}>
          <div className="bk-bh"><span className="bk-chip">{cur.nombre}</span>
            <span className="bk-bh-d">Plan individual: competencias por debajo del nivel que pide su rol, ordenadas por impacto en la puntuación.</span>
            <span className="bk-bh-k mono">{sN(cur.punt)} de {sN(cur.objetivo)}</span></div>
          {cur.brechas.length
            ? <table className="bk-table">
                <thead><tr><th>Competencia</th><th className="num">Nivel</th><th className="num">Exigido</th><th className="num">Peso</th><th>Qué tiene que empezar a hacer</th></tr></thead>
                <tbody>
                  {cur.brechas.map(c => (
                    <tr key={c.id}>
                      <td className="bk-nom"><b>{c.label}</b><em>{c.resumen}</em></td>
                      <td className="num mono"><span className="sk-n mono" style={chip(c.n)}>{c.n}</span></td>
                      <td className="num mono">{c.esp}</td>
                      <td className="num mono">{c.peso}</td>
                      <td className="sk-ancla"><ul className="sk-cond">{c.conductas.map((x, i) => <li key={i}>{x}</li>)}</ul></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            : <div className="bk-lvl2-n">{cur.nombre} está en nivel de rol en las cuatro competencias. El siguiente paso no es formación: es subirle el nivel esperado o ponerle a formar al resto.</div>}
        </section>
      </div>
      <div className="bk-foot">
        Marco {window.SK_META.version}. La puntuación que edites se guarda solo en este navegador, así que sirve para trabajar la evaluación en sesión. El siguiente paso es colgar una formación de cada competencia y medir el movimiento de nivel contra la conversión de las etapas que mueve.
      </div>
    </div>
  );
};
