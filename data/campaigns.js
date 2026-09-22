// Campañas outbound: la lista se confecciona en Market Research y se monitoriza
// en Campañas. Una campaña congela los NIF y guarda la tesis que la justificó.

window.CAMP_SEQ = [
  { id:'e1', ch:'email', day:0,  label:'Email 1 · tensión de circulante' },
  { id:'l1', ch:'li',    day:2,  label:'LinkedIn · conexión al decisor' },
  { id:'c1', ch:'call',  day:3,  label:'Llamada 1 · apertura en frío' },
  { id:'e2', ch:'email', day:5,  label:'Email 2 · caso del sector' },
  { id:'l2', ch:'li',    day:8,  label:'LinkedIn · mensaje con el número' },
  { id:'c2', ch:'call',  day:10, label:'Llamada 2 · segundo intento' },
  { id:'e3', ch:'email', day:14, label:'Email 3 · cierre de secuencia' },
];

// Plantillas de cadena: solo mensajes (email y LinkedIn), con el contenido de
// cada pieza para poder revisarlo campaña a campaña. Placeholders: {{empresa}},
// {{decisor}}, {{pmc}}, {{sector}}, {{linea}}.
const A = { asunto:'{{empresa}} · cobrar a 30 en vez de a {{pmc}}',
  cuerpo:'Hola {{decisor}},\n\nEn {{sector}} vemos plazos de cobro de {{pmc}} días mientras los proveedores y las nóminas no esperan. En {{empresa}} eso son semanas de caja inmovilizada en facturas ya emitidas.\n\nEn Kintai anticipamos esas facturas sin consumir CIRBE ni pedir garantías personales: la línea es del cliente, no del banco.\n\n¿Te cuadra un hueco de 20 minutos esta semana para ver qué línea saldría con vuestros números? Te dejo mi agenda aquí.' };
const B = { asunto:'Cómo lo resolvió otra empresa de {{sector}}',
  cuerpo:'Hola {{decisor}},\n\nUna empresa de vuestro tamaño en {{sector}} tenía el circulante atado a plazos de 90 días y la póliza del banco ya renovada al límite. Anticipando facturas de sus tres clientes principales liberaron caja en 48h y dejaron de depender de la renovación anual.\n\nNo sustituimos al banco: descargamos la parte de circulante para que la póliza quede libre para inversión.\n\n¿Lo vemos 20 minutos?' };
const C = { asunto:'La cifra concreta para {{empresa}}',
  cuerpo:'Hola {{decisor}},\n\nCon la facturación pública de {{empresa}} la línea de anticipo estaría en el entorno de {{linea}}, disponible en días y sin aparecer en CIRBE como riesgo bancario nuevo.\n\nSi la cifra te encaja, en la llamada validamos cartera de clientes y plazos, y sales con el número real.\n\n¿Te reservo hueco el jueves?' };
const D = { asunto:'Cierro el tema, {{decisor}}',
  cuerpo:'Hola {{decisor}},\n\nNo quiero seguir insistiendo: cierro el hilo por mi parte. Si en algún momento los plazos de cobro aprietan o toca renovar póliza, escríbeme y lo miramos con vuestros números.\n\nTe dejo el hueco de agenda abierto por si prefieres verlo ahora: 20 minutos y sales con la línea estimada.' };
const L1 = { asunto:'LinkedIn · invitación',
  cuerpo:'{{decisor}}, te escribo por el circulante en {{sector}}: trabajamos anticipo de facturas sin consumir CIRBE. Te mando la conexión por si te interesa ver cómo queda en {{empresa}}.' };
const L2 = { asunto:'LinkedIn · mensaje con el número',
  cuerpo:'{{decisor}}, con vuestra facturación la línea estaría en torno a {{linea}} sin garantías personales. Si te encaja, te paso hueco de 20 minutos y lo validamos con vuestra cartera de clientes.' };

