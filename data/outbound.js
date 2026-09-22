// ============= OUTBOUND · OBJETIVOS 2027 =============
// Modelo del fichero Objetivos_Outbound_Q4.xlsx: targets de discovery por
// fuente y persona, puntos por segmento, curva de payout y gates. La hoja fija
// Q4-26 (octubre a diciembre, septiembre fuera); aquí se extiende a 2027
// manteniendo la misma mecánica.
window.OB_META = {
  fuente: 'Objetivos_Outbound_Q4.xlsx · hojas Targets_Q4 e Inputs',
  anio: 2027,
  baseQ: 'Q4 2026',
  nota: 'La hoja excluye septiembre del cómputo de Q4. Para 2027 cada trimestre cuenta sus tres meses.',
};

// Puntos por discovery cualificada según segmento. Es la regla que hace que un
// discovery de Mid-Market valga el doble.
window.OB_PUNTOS = { 'Mid-Market': 2, 'SME Big': 1, 'SME Junior': 1, 'SME Mid': 1, 'SME': 1 };

// Fuentes de discovery, con el target mensual de la hoja en su último mes de Q4
// (diciembre), que es el régimen al que llega cada una.
window.OB_TEAM = [
  { id:'dani',   nombre:'Dani',   rol:'SDR Líder',   fuente:'SDR team',         seg:'Mid-Market', q4:[10,10,10], regimen:10, desde:'2027-01' },
  { id:'ext1',   nombre:'SDR 1',  rol:'SDR externo', fuente:'Proveedor externo',seg:'SME Big',    q4:[20,30,30], regimen:30, desde:'2027-01' },
  { id:'sdr2',   nombre:'SDR 2',  rol:'SDR',         fuente:'SDR team',         seg:'SME Junior', q4:[10,20,30], regimen:30, desde:'2027-01' },
  { id:'sdr3',   nombre:'SDR 3',  rol:'SDR',         fuente:'SDR team',         seg:'Mid-Market', q4:[10,15,20], regimen:20, desde:'2027-01' },
  { id:'sdr4',   nombre:'SDR 4',  rol:'SDR',         fuente:'SDR team',         seg:'Mid-Market', q4:[10,15,20], regimen:20, desde:'2027-01' },
  { id:'lina',   nombre:'Lina',   rol:'AE outbound', fuente:'AE outbound',      seg:'SME Big',    q4:[12,12,10], regimen:12, desde:'2027-01' },
  { id:'silvia', nombre:'Silvia', rol:'AE outbound', fuente:'AE outbound',      seg:'SME Big',    q4:[12,12,10], regimen:12, desde:'2027-01' },
  { id:'arnau',  nombre:'Arnau',  rol:'AE outbound', fuente:'AE outbound',      seg:'SME Big',    q4:[12,12,10], regimen:12, desde:'2027-01' },
  { id:'adrian', nombre:'Adrián', rol:'AE outbound', fuente:'AE outbound',      seg:'SME Big',    q4:[12,12,10], regimen:12, desde:'2027-01' },
];

window.OB_FUENTES = [
  { id:'SDR team',          label:'SDR team',          color:'#2E7D5B', desc:'Equipo propio de prospección.' },
  { id:'Proveedor externo', label:'Proveedor externo', color:'#8E6E2A', desc:'SDR subcontratado, sin coste fijo de plantilla.' },
  { id:'AE outbound',       label:'AE outbound',       color:'#4054A8', desc:'El AE se prospecta su propia cartera.' },
];

// Target mensual y semanal por tipo de SDR y segmento, tal como los fija la hoja.
// El junior rinde una fracción del senior, y la hoja la escribe.
window.OB_TARGETS = [
  { tipo:'SDR Senior', seg:'Mid-Market', mensual:20, ratio:1 },
  { tipo:'SDR Junior', seg:'Mid-Market', mensual:12, ratio:0.60 },
  { tipo:'SDR Senior', seg:'SME Big',    mensual:30, ratio:1 },
  { tipo:'SDR Junior', seg:'SME Big',    mensual:21, ratio:0.70 },
  { tipo:'SDR Senior', seg:'SME Mid',    mensual:40, ratio:1 },
  { tipo:'SDR Junior', seg:'SME Mid',    mensual:30, ratio:0.75 },
];
window.OB_SEMANAS = 4.2;   // las que usa la hoja para el objetivo semanal

