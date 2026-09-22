// ============= CARTERA COMPARTIDA =============
// Qué parte de su cartera de clientes nos enseña el emisor y con qué calidad,
// comparada con las fuentes que permiten contrastarla. El fichero de riesgos
// no registra todavía qué documentación aportó cada empresa, así que la
// cobertura por fuente es un modelo estable por NIF sobre la población real.
window.CAR_DEMO = true;
window.CAR_META = {
  fuente: 'Modelo de ejemplo sobre CONTROL RIESGOS · falta el registro de documentación aportada por deal.',
};
// Fuentes con las que se contrasta la cartera que comparte el emisor.
window.CAR_FUENTES = [
  { id: 'compartida', label: 'Cartera compartida', color: '#4054A8',
    desc: 'Lo que el emisor nos entrega y la calculadora puede analizar.', share: 1 },
  { id: 'm347', label: '347 / SII', color: '#8E6E2A',
    desc: 'Operaciones declaradas a Hacienda: la foto más reciente de la cartera.', share: 0.88 },
  { id: 'informa', label: 'Informa deudores', color: '#2E7D5B',
    desc: 'Deudores con ficha en Informa, a cierre de balance de diciembre.', share: 0.74 },
  { id: 'mayor', label: 'Libro diario / mayor', color: '#C8853D',
    desc: 'Contabilidad completa: todo lo facturado y pendiente.', share: 0.52 },
];
// Campos que debería traer la cartera para poder analizarla.
window.CAR_CAMPOS = [
  { id: 'cif', label: 'CIF del deudor', peso: 0.30, base: 0.78 },
  { id: 'importe', label: 'Importe por factura', peso: 0.22, base: 0.86 },
  { id: 'venc', label: 'Vencimiento', peso: 0.20, base: 0.64 },
  { id: 'anti', label: 'Antigüedad de saldo', peso: 0.16, base: 0.41 },
  { id: 'cobro', label: 'Histórico de cobro', peso: 0.12, base: 0.27 },
];

window.carAnalisis = function (tier) {
  // Todo sale del listado por empresa: mismos emisores, mismos saldos y mismos
  // deudores que la tabla agregada y que la tabla de empresas.
  const H = window.rskHash;
  const T = {}; (window.CAR_TIERS || []).forEach(t => { T[t.id] = t; });
  const emp = window.carEmpresas({ tier });
  const comparten = emp.rows;
  const base = (window.CONTACTS || []).filter(c => window.optCruzada(c) && c.req && T[c.tier] && (!tier || c.tier === tier));
  const evald = base.filter(c => c.s && Object.keys(c.s).some(k => c.s[k] !== undefined));
  const carTotal = comparten.reduce((a, r) => a + r.eCalc, 0);
  const ventas = comparten.reduce((a, r) => a + r.fact, 0);

  const saldo = (r, id) => id === 'informa' ? r.eInforma : id === 'm347' ? r.e347
    : id === 'compartida' ? r.eCalc : Math.max(r.eInforma, r.e347) * 1.06;
  const deud = (r, id) => {
    const t = T[r.tier] || { f347: 1, calc: 0.6 };
    return id === 'informa' ? r.dInforma : id === 'm347' ? r.dInforma * t.f347
      : id === 'compartida' ? r.dInforma * Math.min(1, t.f347) * t.calc
      : r.dInforma * Math.max(1, t.f347) * 1.06;
  };
  const fuentes = window.CAR_FUENTES.map(f => {
    const con = comparten.filter(r => f.share >= 1 || H((r.nif || r.nombre || '') + f.id) < f.share);
    const eur = con.reduce((a, r) => a + saldo(r, f.id), 0);
    const carCon = con.reduce((a, r) => a + r.eCalc, 0);
    return { ...f, n: con.length, eur, carCon, cob: carCon ? eur / carCon : null,
      pctEmisores: comparten.length ? con.length / comparten.length : null,
      deudores: Math.round(con.reduce((a, r) => a + deud(r, f.id), 0)) };
  });
  const fMayor = fuentes.find(f => f.id === 'mayor');

  // Calidad de lo compartido: los emisores grandes entregan agregados.
  const umbral = (r, k) => k.base * (r.fact > 20000000 ? 0.7 : r.fact > 5000000 ? 0.9 : 1.08);
  const campos = window.CAR_CAMPOS.map(k => {
    const con = comparten.filter(r => H((r.nif || r.nombre || '') + k.id) < umbral(r, k));
    return { ...k, n: con.length, pct: comparten.length ? con.length / comparten.length : null,
      eur: con.reduce((a, r) => a + r.eCalc, 0) };
  });
  const calidad = comparten.map(r => window.CAR_CAMPOS.reduce((a, k) =>
    a + (H((r.nif || r.nombre || '') + k.id) < umbral(r, k) ? k.peso : 0), 0));
  const usados = new Set();
  const calTramos = [
    { id: 'alta', label: 'Analizable sin pedir nada más', min: 0.8, color: '#2E7D5B' },
    { id: 'media', label: 'Falta algún campo clave', min: 0.55, color: '#8E6E2A' },
    { id: 'baja', label: 'Solo sirve para una foto gruesa', min: 0.3, color: '#C8853D' },
    { id: 'nula', label: 'No permite analizar la cartera', min: 0, color: '#C8553D' },
  ].map(t => {
    const own = calidad.map((v, i) => ({ v, i })).filter(x => x.v >= t.min && !usados.has(x.i));
    own.forEach(x => usados.add(x.i));
    return { id: t.id, label: t.label, color: t.color, n: own.length,
      pct: comparten.length ? own.length / comparten.length : null,
      eur: own.reduce((a, x) => a + comparten[x.i].eCalc, 0) };
  });

  return { meta: window.CAR_META, n: base.length, ev: evald.length,
    comparten: comparten.length, pctComparte: base.length ? comparten.length / base.length : null,
    carTotal, ventas, sobreVentas: ventas ? carTotal / ventas : null,
    media: comparten.length ? carTotal / comparten.length : null,
    fuentes, campos, calTramos,
    hueco: fMayor.eur - fMayor.carCon, huecoN: fMayor.n, huecoCar: fMayor.carCon };
};