window.CAMP_TPL = [
  { id:'e4', label:'4 emails', steps:[
    { ch:'email', day:0,  label:'Email 1 · tensión de circulante', ...A },
    { ch:'email', day:3,  label:'Email 2 · caso del sector', ...B },
    { ch:'email', day:7,  label:'Email 3 · el número concreto', ...C },
    { ch:'email', day:12, label:'Email 4 · cierre con hueco de agenda', ...D },
  ]},
  { id:'e3', label:'3 emails', steps:[
    { ch:'email', day:0,  label:'Email 1 · tensión de circulante', ...A },
    { ch:'email', day:4,  label:'Email 2 · caso del sector', ...B },
    { ch:'email', day:10, label:'Email 3 · cierre con hueco de agenda', ...D },
  ]},
  { id:'e3li', label:'3 emails + LinkedIn', steps:[
    { ch:'email', day:0,  label:'Email 1 · tensión de circulante', ...A },
    { ch:'li',    day:2,  label:'LinkedIn · conexión al decisor', ...L1 },
    { ch:'email', day:5,  label:'Email 2 · caso del sector', ...B },
    { ch:'email', day:11, label:'Email 3 · cierre con hueco de agenda', ...D },
  ]},
  { id:'e4li2', label:'4 emails + 2 LinkedIn', steps:[
    { ch:'email', day:0,  label:'Email 1 · tensión de circulante', ...A },
    { ch:'li',    day:2,  label:'LinkedIn · conexión al decisor', ...L1 },
    { ch:'email', day:5,  label:'Email 2 · caso del sector', ...B },
    { ch:'email', day:9,  label:'Email 3 · el número concreto', ...C },
    { ch:'li',    day:11, label:'LinkedIn · mensaje con el número', ...L2 },
    { ch:'email', day:15, label:'Email 4 · cierre con hueco de agenda', ...D },
  ]},
];

window.campSeqOf = function (c) {
  if (c && c.seq && c.seq.length) {
    const t = window.CAMP_TPL.find(t => t.id === (c && c.tpl));
    return c.seq.filter(s => s.ch !== 'call').map((s, i) => {
      const o = t && t.steps[i];
      return { asunto: o && o.asunto, cuerpo: o && o.cuerpo, ...s };
    });
  }
  const t = window.CAMP_TPL.find(t => t.id === (c && c.tpl)) || window.CAMP_TPL[2];
  return t.steps.map((s, i) => ({ ...s, id: t.id + '-' + i, enviados: 0, aperturas: 0, respuestas: 0 }));
};

// Firma legible de la cadena: «3 email + 1 LinkedIn»
window.campSeqSig = function (seq) {
  const n = {};
  for (const s of seq) n[s.ch] = (n[s.ch] || 0) + 1;
  return Object.keys(window.CAMP_CH).filter(k => n[k])
    .map(k => n[k] + ' ' + window.CAMP_CH[k].label).join(' + ');
};

// Nombre sugerido: nicho + corte + ángulo, para que se entienda sin abrirla.
window.campSuggestName = function ({ cnaeLabel, tierLabels = [], pmcMin = 0, onlyA, topLocalidad, stats = {} }) {
  const parts = [];
  const nicho = (cnaeLabel || 'Multisector').replace(/\s*\(.*?\)\s*/g, '').trim();
  parts.push(nicho.charAt(0).toUpperCase() + nicho.slice(1));
  if (topLocalidad) parts.push(topLocalidad);
  if (tierLabels.length) parts.push(tierLabels.join('/'));
  if (pmcMin >= 15) parts.push('PMC >' + pmcMin + 'd');
  if (onlyA) parts.push('solo A');
  const ang = pmcMin >= 90 ? 'tensión de circulante'
    : (stats.parts && stats.parts.alt >= 60) ? 'banca agotada'
    : (stats.parts && stats.parts.nec >= 60) ? 'necesidad de caja'
    : 'anticipo de facturas';
  parts.push(ang);
  return parts.join(' · ');
};

window.CAMP_CH = {
  email:{ label:'Email', color:'#4054A8' },
  li:{ label:'LinkedIn', color:'#2E7D5B' },
};

window.CAMP_METRICS = [
  { k:'enviados',   label:'Contactados',  hint:'empresas con al menos un mensaje de la cadena' },
  { k:'leads',      label:'Leads',        hint:'respuesta con interés: hay conversación abierta' },
  { k:'cualificados', label:'Cualificados', hint:'pasan el filtro de calificación: necesidad y encaje confirmados' },
  { k:'deals_auto', label:'Deals auto',   hint:'discovery agendada por el prospecto desde la cadena, sin llamar' },
  { k:'deals_call', label:'Deals llamada',hint:'discovery levantada llamando al prospecto' },
  { k:'clientes',   label:'Clientes',     hint:'contrato firmado' },
];

