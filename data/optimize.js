// ============= FUNNEL OPTIMIZATION =============
// Cruces que buscan una sola cosa: qué mueve la conversión. Tres fuentes, cada
// una con lo que sí sabe — HubSpot para conversión y tiempo, CONTROL RIESGOS
// para operativas y límites, y la taxonomía de rechazo para los motivos.
window.OPT_META = {
  fuentes: 'HubSpot (conversión y tiempo) · CONTROL RIESGOS (operativas y límites) · taxonomía de rechazo',
  aviso: 'La conversión por operativa se mide sobre las empresas del fichero de riesgos cruzadas con HubSpot por nombre: 53% de cobertura.',
};

// Time to money: días entre la creación del deal y su firma, en percentiles.
window.OPT_T2M = {"total":{"n":589,"p25":8,"med":23,"p75":59,"p90":146},"canal:Contacts":{"n":5,"p25":33,"med":105,"p75":142,"p90":193},"seg:mid":{"n":105,"p25":10,"med":34,"p75":62,"p90":92},"seg:big":{"n":81,"p25":8,"med":26,"p75":64,"p90":132},"seg:midmkt":{"n":66,"p25":7,"med":14,"p75":29,"p90":142},"canal:Referral":{"n":85,"p25":3,"med":17,"p75":44,"p90":138},"seg:small":{"n":75,"p25":20,"med":43,"p75":83,"p90":155},"canal:Inbound":{"n":18,"p25":21,"med":48,"p75":56,"p90":73},"canal:Outbound":{"n":16,"p25":8,"med":16,"p75":49,"p90":64},"canal:Partners":{"n":383,"p25":9,"med":21,"p75":48,"p90":102}};
// Conversión por canal y segmento.
window.OPT_CS = {"Contacts|mid":{"d":13,"w":1,"l":1,"eur":50000},"Contacts|corp":{"d":4,"w":0,"l":0,"eur":0},"Contacts|midmkt":{"d":67,"w":2,"l":15,"eur":234999},"Contacts|small":{"d":3,"w":0,"l":2,"eur":0},"Contacts|big":{"d":15,"w":2,"l":5,"eur":157000},"Referral|corp":{"d":1,"w":0,"l":0,"eur":0},"Referral|midmkt":{"d":29,"w":16,"l":6,"eur":20571426.27},"Referral|mid":{"d":31,"w":7,"l":16,"eur":569000},"Referral|small":{"d":31,"w":7,"l":21,"eur":550000},"Referral|big":{"d":16,"w":10,"l":5,"eur":3949000},"Referral|sin":{"d":78,"w":47,"l":28,"eur":18966731.39},"Inbound|small":{"d":203,"w":9,"l":193,"eur":365000},"Inbound|mid":{"d":45,"w":3,"l":39,"eur":135000},"Inbound|sin":{"d":29,"w":5,"l":22,"eur":1783395.39},"Inbound|midmkt":{"d":6,"w":0,"l":4,"eur":0},"Inbound|big":{"d":9,"w":1,"l":6,"eur":245000},"Outbound|big":{"d":84,"w":2,"l":30,"eur":226380},"Outbound|midmkt":{"d":63,"w":4,"l":31,"eur":770000},"Outbound|mid":{"d":66,"w":6,"l":48,"eur":322042.33},"Outbound|small":{"d":69,"w":1,"l":61,"eur":50000},"Outbound|sin":{"d":633,"w":3,"l":585,"eur":83766.11},"Partners|mid":{"d":528,"w":89,"l":384,"eur":8948357.049999999},"Partners|small":{"d":848,"w":57,"l":773,"eur":5357592.5},"Partners|big":{"d":229,"w":67,"l":104,"eur":10997651},"Partners|midmkt":{"d":156,"w":44,"l":61,"eur":20481413.990000002},"Partners|sin":{"d":576,"w":130,"l":424,"eur":17006102.17},"Partners|corp":{"d":4,"w":0,"l":4,"eur":0},"—|sin":{"d":865,"w":85,"l":684,"eur":22060304.299999997},"—|small":{"d":10,"w":2,"l":8,"eur":33500},"—|midmkt":{"d":1,"w":0,"l":0,"eur":0}};

window.OPT_CANALES = [
  { id:'Partners', label:'Partners' }, { id:'Outbound', label:'Outbound' },
  { id:'Inbound', label:'Inbound' }, { id:'Referral', label:'Referral' },
  { id:'Contacts', label:'Contactos' },
];
window.OPT_SEGS = [
  { id:'midmkt', label:'Mid Market', color:'#8E6E2A' },
  { id:'big', label:'Big Pymes', color:'#2E7D5B' },
  { id:'mid', label:'Mid Pymes', color:'#4054A8' },
  { id:'small', label:'Small Pymes', color:'#767D8C' },
  { id:'corp', label:'Corporate', color:'#6E3B8E' },
];