// Composición de la cartera compartida: medios de cobro, geografía y qué parte
// está ya cedida. Modelo por tier mientras no llegue el detalle por factura.
window.CAR_MIX = {
  midmkt: { transferencia: 0.52, confirming: 0.26, pagare: 0.13, tpv: 0.02, giro: 0.07, nacional: 0.71, eu: 0.26, cedido: 0.34 },
  big:    { transferencia: 0.58, confirming: 0.19, pagare: 0.12, tpv: 0.03, giro: 0.08, nacional: 0.80, eu: 0.17, cedido: 0.28 },
  mid:    { transferencia: 0.63, confirming: 0.11, pagare: 0.10, tpv: 0.06, giro: 0.10, nacional: 0.88, eu: 0.10, cedido: 0.19 },
};
// Saldo de deudores que ve Informa: de media el 15% de la facturación anual,
// que es el cierre de balance de diciembre.
window.CAR_INFORMA_PCT = 0.15;
// Tiers que se analizan aquí y su facturación media, la que fija dirección.
// f347: desviación del 347/SII sobre Informa, ±20% según crecimiento y
// estacionalidad. calc: la calculadora ve el 60% de lo que hay.
window.CAR_TIERS = [
  { id: 'midmkt', factMedia: 40000000, deudores: 165, f347: 1.20, calc: 0.60 },
  { id: 'big',    factMedia: 12000000, deudores: 88,  f347: 1.08, calc: 0.60 },
  { id: 'mid',    factMedia: 3200000,  deudores: 37,  f347: 0.80, calc: 0.60 },
];
window.CAR_COLS = [
  { id: 'transferencia', label: 'Transferencia' }, { id: 'confirming', label: 'Confirming' },
  { id: 'pagare', label: 'Pagaré' }, { id: 'tpv', label: 'TPV' }, { id: 'giro', label: 'Giro' },
  { id: 'nacional', label: 'Nacional' }, { id: 'eu', label: 'UE' }, { id: 'cedido', label: 'Cedido' },
];

