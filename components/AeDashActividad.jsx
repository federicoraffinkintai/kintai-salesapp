// Dashboard 2 · ACTIVIDAD. Mismo patrón que calidad: selector de trimestre,
// una ficha por AE y la tabla completa debajo. Dos sub-bloques: (A) generación
// de deals — cuántos creó y por qué depósito entraron, más la actividad de
// contacto realizada, que todavía no se registra por propietario; y (B) el
// trabajo vivo por etapa del embudo.
const avN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
const av1 = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(1).replace('.', ',');
const avP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d).replace('.', ',') + '%';
const avEur = (v) => v == null ? '—' : v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + 'M€'
  : v >= 1e3 ? Math.round(v / 1e3) + 'k€' : avN(v) + '€';

// Mezcla de depósitos: de qué depende cada AE para tener deals. Barra apilada
// con el ancho proporcional al volumen creado, para que la comparación no
// pierda la escala — depender de partners con 130 deals no es lo mismo que con 9.
function AvMezcla({ G, sel, onSel }) {
  const CAN = window.AEDASH_ACT_CANALES;
  const max = Math.max(1, ...G.list.map(a => a.creados || 0));
  const conDatos = G.list.filter(a => a.creados);
  if (!conDatos.length) return <div className="cht-vacio">Ningún AE creó deals en {G.label}.</div>;
  return (
    <div className="cht-mix">
      {G.list.map(a => (
        <div key={a.key} className={'cht-mx' + (sel === a.key ? ' on' : '')} onClick={() => onSel && onSel(a.key)}>
          <span className="cht-mx-n">{a.nombre}</span>
          <div className="cht-mx-b" style={{width: ((a.creados || 0) / max * 100) + '%'}}>
            {a.creados ? a.canal.filter(c => c.deals).map(c => (
              <i key={c.id} style={{width: (c.deals / a.creados * 100) + '%', background: c.color}}
                title={c.label + ' · ' + avN(c.deals) + ' deals (' + avP(c.deals / a.creados) + ')'}/>
            )) : null}
          </div>
          <b className="mono">{a.creados ? avN(a.creados) : '—'}</b>
        </div>
      ))}
      <div className="cht-leg">
        {CAN.map(c => <span key={c.id}><i style={{background: c.color}}/>{c.label}</span>)}
      </div>
    </div>
  );
}