// Tramos de cobertura del sublímite sobre lo pedido. La pregunta de negocio:
// ¿convierte igual un ciego al 90% de lo pedido que uno al 60%?
window.OPT_TRAMOS = [
  { id:'t100', label:'100% o más', min:1,    max:Infinity },
  { id:'t75',  label:'75 a 100%',  min:0.75, max:1 },
  { id:'t50',  label:'50 a 75%',   min:0.50, max:0.75 },
  { id:'t25',  label:'25 a 50%',   min:0.25, max:0.50 },
  { id:'t0',   label:'menos del 25%', min:0, max:0.25 },
  { id:'cero', label:'denegada',   min:-1,   max:0 },
];

window.OPT_OPERATIVAS = [
  { id:'ciego',  label:'Operativa ciega' },
  { id:'wallet', label:'Wallet' },
  { id:'gc',     label:'Gestión de cobro' },
  { id:'futuro', label:'Cesión de futuros' },
];

// ¿Acabó siendo cliente? Riesgo vivo o deal ganado en HubSpot.
window.optEsCliente = function (c) {
  if (c.vivo > 0) return true;
  if (window.HS_WON && window.HS_NORM && window.HS_WON[window.HS_NORM(c.e)]) return true;
  return false;
};

// ¿Está cruzada con HubSpot? Si no, no cuenta para conversión: no sabemos su
// desenlace comercial.
window.optCruzada = function (c) {
  if (!window.HS_STATE || !window.HS_NORM) return false;
  return !!window.HS_STATE[window.HS_NORM(c.e)];
};

window.optTramo = function (eur, req) {
  if (req == null || !req) return null;
  if (eur == null) return null;
  const r = eur / req;
  if (eur === 0) return window.OPT_TRAMOS.find(t => t.id === 'cero');
  return window.OPT_TRAMOS.find(t => r >= t.min && r < t.max) || window.OPT_TRAMOS[0];
};

// Conversión por operativa y tramo de cobertura. Solo empresas cruzadas.
window.optPorOperativa = function (opId, tier) {
  // Denominador: empresas que riesgos llegó a evaluar, es decir, con algún
  // sublímite en el fichero. Las que nunca pasaron por riesgos no dicen nada
  // de la aprobación de una operativa.
  const todas = window.CONTACTS.filter(c => window.optCruzada(c) && c.req && (!tier || c.tier === tier));
  const base = todas.filter(c => c.s && Object.keys(c.s).some(k => c.s[k] !== undefined));
  const out = window.OPT_TRAMOS.map(t => ({ ...t, n:0, cli:0, eurPedido:0, eurAprobado:0 }));
  let sinDato = 0, sinDatoEur = 0;
  base.forEach(c => {
    const eur = c.s ? c.s[opId] : undefined;
    // Evaluada pero sin esta operativa abierta: es una denegación, no un hueco.
    if (eur === undefined) { sinDato++; sinDatoEur += (+c.req || 0); return; }
    const t = window.optTramo(eur, c.req);
    if (!t) return;
    const row = out.find(x => x.id === t.id);
    row.n++; if (window.optEsCliente(c)) row.cli++;
    row.eurPedido += c.req; row.eurAprobado += eur;
  });
  out.forEach(r => { r.wr = r.n ? r.cli / r.n : null; });
  // Tiempos por tramo: el recorrido modelado del tier y la operativa, estirado
  // cuando la cobertura es baja (se renegocia el límite antes de firmar).
  const t2 = window.t2mSerie ? window.t2mSerie({ segs: tier ? [tier] : ['midmkt','big','mid','small'], oper: opId }) : null;
  const fase = (id) => t2 ? (t2.ult.fases.find(f => f.id === id) || {}).dias || 0 : 0;
  const estira = { t100: 0.85, t75: 1, t50: 1.15, t25: 1.35, t0: 1.6, cero: null };
  out.forEach(r => {
    const e = estira[r.id];
    if (e == null) { r.tNego = null; r.tAct = null; r.tTotal = null; return; }
    r.tNego = fase('nego') * e;
    r.tAct = fase('act') * (e > 1 ? 1 + (e - 1) / 2 : e);
    r.tTotal = (fase('data') + fase('risk')) * e + r.tNego + r.tAct;
  });
  // No tener la operativa en el fichero de riesgos es no habérsela abierto: va
  // con las denegadas, no fuera del cálculo. Si no, la aprobación sale 100%.
  const cero = out.find(r => r.id === 'cero');
  if (cero) { cero.n += sinDato; cero.eurPedido += sinDatoEur; cero.label = 'denegada o no abierta'; cero.wr = cero.n ? cero.cli / cero.n : 0; }
  const aprob = out.filter(r => r.id !== 'cero').reduce((a, r) => a + r.n, 0);
  const cliAprob = out.filter(r => r.id !== 'cero').reduce((a, r) => a + r.cli, 0);
  const eurAprob = out.filter(r => r.id !== 'cero').reduce((a, r) => a + r.eurPedido, 0);
  return { rows: out.filter(r => r.n > 0), sinDato, base: base.length, noEvaluadas: todas.length - base.length,
    // Tasa de aprobación: empresas con algún límite abierto en esa operativa
    // sobre TODAS las empresas evaluadas.
    aprobadas: aprob, denegadas: cero ? cero.n : 0,
    tasaAprob: base.length ? aprob / base.length : null,
    cliAprob, eurAprob, wrAprob: aprob ? cliAprob / aprob : null,
    tNego: out.filter(r => r.tNego != null && r.n).reduce((a, r, i, xs) => a + r.tNego * r.n, 0) / (aprob || 1),
    tAct: out.filter(r => r.tAct != null && r.n).reduce((a, r) => a + r.tAct * r.n, 0) / (aprob || 1),
    tTotal: out.filter(r => r.tTotal != null && r.n).reduce((a, r) => a + r.tTotal * r.n, 0) / (aprob || 1) };
};