// Una fila por tier: facturación, deudores por cada fuente y composición.
window.carPorTier = function (tier) {
  // El agregado se construye sumando el listado por empresa: una sola fuente
  // para el mix, los saldos y los totales, así las dos tablas cuadran.
  const emp = window.carEmpresas({});
  const H = window.rskHash;
  const base = (window.CONTACTS || []).filter(c => window.optCruzada(c) && c.req);
  const claves = ['transferencia','confirming','pagare','tpv','giro','nacional','eu','cedido'];
  const agg = (rows, t) => {
    const w = rows.reduce((a, r) => a + r.eCalc, 0) || 1;
    const mix = {};
    claves.forEach(k => { mix[k] = rows.reduce((a, r) => a + r.mix[k] * r.eCalc, 0) / w; });
    const s = (k) => rows.reduce((a, r) => a + r[k], 0);
    return { comp: rows.length, factComp: s('fact'), car: s('eCalc'),
      eInforma: s('eInforma'), e347: s('e347'), eCalc: s('eCalc'),
      dInforma: Math.round(s('dInforma')),
      d347: Math.round(rows.reduce((a, r) => a + r.dInforma * (T2[r.tier] ? T2[r.tier].f347 : 1), 0)),
      dCalc: Math.round(rows.reduce((a, r) => a + r.dInforma * Math.min(1, T2[r.tier] ? T2[r.tier].f347 : 1) * (T2[r.tier] ? T2[r.tier].calc : 0.6), 0)),
      mix };
  };
  const T2 = {}; window.CAR_TIERS.forEach(t => { T2[t.id] = t; });
  const tiers = window.CAR_TIERS.filter(t => !tier || t.id === tier).map(t => {
    const s = (window.OPT_SEGS || []).find(x => x.id === t.id) || { label: t.id };
    const rows = emp.rows.filter(r => r.tier === t.id);
    const n = base.filter(c => c.tier === t.id).length;
    return { id: t.id, label: s.label, color: s.color, n, factMedia: t.factMedia,
      fact: n * t.factMedia, calc: t.calc, f347: t.f347, ...agg(rows, t) };
  }).filter(t => t.n > 0);
  const rowsSel = emp.rows.filter(r => !tier || r.tier === tier);
  const sum = (k) => tiers.reduce((a, x) => a + x[k], 0);
  return { tiers, pctInforma: window.CAR_INFORMA_PCT,
    total: { label: 'Total', n: sum('n'), fact: sum('fact'),
      factMedia: sum('n') ? sum('fact') / sum('n') : null,
      ...agg(rowsSel) } };
};


// CNAE a nivel 1 (sección) con el patrón de cobro que le es propio: el TPV vive
// en comercio y hostelería, el confirming en industria y construcción, el
// pagaré en construcción e industria pesada. El modelo de negocio manda mucho
// más que el tamaño, así que el mix se construye sobre el sector.
window.CAR_SECTORES = [
  { id: 'C', label: 'C · Industria manufacturera', peso: 0.22,
    mix: { transferencia: 0.46, confirming: 0.30, pagare: 0.18, tpv: 0.00, giro: 0.06 }, nacional: 0.62, cedido: 0.34 },
  { id: 'G', label: 'G · Comercio', peso: 0.20,
    mix: { transferencia: 0.44, confirming: 0.14, pagare: 0.07, tpv: 0.28, giro: 0.07 }, nacional: 0.84, cedido: 0.22 },
  { id: 'F', label: 'F · Construcción', peso: 0.14,
    mix: { transferencia: 0.38, confirming: 0.34, pagare: 0.24, tpv: 0.00, giro: 0.04 }, nacional: 0.93, cedido: 0.41 },
  { id: 'H', label: 'H · Transporte y logística', peso: 0.10,
    mix: { transferencia: 0.62, confirming: 0.18, pagare: 0.06, tpv: 0.04, giro: 0.10 }, nacional: 0.71, cedido: 0.29 },
  { id: 'I', label: 'I · Hostelería', peso: 0.07,
    mix: { transferencia: 0.22, confirming: 0.04, pagare: 0.02, tpv: 0.64, giro: 0.08 }, nacional: 0.96, cedido: 0.08 },
  { id: 'J', label: 'J · Información y comunicaciones', peso: 0.09,
    mix: { transferencia: 0.68, confirming: 0.06, pagare: 0.02, tpv: 0.06, giro: 0.18 }, nacional: 0.58, cedido: 0.17 },
  { id: 'M', label: 'M · Servicios profesionales', peso: 0.10,
    mix: { transferencia: 0.72, confirming: 0.08, pagare: 0.04, tpv: 0.03, giro: 0.13 }, nacional: 0.74, cedido: 0.15 },
  { id: 'Q', label: 'Q · Sanidad y servicios sociales', peso: 0.05,
    mix: { transferencia: 0.52, confirming: 0.10, pagare: 0.03, tpv: 0.14, giro: 0.21 }, nacional: 0.97, cedido: 0.12 },
  { id: 'A', label: 'A · Agricultura y alimentación', peso: 0.03,
    mix: { transferencia: 0.41, confirming: 0.22, pagare: 0.27, tpv: 0.02, giro: 0.08 }, nacional: 0.55, cedido: 0.37 },
];
window.carSector = function (c) {
  const h = window.rskHash((c.nif || c.e || '') + 'cnae');
  let acc = 0;
  for (const s of window.CAR_SECTORES) { acc += s.peso; if (h < acc) return s; }
  return window.CAR_SECTORES[window.CAR_SECTORES.length - 1];
};