window.campDeals = (m) => (m.deals_auto || 0) + (m.deals_call || 0) || (m.deals || 0);

// Embudo: leads → cualificados → deals
window.CAMP_CONV = [
  { label:'Contacto → lead',      num:'leads',        den:'enviados' },
  { label:'Lead → cualificado',   num:'cualificados', den:'leads' },
  { label:'Cualificado → deal',   num:'deals',        den:'cualificados' },
  { label:'Deal → cliente',       num:'clientes',     den:'deals' },
];

window.CAMP_STATUS = [
  { id:'draft',    label:'Borrador' },
  { id:'enriched', label:'Enriquecida' },
  { id:'active',   label:'En marcha' },
  { id:'done',     label:'Cerrada' },
];

// ---- Score de encaje del nicho -------------------------------------------
// Los tres pilares que ya usamos, normalizados a 0-100 sobre su rango y
// ponderados: la necesidad manda, las alternativas abren la puerta y el
// encaje confirma que el anticipo aplica. Budget queda fuera a propósito:
// es casi constante y no discrimina nichos.
window.NICHE_W = { nec:0.40, alt:0.30, enc:0.30 };
window.NICHE_RANGE = { nec:[-280, 970], alt:[-290, 700], enc:[-100, 300] };

const nrm = (v, [lo, hi]) => Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100));

window.nicheStats = function (list) {
  const n = list.length;
  if (!n) return { n:0, nec:0, alt:0, enc:0, g:0, fit:0, pctA:0, ventas:0, pmc:0, linea:0 };
  const sum = (f) => list.reduce((a, c) => a + (f(c) || 0), 0);
  const nec = sum(c => c.nec) / n, alt = sum(c => c.alt) / n, enc = sum(c => c.enc) / n;
  const parts = {
    nec: nrm(nec, window.NICHE_RANGE.nec),
    alt: nrm(alt, window.NICHE_RANGE.alt),
    enc: nrm(enc, window.NICHE_RANGE.enc),
  };
  return {
    n, nec, alt, enc,
    g: sum(c => c.g) / n,
    parts,
    fit: parts.nec * window.NICHE_W.nec + parts.alt * window.NICHE_W.alt + parts.enc * window.NICHE_W.enc,
    pctA: (list.filter(c => c.g_cat === 'A').length / n) * 100,
    ventas: sum(c => c.ventas) / n,
    pmc: sum(c => c.pmc) / n,
    linea: sum(c => c.linea),
  };
};

// ---- Persistencia --------------------------------------------------------
window.campLoad = function () {
  let list = [];
  try { list = JSON.parse(localStorage.getItem('kintai-camps') || '[]'); } catch { list = []; }
  // Migración: campañas anteriores al embudo leads→cualificados→deals y a las
  // cadenas sin llamada.
  return list.map(c => {
    const m = { ...(c.metrics || {}) };
    if (m.deals != null && m.deals_auto == null && m.deals_call == null) { m.deals_call = m.deals; m.deals_auto = 0; }
    if (m.cualificados == null) m.cualificados = Math.max(m.deals_auto || 0, 0) + (m.deals_call || 0) || m.leads || 0;
    for (const x of window.CAMP_METRICS) if (m[x.k] == null) m[x.k] = 0;
    const seq = (c.seq || []).filter(s => s.ch !== 'call')
      .map(s => ({ ...s, aperturas: s.aperturas ?? 0, respuestas: s.respuestas ?? 0, enviados: s.enviados ?? 0 }));
    const status = c.status === 'live' ? 'active' : c.status;
    return { ...c, status, metrics: m, seq: seq.length ? seq : c.seq };
  });
};
window.campSave = function (list) {
  localStorage.setItem('kintai-camps', JSON.stringify(list));
};
window.campCode = function (existing, keys, depth) {
  const base = 'OB-' + String(new Date().getFullYear()).slice(2) + '-' +
    (keys.length === 1 ? String(keys[0]) : depth + 'D' + keys.length);
  const n = existing.filter(c => c.code.startsWith(base)).length + 1;
  return base + '-' + String(n).padStart(2, '0');
};
window.campEmptyMetrics = function () {
  const m = {};
  for (const x of window.CAMP_METRICS) m[x.k] = 0;
  return m;
};