// Conversión por cualquier dimensión de la cartera de riesgos.
window.optPorDim = function (dim) {
  const base = window.CONTACTS.filter(c => window.optCruzada(c));
  const g = {};
  base.forEach(c => {
    let k = null, lab = null;
    if (dim === 'tier') { k = c.tier || 'sin'; lab = (window.MKT_TIERS.find(t => t.id === k) || {}).label || 'Sin tier'; }
    else if (dim === 'cartera') {
      const cl = (window.carteraGet() || {})[c.nif];
      k = cl && cl.n1 ? cl.n1 : 'sin';
      lab = k === 'sin' ? 'Sin clasificar' : (window.CARTERA_N1.find(x => x.id === k) || {}).label;
    }
    else if (dim === 'motivo') { const e = window.contactEstado(c); k = e; lab = (window.CONTACT_ESTADOS.find(x => x.id === e) || {}).label || e; }
    else if (dim === 'banda') { const r = window.contactRatios(c); const b = window.ratioBand(r.aprobadoPct != null ? r.aprobadoPct : r.pedidoPct); k = b.id; lab = b.label; }
    if (k == null) return;
    g[k] = g[k] || { id:k, label:lab, n:0, cli:0, eur:0 };
    g[k].n++; if (window.optEsCliente(c)) g[k].cli++;
    g[k].eur += c.ap || 0;
  });
  return Object.values(g).map(x => ({ ...x, wr: x.n ? x.cli / x.n : null })).sort((a, b) => b.n - a.n);
};

// Motivos de pérdida con su peso y el límite que se quedó sin firmar.
window.optPerdidas = function () {
  const base = window.CONTACTS.filter(c => window.optCruzada(c) && !window.optEsCliente(c));
  const g = {};
  base.forEach(c => {
    const e = window.contactEstado(c);
    const meta = window.CONTACT_ESTADOS.find(x => x.id === e) || { label:e, color:'#C9CDD8' };
    g[e] = g[e] || { id:e, label:meta.label, color:meta.color, n:0, eur:0, req:0 };
    g[e].n++; g[e].eur += c.ap || 0; g[e].req += c.req || 0;
  });
  const tot = base.length;
  return Object.values(g).map(x => ({ ...x, peso: tot ? x.n / tot : null })).sort((a, b) => b.n - a.n);
};

window.optT2M = function (k) { return window.OPT_T2M[k] || null; };

// ============= LO QUE FALTA EN EL CRM =============
// Tres campos que hoy no existen y que cada uno desbloquea un análisis concreto.
// Van declarados en pantalla para que la ausencia sea una decisión visible y no
// una cifra silenciosamente imputada.
window.OPT_CRM_GAPS = [
  { id:'lost', campo:'Razón de pérdida', donde:'HubSpot · propiedad del deal',
    hoy:'El export no trae ninguna columna de motivo. Los 3.560 perdidos y rechazados no dicen por qué ni en qué etapa.',
    desbloquea:'Mortalidad por etapa y motivo real, en vez de derivarlo del expediente de riesgos. El corte de precio hoy sale vacío porque nadie lo registra.',
    hoyCubre:'Se suple con la taxonomía de CONTROL RIESGOS, que solo cubre el 53% cruzado.' },
  { id:'disp', campo:'Fecha de primera disposición', donde:'Core · alta de línea',
    hoy:'Se mide hasta la firma del deal, no hasta que el cliente usa el dinero.',
    desbloquea:'Time to money de verdad. Hoy la mediana de 23 días es time to signature; entre firma y primera factura hay un tramo que nadie ve.',
    hoyCubre:'Las 33 empresas ganadas sin riesgo vivo son la prueba de que ese tramo existe y se pierde gente.' },
  { id:'tae', campo:'TAE de la operación', donde:'HubSpot · propiedad del deal',
    hoy:'La hoja de outbound fija 25% en los cuatro segmentos, así que la TAE ponderada sale plana y el ranking no discrimina.',
    desbloquea:'Pricing real por AE y por canal, y la pregunta de si el partner cuesta margen o lo protege.',
    hoyCubre:'Se imputa con la TAE por segmento de la hoja, marcada como imputada en el ranking.' },
];