// Listado por empresa con las mismas columnas que el agregado. El mix de cada
// una sale del patrón de su sector, muy disperso: dos empresas del mismo tier
// con modelos de negocio distintos no se parecen en nada.
window.CAR_CED_TRAMOS = [
  { id: 'alto', label: 'Cedido más del 30%', min: 0.30, max: 2 },
  { id: 'medio', label: 'Cedido 10 a 30%', min: 0.10, max: 0.30 },
  { id: 'bajo', label: 'Cedido menos del 10%', min: 0, max: 0.10 },
];
// Estado del emisor: lo que dice el fichero de riesgos cruzado con el vivo.
// Misma taxonomía que usa Calificación: aprobado sin firmar no es churn.
window.CAR_ESTADOS = [
  { id: 'cliente', label: 'Cliente', color: '#2E7D5B' },
  { id: 'churn', label: 'Churn', color: '#C8553D' },
  { id: 'sinfirmar', label: 'Aprobado sin firmar', color: '#4054A8' },
  { id: 'resolucion', label: 'En resolución', color: '#8E6E2A' },
  { id: 'rechazado', label: 'Rechazado', color: '#767D8C' },
];
window.carEstado = function (c) {
  if (+c.vivo > 0) return 'cliente';
  // Churn es quien llegó a operar y ya no tiene riesgo vivo.
  if (c.p === 'RECURRENCY') return 'churn';
  if (c.res === 'APPROVED') return 'sinfirmar';
  if (c.res === 'REJECTED' || c.res === 'DOES NOT QUALIFY') return 'rechazado';
  return 'resolucion';
};