// Curva de payout del equipo por trimestre. La hoja la escribe en puntos
// absolutos calibrados para el equipo de Q4-26 (target 400 con 5 personas); con
// nueve en régimen ese target se supera siempre y el plan paga el máximo los
// cuatro trimestres, que no incentiva nada. Así que la curva se guarda como
// MÚLTIPLOS del target y el target se deriva de la plantilla comprometida.
window.OB_PAYOUT_NIVEL = 'equipo';
window.OB_PAYOUT_CAL = { target: 400, personas: 5, fuente: 'Q4 2026' };
window.OB_PAYOUT_CURVA = [
  { r:0.575, payout:0.40, nivel:'Entry threshold' },
  { r:0.675, payout:0.60, nivel:'Minimum acceptable' },
  { r:0.825, payout:0.80, nivel:'Solid' },
  { r:1.000, payout:1.00, nivel:'Target' },
  { r:1.150, payout:1.25, nivel:'Strong' },
  { r:1.290, payout:1.50, nivel:'Exceptional' },
];

// Objetivo de puntos del trimestre: lo que la plantilla comprometida produce en
// régimen. Es el 100% de la curva, así que el target se mueve con el equipo.
window.obTargetPuntos = function (personas) {
  if (!personas || !personas.length) return window.OB_PAYOUT_CAL.target;
  // Régimen de cada persona × sus puntos por discovery × tres meses.
  return personas.reduce((a, p) => a + p.regimen * window.obPuntos(p.seg) * 3, 0);
};

// Curva materializada en puntos para un target dado.
window.obCurva = function (target) {
  const t = target || window.OB_PAYOUT_CAL.target;
  return window.OB_PAYOUT_CURVA.map(c => ({ ...c, puntos: Math.round(t * c.r) }));
};
// Compatibilidad: la curva con la calibración original de la hoja.
window.OB_PAYOUT = window.obCurva(window.OB_PAYOUT_CAL.target);

// Gates por segmento. Como la curva, están calibrados para el equipo de Q4-26,
// así que escalan con el target para seguir mordiendo.
window.obGates = function (target) {
  const f = (target || window.OB_PAYOUT_CAL.target) / window.OB_PAYOUT_CAL.target;
  return window.OB_GATES.map(g => ({ ...g, mm: Math.round(g.mm * f), sme: Math.round(g.sme * f), factor: f }));
};
window.OB_GATES = [
  { regla:'Mínimo para payout relevante', mm:60,  sme:150, cap:0.60 },
  { regla:'Mínimo para cobrar hasta target', mm:100, sme:200, cap:1.00 },
  { regla:'Mínimo para cobrar hasta 125%', mm:120, sme:240, cap:1.25 },
  { regla:'Cap máximo', mm:120, sme:240, cap:1.50 },
];

window.OB_QUALITY = [
  { metrica:'AE accepted rate', umbral:0.75, efecto:'Cap payout al 100%' },
  { metrica:'CRM hygiene',      umbral:0.90, efecto:'Cap payout al 100%' },
  { metrica:'ICP fit',          umbral:0.80, efecto:'Cap payout al 100%' },
];

// Economía por segmento de la hoja Sheet1: precio por deal y conversión.
window.OB_ECON = [
  { seg:'Mid-Market', precioDeal:150, conv:0.07, facility:1000000, tae:0.25 },
  { seg:'SME Big',    precioDeal:100, conv:0.07, facility:300000,  tae:0.25 },
  { seg:'SME Mid',    precioDeal:50,  conv:0.07, facility:150000,  tae:0.25 },
  { seg:'SME Small',  precioDeal:25,  conv:0.07, facility:50000,   tae:0.25 },
];

window.obMonths = function () {
  const L = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return L.map((l, i) => ({ id:'2027-' + String(i+1).padStart(2,'0'), y:2027, m:i+1,
    label: l + ' 27', q:'Q' + Math.ceil((i+1)/3) }));
};

window.obPuntos = function (seg) { return window.OB_PUNTOS[seg] || 1; };

window.obPayoutDe = function (puntos, curva) {
  const c = curva || window.OB_PAYOUT;
  if (puntos < c[0].puntos) return { payout:0, nivel:'Por debajo del umbral' };
  let out = c[0];
  c.forEach(x => { if (puntos >= x.puntos) out = x; });
  return out;
};

