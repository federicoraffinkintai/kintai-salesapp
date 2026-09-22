// Mapa de etapas: las tres métricas de cada etapa y las competencias que la
// mueven. Dos lecturas: por etapa y por competencia.
const { useState, useMemo: useMemoSM } = React;

window.SkillMap = function SkillMap() {
  const [vista, setVista] = useState('etapa');
  const [foco, setFoco] = useState(null);
  const porComp = useMemoSM(() => window.smPorComp(), []);
  const F = window.SM_FUENTES;
  const fuente = (f) => <span className="sm-f" style={{'--c': F[f].color}} title={F[f].desc}>{F[f].label}</span>;

  return (
    <>
      <div className="bk-lvl-h">Cómo se mide cada etapa</div>
      <section className="bk-block sm-head">
        <div className="bk-bh">
          <span className="bk-chip">Tres métricas, todas las etapas</span>
          <span className="bk-bh-d">{window.SM_META.nota}</span>
        </div>
        <div className="sm-fuentes">
          {window.SM_METRICAS.map(m => (
            <div key={m.id} className="sm-fu" style={{'--c': m.ancla ? '#2E7D5B' : '#767D8C'}}>
              <span>{m.label}{m.ancla && <i className="sm-anc">ancla</i>}</span>
              <em>{m.def}</em>
              {fuente(m.fuente)}
            </div>
          ))}
        </div>
      </section>

      <div className="ob-lv">
        <label>Lectura</label>
        <div className="bk-fg">
          {[['etapa','Por etapa'],['comp','Por competencia']].map(([k, l]) => (
            <button key={k} className={vista === k ? 'on' : ''} onClick={() => setVista(k)}>{l}</button>
          ))}
        </div>
        <span className="ob-lv-n">{vista === 'etapa'
          ? 'La conversión de la etapa cae en una de cuatro bandas, y esa banda es el nivel que se propone para las competencias que la mueven.'
          : 'La misma tabla al revés: en qué etapas se juega cada competencia y qué métrica la delata.'}</span>
      </div>

      {vista === 'etapa' ? (
        <div className="bk-lvl2">
          <table className="bk-table sm-tabla">
            <thead><tr>
              <th>Etapa</th><th>Conversión · métrica ancla</th><th>Bandas de nivel</th>
              <th>Ticket medio</th><th>% sobre deudores disponibles</th><th>Competencias que la mueven</th>
            </tr></thead>
            <tbody>
              {window.SM_ETAPAS.map(e => (
                <tr key={e.id}>
                  <td className="bk-nom"><b><s className="sm-dot" style={{background:e.color}}/>{e.label}</b><em>{e.desc}</em></td>
                  <td className="sm-ancla-c"><b>{e.m.conv}</b></td>
                  <td>
                    <div className="sm-bandas">
                      {e.b.map((b, i) => {
                        const esc = window.SK_ESCALA[i + 1];
                        return <div key={i} className="sm-b"><b className="mono" style={{background:esc.color, color:esc.fg}}>{i + 1}</b><span>{b}</span></div>;
                      })}
                    </div>
                  </td>
                  <td className="sm-def-c">{e.m.ticket}</td>
                  <td className="sm-def-c">{e.m.deud}</td>
                  <td>
                    <div className="sm-tags">
                      {e.comps.map(id => { const c = window.smComp(id);
                        return <span key={id} className="ap-q4-u sm-chip" style={{'--c': c.color}} title={c.resumen}
                          onClick={() => { setFoco(id); setVista('comp'); }}>{c.label}</span>; })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bk-lvl2-n">
            Conversión y ticket medio salen del export de HubSpot. El porcentaje sobre deudores disponibles <b>hay que instrumentarlo</b>: exige cargar los deudores que el cliente tiene y cuáles entran en la operación. Es la métrica que distingue una línea testimonial de una cartera capturada.
          </div>
        </div>
      ) : (
        <div className="bk-lvl2">
          <table className="bk-table sm-tabla">
            <thead><tr>
              <th>Competencia</th><th>Qué es</th><th>Dónde se juega</th><th>Qué métrica la delata</th><th className="num">Nivel esperado</th>
            </tr></thead>
            <tbody>
              {porComp.map(x => (
                <tr key={x.comp.id} className={foco === x.comp.id ? 'sm-foco' : ''} onClick={() => setFoco(x.comp.id)}>
                  <td className="bk-nom"><b><s className="sm-dot" style={{background:x.comp.color}}/>{x.comp.label}</b><em>peso {x.comp.peso.pymes} en Pymes · {x.comp.peso.midmkt} en Mid Market</em></td>
                  <td className="sm-def-c">{x.comp.resumen}</td>
                  <td><div className="sm-tags">{x.etapas.map(e => <span key={e.id} className="ap-q4-u" style={{'--c': e.color}}>{e.label}</span>)}</div></td>
                  <td>
                    <ul className="sm-ml">
                      {x.etapas.map(e => <li key={e.id}><b>{e.label}:</b> {e.m.conv.toLowerCase()}</li>)}
                    </ul>
                  </td>
                  <td className="num mono">{x.comp.esp.pymes} / {x.comp.esp.midmkt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bk-lvl2-n">
            {foco
              ? <>Foco en <b>{window.smComp(foco).label}</b>: {window.smComp(foco).conductas.join(' · ')}</>
              : 'Una competencia baja con la conversión de sus etapas alta es una puntuación que hay que revisar — y al revés.'}
            {foco ? <button className="sk-reset sm-quita" onClick={() => setFoco(null)}>Quitar foco</button> : null}
          </div>
        </div>
      )}
    </>
  );
};