window.carEmpresas = function (f) {
  const o = f || {};
  const H = window.rskHash;
  const T = {}; window.CAR_TIERS.forEach(t => { T[t.id] = t; });
  const base = (window.CONTACTS || []).filter(c => window.optCruzada(c) && c.req && T[c.tier]
    && H((c.nif || c.e || '') + 'cartera') > 0.18);
  // Factor de facturación centrado en 1 por tier: la suma del listado tiene
  // que cuadrar con n × factMedia del agregado.
  const fac = {};
  Object.keys(T).forEach(id => {
    const ls = base.filter(c => c.tier === id);
    const hs = ls.map(c => 0.55 + H((c.nif || c.e || '') + 'mix') * 0.9);
    const media = hs.length ? hs.reduce((a, x) => a + x, 0) / hs.length : 1;
    fac[id] = media;
  });
  const rows = base.map(c => {
    const t = T[c.tier], h = H((c.nif || c.e || '') + 'mix');
    const sec = window.carSector(c);
    const fact = t.factMedia * (0.55 + h * 0.9) / (fac[c.tier] || 1);
    const inf = fact * window.CAR_INFORMA_PCT;
    const f347v = t.f347 * (0.92 + H((c.nif || c.e || '') + '347') * 0.16);
    const s347 = inf * f347v;
    const calc = Math.min(inf, s347) * t.calc * (0.85 + H((c.nif || c.e || '') + 'calc') * 0.3);
    // Mix disperso: base del sector, empujón del tier y un exponente que
    // concentra o reparte según la empresa. Un medio con base 0 sigue en 0.
    const mixT = window.CAR_MIX[c.tier];
    const pagos = ['transferencia','confirming','pagare','tpv','giro'];
    const gamma = 0.45 + H((c.nif || c.e || '') + 'gamma') * 2.1;
    const raw = {}; let tot = 0;
    pagos.forEach(p => {
      const bse = sec.mix[p] * 0.8 + mixT[p] * 0.2;
      const v = bse <= 0.005 ? 0 : Math.pow(Math.max(0.001, bse * (0.25 + H((c.nif || c.e || '') + p) * 2.2)), gamma);
      raw[p] = v; tot += v;
    });
    const mix = {}; pagos.forEach(p => { mix[p] = tot ? raw[p] / tot : 0; });
    const nac = Math.min(1, Math.max(0.15, sec.nacional * (0.72 + H((c.nif || c.e || '') + 'nac') * 0.56)));
    mix.nacional = nac; mix.eu = 1 - nac;
    mix.cedido = Math.min(0.9, Math.max(0, sec.cedido * (0.2 + H((c.nif || c.e || '') + 'ced') * 2.1)));
    const dom = pagos.reduce((a, p) => mix[p] > mix[a] ? p : a, pagos[0]);
    // Un medio "cuenta" en una empresa cuando pesa al menos el 15% de su
    // cartera: la transferencia siempre domina, así que filtrar por dominante
    // dejaría vacíos TPV y giro.
    const geo = nac >= 0.75 ? 'nacional' : 'eu';
    const ced = window.CAR_CED_TRAMOS.find(x => mix.cedido >= x.min && mix.cedido < x.max) || window.CAR_CED_TRAMOS[2];
    const est = window.carEstado(c);
    return { nif: c.nif, nombre: c.e, tier: c.tier, estado: est, sector: sec.id, sectorLabel: sec.label,
      estadoLabel: (window.CAR_ESTADOS.find(e => e.id === est) || {}).label,
      estadoColor: (window.CAR_ESTADOS.find(e => e.id === est) || {}).color,
      tierLabel: (window.OPT_SEGS.find(s => s.id === c.tier) || {}).label,
      color: (window.OPT_SEGS.find(s => s.id === c.tier) || {}).color,
      fact, eInforma: inf, e347: s347, eCalc: calc,
      dInforma: Math.round(t.deudores * (0.5 + h)), mix, dom, geo, ced: ced.id, cedPct: mix.cedido };
  });
  // Umbral relativo: "tiene peso en ese medio" es al menos vez y media el mix
  // típico de su tier, con un mínimo del 5%. Con un 15% plano el TPV nunca
  // aparecía, porque su mix normal es del 2 al 6%.
  const umbralDe = (r, id) => Math.max(0.05, (window.CAR_MIX[r.tier] || {})[id] * 1.5);
  const filt = rows.filter(r => (!o.tier || r.tier === o.tier)
    && (!o.metodo || r.mix[o.metodo] >= umbralDe(r, o.metodo))
    && (!o.geo || r.geo === o.geo) && (!o.ced || r.ced === o.ced)
    && (!o.estado || r.estado === o.estado) && (!o.sector || r.sector === o.sector));
  filt.sort((a, b) => b.fact - a.fact);
  const sum = (k) => filt.reduce((a, r) => a + r[k], 0);
  // Resumen de la selección: medios ponderados por cartera compartida.
  const wtot = sum('eCalc') || 1;
  const medios = {};
  ['transferencia','confirming','pagare','tpv','giro','nacional','eu','cedido'].forEach(k => {
    medios[k] = filt.reduce((a, r) => a + r.mix[k] * r.eCalc, 0) / wtot;
  });
  const porSector = window.CAR_SECTORES.map(s => {
    const l = filt.filter(r => r.sector === s.id);
    return { id: s.id, label: s.label, n: l.length, eur: l.reduce((a, r) => a + r.eCalc, 0) };
  }).filter(s => s.n).sort((a, b) => b.n - a.n);
  return { rows: filt, n: filt.length, total: rows.length, medios, porSector,
    umbral: o.metodo && rows.length ? umbralDe(rows[0], o.metodo) : 0.05,
    fact: sum('fact'), eInforma: sum('eInforma'), e347: sum('e347'), eCalc: sum('eCalc') };
};