// ============= NIVEL 1 · OBJETIVO POR TIER =============
// Lo que el plan de 2027 pide al canal outbound, para que el objetivo de
// discovery no viva desconectado del compromiso de clientes.
window.obTierPlan = function () {
  if (!window.gtmCapacityPlan || !window.GTM_DEFAULTS) return null;
  const cp = window.gtmCapacityPlan(window.GTM_DEFAULTS);
  const ms = window.obMonths();
  const idx = {};
  cp.months.forEach((m, i) => { idx[m.y + '-' + String(m.m).padStart(2,'0')] = i; });
  const tiers = cp.blocks.map(b => {
    const rows = ms.map(mo => {
      const i = idx[mo.id];
      const r = i != null ? b.rows[i] : null;
      return { leads: r ? r.leads : null, deals: r ? r.deals : null, cli: r ? r.cli : null };
    });
    return { id:b.tier.id, label:b.label, color:b.tier.color, rango:b.rango, cap:b.cap, rows,
      totL: rows.reduce((a,r)=>a+(r.leads||0),0),
      totD: rows.reduce((a,r)=>a+(r.deals||0),0),
      totC: rows.reduce((a,r)=>a+(r.cli||0),0) };
  }).filter(t => t.totD > 0 || t.totL > 0);
  const totalRows = ms.map((mo, i) => ({ ...mo,
    leads: tiers.reduce((a,t)=>a+(t.rows[i].leads||0),0),
    deals: tiers.reduce((a,t)=>a+(t.rows[i].deals||0),0),
    cli: tiers.reduce((a,t)=>a+(t.rows[i].cli||0),0) }));
  return { months: ms, tiers, totalRows,
    totL: tiers.reduce((a,t)=>a+t.totL,0),
    totD: tiers.reduce((a,t)=>a+t.totD,0),
    totC: tiers.reduce((a,t)=>a+t.totC,0) };
};

// ============= NIVEL 2 y 3 · FUENTES Y PERSONAS =============
// Cada persona arranca en el régimen que alcanzó en diciembre de Q4 y crece al
// ritmo que se le exija. Los puntos salen del segmento, como en la hoja.
window.OB_GROWTH_DEFECTO = 0.02;

window.obPlan = function (opts) {
  const o = opts || {};
  const growth = o.growth == null ? window.OB_GROWTH_DEFECTO : o.growth;
  const ms = window.obMonths();

  const personas = window.OB_TEAM.map(p => {
    const pts = window.obPuntos(p.seg);
    const rows = ms.map((mo, i) => {
      const activo = mo.id >= p.desde;
      const disc = activo ? p.regimen * Math.pow(1 + growth, i) : null;
      return { ...mo, activo, disc, puntos: disc != null ? disc * pts : null,
        semanal: disc != null ? disc / window.OB_SEMANAS : null };
    });
    const act = rows.filter(r => r.activo);
    const quarters = ['Q1','Q2','Q3','Q4'].map(q => {
      const g = rows.filter(r => r.q === q && r.activo);
      return { q, disc: g.reduce((a, r) => a + r.disc, 0), puntos: g.reduce((a, r) => a + r.puntos, 0) };
    });
    return { ...p, pts, rows, quarters,
      disc: act.reduce((a,r)=>a+r.disc,0),
      puntos: act.reduce((a,r)=>a+r.puntos,0),
      semanal: act.length ? act[act.length-1].semanal : null };
  });

  const fuentes = window.OB_FUENTES.map(f => {
    const g = personas.filter(p => p.fuente === f.id);
    const rows = ms.map((mo, i) => ({ ...mo,
      disc: g.reduce((a,p)=>a+(p.rows[i].disc||0),0),
      puntos: g.reduce((a,p)=>a+(p.rows[i].puntos||0),0),
      gente: g.filter(p => p.rows[i].activo).length }));
    return { ...f, personas:g, rows,
      disc: rows.reduce((a,r)=>a+r.disc,0),
      puntos: rows.reduce((a,r)=>a+r.puntos,0) };
  }).filter(f => f.personas.length);

  const porSeg = {};
  personas.forEach(p => {
    porSeg[p.seg] = porSeg[p.seg] || { seg:p.seg, gente:0, disc:0, puntos:0, pts:p.pts };
    porSeg[p.seg].gente++; porSeg[p.seg].disc += p.disc; porSeg[p.seg].puntos += p.puntos;
  });

  const totalRows = ms.map((mo, i) => ({ ...mo,
    disc: personas.reduce((a,p)=>a+(p.rows[i].disc||0),0),
    puntos: personas.reduce((a,p)=>a+(p.rows[i].puntos||0),0),
    gente: personas.filter(p => p.rows[i].activo).length }));

  // Payout del equipo por trimestre, con la curva y los gates recalibrados a la
  // plantilla de este plan. La aportación de cada persona es su parte de puntos.
  const target = o.target == null ? window.obTargetPuntos(personas) : o.target;
  const curva = window.obCurva(target);
  const gates = window.obGates(target);
  const quarters = ['Q1','Q2','Q3','Q4'].map(q => {
    const puntos = personas.reduce((a, p) => a + (p.quarters.find(x => x.q === q) || {}).puntos, 0);
    const mm = personas.filter(p => p.seg === 'Mid-Market').reduce((a, p) => a + (p.quarters.find(x => x.q === q) || {}).puntos, 0);
    const sme = puntos - mm;
    // Gates por segmento: el cap lo fija el gate más alto que se cumple.
    let cap = 0;
    gates.forEach(g => { if (mm >= g.mm && sme >= g.sme) cap = Math.max(cap, g.cap); });
    const cur = window.obPayoutDe(puntos, curva);
    return { q, puntos, mm, sme, cap,
      disc: personas.reduce((a, p) => a + (p.quarters.find(x => x.q === q) || {}).disc, 0),
      payoutCurva: cur.payout, nivel: cur.nivel,
      payout: Math.min(cur.payout, cap || cur.payout),
      capado: cap > 0 && cur.payout > cap };
  });

  return { months: ms, personas, fuentes, totalRows, growth, quarters, target, curva, gates,
    targetCal: window.OB_PAYOUT_CAL,
    porSeg: Object.values(porSeg),
    disc: personas.reduce((a,p)=>a+p.disc,0),
    puntos: personas.reduce((a,p)=>a+p.puntos,0),
    // Clientes que salen de esas discoveries con la conversión de la hoja.
    clientes: personas.reduce((a,p) => {
      const e = window.OB_ECON.find(x => x.seg === p.seg) || { conv: 0.07 };
      return a + p.disc * e.conv;
    }, 0) };
};

