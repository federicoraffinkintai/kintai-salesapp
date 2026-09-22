// Canal contactos: cola de follow-up sobre operaciones que ya pasaron por riesgos
const { useState, useMemo } = React;

const cN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
const cEur = (v) => v == null ? '—' : v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + 'M€'
  : v >= 1e3 ? Math.round(v / 1e3) + 'k€' : cN(v) + '€';
const cPct = (v, d) => v == null || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d).replace('.', ',') + '%';
const TIER_LAB = { small:'SME Small', mid:'SME Mid', big:'SME Big', midmkt:'Mid Market', corp:'Corporate' };
const OPERATIVA_LAB = { gc:'Gestión de cobro', wallet:'Wallet', ciego:'Ciego', special:'Especial', futuro:'Futuros' };

window.ContactFlow = function ContactFlow() {
  const [tier, setTier] = useState('all');
  const [estado, setEstado] = useState('activacion');
  const [res, setRes] = useState('all');
  const [deal, setDeal] = useState('all');
  const [enc, setEnc] = useState('all');
  const [sel, setSel] = useState(null);
  const [camp, setCamp] = useState(null);
  const [cart, setCart] = useState(() => window.carteraGet());
  const [log, setLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kintai-fulog') || '{}'); } catch (e) { return {}; }
  });
  const mark = (nif, outcome) => {
    const next = { ...log, [nif]: { outcome, ts: Date.now() } };
    setLog(next);
    try { localStorage.setItem('kintai-fulog', JSON.stringify(next)); } catch (e) {}
  };

  const all = window.CONTACTS;
  // Cruce con HubSpot por nombre normalizado: el export no trae NIF.
  const hsOf = (c) => {
    if (!window.HS_OPEN) return null;
    const k = window.HS_NORM(c.e);
    return window.HS_OPEN[k] || null;
  };
  const est = window.CONTACT_ESTADOS;
  const estOf = (c) => est.find(e => e.id === window.contactEstado(c)) || est[est.length - 1];
  const campaign = camp ? window.CONTACT_CAMPAIGNS.find(c => c.id === camp) : null;

  const queue = useMemo(() => {
    let q = window.contactQueue(all, { tier, estado, res });
    if (enc !== 'all') q = q.filter(c => {
      const x = window.contactEncaje(c);
      return enc === 'sin' ? !x : x && window.encBand(x.enc).id === enc;
    });
    if (deal !== 'all') q = q.filter(c => {
      const ds = window.HS_DEAL_STATE(c.e, c.vivo);
      return deal === 'lost' ? (ds.id === 'lost' || ds.id === 'perdido') : ds.id === deal;
    });
    if (campaign) q = q.filter(campaign.match);
    return q;
  }, [all, tier, estado, res, camp, deal, enc]);

  const cur = sel ? all.find(c => c.nif === sel) : queue[0];

  // Totales de la cartera. El dinero primero: es lo que justifica el canal.
  const tot = useMemo(() => {
    const f = tier === 'all' ? all : all.filter(c => c.tier === tier);
    const byEst = {};
    est.forEach(e => byEst[e.id] = f.filter(c => window.contactEstado(c) === e.id));
    const act = byEst.activacion;
    return {
      n: f.length, byEst,
      aprobadoSinUsar: act.reduce((a, c) => a + (c.ap || 0), 0),
      ganadoSinUsar: byEst.ganado.reduce((a, c) => a + (c.ap || 0), 0),

      pedidoSinRes: byEst.expediente.reduce((a, c) => a + (c.req || 0), 0),
      bloqueado: byEst.producto.reduce((a, c) => a + (c.req || 0), 0),
      vivo: byEst.cliente.reduce((a, c) => a + (c.vivo || 0), 0),
    };
  }, [all, tier]);

  // Agregados del dashboard. Las medias de % sobre ventas son medianas, que a
  // esta dispersión de tamaños no las arrastra un caso extremo.
  const agg = useMemo(() => {
    const f = tier === 'all' ? all : all.filter(c => c.tier === tier);
    const R = f.map(c => ({ c, r: window.contactRatios(c) }));
    const conV = R.filter(x => x.r.ventas);
    const medOf = (arr) => { const v = arr.filter(x => x != null).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null; };
    // Poblaciones separadas: mezclarlas es lo que producía dos huecos distintos.
    const aprob = f.filter(c => c.res === 'APPROVED' && c.req && c.ap != null);
    const aprobConV = aprob.filter(c => c.v > 0);
    const recortadas = aprob.filter(c => c.ap < c.req * 0.995);
    const ampliadas = aprob.filter(c => c.ap > c.req * 1.005);
    const reqAprob = aprob.reduce((a, c) => a + c.req, 0);
    const apAprob = aprob.reduce((a, c) => a + c.ap, 0);
    const hueco = recortadas.reduce((a, c) => a + (c.req - c.ap), 0);
    const exceso = ampliadas.reduce((a, c) => a + (c.ap - c.req), 0);
    // Lo pedido que nunca tuvo límite: rechazado o sin veredicto. Cantidad aparte.
    const sinLimite = f.filter(c => c.res !== 'APPROVED');
    const reqSinLimite = sinLimite.reduce((a, c) => a + (c.req || 0), 0);
    const act = f.filter(c => window.contactEstado(c) === 'activacion');
    const bands = {};
    window.RATIO_BANDS.forEach(b => bands[b.id] = { n: 0, eur: 0 });
    let sinCifra = 0;
    conV.forEach(x => {
      const pct = x.r.aprobadoPct != null ? x.r.aprobadoPct : x.r.pedidoPct;
      const b = window.ratioBand(pct);
      if (b) { bands[b.id].n++; bands[b.id].eur += x.c.ap || 0; } else sinCifra++;
    });
    const enBanda = window.RATIO_BANDS.reduce((a, b) => a + bands[b.id].n, 0);
    const ops = ['ciego','wallet','gc','futuro','special'].map(id => {
      const g = f.filter(c => c.s && c.s[id] > 0);
      return { id, n: g.length, eur: g.reduce((a, c) => a + c.s[id], 0),
        pctMed: medOf(g.map(c => c.v ? c.s[id] / c.v : null)),
        pctReqMed: medOf(g.map(c => c.req ? c.s[id] / c.req : null)),
        fix: window.FIX_ROADMAP.find(x => x.id === id) };
    }).filter(o => o.n).sort((a, b) => b.eur - a.eur);
    const tierIds = ['big','midmkt','mid','small','corp',null];
    const tiers = tierIds.map(id => {
      const g = all.filter(c => (c.tier || null) === id && window.contactEstado(c) === 'activacion');
      return { id, n: g.length, sinUsar: g.reduce((a, c) => a + (c.ap || 0), 0),
        pctMed: medOf(g.map(c => c.v ? (c.ap || 0) / c.v : null)) };
    }).filter(t => t.n);
    const cl = window.carteraGet();
    const clas = f.filter(c => cl[c.nif] && cl[c.nif].n1);
    const cartera = {
      total: clas.length, clasificadas: clas.length > 0,
      n1: window.CARTERA_N1.map(o => {
        const g = clas.filter(c => cl[c.nif].n1 === o.id);
        return { id:o.id, label:o.label, n:g.length, eur:g.reduce((a, c) => a + (c.ap || 0), 0),
          pctMed: medOf(g.map(c => c.v ? (c.ap || 0) / c.v : null)) };
      }).filter(x => x.n),
    };
    const totSinUsar = tiers.reduce((a, t) => a + t.sinUsar, 0);
    return {
      nAprob: aprob.length, nRecort: recortadas.length, nAmpl: ampliadas.length,
      reqAprob, apAprob, hueco, exceso,
      cobAprob: reqAprob ? apAprob / reqAprob : null,
      reqSinLimite, nSinLimite: sinLimite.length,
      enBanda, sinCifra, cartera,
      conDeal: f.filter(c => window.HS_OPEN && window.HS_OPEN[window.HS_NORM(c.e)]).length,
      enc: (() => {
        const conEnc = f.map(c => ({ c, x: window.contactEncaje(c) })).filter(y => y.x);
        return {
          n: conEnc.length,
          bands: window.ENC_BANDS.map(b => {
            const g = conEnc.filter(y => window.encBand(y.x.enc).id === b.id);
            return { id:b.id, label:b.label, color:b.color, n:g.length,
              eur: g.reduce((a, y) => a + (y.c.ap || 0), 0),
              pctMed: medOf(g.map(y => y.c.v ? (y.c.ap || 0) / y.c.v : null)) };
          }).filter(x => x.n),
        };
      })(),
      dealMix: (() => {
        const g = {};
        f.forEach(c => { const id = window.HS_DEAL_STATE(c.e, c.vivo).id; g[id] = (g[id] || 0) + 1; });
        const lab = { abierto:'abiertos', cliente:'clientes', churn:'churn', lost:'lost', rechazado:'rechazados', perdido:'lost y rechazado', ninguno:'sin deal' };
        return Object.entries(g).sort((a, b) => b[1] - a[1]).map(([k, v]) => v + ' ' + lab[k]).join(' · ');
      })(),
      // Medianas sobre las aprobadas CON ventas, que es la población de las
      // tarjetas. Sobre conV entrarían 94 rechazadas con aprobado 0 y hundirían
      // la mediana a la mitad.
      nAprobConV: aprobConV.length,
      reqPctMed: medOf(aprobConV.map(c => c.req / c.v)),
      apPctMed: medOf(aprobConV.map(c => c.ap / c.v)),
      // Y la del universo entero, que es otra cosa y se dice aparte.
      reqPctMedTodas: medOf(conV.map(x => x.r.pedidoPct)),
      actPctMed: medOf(act.filter(c => c.v).map(c => (c.ap || 0) / c.v)),
      conVentas: conV.length, bands, ops, tiers,
      focoShare: totSinUsar ? tiers.filter(t => t.id === 'big' || t.id === 'midmkt').reduce((a, t) => a + t.sinUsar, 0) / totSinUsar : 0,
    };
  }, [all, tier, cart]);

  // Importe con sus dos bases debajo: gris sobre ventas, naranja sobre pedido.
  const Money = ({ eur, ventas, pedido, base }) => {
    if (eur == null) return <span className="fu-none">—</span>;
    return (
      <span className="fu-m">
        <b className="mono">{cEur(eur)}</b>
        <em className="fu-m-v mono">{ventas ? cPct(eur / ventas, 1) : '—'}</em>
        {!base && <em className="fu-m-p mono">{pedido ? cPct(eur / pedido, 0) : '—'}</em>}
      </span>
    );
  };

  const done = Object.keys(log).length;

  return (
    <div className="fu" data-screen-label="08 Follow ups contactos">
      <div className="fu-head">
        <div>
          <h1 className="fu-h1">Follow ups · canal contactos</h1>
          <div className="fu-sub">Las {window.CONTACTS_META.operaciones} operaciones que han pasado por comité de riesgos, consolidadas en {window.CONTACTS_META.empresas} empresas por su resolución más reciente. De cada una sabemos el límite que pidió, el que riesgos aprobó, qué operativa le denegamos y si ha dispuesto.</div>
        </div>
        <div className="fu-kpis">
          <div className="fu-kpi accent"><b className="mono">{cEur(tot.aprobadoSinUsar)}</b><span>aprobado sin firmar</span></div>
          <div className="fu-kpi"><b className="mono">{cEur(tot.ganadoSinUsar)}</b><span>ganado sin primera factura</span></div>
          <div className="fu-kpi"><b className="mono">{cEur(agg.hueco)}</b><span>hueco en {agg.nRecort} recortadas</span></div>
          <div className="fu-kpi"><b className="mono">{tot.byEst.expediente.length}</b><span>sin resolución</span></div>
          <div className="fu-kpi"><b className="mono">{agg.conDeal}</b><span>con deal abierto</span></div>
          <div className="fu-kpi"><b className="mono">{done}</b><span>trabajados</span></div>
        </div>
      </div>

      {/* ===== DASHBOARD RESUMEN ===== */}
      <section className="fu-dash">
        <div className="fu-dash-row">
          <div className="fu-d-big">
            <div className="fu-d-lab">Aprobado y sin firmar</div>
            <div className="fu-d-n mono">{cEur(tot.aprobadoSinUsar)}</div>
            <div className="fu-d-d"><b>{tot.byEst.activacion.length}</b> empresas con límite aprobado por riesgos, sin deal ganado en HubSpot y sin riesgo vivo. El lead, el discovery y el comité ya están pagados.{tot.byEst.ganado.length > 0 && <> Aparte, <b>{tot.byEst.ganado.length}</b> ya ganaron el deal ({cEur(tot.ganadoSinUsar)}) y no han subido la primera factura.</>}</div>
            <div className="fu-d-sub">
              <div><span>Media por empresa</span><b className="mono">{cEur(tot.aprobadoSinUsar / Math.max(1, tot.byEst.activacion.length))}</b></div>
              <div><span>Sobre su facturación</span><b className="mono">{cPct(agg.actPctMed, 1)}</b></div>
              <div><span>Población</span><b className="mono">{tot.byEst.activacion.length} sin firmar</b></div>
            </div>
          </div>
          <div className="fu-d-cols">
            <div className="fu-d-k"><div className="fu-d-kl">Pedido en las {agg.nAprob} aprobadas</div><div className="fu-d-kn mono">{cEur(agg.reqAprob)}</div><div className="fu-d-kd">mediana del {cPct(agg.reqPctMed, 1)} de sus ventas, en las {agg.nAprobConV} con cifra de ventas</div></div>
            <div className="fu-d-k"><div className="fu-d-kl">Aprobado en esas mismas</div><div className="fu-d-kn mono">{cEur(agg.apAprob)}</div><div className="fu-d-kd">cobertura del {cPct(agg.cobAprob, 0)} · mediana {cPct(agg.apPctMed, 1)} de ventas en esas {agg.nAprobConV}</div></div>
            <div className="fu-d-k warn"><div className="fu-d-kl">Hueco en las {agg.nRecort} recortadas</div><div className="fu-d-kn mono">{cEur(agg.hueco)}</div><div className="fu-d-kd">{agg.nAmpl} salieron ampliadas, {cEur(agg.exceso)} por encima de lo pedido</div></div>
            <div className="fu-d-k"><div className="fu-d-kl">Pedido sin límite</div><div className="fu-d-kn mono">{cEur(agg.reqSinLimite)}</div><div className="fu-d-kd">{agg.nSinLimite} rechazadas o sin veredicto, nunca tuvieron límite</div></div>
          </div>
        </div>

        <div className="fu-dash-row2">
          <div className="fu-d-box">
            <div className="fu-d-bt">Límite sobre facturación <em>· dónde queda cada empresa contra su tamaño</em></div>
            <div className="fu-bands">
              {window.RATIO_BANDS.map(bd => {
                const g = agg.bands[bd.id];
                return (
                  <div key={bd.id} className="fu-band">
                    <div className="fu-band-h"><i style={{background: bd.color}}/>{bd.label}<b className="mono">{g.n}</b></div>
                    <div className="fu-band-bar"><div style={{width: (g.n / Math.max(1, agg.enBanda) * 100) + '%', background: bd.color}}/></div>
                    <div className="fu-band-d">{cEur(g.eur)} aprobados · {bd.nota}</div>
                  </div>
                );
              })}
            </div>
            <div className="fu-d-note">Bandas sobre <b>{agg.enBanda} empresas</b>: las que traen cifra de ventas ({agg.conVentas} de {tot.n}) y además tienen límite pedido o aprobado. Quedan fuera {tot.n - agg.conVentas} sin ventas en el fichero y {agg.sinCifra} con ventas pero sin ninguna cifra de límite.</div>
          </div>

          <div className="fu-d-box">
            <div className="fu-d-bt">Operativas aprobadas <em>· techo por operativa, <b className="fu-warnlab">no acumulable</b></em></div>
            <table className="fu-op-table">
              <thead><tr><th>Operativa</th><th className="num">Empresas</th><th className="num">Aprobado</th><th className="num">% ventas</th><th className="num">% pedido</th><th className="num">Roadmap</th></tr></thead>
              <tbody>
                {agg.ops.map(o => (
                  <tr key={o.id}>
                    <td>{OPERATIVA_LAB[o.id]}</td>
                    <td className="num mono">{o.n}</td>
                    <td className="num mono">{cEur(o.eur)}</td>
                    <td className="num mono">{cPct(o.pctMed, 1)}</td>
                    <td className="num mono">{cPct(o.pctReqMed, 0)}</td>
                    <td className="num">{o.fix ? <span className={'fu-rd r-' + o.fix.estado}>{o.fix.estado === 'vivo' ? o.fix.eta : o.fix.estado === 'estudio' ? 'sin fecha' : 'no entra'}</span> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="fu-d-note">El sublímite es el techo que fijó el comité <b>si la operación va por esa operativa</b>, no un tramo de la línea. La columna no se suma: los 218,6M€ que darían estas cinco filas no existen, el aprobado real es el de la tarjeta de arriba. Cuando un techo está a cero, esa operativa se le denegó: ese es el cruce que ordena las campañas de producto.</div>
          </div>

          <div className="fu-d-box">
            <div className="fu-d-bt">Score de encaje <em>· cruzado por NIF con el dataset de scoring</em></div>
            <table className="fu-op-table">
              <thead><tr><th>Banda</th><th className="num">Empresas</th><th className="num">Aprobado</th><th className="num">% ventas</th></tr></thead>
              <tbody>
                {agg.enc.bands.map(b => (
                  <tr key={b.id}>
                    <td><span className="fu-dot" style={{background: b.color}}/>{b.label} <em className="fu-bandid">{b.id}</em></td>
                    <td className="num mono">{b.n}</td>
                    <td className="num mono">{cEur(b.eur)}</td>
                    <td className="num mono">{cPct(b.pctMed, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="fu-d-note">Solo 2 de las {tot.n} están en el dataset de 300 con scoring corrido, así que el encaje se <b>deriva del expediente</b>: que riesgos aprobara y cuánto de lo pedido, el peso del límite sobre ventas contra la banda útil, cuántas operativas le abrió el comité y el tamaño del límite. Es un score distinto del de prospección y mejor informado, porque el comité ya se pronunció. Prioriza la cola junto al importe y la frescura.</div>
          </div>

          <div className="fu-d-box">
            <div className="fu-d-bt">Tipo de cartera <em>· clasificación de ventas</em></div>
            {agg.cartera.clasificadas ? (
              <table className="fu-op-table">
                <thead><tr><th>Nivel 1</th><th className="num">Empresas</th><th className="num">Aprobado</th><th className="num">% ventas</th></tr></thead>
                <tbody>
                  {agg.cartera.n1.map(x => (
                    <tr key={x.id}>
                      <td>{x.label}</td><td className="num mono">{x.n}</td>
                      <td className="num mono">{cEur(x.eur)}</td>
                      <td className="num mono">{cPct(x.pctMed, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="fu-d-empty">
                <b>Sin clasificar todavía</b>
                <span>Ni el fichero de riesgos ni el export de HubSpot traen origen de colateral. Se clasifica en la ficha de cada empresa, nivel 1 y nivel 2, y este corte se va llenando. {agg.cartera.total} de {tot.n} clasificadas.</span>
              </div>
            )}
            <div className="fu-d-note">El anticipable de nivel 2 es el mismo que usa la calculadora de colateral del discovery, para que la estimación de una pestaña valga en la otra.</div>
          </div>

          <div className="fu-d-box">
            <div className="fu-d-bt">Por tier <em>· dónde está el dinero recuperable</em></div>
            <table className="fu-op-table">
              <thead><tr><th>Tier</th><th className="num">Empresas</th><th className="num">Sin usar</th><th className="num">% ventas</th></tr></thead>
              <tbody>
                {agg.tiers.map(t => (
                  <tr key={t.id} className={t.id === 'big' || t.id === 'midmkt' ? 'foco' : ''}>
                    <td>{TIER_LAB[t.id] || 'Sin ventas'}</td>
                    <td className="num mono">{t.n}</td>
                    <td className="num mono">{cEur(t.sinUsar)}</td>
                    <td className="num mono">{cPct(t.pctMed, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="fu-d-note">Los dos tiers de foco concentran {cPct(agg.focoShare, 0)} del límite aprobado sin usar.</div>
          </div>
        </div>
      </section>

      <div className="fu-camps">
        <div className="fu-camps-l">Campañas sobre la cartera</div>
        <div className="fu-camps-row">
          <button className={`fu-camp ${!camp ? 'on' : ''}`} onClick={() => { setCamp(null); setSel(null); }}>
            <b>Toda la cartera</b><em>{all.length} empresas</em>
          </button>
          {window.CONTACT_CAMPAIGNS.map(c => {
            const m = all.filter(c.match);
            const eur = window.campEur(c, all);
            return (
              <button key={c.id} className={`fu-camp ${camp === c.id ? 'on' : ''}`} disabled={!m.length}
                onClick={() => { setCamp(camp === c.id ? null : c.id); setSel(null); setEstado('all'); }}>
                <span className="fu-trig">{c.trigger}</span>
                <b>{c.label}</b>
                <em>{m.length} empresas · {cEur(eur)} <span className="fu-camp-b">{window.CAMP_BASE_LABEL[c.base]}</span></em>
              </button>
            );
          })}
        </div>
        {campaign && <div className="fu-gancho"><span>Gancho</span>“{campaign.gancho}”</div>}
        {!all.some(c => window.contactEstado(c) === 'precio') && (
          <div className="fu-warnbox">
            <b>El precio no está en ningún fichero.</b> CONTROL RIESGOS solo usa cinco motivos de rechazo —viabilidad dudosa, operativa no viable, no califica, blocklist y experiencia negativa— y el export de HubSpot no trae columna de motivo de pérdida.
            Por eso la campaña de precio sale vacía: hay que marcarlo a mano en la ficha, con el botón <b>«Se cayó por precio»</b>, hasta que el CRM tenga el campo.
          </div>
        )}
      </div>

      <div className="fu-body">
        <div className="fu-list">
          <div className="fu-filters">
            <div className="fu-fg">
              <button className={tier === 'all' ? 'on' : ''} onClick={() => setTier('all')}>Todos</button>
              {['big','midmkt','mid','small'].map(k => (
                <button key={k} className={tier === k ? 'on' : ''} onClick={() => setTier(k)}>{TIER_LAB[k]}</button>
              ))}
            </div>
            <div className="fu-fg">
              {[['all','Encaje: todo'],['AAA','AAA'],['A','A'],['B','B'],['C','C'],['sin','Sin score']].map(([k, l]) => (
                <button key={k} className={enc === k ? 'on' : ''} onClick={() => setEnc(k)}>{l}</button>
              ))}
            </div>
            <div className="fu-fg">
              {[['all','Deal: todos'],['abierto','Abierto'],['churn','Churn'],['lost','Lost'],['rechazado','Rechazado'],['ninguno','Sin deal']].map(([k, l]) => (
                <button key={k} className={deal === k ? 'on' : ''} onClick={() => setDeal(k)}>{l}</button>
              ))}
            </div>
            <div className="fu-fg">
              <button className={estado === 'all' ? 'on' : ''} onClick={() => setEstado('all')}>Todo</button>
              {est.map(e => (
                <button key={e.id} className={estado === e.id ? 'on' : ''} onClick={() => setEstado(e.id)} title={e.desc}>
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fu-legend2">
            <span><i className="fu-m-v"/>% sobre ventas del cliente</span>
            <span><i className="fu-m-p"/>% sobre el importe que pidió</span>
            <span className="fu-legend2-n">{agg.dealMix} · cruzado con HubSpot por nombre normalizado</span>
          </div>
          <div className="fu-scroll">
            <table className="fu-table">
              <thead><tr>
                <th>Empresa</th><th>Encaje</th><th>Resolución</th><th className="num">Pedido</th>
                <th className="num">Aprobado</th>
                <th className="num">Wallet</th><th className="num">Ciego</th><th>Otras operativas</th>
                <th>Estado del deal</th><th>Acción</th>
              </tr></thead>
              <tbody>
                {queue.slice(0, 120).map(c => {
                  const e = estOf(c);
                  const ac = window.contactAccion(c);
                  const lg = log[c.nif];
                  const ratio = c.req && c.ap != null ? c.ap / c.req : null;
                  const subs = c.s ? Object.keys(c.s) : [];
                  return (
                    <tr key={c.nif} className={`${cur && cur.nif === c.nif ? 'on' : ''} ${lg ? 'done' : ''}`}
                      onClick={() => setSel(c.nif)}>
                      <td className="fu-emp">
                        <b>{c.e}</b>
                        <em>{c.tier ? TIER_LAB[c.tier] : 'sin ventas'} · {c.v ? cEur(c.v) : '—'} · {c.d || 'sin fecha'}</em>
                      </td>
                      <td className="fu-encc">{(() => {
                        const x = window.contactEncaje(c);
                        if (!x) return <span className="fu-none">—</span>;
                        const b = window.encBand(x.enc);
                        return <span className={'fu-encchip f-' + x.fuente} style={{'--c': b.color}}
                          title={b.label + ' · ' + (x.fuente === 'scoring' ? 'score de prospección' : 'derivado del expediente: ' + (x.cob != null ? 'cubrió ' + cPct(x.cob, 0) + ' de lo pedido, ' : '') + x.nOps + ' operativas abiertas')}>
                          <b className="mono">{Math.round(x.enc)}</b><em>{b.id}</em>
                        </span>;
                      })()}</td>
                      <td className="fu-mot">
                        <span className="fu-dot" style={{background: e.color}}/>
                        <span>{c.res === 'APPROVED' ? 'Aprobado' : c.res === 'REJECTED' ? ((window.REJECT_TAXONOMY[c.mot] || {}).label || 'Rechazado') : c.res === 'MORE INFO' ? 'Más información' : c.res === 'DOES NOT QUALIFY' ? 'No califica' : c.res === 'PENDING' ? 'Pendiente' : 'Sin dato'}</span>
                      </td>
                      <td className="num"><Money eur={c.req} ventas={c.v} base/></td>
                      <td className="num">
                        {c.ap != null
                          ? <Money eur={c.ap} ventas={c.v} pedido={c.req}/>
                          : <span className="fu-nores">sin resolver</span>}
                      </td>
                      {['wallet', 'ciego'].map(k => (
                        <td key={k} className="num">
                          <Money eur={c.s && c.s[k] > 0 ? c.s[k] : null} ventas={c.v} pedido={c.req}/>
                        </td>
                      ))}
                      <td className="fu-subs">
                        {(() => {
                          const otras = subs.filter(s => s !== 'wallet' && s !== 'ciego');
                          return otras.length
                            ? otras.map(s => (
                                <span key={s} className="fu-opchip" title={OPERATIVA_LAB[s]}>
                                  {OPERATIVA_LAB[s]}
                                  <b className="mono">{cEur(c.s[s])}</b>
                                  <em className="fu-m-v mono">{c.v ? cPct(c.s[s] / c.v, 1) : '—'}</em>
                                  <em className="fu-m-p mono">{c.req ? cPct(c.s[s] / c.req, 0) : '—'}</em>
                                </span>
                              ))
                            : <span className="fu-none">ninguna</span>;
                        })()}
                      </td>
                      <td className="fu-deal">{(() => {
                        const ds = window.HS_DEAL_STATE(c.e, c.vivo);
                        if (ds.id === 'ninguno') return <span className="fu-none">—</span>;
                        return <span className={'fu-dealchip s-' + ds.id} style={{'--c': ds.color}} title={ds.detalle || ''}>{ds.label}</span>;
                      })()}</td>
                      <td className="fu-ac"><b>{ac.verbo}</b>{lg && <span className="fu-tick">✓</span>}</td>
                    </tr>
                  );
                })}
                {!queue.length && <tr><td colSpan="11" className="fu-empty">Nada en la cola con estos filtros.</td></tr>}
              </tbody>
            </table>
          </div>
          {queue.length > 120 && <div className="fu-more">Mostrando las 120 primeras de {queue.length} por score de cola.</div>}
        </div>

        {cur && (() => {
          const e = estOf(cur);
          const ac = window.contactAccion(cur);
          const fix = window.contactOperativa(cur);
          const tax = cur.mot ? window.REJECT_TAXONOMY[cur.mot] : null;
          const ratio = cur.req && cur.ap != null ? cur.ap / cur.req : null;
          const subs = cur.s ? Object.keys(cur.s) : [];
          return (
            <div className="fu-card">
              <div className="fu-c-head" style={{'--c': e.color}}>
                <div>
                  <div className="fu-c-emp">{cur.e}{(() => {
                    const x = window.contactEncaje(cur);
                    if (!x) return null;
                    const b = window.encBand(x.enc);
                    return <span className="fu-encchip inline" style={{'--c': b.color}} title={b.label}><b className="mono">{Math.round(x.enc)}</b><em>{b.id}</em></span>;
                  })()}</div>
                  <div className="fu-c-meta">{cur.nif} · {cur.tier ? TIER_LAB[cur.tier] : 'sin ventas en el fichero'}{cur.v ? ' · ' + cEur(cur.v) : ''}{cur.an ? ' · analizó ' + cur.an : ''}</div>
                </div>
                <span className="fu-c-est" style={{background: e.color}}>{e.label}</span>
              </div>

              <div className="fu-act">
                <div className="fu-act-v">{ac.verbo}</div>
                <div className="fu-act-d">{ac.detalle}</div>
                {fix && <div className={`fu-road r-${fix.estado}`}>
                  <b>{fix.label}</b> · {fix.estado === 'vivo' ? 'comprometido ' + fix.eta : fix.estado === 'estudio' ? 'en estudio, sin fecha' : 'descartado'}
                  <em>{fix.nota}</em>
                </div>}
                {tax && !fix && <div className="fu-road r-pal"><b>{tax.palanca}</b><em>{tax.nota}</em></div>}
                <div className="fu-mark">
                  <span>Marcar motivo real</span>
                  <button className={(cart[cur.nif] || {}).motivo === 'precio' ? 'on' : ''}
                    onClick={() => setCart(window.carteraSet(cur.nif, { motivo: (cart[cur.nif] || {}).motivo === 'precio' ? null : 'precio' }))}>
                    Se cayó por precio
                  </button>
                  <em>Ni riesgos ni HubSpot registran el precio como motivo de pérdida. Si lo marcas aquí, entra en la campaña de precio.</em>
                </div>
              </div>

              <div className="fu-box">
                <div className="fu-box-t">Resolución de riesgos{cur.d ? ' · ' + cur.d : ''}</div>
                {cur.ap != null ? (
                  <>
                    <div className="fu-lim">
                      <div className="fu-lim-bar">
                        <div className="fu-lim-fill" style={{width: Math.min(100, (ratio || 0) * 100) + '%'}}/>
                      </div>
                      <div className="fu-lim-row">
                        <span>Pedía <b className="mono">{cEur(cur.req)}</b></span>
                        <span>Aprobado <b className="mono">{cEur(cur.ap)}</b></span>
                      </div>
                    </div>
                    <dl>
                      <div><dt>Cobertura</dt><dd className="mono">{cPct(ratio)}</dd></div>
                      {cur.req && cur.ap < cur.req && <div><dt>Sin cubrir</dt><dd className="mono">{cEur(cur.req - cur.ap)}</dd></div>}
                      {cur.max != null && <div><dt>Máximo de línea</dt><dd className="mono">{cEur(cur.max)}</dd></div>}
                      {(() => { const r = window.contactRatios(cur); if (!r.ventas) return null; const bd = window.ratioBand(r.aprobadoPct);
                        return <>
                          <div className="fu-hl"><dt>Pedido sobre ventas</dt><dd className="mono">{cPct(r.pedidoPct, 1)}</dd></div>
                          <div className="fu-hl"><dt>Aprobado sobre ventas</dt><dd className="mono"><span className="fu-ratio" style={{'--c': bd.color}}>{cPct(r.aprobadoPct, 1)}</span></dd></div>
                          <div><dt>Banda</dt><dd>{bd.label}</dd></div>
                        </>; })()}
                      <div><dt>Tipo de análisis</dt><dd>{cur.t || '—'}</dd></div>
                      <div><dt>Origen</dt><dd>{cur.p || '—'}</dd></div>
                    </dl>
                  </>
                ) : (
                  <div className="fu-nores-box">
                    <b>{cur.res === 'MORE INFO' ? 'Comité pidió más información' : 'Sin resolución'}</b>
                    <span>Pedía {cEur(cur.req)} y no hay límite aprobado. Falta expediente, no hay veredicto de riesgos.</span>
                  </div>
                )}
              </div>

              <div className="fu-box">
                <div className="fu-box-t">Operativas aprobadas <em className="fu-warnlab">techos alternativos, no se suman</em></div>
                {subs.length ? (
                  <table className="fu-sub-table">
                    <thead><tr><th>Operativa</th><th className="num">Aprobado</th><th className="num">% ventas</th><th className="num">% pedido</th></tr></thead>
                    <tbody>
                      {window.contactRatios(cur).subs.sort((a, b) => b.eur - a.eur).map(s => (
                        <tr key={s.id}>
                          <td>{OPERATIVA_LAB[s.id]}</td>
                          <td className="num mono">{cEur(s.eur)}</td>
                          <td className="num mono">{s.pct != null ? cPct(s.pct, 1) : <span className="fu-none">—</span>}</td>
                          <td className="num mono">{cur.req ? cPct(s.eur / cur.req, 0) : <span className="fu-none">—</span>}</td>
                        </tr>
                      ))}
                      {(() => { const r = window.contactRatios(cur); return r.subMax != null ? (
                        <tr className="fu-sub-max">
                          <td>Techo más alto</td>
                          <td className="num mono">{cEur(r.subMax)}</td>
                          <td className="num mono">{r.subMaxPct != null ? cPct(r.subMaxPct, 1) : '—'}</td>
                          <td className="num mono">{cur.req ? cPct(r.subMax / cur.req, 0) : '—'}</td>
                        </tr>
                      ) : null; })()}
                    </tbody>
                  </table>
                ) : <div className="fu-hint">Ninguna operativa con sublímite. {cur.res === 'REJECTED' ? 'El rechazo dejó todo a cero.' : 'Solo línea estándar.'}</div>}
                {subs.length > 1 && <div className="fu-hint">Cada cifra es el techo si la operación va por esa operativa. La línea aprobada es {cEur(cur.ap)}: el cliente no puede usar los {subs.length} techos a la vez.</div>}
              </div>

              <div className="fu-box">
                <div className="fu-box-t">Tipo de cartera <em>· encaje de producto</em></div>
                {(() => {
                  const cl = cart[cur.nif] || {};
                  const n2 = window.CARTERA_N2.find(x => x.id === cl.n2);
                  const dias = cl.dias || window.CARTERA_DIAS_DEFECTO;
                  const col = window.carteraColateral(cur.v, cl.n2, dias);
                  return (
                    <>
                      <div className="fu-cl-lab">Nivel 1 · origen del crédito</div>
                      <div className="fu-cl">
                        {window.CARTERA_N1.map(o => (
                          <button key={o.id} className={cl.n1 === o.id ? 'on' : ''} title={o.desc}
                            onClick={() => setCart(window.carteraSet(cur.nif, { n1: o.id }))}>{o.label}</button>
                        ))}
                      </div>
                      <div className="fu-cl-lab">Nivel 2 · quién debe</div>
                      <div className="fu-cl">
                        {window.CARTERA_N2.filter(o => !cl.n1 || o.n1.includes(cl.n1)).map(o => (
                          <button key={o.id} className={cl.n2 === o.id ? 'on' : ''} title={'Anticipable ' + o.anticipable + '%'}
                            onClick={() => setCart(window.carteraSet(cur.nif, { n2: o.id }))}>{o.label}</button>
                        ))}
                      </div>
                      {n2 ? (
                        <>
                          <div className="fu-cl-lab">Días de cartera <em className="fu-warnlab">supuesto, no hay PMC en los ficheros</em></div>
                          <div className="fu-cl">
                            {[30, 60, 90, 120, 180].map(x => (
                              <button key={x} className={dias === x ? 'on' : ''}
                                onClick={() => setCart(window.carteraSet(cur.nif, { dias: x }))}>{x} d</button>
                            ))}
                          </div>
                          <dl>
                            <div><dt>Anticipable de nivel 2</dt><dd className="mono">{n2.anticipable}%</dd></div>
                            {col && <div><dt>Colateral vivo a {dias} días</dt><dd className="mono">{cEur(col.vivo)}</dd></div>}
                            {col && <div><dt>Anticipable estimado</dt><dd className="mono">{cEur(col.eur)}</dd></div>}
                            {col && cur.req && <div className={cur.req > col.eur * 1.1 ? 'fu-hl' : ''}><dt>Pedía</dt><dd className="mono">{cPct(cur.req / col.eur, 0)} de ese anticipable</dd></div>}
                          </dl>
                          {col && <div className="fu-hint">Ventas {cEur(cur.v)} × {dias}/365 = {cEur(col.vivo)} de cartera viva, × {n2.anticipable}% de nivel 2 = {cEur(col.eur)}. Los días son el supuesto: a 30 días saldría {cEur(cur.v * (30/365) * n2.anticipable/100)} y a 180 {cEur(cur.v * (180/365) * n2.anticipable/100)}.</div>}
                        </>
                      ) : <div className="fu-hint">Sin clasificar. El fichero de riesgos no trae origen de colateral: lo pone ventas al revisar la ficha y se guarda en este navegador hasta que el CRM tenga el campo.</div>}
                    </>
                  );
                })()}
              </div>

              <div className="fu-box">
                <div className="fu-box-t">Disposición y datos</div>
                <dl>
                  <div><dt>Riesgo vivo</dt><dd className="mono">{cur.vivo != null ? cEur(cur.vivo) : 'sin disponer'}</dd></div>
                  <div><dt>Último dato financiero</dt><dd>{cur.ud || '—'}</dd></div>
                  {cur.enc && <div><dt>Encargado en riesgos</dt><dd>{cur.enc}</dd></div>}
                </dl>
                {cur.nr && <div className="fu-note-inline"><span>Nota de riesgos</span>{cur.nr}</div>}
              </div>

              <div className="fu-outcomes">
                {[['reabierto','Deal reabierto'],['interesado','Interesado'],['espera','Espera producto'],['no','No, cerrar'],['nocontesta','No contesta']].map(([k, l]) => (
                  <button key={k} className={log[cur.nif] && log[cur.nif].outcome === k ? 'on' : ''}
                    onClick={() => mark(cur.nif, k)}>{l}</button>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      <div className="fu-foot">
        <div className="fu-foot-bars">
          {est.map(e => {
            const n = tot.byEst[e.id].length;
            return (
              <div key={e.id} className="fu-fb">
                <div className="fu-fb-h"><i style={{background: e.color}}/>{e.label}<b className="mono">{n}</b></div>
                <div className="fu-fb-bar"><div style={{width: (n / tot.n * 100) + '%', background: e.color}}/></div>
                <div className="fu-fb-d">{e.desc}</div>
              </div>
            );
          })}
        </div>
        <div className="fu-foot-n">
          El hallazgo que ordena la cola: <b>{tot.byEst.activacion.length} empresas</b> tienen límite aprobado por riesgos, sin deal ganado y sin riesgo vivo: {cEur(tot.aprobadoSinUsar)} aprobados que nunca llegaron a firma. Otras <b>{tot.byEst.ganado.length}</b> sí firmaron ({cEur(tot.ganadoSinUsar)}) y no han subido la primera factura, que es un problema de activación y no de venta.
          Otras <b>{tot.byEst.expediente.length}</b> pidieron {cEur(tot.pedidoSinRes)} y se quedaron sin veredicto porque faltó documentación, y <b>{tot.byEst.producto.length}</b> se cayeron por operativa que no damos, {cEur(tot.bloqueado)} que dependen del roadmap.
          En las {agg.nAprob} operaciones aprobadas con las dos cifras, riesgos cubrió el <b>{cPct(agg.cobAprob, 0)}</b> de lo pedido: {agg.nRecort} salieron recortadas con {cEur(agg.hueco)} sin cubrir y {agg.nAmpl} ampliadas por encima de lo que pedían.
          El estado se deriva de la resolución cruzada con <b>FIX_ROADMAP</b>: al mover una fecha de producto, la cola se reordena sola.
          Fuente: {window.CONTACTS_META.fuente}.
        </div>
      </div>
    </div>
  );
};