// ---- Datos de ejemplo: 7 campañas en distintos estados -------------------
window.campSeed = function (companies) {
  const pick = (from, n) => companies.slice(from, from + n).map(c => c.nif).filter(Boolean);
  const mk = (i, code, name, tpl, status, nifs, tesis, m, rates) => {
    const t = window.CAMP_TPL.find(t => t.id === tpl);
    const base = m.enviados || 0;
    return {
      id: 'seed-' + i, code, name, tpl, status, tesis, createdAt: Date.now() - i * 864e5,
      nodes: [], fit: rates.fit, nifs,
      metrics: { enviados:0, leads:0, cualificados:0, deals_auto:0, deals_call:0, clientes:0, ...m },
      seq: t.steps.map((s, k) => {
        const decay = [1, 0.82, 0.68, 0.55, 0.45, 0.38][k] || 0.3;
        const env = Math.round(base * decay);
        return { ...s, id: tpl + '-' + k,
          enviados: env,
          aperturas: s.ch === 'email' ? Math.round(env * rates.open * (1 - k * 0.05)) : 0,
          respuestas: Math.round(env * rates.reply * (k === 0 ? 0.7 : 1)) };
      }),
    };
  };
  return [
    mk(1, 'OB-26-4110-01', 'Promoción inmobiliaria Levante · PMC >90d · tensión de circulante', 'e4li2', 'active',
      pick(0, 62), 'Promotoras con obra en curso y cobro a certificación: el circulante se les va en avales y proveedores.',
      { enviados:58, leads:14, cualificados:9, deals_auto:5, deals_call:2, clientes:2 }, { open:0.52, reply:0.11, fit:71 }),
    mk(2, 'OB-26-2511-01', 'Carpintería metálica Cataluña · banca agotada', 'e3li', 'active',
      pick(60, 41), 'Talleres con póliza renovada al límite y clientes grandes que pagan a 120.',
      { enviados:39, leads:8, cualificados:6, deals_auto:2, deals_call:3, clientes:1 }, { open:0.44, reply:0.09, fit:66 }),
    mk(3, 'OB-26-4321-01', 'Instalaciones eléctricas Madrid · Tier 2 · necesidad de caja', 'e4', 'active',
      pick(100, 78), 'Subcontratas de instalación con nómina alta y certificaciones a 90 días.',
      { enviados:71, leads:11, cualificados:7, deals_auto:3, deals_call:1, clientes:1 }, { open:0.39, reply:0.08, fit:63 }),
    mk(4, 'OB-26-1071-01', 'Panadería industrial · solo A · anticipo de facturas', 'e3', 'done',
      pick(180, 34), 'Fabricantes con distribución a cadena de supermercados: cobro largo y muy concentrado.',
      { enviados:34, leads:5, cualificados:3, deals_auto:1, deals_call:1, clientes:1 }, { open:0.36, reply:0.07, fit:58 }),
    mk(5, 'OB-26-4941-01', 'Transporte de mercancías · PMC >120d · tensión de circulante', 'e4li2', 'enriched',
      pick(215, 96), 'Flotas con combustible al contado y clientes industriales que pagan a 120-150.',
      { enviados:12, leads:2, cualificados:1, deals_auto:1, deals_call:0, clientes:0 }, { open:0.58, reply:0.14, fit:74 }),
    mk(6, 'OB-26-4669-01', 'Mayorista de maquinaria · Tier 3 · banca agotada', 'e3li', 'enriched',
      pick(310, 47), 'Distribuidores con stock financiado y descuento comercial ya consumido.',
      { enviados:0, leads:0, cualificados:0, deals_auto:0, deals_call:0, clientes:0 }, { open:0, reply:0, fit:61 }),
    mk(7, 'OB-26-2D3-01', 'Multisector Levante · Tier 2/Tier 3 · necesidad de caja', 'e4', 'draft',
      pick(360, 120), 'Pool mixto para probar el ángulo de necesidad de caja fuera de un nicho concreto.',
      { enviados:0, leads:0, cualificados:0, deals_auto:0, deals_call:0, clientes:0 }, { open:0, reply:0, fit:54 }),
  ];
};