// ============= ANÁLISIS DE CONVERSIONES =============
// La cadena de outbound tiene tres saltos y cada uno tiene dos cifras: la que
// supone la hoja y la que mide HubSpot. Aquí van juntas.
window.obConversiones = function () {
  const econ = window.OB_ECON;
  const real = (window.HS_CANAL || []).find(c => c.id === 'outbound');
  const seg = window.HS_SEG || {};
  const mapSeg = { 'Mid-Market':'midmkt', 'SME Big':'big', 'SME Mid':'mid', 'SME Small':'small' };

  const filas = econ.map(e => {
    const k = mapSeg[e.seg];
    const s = k ? seg[k] : null;
    const realWr = s && s.outCerr ? s.outWon / s.outCerr : null;
    return { seg:e.seg, supuesto:e.conv, real:realWr,
      dealsPorClienteSup: e.conv ? 1 / e.conv : null,
      dealsPorClienteReal: realWr ? 1 / realWr : null,
      factor: realWr && e.conv ? e.conv / realWr : null,
      facility:e.facility, precioDeal:e.precioDeal,
      dealsReales: s ? s.outb : null, wonReales: s ? s.outWon : null };
  });

  // Cadena completa: lead trabajado → discovery → deal → cliente. Los dos
  // primeros saltos salen del plan de 2027, el último de la hoja y de HubSpot.
  let cadena = null;
  if (window.gtmCapacityPlan && window.GTM_DEFAULTS) {
    const p = window.GTM_DEFAULTS;
    const cp = window.gtmCapacityPlan(p);
    const leads = cp.totalRows.reduce((a, r) => a + (r.leads || 0), 0);
    const deals = cp.totalRows.reduce((a, r) => a + (r.deals || 0), 0);
    const cli = cp.totalRows.reduce((a, r) => a + (r.cli || 0), 0);
    cadena = { leads, deals, cli,
      leadADeal: leads ? deals / leads : null,
      dealACliente: deals ? cli / deals : null,
      puntaAPunta: leads ? cli / leads : null,
      realCanal: real ? real.wr : null };
  }
  return { filas, cadena, real,
    // Discoveries que hace falta por cliente con cada supuesto.
    discPorCliente: { hoja: 1 / 0.07, real: real && real.wr ? 1 / real.wr : null } };
};
