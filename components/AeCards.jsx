// Dashboards individuales de AE, con el mismo formato que los del SDR:
// arriba las conversiones que manda mirar dirección más ticket y pricing, en
// medio el embudo de la persona — deals, discoveries, data gatherings,
// propuestas, activaciones, clientes — y abajo las insignias.
const cdN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
const cd1 = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(1).replace('.', ',');
const cdP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d).replace('.', ',') + '%';
const cdEur = (v) => v == null ? '—' : v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + 'M€'
  : v >= 1e3 ? Math.round(v / 1e3) + 'k€' : cdN(v) + '€';

window.AeCards = function AeCards({ sel, onSel }) {
  const A = React.useMemo(() => window.aeActividad(), []);
  // El embudo de la tarjeta sin el hito de riesgos, que es el que no se cuenta
  // como actividad del AE sino como paso de comité.
  const barras = ['deals', 'discovery', 'data', 'propuesta', 'activacion', 'cliente'];

  return (
    <>
      <div className="bk-lvl-h">Dashboards individuales · uno por AE</div>
      <div className="sdr-cards">
        {A.list.map((a, i) => {
          const h = (id) => a.hitos.find(x => x.id === id) || {};
          const base = Math.max(1, h('deals').n || 1);
          return (
            <div className={'sdr-card' + (sel === a.key ? ' me' : '')} key={a.key} onClick={() => onSel && onSel(a.key)}>
              <div className="sdr-card-h">
                <span className="sdr-pos mono">{i + 1}</span>
                <div>
                  <div className="sdr-nom">{a.nombre}<em>{a.unidadLabel}</em></div>
                  <div className="sdr-sub">{cdEur(a.obj.eur)} objetivo · {cdN(a.deals)} deals{a.dealsEmbudo !== a.deals ? ', ' + cdN(a.dealsEmbudo) + ' de nuevo negocio' : ''} · {cdN(a.objCli)} clientes</div>
                </div>
                <span className="sdr-meet mono">{cd1(h('cliente').n)}<em>clientes del modelo</em></span>
              </div>
              <div className="sdr-kpis">
                {a.conv.map(c => (
                  <div className="sdr-k" key={c.id} title={c.desc}>
                    <span className="sdr-k-l">{c.label}</span>
                    <span className="sdr-k-n mono">{cdP(c.v)}</span>
                    <span className="sdr-k-s">{c.id === 'discRisk' ? 'saca la documentación' : c.id === 'negoAct' ? 'cierra el precio' : 'línea dispuesta'}</span>
                  </div>
                ))}
                <div className="sdr-k">
                  <span className="sdr-k-l">Ticket medio</span>
                  <span className="sdr-k-n mono">{cdEur(a.ticket)}</span>
                  <span className="sdr-k-s">línea por cliente</span>
                </div>
                <div className="sdr-k">
                  <span className="sdr-k-l">Pricing</span>
                  <span className="sdr-k-n mono">{a.pricing ? cdN(a.pricing) + '€' : '—'}</span>
                  <span className="sdr-k-s">{a.pricing ? 'por deal, imputado' : 'sin mezcla de segmento'}</span>
                </div>
              </div>
              <div className="sdr-embudo">
                {barras.map(id => {
                  const x = h(id);
                  return (
                    <div className="sdr-e" key={id}>
                      <span>{x.label}</span>
                      <div><i style={{width: Math.max(2, Math.min(100, (x.n || 0) / base * 100)) + '%', background: x.color}}/></div>
                      <b className="mono">{id === 'deals' ? cdN(x.n) : cd1(x.n)}</b>
                    </div>
                  );
                })}
              </div>
              <div className="sdr-badges">
                {a.badges.length ? a.badges.map(id => {
                  const b = window.AEACT_BADGES.find(x => x.id === id);
                  return b ? <span className="ap-badge" key={id} title={b.name + ' · ' + b.desc}>{b.icon}</span> : null;
                }) : <span className="sdr-nobadge">Sin insignias todavía</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="bk-foot">
        Las tres conversiones son las del modelo de actividad de su unidad, no medidas: HubSpot no expone hoy el histórico de etapas por deal, así que no hay conversión real por AE. El ticket medio es el comprometido en el objetivo y el pricing es el precio por deal imputado por mezcla de segmentos, con la tabla de la hoja de outbound — {Object.keys(window.AEACT_SEG_PRECIO).map(k => k + ' ' + window.AEACT_SEG_PRECIO[k] + '€').join(', ')}. Las insignias se prueban sobre el objetivo y el pipeline vivo: {window.AEACT_BADGES.map(b => b.name.toLowerCase()).join(', ')}.
      </div>
    </>
  );
};