window.AeDashActividad = function AeDashActividad({ sel, onSel }) {
  const [gran, setGran] = React.useState('trimestre');
  const periodos = React.useMemo(() => window.aeDashPeriodos(gran), [gran]);
  const [q, setQ] = React.useState(window.aeDashUltimo('trimestre'));
  React.useEffect(() => {
    if (!periodos.some(p => p.id === q)) setQ(periodos.length ? periodos[periodos.length - 1].id : null);
  }, [gran]);
  const G = React.useMemo(() => window.aeDashGeneracion(q, gran), [q, gran]);
  const CAN = window.AEDASH_ACT_CANALES;
  // Un único criterio para el par (deals, importe) de un hito, usado en la
  // cabecera y en los KPI: sin cohorte o sin deals que lo alcancen, guion en
  // los dos sitios; con deals y sin importe, 0€ y se dice por qué.
  const hito = (a, id) => {
    if (!a.medido) return { n: null, eur: null, txt: 'sin cohorte' };
    const n = a.alc[id];
    if (!n) return { n: 0, eur: null, txt: 'sin deals que lo alcancen' };
    return { n, eur: a.alcEur[id], txt: avN(n) + ' deals' + (a.alcEur[id] ? '' : ', sin importe en el CRM') };
  };

  return (
    <>
      <div className="bk-lvl-h">Dashboard 1 · Actividad</div>
      <div className="ob-lv">
        <label>Ventana</label>
        <div className="bk-fg">
          {window.AE_REAL_GRAN.map(x => (
            <button key={x.id} className={gran === x.id ? 'on' : ''} onClick={() => setGran(x.id)}>{x.label}</button>
          ))}
        </div>
        <div className="bk-fg">
          {periodos.map(x => (
            <button key={x.id} className={q === x.id ? 'on' : ''} onClick={() => setQ(x.id)}>{x.label}</button>
          ))}
        </div>
        <span className="ob-lv-n">Cohorte por fecha de creación del deal, en la ventana elegida. Los deals y su origen son medición del export; las llamadas y los emails no, porque HubSpot no los registra con propietario.</span>
      </div>

      {/* ---- Sub-bloque A · generación de deals ---- */}
      <div className="bk-lvl-h sub">A · Generación de deals</div>
      <section className="bk-block">
        <div className="bk-bh">
          <span className="bk-chip">De qué depósito depende cada AE</span>
          <span className="bk-bh-d">Reparto de los deals creados en {G.label} por origen, con el ancho de la barra proporcional al volumen: depender de partners con 130 deals no es lo mismo que con 9. Un AE con la barra casi entera de un color tiene un problema de concentración aunque el número sea bueno.</span>
          <span className="bk-bh-k mono">{avN(G.creados)} deals creados</span>
        </div>
        <AvMezcla G={G} sel={sel} onSel={onSel}/>
      </section>
      <div className="sdr-cards">
        {G.list.map((a, i) => (
          <div className={'sdr-card' + (sel === a.key ? ' me' : '')} key={a.key} onClick={() => onSel && onSel(a.key)}>
            <div className="sdr-card-h">
              <span className="sdr-pos mono">{i + 1}</span>
              <div>
                <div className="sdr-nom">{a.nombre}<em>{a.unidadLabel}</em></div>
                <div className="sdr-sub">{a.medido
                  ? avN(a.abiertos) + ' de esos deals siguen abiertos hoy'
                  : 'sin deals creados en ' + G.label}</div>
              </div>
              <span className="sdr-meet mono">{avN(a.creados)}<em>deals creados</em></span>
            </div>
            <div className="sdr-kpis">
              <div className={'sdr-k' + (a.medido ? '' : ' pend')}><span className="sdr-k-l">Deals</span><span className="sdr-k-n mono">{avN(a.creados)}</span><span className="sdr-k-s">creados en {G.label}</span></div>
              {CAN.map(ch => {
                const c = a.canal.find(x => x.id === ch.id) || {};
                return (
                  <div className={'sdr-k' + (c.deals ? '' : ' pend')} key={ch.id} title={ch.desc}>
                    <span className="sdr-k-l">{ch.label}</span>
                    <span className="sdr-k-n mono">{avN(c.deals)}</span>
                    <span className="sdr-k-s">{c.deals && a.creados ? avP(c.deals / a.creados) + ' de sus deals' : 'sin deals'}</span>
                  </div>
                );
              })}
            </div>
            <div className="sdr-embudo wide">
              <div className="sdr-e-t">Actividad realizada por depósito</div>
              {CAN.filter(ch => ch.id !== 'otros').map((ch, ci) => (
                <div className={'sdr-grp' + (ci ? ' sep' : '')} key={ch.id}>
                  <div className="sdr-grp-t" style={{'--c': ch.color}}>{ch.label}</div>
                  {window.AEDASH_ACT_TOQUES.map(t => (
                    <div className="sdr-e" key={t.id} title={t.fuente}>
                      <span>{t.label}</span>
                      <span className="sdr-e-p">sin registro por propietario</span>
                      <b className="mono">—</b>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="sdr-badges">
              <span className="sdr-nobadge">{a.medido
                ? 'Origen del deal medido en el CRM; la actividad que lo levantó, no.'
                : 'Se incorpora a Q4: su primer deal creado abrirá esta ficha.'}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bk-lvl2">
        <div className="bk-lvl2-n">
          {CAN.map(c => <span key={c.id}><b>{c.label}.</b> {c.desc} </span>)}
          <b>Actividad realizada.</b> {window.AEDASH_ACT_TOQUES.map(t => t.label + ': ' + t.fuente).join(' ')}
        </div>
      </div>

      {/* ---- Sub-bloque B · actividad de pipeline ---- */}
      <div className="bk-lvl-h sub">B · Avances en pipeline</div>
      <div className="sdr-cards">
        {G.list.map((a, i) => (
          <div className={'sdr-card' + (sel === a.key ? ' me' : '')} key={a.key} onClick={() => onSel && onSel(a.key)}>
            <div className="sdr-card-h">
              <span className="sdr-pos mono">{i + 1}</span>
              <div>
                <div className="sdr-nom">{a.nombre}<em>{a.unidadLabel}</em></div>
                <div className="sdr-sub">{a.medido
                  ? avN(a.creados) + ' creados · ' + avEur(a.alcEur.data) + ' de línea en data gathering'
                  : 'sin deals creados en ' + G.label}</div>
              </div>
              <span className="sdr-meet mono">{a.medido ? avN(a.alc.disc) : '—'}<em>deals avanzados</em></span>
            </div>
            <div className="sdr-kpis">
              {window.AE_REAL_HITOS.filter(h => h.id !== 'disc').map(h => {
                const x = hito(a, h.id);
                return (
                  <div className={'sdr-k' + (x.n ? '' : ' pend')} key={h.id}
                    title={'Importe de línea de los deals creados en ' + G.label + ' que han alcanzado ' + h.label + '.'}>
                    <span className="sdr-k-l">{h.label}</span>
                    <span className="sdr-k-n mono">{x.eur == null ? '—' : avEur(x.eur)}</span>
                    <span className="sdr-k-s">{x.txt}</span>
                  </div>
                );
              })}
              <div className={'sdr-k' + (a.pipe ? '' : ' pend')} title="Pipeline abierto hoy a su nombre, de todas las cohortes.">
                <span className="sdr-k-l">Abierto hoy</span>
                <span className="sdr-k-n mono">{a.pipe ? avEur(a.pipe.eur) : '—'}</span>
                <span className="sdr-k-s">{a.pipe ? avN(a.pipe.n) + ' deals vivos' : 'sin pipeline'}</span>
              </div>
            </div>
            <div className="sdr-embudo wide">
              <div className="sdr-e-t">Actividad sobre deals · cuántos pasan del hito anterior</div>
              {[{id:'data', de:'disc', label:'Data gathering'},
                {id:'nego', de:'risk', label:'Negociación'},
                {id:'won',  de:'nego', label:'Activación'}].map(r => {
                const base = a.alc ? a.alc[r.de] : null;
                const n = a.alc ? a.alc[r.id] : null;
                const deL = window.AE_REAL_META.hitos[r.de].toLowerCase();
                return (
                  <div className="sdr-e" key={r.id}
                    title={'Deals creados en ' + G.label + ' que llegaron a ' + r.label + ', sobre los que antes habían llegado a ' + deL + '. Misma población en los dos lados de la fracción.'}>
                    <span>{r.label}</span>
                    {base
                      ? <div><i style={{width: (n ? Math.max(2, Math.min(100, n / base * 100)) : 0) + '%'}}/></div>
                      : <span className="sdr-e-p">{a.medido ? 'ninguno llegó a ' + deL : 'sin cohorte'}</span>}
                    <b className="mono">{base ? avN(n) : '—'}<u>{base ? 'de ' + avN(base) : ''}</u></b>
                  </div>
                );
              })}
            </div>
            <div className="sdr-embudo wide">
              <div className="sdr-e-t">Deals que alcanzan cada hito · cohorte {G.label}</div>
              {window.AE_REAL_HITOS.map(h => {
                const n = a.alc ? a.alc[h.id] : null;
                return (
                  <div className="sdr-e" key={h.id} title={'Deals creados en ' + G.label + ' que han llegado a ' + h.label + ', contando su etapa actual y los ganados.'}>
                    <span>{h.label}</span>
                    {a.medido
                      ? <div><i style={{width: (n ? Math.max(2, Math.min(100, n / Math.max(1, a.creados || 1) * 100)) : 0) + '%', background: h.id === 'won' ? '#1F5C42' : null}}/></div>
                      : <span className="sdr-e-p">sin cohorte</span>}
                    <b className="mono">{a.medido ? avN(n) : '—'}<u>{a.medido && a.creados ? avP(n / a.creados) + ' de creados' : ''}</u></b>
                  </div>
                );
              })}
            </div>
            <div className="sdr-badges">
              <span className="sdr-nobadge">{a.medido
                ? 'Avances de la cohorte creada en ' + G.label + ': el importe es la línea de los deals que alcanzaron cada hito.'
                : 'Recién incorporado: sin deals creados en esta ventana.'}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bk-lvl2">
        <div className="bk-lvl2-n">
          <b>Un deal cuenta en un hito si lo ha alcanzado.</b> El export solo trae la etapa actual, así que un deal suma en todos los hitos hasta donde está hoy, y los ganados suman en todos. El importe es la línea esperada de esos deals, no lo dispuesto.
        </div>
      </div>
      <div className="bk-foot">
        {window.AE_REAL_META.fuente}. El origen del deal sale del campo Source Type del export, así que los deals por depósito son medición; las llamadas y los emails necesitan registro de actividad con propietario y sello de tiempo. En el sub-bloque B todo es de la misma población: los deals CREADOS en la ventana elegida y hasta dónde han llegado, con el importe de línea sumado en cada hito. La única excepción va etiquetada: el KPI «abierto hoy», que es el pipeline vivo completo de todas las cohortes. La sección de actividad sobre deals compara cada hito con el hito anterior de la MISMA cohorte, así que el numerador siempre está dentro del denominador. «Alcanzar» un hito significa que la etapa actual del deal lo ha pasado o que acabó ganado; el registro de actividad real por propietario —quién tocó qué deal y cuándo— sigue pendiente. Un deal cuenta en un hito si su etapa actual lo ha alcanzado o si acabó ganado; los perdidos no registran dónde murieron, así que esto mide avance, no mortalidad. Para ver el avance con fecha —cuándo pasó cada etapa— hace falta guardar un snapshot semanal de etapa por deal — el mismo registro que desbloquea deals atascados y tiempo en cada estado en el dashboard de rigor.
      </div>
    </>
  );
};
