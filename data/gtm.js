// Cierre efectivo por tier y canal. Con useReal manda lo medido en HubSpot.
window.gtmWin = function (p, tierId, canal) {
  if (!p.useReal) return p.winRate;
  const c = (p.winByChannel || {})[tierId];
  if (c && canal && c[canal] != null) return c[canal];
  return (p.winByTier || {})[tierId] != null ? p.winByTier[tierId] : p.winRate;
};

// Rampa de madurez mes a mes. Los valores anuales de p.ramp son los vértices y
// entre ellos se interpola, porque el equipo no gana eficacia de golpe el 1 de
// enero: la gana cada mes. Sin esto las cohortes salen en mesetas.
window.gtmRampAt = function (p, monthsFromStart) {
  const t = monthsFromStart / 12;
  const i = Math.floor(t), f = t - i;
  const a = p.ramp[Math.min(p.ramp.length - 1, i)];
  const b = p.ramp[Math.min(p.ramp.length - 1, i + 1)];
  return a + (b - a) * f;
};

// Tasa efectiva de cualificada a deal según el modelo de embudo elegido.
window.gtmDealRate = function (p) { return p.stages === 3 ? 1 : p.dealRate; };

// ============= PLAN GO-TO-MARKET =============
// Simulación mensual desde hoy hasta el objetivo de cierre de 2029.
// Todo son palancas: nada está escrito a mano en el resultado.

window.GTM_META = {
  start: { y: 2026, m: 9 },   // septiembre 2026
  end:   { y: 2029, m: 12 },  // diciembre 2029
  weeksPerYear: 46,           // 52 menos vacaciones, festivos y formación
};
window.GTM_MONTHS = (function () {
  const out = [];
  let y = window.GTM_META.start.y, m = window.GTM_META.start.m;
  while (y < window.GTM_META.end.y || (y === window.GTM_META.end.y && m <= window.GTM_META.end.m)) {
    out.push({ y, m, label: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][m - 1] + ' ' + String(y).slice(2) });
    m++; if (m > 12) { m = 1; y++; }
  }
  return out;
})();
window.GTM_WPM = window.GTM_META.weeksPerYear / 12; // 3,83 semanas laborables por mes

// Universos disponibles. Se leen del motor AEAT para no tener dos verdades.
window.GTM_UNIVERSES = [
  { id:'foco',  label:'Foco · SME Big + Mid Market', tiers:['big','midmkt'],
    desc:'6M a 180M€. El foco declarado.' },
  { id:'big',   label:'Solo SME Big', tiers:['big'],
    desc:'6 a 20M€. El tier más homogéneo para validar el guion.' },
  { id:'ampl',  label:'Ampliado · + SME Mid', tiers:['mid','big','midmkt'],
    desc:'1M a 180M€. Multiplica el universo por cinco.' },
];

window.GTM_DEFAULTS = {
  universe: 'foco',
  sdr: 6,               // SDR hoy
  leadsPerSdrMonth: 400, // leads nuevos que gestiona un SDR al mes
  // Etapas del embudo. En 3 etapas la cualificada ES el deal: lead → deal →
  // cliente, que es como lo lee ventas. En 4 etapas se separa la reunión
  // cualificada del deal propuesto y aparece un salto intermedio más.
  stages: 3,
  // Las listas se trabajan por orden de encaje, así que los primeros meses
  // cierran mejor que el régimen y la prima decae al consumirse la cola buena.
  qualityPremium: 1.40,
  qualityDecay: 0.965,
  // Parte de los deals ya abiertos hoy que madura en cada uno de los primeros
  // meses: el plan no arranca con la cartera vacía.
  openingFlow: 0.228,
  // Los deals no firman todos exactamente al mes del ciclo: unos se adelantan y
  // otros se alargan. Peso de cierre a ciclo−1, ciclo y ciclo+1.
  maturity: [0.45, 0.30, 0.15, 0.07, 0.03],
  contactRate: 0.30,    // lead trabajado → conversación con decisor
  discRate: 0.10,       // prospecto → discovery
  dealRate: 0.10,       // discovery → deal
  winRate: 0.10,        // deal → cliente
  ae: 6,                // AE hoy
  dealsPerAeMonth: 48,  // deals nuevos que gestiona un AE al mes (AE puro, no full-cycle)
  cycleMonths: 2,       // meses de deal a firma
  retouch: 0.55,        // eficacia de una segunda pasada sobre la misma empresa
  ramp: [0.4, 1.0, 1.4, 1.7], // madurez por año de plan: guion, datos, scores
  target: 1000,         // clientes a cierre de 2029
  autoHire: false,      // contratar AE hasta cubrir la demanda de discovery
  // Plantilla comprometida por tier. Cuando la capacidad es el dato y el
  // objetivo la incógnita, el plan se resuelve de abajo arriba desde aquí.
  // Canal de partners y brokers. El deal llega ya cualificado, así que cierra
  // el mismo mes y sin rampa de madurez: la curva de aprendizaje la puso el
  // broker. Lo que sí tiene rampa es el volumen de deals que traen.
  // Un deal de partner también lo cierra un AE: viene cualificado, pero alguien
  // lo trabaja. Y tiene prioridad sobre el outbound, porque a un broker no se le
  // devuelve el deal. Ponlo en false solo si los cierra otro equipo.
  // Parte de la línea concedida que el cliente tiene dispuesta de media. El
  // loanbook es saldo dispuesto, no límite concedido: sin esto se contaba el
  // total de líneas como si estuviera todo en balance.
  utilizacion: 0.60,
  // Objetivo de clientes y línea media por tier. Son estado del plan, no
  // globales: mover la palanca en Unicorn no debe cambiar la pestaña 2027.
  // Mid Market y SME Big los fija dirección; el resto se completa desde el BP
  // con el factor de ambición y queda editable.
  objByTier: { midmkt: 400, big: 800 },
  // Objetivo expresado como cuota de mercado. Manda sobre objByTier: el número
  // de clientes se deriva del universo del tramo.
  shareByTier: { mid: 0.015, small: 0.005 },
  // Segmentos cuyo crecimiento fuerte arranca en 2028: la curva se retrasa en
  // vez de repartirse como el resto del plan.
  lateByTier: { mid: true, small: true },
  ticketByTier: { corp: 10000000, midmkt: 3000000, big: 600000, mid: 150000, small: 50000 },
  // La línea media no es constante: arranca en la del BP y crece hacia la
  // objetivo con la misma forma que los clientes del segmento.
  ticketRampa: true,
  partnerUsesAe: true,
  // Cierre real por tier medido en HubSpot (deals ganados sobre cerrados).
  // Sustituye al winRate único: SME Big cierra al 35% y Small al 7%.
  winByTier: { small:0.067, mid:0.178, big:0.353, midmkt:0.361, corp:0.10 },
  // Cierre real por canal dentro de cada tier: el partner cierra seis veces
  // mejor que el outbound en SME Big. Sin esto el plan sobrestima el outbound.
  winByChannel: {
    big:    { out:0.063, part:0.392 },
    midmkt: { out:0.114, part:0.419 },
    mid:    { out:0.111, part:0.188 },
    small:  { out:0.016, part:0.069 },
  },
  useReal: true,
  // Canal de contactos: todo prospect con discovery hecho cuyo deal se perdió,
  // más los clientes que han hecho churn. No es una lista nueva, es la cartera
  // de gente que ya nos conoce, y la trabaja el AE con la capacidad que le
  // sobra después de partners y outbound.
  contacts: {
    seed: 0.5,          // parte de los deals perdidos históricos que sigue viva
    followUpShare: 0.22, // parte de la cartera que se toca cada mes
    dealRate: 0.09,      // follow-up → deal reabierto
    winRate: 0.14,       // cierra mejor que un frío: ya hubo discovery
    churnMonthly: 0.008, // clientes que se van y vuelven a la cartera
  },
  // Canal tech/embedded: un partnership integrado en el canal micro. El deal
  // nace dentro del producto del partner, así que no consume SDR y el cierre lo
  // hace el flujo, no una persona. Rampa hasta dic-26 y luego crecimiento.
  embedded: {
    micro: { partner:'Partnership micro', startDeals: 12, targetDeals: 50,
      startCli: 6, targetCli: 25, rampMonths: 3, growth: 0.03, usesAe: false },
  },
  partners: {
    // Rampa hasta nov-26 porque el partnership manager acaba de entrar y ese es
    // su empujón inicial. A partir de ahí crecimiento moderado compuesto.
    big:    { startDeals: 20, targetDeals: 30, rampMonths: 2, growth: 0.05, winRate: 0.10 },
    midmkt: { startDeals: 10, targetDeals: 20, rampMonths: 2, growth: 0.05, winRate: 0.10 },
    // Corporate se planifica dentro de Mid Market: no lleva entrada propia.
  },
  // Plantilla y productividad real por tier. El techo de deals por SDR y mes es
  // una observación de campo, no una derivada de la tasa: aunque el lead
  // convierta mejor, un SDR no abre más de esto al mes.
  tierCaps: {
    micro:  { sdr: 0, ae: 0, dealsPerSdr: 40 },
    small:  { sdr: 0, ae: 0, dealsPerSdr: 40 },
    mid:    { sdr: 0, ae: 1, dealsPerSdr: 35 },
    big:    { sdr: 4, ae: 4, dealsPerSdr: 30 },
    midmkt: { sdr: 2, ae: 2, dealsPerSdr: 20 },
  },
};

// Escenarios que reproducen las hipótesis de la conversación.
window.GTM_SCENARIOS = [
  { id:'actual', label:'Como está hoy', desc:'6 SDR y 6 AE, conversión de primer año en las tres etapas.',
    set:{ sdr:6, ae:6, discRate:0.10, dealRate:0.10, winRate:0.10, autoHire:false } },
  { id:'ae15', label:'Doblar el equipo', desc:'12 SDR y 12 AE con la conversión de primer año.',
    set:{ sdr:12, ae:12, discRate:0.10, dealRate:0.10, winRate:0.10, autoHire:false } },
  { id:'estricto', label:'Calificación estricta', desc:'Menos discoveries pero mejores: mitad de volumen, doble de cierre.',
    set:{ sdr:6, ae:4, discRate:0.05, dealRate:0.20, winRate:0.25, autoHire:false } },
  { id:'ampliar', label:'Abrir SME Mid', desc:'Mismo equipo, universo cinco veces mayor.',
    set:{ universe:'ampl', sdr:6, ae:4, discRate:0.05, dealRate:0.20, winRate:0.25, autoHire:false } },
  { id:'necesario', label:'Lo que hace falta', desc:'Contratar AE sin límite y ver qué conversión exige el objetivo.',
    set:{ universe:'ampl', sdr:12, ae:6, discRate:0.06, dealRate:0.25, winRate:0.30, autoHire:true } },
];

window.gtmUniverseSize = function (universeId, mktOpts) {
  const u = window.mktUniverse(mktOpts || { method:'log', year:2022, drift:0.03 });
  const def = window.GTM_UNIVERSES.find(x => x.id === universeId) || window.GTM_UNIVERSES[0];
  return def.tiers.reduce((a, t) => a + (u[t] || 0), 0);
};

// ---- Simulación ----
// Cada mes: los SDR sacan prospectos nuevos del pozo; cuando el pozo se agota
// se empieza otra pasada con menos eficacia. La demanda de discovery la limita
// la capacidad de los AE, y lo que no cabe se pierde, no se acumula: un lead
// trabajado que no consigue reunión en su ventana se enfría.
window.gtmSimulate = function (p, mktOpts) {
  const U = window.gtmUniverseSize(p.universe, mktOpts);
  const months = window.GTM_MONTHS;
  const rows = [];
  let pool = U, pass = 1, dealsPipe = [], cumClients = 0, cumProspects = 0, cumDisc = 0, cumLost = 0;
  let exhaustedAt = null, hitAt = null, maxAeNeeded = 0;

  months.forEach((mo, i) => {
    const yearIdx = Math.min(p.ramp.length - 1, Math.floor(i / 12));
    const ramp = p.ramp[yearIdx];

    const sdrCap = p.sdr * p.leadsPerSdrMonth;
    // Cuando el pozo se agota a mitad de mes el remanente de capacidad pasa a
    // la siguiente pasada en el mismo mes, no se evapora. Cada trozo lleva la
    // eficacia de su pasada y el mes se queda con la media ponderada.
    let prospects = 0, effW = 0, rest = sdrCap, guard = 0;
    while (rest > 0.01 && U > 0.5 && guard++ < 200) {
      const take = Math.min(rest, pool);
      const f = Math.pow(p.retouch, pass - 1);
      prospects += take; effW += take * f; rest -= take; pool -= take;
      if (pool <= 0.5) { if (exhaustedAt == null) exhaustedAt = i; pool = U; pass++; }
    }
    const passFactor = prospects ? effW / prospects : 1;

    // Los SDR generan reuniones; el AE gestiona los deals que salen de ellas.
    // La capacidad de AE capa deals, que es la unidad en la que trabaja un AE puro.
    const demand = prospects * p.discRate * ramp * passFactor;
    const dealsDemand = demand * window.gtmDealRate(p);
    const aeCap = p.ae * p.dealsPerAeMonth;
    const aeNeeded = dealsDemand / p.dealsPerAeMonth;
    maxAeNeeded = Math.max(maxAeNeeded, aeNeeded);
    const dealsRun = p.autoHire ? dealsDemand : Math.min(dealsDemand, aeCap);
    const run = window.gtmDealRate(p) ? dealsRun / window.gtmDealRate(p) : 0;
    const lost = Math.max(0, demand - run);

    const deals = dealsRun;
    dealsPipe.push(deals);
    const matured = i - p.cycleMonths >= 0 ? dealsPipe[i - p.cycleMonths] : 0;
    const clients = matured * p.winRate;

    cumProspects += prospects; cumDisc += run; cumLost += lost; cumClients += clients;
    if (!hitAt && cumClients >= p.target) hitAt = i;

    rows.push({ ...mo, i, yearIdx, ramp, pass, prospects, poolLeft: pool, demand, aeCap,
      aeNeeded, run, lost, deals, clients, cumClients, cumProspects, cumDisc, cumLost,
      ae: p.autoHire ? Math.ceil(aeNeeded) : p.ae,
      target: p.target * (i + 1) / months.length });
  });

  return {
    U, rows, exhaustedAt, hitAt, maxAeNeeded,
    finalClients: cumClients,
    totalProspects: cumProspects, totalDisc: cumDisc, totalLost: cumLost,
    passes: pass,
    // conversión de punta a punta que exige el objetivo, sobre empresas únicas
    requiredOnUniverse: p.target / U,
    achievedOnUniverse: cumClients / U,
    endToEnd: p.discRate * p.dealRate * p.winRate,
  };
};

// Qué limita cada mes. Un plan sin cuello identificado no es un plan.
window.gtmBottleneck = function (r, p) {
  if (r.lost > r.demand * 0.05) return { id:'ae', label:'Capacidad de AE', color:'#B23A3A' };
  if (r.pass > 1) return { id:'pool', label:'Universo agotado', color:'#B8731F' };
  if (r.prospects < p.sdr * p.leadsPerSdrMonth * 0.98) return { id:'pool', label:'Universo agotado', color:'#B8731F' };
  return { id:'conv', label:'Conversión', color:'#256B4C' };
};

// ============= OBJETIVO DE BP: RESOLVER HACIA ATRÁS =============
// Los 1.000 clientes a cierre de 2029 son compromiso de business plan, no
// hipótesis. Así que la pregunta deja de ser "cuántos saldrían" y pasa a ser
// "qué tiene que ser verdad para que salgan".

// Hitos de BP: reparto acumulado del objetivo por cierre de año.
// Una recta no vale: el primer año casi no produce porque el ciclo y la
// maduración del guion se comen los meses.
// Hito de un año sobre el camino QUE QUEDA desde la base real. El shape reparte
// el recorrido de base→objetivo, no el objetivo entero: con 203 clientes ya
// firmados, un 18% de 1.000 estaría cumplido sin hacer nada.
window.gtmHito = function (p, year, base) {
  const sh = window.GTM_BP_SHAPE.find(s => s.year === year) || { cum: 0.18 };
  const b = base == null ? 0 : base;
  if (b <= 0) return p.target * sh.cum;
  // Reescalado: el cum del año de arranque se convierte en el cero.
  const y0 = window.GTM_BP_SHAPE[0].cum;
  const r = sh.cum <= y0 ? 0 : (sh.cum - y0) / (1 - y0);
  return b + (p.target - b) * r;
};

window.GTM_BP_SHAPE = [
  { year:2026, cum:0.03 }, { year:2027, cum:0.18 },
  { year:2028, cum:0.50 }, { year:2029, cum:1.00 },
];

window.gtmYears = function () {
  const out = [];
  for (const b of window.GTM_BP_SHAPE) {
    const idx = window.GTM_MONTHS.reduce((a, m, i) => m.y === b.year ? i : a, -1);
    out.push({ ...b, lastIdx: idx, months: window.GTM_MONTHS.filter(m => m.y === b.year).length });
  }
  return out;
};

// Años efectivos del horizonte, en años decimales.
window.GTM_YEARS = window.GTM_MONTHS.length / 12;

// Cada resolución despeja UNA palanca dejando las demás como están.
// Todas parten de la misma identidad:
//   clientes = prospectos × discRate × dealRate × winRate × madurez × pasadas
//   prospectos = sdr × leads × semanas × años
//   discoveries = prospectos × discRate  →  AE = discoveries / capacidad
// Techo aritmético: no hay más sociedades con facturación en España.
window.gtmSpainMax = function () {
  const u = window.mktUniverse({ method:'log', year:2022, drift:0.03 });
  return Object.values(u).reduce((a, b) => a + b, 0);
};

// mode: 'required' resuelve el mundo coherente con la conversión que exige el
// objetivo. 'current' resuelve manteniendo el cierre de hoy, que sirve para ver
// lo absurdo que sale y por qué la palanca no es contratar.
window.gtmSolve = function (p, sim, mode) {
  const Y = window.GTM_YEARS, W = window.GTM_META.weeksPerYear;
  const rampAvg = p.ramp.slice(0, Math.ceil(Y)).reduce((a, b) => a + b, 0) / Math.ceil(Y);
  const touches = p.sdr * p.leadsPerSdrMonth * 12 * Y;
  const U = window.gtmUniverseSize(p.universe);
  const passes = touches / U;
  // eficacia media ponderada al repetir pasadas sobre el mismo universo
  let eff = 0, left = touches;
  for (let k = 1; left > 0; k++) {
    const chunk = Math.min(U, left);
    eff += chunk * Math.pow(p.retouch, k - 1);
    left -= chunk;
  }
  eff = touches ? eff / touches : 1;

  const chain = p.discRate * window.gtmDealRate(p) * p.winRate * rampAvg * eff;
  const clients = touches * chain;

  // La simulación es la verdad: capa por plantilla de AE y retrasa el ciclo.
  // 'clients' es el techo teórico sin límite de agenda.
  const delivered = sim ? sim.finalClients : clients;
  const base = sim ? sim.totalProspects : touches;

  // Todas las tarjetas de plantilla se resuelven sobre UN mismo supuesto de
  // tramo bajo, para que no haya dos respuestas a "cuántos AE".
  const bottomRequired = (p.target / base) / (p.discRate * rampAvg * eff);
  const bottomNow = window.gtmDealRate(p) * p.winRate;
  const solveMode = mode === 'current' ? 'current' : 'required';
  const bottomUsed = solveMode === 'current' ? bottomNow : bottomRequired;

  // Con el supuesto activo, deal y cierre se escalan manteniendo su ratio.
  const scaleB = Math.sqrt(bottomUsed / Math.max(1e-9, bottomNow));
  const dealEff = Math.min(1, window.gtmDealRate(p) * scaleB);
  const winEff = Math.min(0.9, p.winRate * scaleB);
  const discNeeded = p.target / Math.max(1e-9, bottomUsed);
  const dealsNeeded = p.target / Math.max(1e-9, winEff);
  const aeCapYear = p.dealsPerAeMonth * 12;
  const aeNeeded = dealsNeeded / (aeCapYear * Y);
  const touchesNeeded = discNeeded / (p.discRate * rampAvg * eff);
  const sdrNeeded = touchesNeeded / (p.leadsPerSdrMonth * 12 * Y);
  const spainMax = window.gtmSpainMax();

  return {
    U, touches, passes, eff, rampAvg, chain, clients, delivered, base,
    chainDelivered: base ? delivered / base : 0,
    // 1) conversión por lead trabajado mínima, con el equipo y universo de hoy
    chainNeeded: base ? p.target / base : Infinity,
    chainFactor: chain ? (p.target / base) / chain : Infinity,
    // 2) cuánto hay que apretar el tramo bajo del embudo si discRate no se toca
    bottomNeeded: bottomRequired, bottomNow, bottomUsed, solveMode,
    // 3) universo mínimo para hacerlo en una sola pasada
    universeNeeded: touchesNeeded,
    spainMax, impossible: touchesNeeded > spainMax,
    // 4) plantilla, toda sobre el mismo supuesto
    dealsNeeded, discNeeded, aeNeeded, touchesNeeded, sdrNeeded, dealEff, winEff,
    aeAtCurrent: (p.target / Math.max(1e-9, p.winRate)) / (aeCapYear * Y),
    aeAtRequired: (p.target / Math.max(1e-9, winEff)) / (aeCapYear * Y),
    discPerWeek: discNeeded / (W * Y),
    dealsPerMonth: dealsNeeded / (12 * Y),
  };
};

// Frontera de viabilidad: AE contra calidad del tramo bajo del embudo.
// Son las dos decisiones que el equipo controla de verdad: a cuánta gente
// contratas y cuánto aprietas la calificación.
window.gtmFrontier = function (p, sol) {
  const Y = window.GTM_YEARS, W = window.GTM_META.weeksPerYear;
  // La escalera de AE se centra en la plantilla que exige el objetivo, para que
  // la frontera siga siendo legible cuando cambia la capacidad por AE.
  // Se ancla en el cierre EXIGIDO, no en el de hoy: con el de hoy la escalera
  // se va a cientos de AE y la tabla deja de decir nada.
  // El AE se mide en deals, así que la frontera cruza plantilla contra tasa de
  // cierre de deal a cliente, que es lo que el AE controla.
  const win = sol && sol.winEff ? sol.winEff : p.winRate;
  const anchor = Math.max(2, Math.ceil(p.target / Math.max(1e-9, win) / (p.dealsPerAeMonth * 12 * Y)));
  const aeOpts = [...new Set([0.25, 0.5, 0.75, 1, 1.5, 2, 3]
    .map(k => Math.max(1, Math.round(anchor * k))).concat(p.ae))]
    .sort((a, b) => a - b).slice(0, 8);
  const bottomOpts = [0.05, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50];
  // Columna más cercana al cierre exigido: la cifra del pie es derivada.
  const col = bottomOpts.reduce((a, b) => Math.abs(b - win) < Math.abs(a - win) ? b : a, bottomOpts[0]);
  const cells = aeOpts.map(ae => bottomOpts.map(b => {
    const dealCap = ae * p.dealsPerAeMonth * 12 * Y;
    const clients = dealCap * b;
    return { ae, bottom: b, clients, ok: clients >= p.target };
  }));
  const minAe = aeOpts.find(ae => ae * p.dealsPerAeMonth * 12 * Y * col >= p.target);
  return { aeOpts, bottomOpts, cells, bottom: win, col, minAe };
};

// El año bisagra es el último con universo virgen: a partir de ahí el
// crecimiento ya no puede venir de prospección nueva.
window.gtmHingeYear = function (sim) {
  if (sim.exhaustedAt == null) return null;
  return window.GTM_MONTHS[sim.exhaustedAt].y - 1;
};

// ============= PLAN MENSUAL DE UN AÑO =============
// Top-down: del hito de BP del año se deriva la curva mensual de clientes y de
// ahí, hacia atrás por el embudo, el volumen que hay que mover cada mes y la
// plantilla que eso pide. Es lo contrario de la simulación: aquí el resultado
// está fijado y lo que se calcula es el esfuerzo.
window.gtmMonthlyPlan = function (p, sol, year) {
  year = year || 2027;
  const shape = window.GTM_BP_SHAPE;
  const prev = shape.find(s => s.year === year - 1);
  const cur = shape.find(s => s.year === year);
  const cumPrev = p.target * (prev ? prev.cum : 0);
  const cumEnd = p.target * (cur ? cur.cum : 1);
  const net = cumEnd - cumPrev;

  // Rampa creciente dentro del año: en enero el equipo no rinde como en diciembre.
  const w = []; for (let i = 1; i <= 12; i++) w.push(i);
  const sw = w.reduce((a, b) => a + b, 0);
  const clients = w.map(x => net * x / sw);

  // Tasas coherentes con el supuesto activo de la sección: si el tramo bajo
  // tiene que llegar al exigido, se escalan deal y cierre manteniendo su ratio.
  const scale = Math.sqrt(sol.bottomUsed / Math.max(1e-9, window.gtmDealRate(p) * p.winRate));
  const dealEff = Math.min(1, window.gtmDealRate(p) * scale);
  const winEff = Math.min(0.9, p.winRate * scale);
  const meetRate = p.discRate / p.contactRate; // conversación → reunión

  const rows = [];
  let cum = cumPrev;
  const opened = [];
  for (let i = 0; i < 12; i++) {
    const cl = clients[i];
    // los deals que se firman en i+ciclo hay que abrirlos ahora
    const fi = i + p.cycleMonths;
    const futureCl = fi < 12 ? clients[fi] : net * (13 + (fi - 12)) / sw;
    const dealsOpen = futureCl / winEff;
    const disc = dealsOpen / dealEff;
    const contacts = disc / meetRate;
    const leads = disc / p.discRate;
    opened.push(dealsOpen);
    const inPipe = opened.slice(Math.max(0, i - p.cycleMonths + 1)).reduce((a, b) => a + b, 0);
    cum += cl;
    rows.push({
      i, year, m: i + 1,
      label: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][i],
      leads, contacts, disc, dealsOpen, clients: cl, cum, inPipe,
      sdr: leads / p.leadsPerSdrMonth,
      ae: dealsOpen / p.dealsPerAeMonth,
      managed: cum,
    });
  }
  const sum = (f) => rows.reduce((a, r) => a + f(r), 0);
  return {
    year, cumPrev, cumEnd, net, rows, dealEff, winEff, meetRate,
    totals: { leads: sum(r => r.leads), contacts: sum(r => r.contacts), disc: sum(r => r.disc),
      dealsOpen: sum(r => r.dealsOpen), clients: sum(r => r.clients) },
    peak: { sdr: Math.max(...rows.map(r => r.sdr)), ae: Math.max(...rows.map(r => r.ae)) },
  };
};

// ============= ESTADO ACTUAL POR TIER, CONTRA EL OBJETIVO 2029 =============
window.gtmTierState = function (mktOpts) {
  const f = window.mktFunnel(mktOpts || { method:'log', year:2022, drift:0.03 });
  return window.MKT_TIERS.map(t => {
    const s = f[t.id];
    return {
      tier: t, universo: s.universo,
      cualificado: s.cualificado, impactado: s.impactado, contactado: s.contactado,
      reunion: s.reunion, deal: s.deal, cliente: s.cliente,
      penetracion: s.universo ? s.cliente / s.universo : 0,
      objetivo: t.targetClients,
      objPct: t.targetClients ? t.targetClients / s.universo : 0,
      achievement: t.targetClients ? s.cliente / t.targetClients : null,
      faltan: Math.max(0, t.targetClients - s.cliente),
    };
  });
};

// ============= PLAN POR TIER, MES A MES, HASTA DICIEMBRE DE 2027 =============
// Los meses son columnas y cada tier un bloque. El encadenado es el que pidió
// ventas: empresas → prospectadas → cualificadas → deal → cliente, con la
// cualificación entendida como conversación que confirma encaje, que es la que
// se convierte en discovery y por tanto la que dimensiona los AE.

window.GTM_H2027_END = { y: 2027, m: 12 };
window.GTM_H2027 = window.GTM_MONTHS.filter(m => m.y < 2028);

// Cómo se reparte el objetivo del BP entre tiers.
window.GTM_SPLITS = [
  { id:'foco', label:'Solo foco', desc:'Todo el objetivo en SME Big y Mid Market, repartido como su objetivo declarado.',
    pick:t => t.focus },
  { id:'declarado', label:'Objetivo declarado', desc:'Proporcional a los objetivos de cliente por tier que ya tiene el plan.',
    pick:() => true },
  { id:'big', label:'Solo SME Big', desc:'Concentrar todo en el tier más homogéneo mientras se valida el guion.',
    pick:t => t.id === 'big' },
];

window.gtmTierShares = function (splitId) {
  const def = window.GTM_SPLITS.find(s => s.id === splitId) || window.GTM_SPLITS[0];
  const rows = window.MKT_TIERS.filter(t => def.pick(t) && t.targetClients > 0);
  const tot = rows.reduce((a, t) => a + t.targetClients, 0);
  const out = {};
  for (const t of window.MKT_TIERS) out[t.id] = 0;
  for (const t of rows) out[t.id] = tot ? t.targetClients / tot : 0;
  return { def, shares: out, tiers: rows };
};

window.gtmTierMonthly = function (p, sol, splitId) {
  const { def, shares, tiers } = window.gtmTierShares(splitId);
  const state = window.gtmTierState();
  const months = window.GTM_H2027;
  const N = months.length;

  // Hito de BP a cierre de 2027 y punto de partida real de los tiers del reparto.
  // Misma base y mismo rebase que gtmCapacityPlan: los dos motores no pueden
  // anunciar hitos distintos en la misma tarjeta.
  const baseCli = tiers.reduce((a, t) => {
    const st = state.find(s => s.tier.id === t.id) || {};
    if (p.useReal && window.HS_START && window.HS_START[t.id]) return a + window.HS_START[t.id].clientes;
    return a + (st.cliente || 0);
  }, 0);
  const milestone = window.gtmHito(p, 2027, baseCli);
  const milestonePlano = p.target * (window.GTM_BP_SHAPE.find(s => s.year === 2027) || { cum: 0.18 }).cum;
  const net = Math.max(0, milestone - baseCli);

  // Rampa creciente: el mes 1 no rinde como el 16.
  const w = []; for (let i = 1; i <= N; i++) w.push(i);
  const sw = w.reduce((a, b) => a + b, 0);
  const clientCurve = w.map(x => net * x / sw);

  // Tasas coherentes con el supuesto activo de la sección de arriba.
  const scale = Math.sqrt(sol.bottomUsed / Math.max(1e-9, p.dealRate * p.winRate));
  const dealEff = Math.min(0.9, p.dealRate * scale);
  const winEff = Math.min(0.9, p.winRate * scale);

  const leadsPerSdrMonth = p.leadsPerSdrMonth;
  const dealsPerAeMonth = p.dealsPerAeMonth;

  const blocks = tiers.map(t => {
    const st = state.find(s => s.tier.id === t.id);
    const share = shares[t.id];
    // Bases homólogas: prospectadas ← impactadas (leads ya trabajados),
    // cualificadas ← reuniones ya celebradas. El pozo de score NO es el
    // acumulado de reuniones: son dos magnitudes distintas.
    let cumCli = st.cliente, cumPros = st.impactado, cumCual = st.reunion, cumDeal = st.deal;
    const opened = [];
    const rows = months.map((mo, i) => {
      const cli = clientCurve[i] * share;
      // los deals que firman en i+ciclo hay que abrirlos ahora
      const fi = i + p.cycleMonths;
      const futureCli = (fi < N ? clientCurve[fi] : net * (N + 1 + (fi - N)) / sw) * share;
      const dealsOpen = futureCli / winEff;
      const cual = dealsOpen / dealEff;
      const pros = cual / p.discRate;
      opened.push(dealsOpen);
      const pipe = opened.slice(Math.max(0, i - p.cycleMonths + 1)).reduce((a, b) => a + b, 0);
      cumCli += cli; cumPros += pros; cumCual += cual; cumDeal += dealsOpen;
      return { ...mo, i, pros, cual, dealsOpen, cli, pipe,
        cumPros, cumCual, cumDeal, cumCli,
        penPros: cumPros / st.universo, penCual: cumCual / st.universo, penCli: cumCli / st.universo,
        sdr: pros / leadsPerSdrMonth, ae: dealsOpen / dealsPerAeMonth };
    });
    return { tier: t, share, universo: st.universo, start: st, rows,
      totals: {
        pros: rows.reduce((a, r) => a + r.pros, 0),
        cual: rows.reduce((a, r) => a + r.cual, 0),
        deals: rows.reduce((a, r) => a + r.dealsOpen, 0),
        cli: rows.reduce((a, r) => a + r.cli, 0),
      },
      peak: { sdr: Math.max(...rows.map(r => r.sdr)), ae: Math.max(...rows.map(r => r.ae)) } };
  });

  // Capacidad agregada: es la que se contrata, no la de cada bloque por separado.
  const totalRows = months.map((mo, i) => {
    const sdr = blocks.reduce((a, b) => a + b.rows[i].sdr, 0);
    const ae = blocks.reduce((a, b) => a + b.rows[i].ae, 0);
    return { ...mo, i, sdr, ae,
      pros: blocks.reduce((a, b) => a + b.rows[i].pros, 0),
      cual: blocks.reduce((a, b) => a + b.rows[i].cual, 0),
      dealsOpen: blocks.reduce((a, b) => a + b.rows[i].dealsOpen, 0),
      cli: blocks.reduce((a, b) => a + b.rows[i].cli, 0),
      cumCli: blocks.reduce((a, b) => a + b.rows[i].cumCli, 0),
      sdrGap: Math.max(0, Math.ceil(sdr) - p.sdr), aeGap: Math.max(0, Math.ceil(ae) - p.ae) };
  });

  return { def, months, blocks, totalRows, milestone, milestonePlano, baseCli, net, dealEff, winEff,
    peak: { sdr: Math.max(...totalRows.map(r => r.sdr)), ae: Math.max(...totalRows.map(r => r.ae)) },
    // ratios tesis de capacity, para poder discutirlos sin abrir el modelo
    ratios: {
      leadsPerSdrMonth, dealsPerAeMonth,
      leadsPerClient: 1 / (p.discRate * dealEff * winEff),
      discPerClient: 1 / (dealEff * winEff),
      dealsPerClient: 1 / winEff,
      clientsPerAeYear: dealsPerAeMonth * 12 * winEff,
      clientsPerSdrYear: leadsPerSdrMonth * 12 * p.discRate * dealEff * winEff,
    } };
};

// ============= PLAN DESDE LA CAPACIDAD =============
// Al revés que gtmTierMonthly: la plantilla por tier está fija y lo que se
// calcula es qué objetivo mensual sostiene. Cada mes lleva su restricción
// activa: leads de SDR, deals de AE o universo agotado.
// Tiers que se planifican juntos porque los lleva el mismo equipo. La clave es
// el tier que da nombre al bloque; el valor, los que absorbe.
window.GTM_MERGE = { midmkt: ['corp'] };
window.GTM_MERGE_LABEL = { midmkt: 'Mid Market + Corporate' };

window.gtmCapacityPlan = function (p, months) {
  months = months || window.GTM_H2027;
  const N = months.length;
  const state = window.gtmTierState();
  const caps = p.tierCaps || {};
  const startYear = months[0].y;

  // De mayor a menor tamaño de empresa, que es como se lee el mercado.
  const absorbidos = Object.values(window.GTM_MERGE || {}).flat();
  const orden = window.MKT_TIERS.slice().reverse().map(t => t.id)
    .filter(id => caps[id] && !absorbidos.includes(id));
  const blocks = orden.map(tierId => {
    const tier = window.MKT_TIERS.find(t => t.id === tierId);
    const merged = (window.GTM_MERGE || {})[tierId] || [];
    const base = state.find(s => s.tier.id === tierId);
    // Los tiers fusionados aportan su universo y su punto de partida.
    const st = merged.length ? merged.reduce((acc, id) => {
      const x = state.find(s => s.tier.id === id);
      if (!x) return acc;
      return { ...acc, universo: acc.universo + x.universo, impactado: acc.impactado + x.impactado,
        reunion: acc.reunion + x.reunion, deal: acc.deal + x.deal, cliente: acc.cliente + x.cliente };
    }, { ...base }) : base;
    const cap = caps[tierId];
    const leadsCap = cap.sdr * p.leadsPerSdrMonth;
    const dealsCap = cap.ae * p.dealsPerAeMonth;
    const sdrDealCap = cap.sdr * cap.dealsPerSdr;
    const pa = (p.partners || {})[tierId];
    const em = (p.embedded || {})[tierId];

    let pool = Math.max(0, st.universo - st.impactado);
    let pass = 1;
    // Dos contadores distintos: empresas únicas tocadas, que no puede pasar del
    // universo, y leads trabajados, que sí los repite la segunda pasada.
    let uniq = st.impactado, retouch = 0;
    const hsBase = p.useReal && window.HS_START ? window.HS_START[tierId] : null;
    const start = hsBase ? { clientes: hsBase.clientes + merged.reduce((a, id) => a + ((window.HS_START[id] || {}).clientes || 0), 0) } : null;
    let cumCual = st.reunion, cumDeal = st.deal, cumCli = start ? start.clientes : st.cliente;
    let cumPDeal = 0, cumPCli = 0;
    let cumFuDeal = 0, cumFuCli = 0, cumChurn = 0;
    let cumEDeal = 0, cumECli = 0;
    // Arranque de la cartera: los discovery ya hechos que no acabaron en cliente.
    let contactPool = Math.max(0, (st.reunion - st.cliente)) * p.contacts.seed;
    const dealsSeries = [];
    const rows = months.map((mo, i) => {
      const ramp = window.gtmRampAt(p, i);
      // Mismo tratamiento que en gtmSimulate: el SDR sigue trabajando cuando el
      // pozo se agota, pero sobre empresas ya tocadas y con la eficacia de
      // segunda pasada. Los leads no caen a cero mientras haya SDR contratados.
      let leads = 0, effW = 0, rest = leadsCap, guard = 0, fresh = 0, again = 0;
      while (rest > 0.01 && st.universo > 0.5 && guard++ < 200) {
        const take = Math.min(rest, pool);
        const f = Math.pow(p.retouch, pass - 1);
        leads += take; effW += take * f; rest -= take; pool -= take;
        if (pass === 1) fresh += take; else again += take;
        if (pool <= 0.5) { pool = st.universo; pass++; }
      }
      uniq = Math.min(st.universo, uniq + fresh);
      retouch += again;
      const passFactor = leads ? effW / leads : 1;
      const cual = leads * p.discRate * ramp * passFactor;
      // Partners primero: rampa de volumen y cierre en el mismo mes.
      // Techo del SDR primero: por bien que convierta la lista, el SDR no abre
      // más deals al mes de los que puede trabajar.
      const dealsRaw = cual * window.gtmDealRate(p);
      const dealsWanted = Math.min(dealsRaw, sdrDealCap);
      const sdrCapped = Math.max(0, dealsRaw - dealsWanted);
      const pDeals = !pa ? 0
        : i <= pa.rampMonths
          ? pa.startDeals + (pa.targetDeals - pa.startDeals) * (i / pa.rampMonths)
          : pa.targetDeals * Math.pow(1 + pa.growth, i - pa.rampMonths);
      const pCli = pDeals * (pa ? (p.useReal ? window.gtmWin(p, tierId, 'part') : pa.winRate) : 0);
      // Embedded: volumen y clientes con rampa propia. El cierre no se deriva de
      // una tasa sobre deals: el partner reporta deals y clientes por separado.
      const eDeals = !em ? 0
        : i <= em.rampMonths
          ? em.startDeals + (em.targetDeals - em.startDeals) * (i / em.rampMonths)
          : em.targetDeals * Math.pow(1 + em.growth, i - em.rampMonths);
      const eCli = !em ? 0
        : i <= em.rampMonths
          ? em.startCli + (em.targetCli - em.startCli) * (i / em.rampMonths)
          : em.targetCli * Math.pow(1 + em.growth, i - em.rampMonths);
      const C = p.contacts, pool0 = contactPool;
      const aeForOut = p.partnerUsesAe ? Math.max(0, dealsCap - pDeals) : dealsCap;
      const deals = Math.min(dealsWanted, aeForOut);
      const dealsLost = Math.max(0, dealsWanted - deals);
      // Lo que le queda al AE después de partners y outbound va a follow-up.
      const aeForFu = Math.max(0, dealsCap - (p.partnerUsesAe ? pDeals : 0) - deals);
      dealsSeries.push(deals);
      // Prima de encaje: decae hacia el régimen a medida que se agotan las
      // listas buenas. Y los deals que ya están abiertos hoy siguen madurando.
      const qp = 1 + (p.qualityPremium - 1) * Math.pow(p.qualityDecay, i);
      // Reparto del cierre alrededor del ciclo. Lo que cae antes del arranque
      // del plan lo cubre la cartera ya abierta, que también madura escalonada.
      let matured = 0;
      p.maturity.forEach((w, k) => {
        const lag = p.cycleMonths - 1 + k;
        const j = i - lag;
        matured += w * (j >= 0 ? dealsSeries[j] : st.deal * p.openingFlow);
      });
      const cli = matured * window.gtmWin(p, tierId, 'out') * qp;
      // Canal contactos: se toca una parte de la cartera, una parte reabre deal
      // y esos cierran mejor porque ya hubo discovery.
      const fuDone = pool0 * C.followUpShare;
      const fuDealsWanted = fuDone * C.dealRate;
      const fuDeals = Math.min(fuDealsWanted, aeForFu);
      // El contacto ya tuvo discovery: cierra como el canal partner del tier.
      const fuCli = fuDeals * (p.useReal ? window.gtmWin(p, tierId, 'part') * 0.75 : C.winRate);
      const churned = cumCli * C.churnMonthly;
      // La cartera crece con lo perdido de los tres canales y con el churn, y
      // baja con lo que se reabre y cierra.
      const lostOut = Math.max(0, matured - matured * p.winRate * qp);
      const lostPart = pDeals - pCli;
      contactPool = Math.max(0, contactPool + lostOut + lostPart + churned + (fuDeals - fuCli) - fuDeals);
      cumCual += cual; cumDeal += deals; cumCli += cli;
      cumPDeal += pDeals; cumPCli += pCli;
      cumFuDeal += fuDeals; cumFuCli += fuCli; cumChurn += churned;
      cumEDeal += eDeals; cumECli += eCli;
      cumCli -= churned;
      const limit = dealsLost > deals * 0.02 ? 'ae'
        : sdrCapped > dealsRaw * 0.02 ? 'sdrdeals'
        : pass > 1 ? 'pool' : 'sdr';
      return { ...mo, i, ramp, leads, leadsCap, cual, dealsRaw, dealsWanted, deals, dealsLost, dealsCap,
        sdrDealCap, sdrCapped,
        cli, cumPros: uniq, retouch, fresh, again, cumCual, cumDeal, cumCli, limit, pass, passFactor,
        aeLoad: (p.partnerUsesAe ? pDeals : 0) + deals + fuDeals + (em && em.usesAe ? eDeals : 0),
        aeUsed: ((p.partnerUsesAe ? pDeals : 0) + deals + fuDeals + (em && em.usesAe ? eDeals : 0)) / p.dealsPerAeMonth,
        pDeals, pCli, cumPDeal, cumPCli,
        contactPool: pool0, fuDone, fuDealsWanted, fuDeals, fuCli, churned,
        cumFuDeal, cumFuCli, cumChurn, aeForFu,
        em, eDeals, eCli, cumEDeal, cumECli,
        allDeals: deals + pDeals + fuDeals + eDeals, allCli: cli + pCli + fuCli + eCli,
        cumAllDeals: cumDeal + cumPDeal + cumFuDeal + cumEDeal,
        cumAllCli: cumCli + cumPCli + cumFuCli + cumECli,
        penAllCli: (cumCli + cumPCli + cumFuCli + cumECli) / st.universo,
        // "Sin tocar" no se rellena: una vez agotado el universo es cero, y el
        // pozo de repetición vive aparte con su propia etiqueta.
        untouched: Math.max(0, st.universo - uniq), retouchPool: pass > 1 ? pool : 0,
        penPros: uniq / st.universo, penCual: cumCual / st.universo, penCli: cumCli / st.universo,
        sdrUsed: leads / p.leadsPerSdrMonth, aeUsed: deals / p.dealsPerAeMonth };
    });
    const totDeals = rows.reduce((a, r) => a + r.deals, 0);
    const totPDeals = rows.reduce((a, r) => a + r.pDeals, 0);
    const totPCli = rows.reduce((a, r) => a + r.pCli, 0);
    const totFuDeals = rows.reduce((a, r) => a + r.fuDeals, 0);
    const totFuCli = rows.reduce((a, r) => a + r.fuCli, 0);
    const totChurn = rows.reduce((a, r) => a + r.churned, 0);
    const totEDeals = rows.reduce((a, r) => a + r.eDeals, 0);
    const totECli = rows.reduce((a, r) => a + r.eCli, 0);
    return { tier, cap, st, leadsCap, dealsCap, rows, totDeals, pa, totPDeals, totPCli,
      merged, label: merged.length ? (window.GTM_MERGE_LABEL[tierId] || tier.label) : tier.label,
      // El rango sale de MKT_BOUNDS, y al fusionar se toma el suelo del tier
      // base con el techo del último absorbido.
      rango: (() => {
        const b = window.MKT_BOUNDS[tierId];
        if (!b) return '';
        const eur = (v) => v === 0 ? '0' : v >= 1e6 ? (v / 1e6) + 'M€' : (v / 1e3) + 'k€';
        const abierto = (v) => v == null || !isFinite(v);
        if (!merged.length) return abierto(b[1]) ? eur(b[0]) + ' en adelante' : eur(b[0]) + ' – ' + eur(b[1]);
        const tops = merged.map(id => (window.MKT_BOUNDS[id] || [])[1]);
        if (abierto(b[1]) || tops.some(abierto)) return eur(b[0]) + ' en adelante';
        return eur(b[0]) + ' – ' + eur(Math.max(b[1], ...tops));
      })(),
      totFuDeals, totFuCli, totChurn, em, totEDeals, totECli,
      endAllCli: rows[N - 1].cumAllCli,
      totLeads: rows.reduce((a, r) => a + r.leads, 0),
      totRetouch: rows[N - 1].retouch,
      totCual: rows.reduce((a, r) => a + r.cual, 0),
      totCli: rows.reduce((a, r) => a + r.cli, 0),
      endCli: rows[N - 1].cumCli,
      objetivo: tier.targetClients,
      aeIdle: rows.reduce((a, r) => a + Math.max(0, r.dealsCap - r.aeLoad), 0),
      aeUse: rows.reduce((a, r) => a + r.aeLoad, 0) / (dealsCap * N),
      sdrDealCap, sdrDealUse: rows.reduce((a, r) => a + r.deals, 0) / (sdrDealCap * N),
      sdrCapped: rows.reduce((a, r) => a + r.sdrCapped, 0),
      sdrUse: rows.reduce((a, r) => a + r.leads, 0) / (leadsCap * N),
      dealsLost: rows.reduce((a, r) => a + r.dealsLost, 0),
      passes: rows[N - 1].pass,
      exhaustedAt: rows.findIndex(r => r.pass > 1),
      poolLeft: rows[N - 1].untouched };
  });

  const totalRows = months.map((mo, i) => ({
    ...mo, i,
    leads: blocks.reduce((a, b) => a + b.rows[i].leads, 0),
    cual: blocks.reduce((a, b) => a + b.rows[i].cual, 0),
    deals: blocks.reduce((a, b) => a + b.rows[i].deals, 0),
    cli: blocks.reduce((a, b) => a + b.rows[i].cli, 0),
    cumCli: blocks.reduce((a, b) => a + b.rows[i].cumCli, 0),
    pDeals: blocks.reduce((a, b) => a + b.rows[i].pDeals, 0),
    pCli: blocks.reduce((a, b) => a + b.rows[i].pCli, 0),
    contactPool: blocks.reduce((a, b) => a + b.rows[i].contactPool, 0),
    fuDone: blocks.reduce((a, b) => a + b.rows[i].fuDone, 0),
    fuDeals: blocks.reduce((a, b) => a + b.rows[i].fuDeals, 0),
    fuCli: blocks.reduce((a, b) => a + b.rows[i].fuCli, 0),
    churned: blocks.reduce((a, b) => a + b.rows[i].churned, 0),
    eDeals: blocks.reduce((a, b) => a + b.rows[i].eDeals, 0),
    eCli: blocks.reduce((a, b) => a + b.rows[i].eCli, 0),
    allDeals: blocks.reduce((a, b) => a + b.rows[i].allDeals, 0),
    allCli: blocks.reduce((a, b) => a + b.rows[i].allCli, 0),
    cumAllCli: blocks.reduce((a, b) => a + b.rows[i].cumAllCli, 0),
    sdr: Object.values(caps).reduce((a, c) => a + c.sdr, 0),
    ae: Object.values(caps).reduce((a, c) => a + c.ae, 0),
  }));

  // Una sola base para todo: la de los tiers fusionados con el recuento real de
  // HubSpot. Antes había dos cuentas — una con fallback al cliente derivado de
  // los tiers sin dato en HS_START, fraccionario — y el hito salía de esa
  // mientras la tarjeta pintaba la otra: 335 contra una base de 212 que da 334.
  const baseCli = blocks.reduce((a, b) => {
    if (!(p.useReal && window.HS_START)) return a + b.st.cliente;
    return a + b.merged.reduce((x, id) => x + ((window.HS_START[id] || {}).clientes || 0), (window.HS_START[b.tier.id] || {}).clientes || 0);
  }, 0);
  const milestone = window.gtmHito(p, months[N - 1].y, baseCli);
  const milestonePlano = p.target * (window.GTM_BP_SHAPE.find(s => s.year === months[N - 1].y) || { cum: 0.18 }).cum;
  const endCli = blocks.reduce((a, b) => a + b.endAllCli, 0);
  const endOut = blocks.reduce((a, b) => a + b.endCli, 0);
  const totDeals = blocks.reduce((a, b) => a + b.totDeals, 0);
  const totPDeals = blocks.reduce((a, b) => a + b.totPDeals, 0);
  const totPCli = blocks.reduce((a, b) => a + b.totPCli, 0);
  const totFuDeals = blocks.reduce((a, b) => a + b.totFuDeals, 0);
  const totFuCli = blocks.reduce((a, b) => a + b.totFuCli, 0);
  const totChurn = blocks.reduce((a, b) => a + b.totChurn, 0);
  const totEDeals = blocks.reduce((a, b) => a + b.totEDeals, 0);
  const totECli = blocks.reduce((a, b) => a + b.totECli, 0);

  return { months, blocks, totalRows, milestone, baseCli, endCli, endOut, totDeals, totPDeals, totPCli,
    totFuDeals, totFuCli, totChurn, totEDeals, totECli,
    embeddedShare: endCli - baseCli > 0 ? totECli / (endCli - baseCli) : 0,
    contactShare: endCli - baseCli > 0 ? totFuCli / (endCli - baseCli) : 0,
    net: endCli - baseCli,
    partnerShare: endCli - baseCli > 0 ? totPCli / (endCli - baseCli) : 0,
    // La incógnita útil: con esta capacidad, qué cierre hace falta para el hito.
    milestonePlano,
    winNeeded: totDeals ? (milestone - baseCli) / totDeals : Infinity,
    winNow: p.winRate,
    gap: milestone - endCli,
    sdr: Object.values(caps).reduce((a, c) => a + c.sdr, 0),
    ae: Object.values(caps).reduce((a, c) => a + c.ae, 0) };
};

// ============= LOANBOOK POR SEGMENTO =============
// Ticket medio de línea por tier. Mid Market y SME Big los fija dirección; el
// resto es el ticket real medido en HubSpot, para no inventar donde hay dato.
// Objetivo de clientes a cierre de 2029, por dirección. El bloque de Mid Market
// incluye Corporate, que se planifica con él.
window.GTM_OBJ_2029 = {
  midmkt: { cli: 400, fuente: 'dirección', antes: 405, antesFuente: 'MKT_TIERS · 375 Mid Market + 30 Corporate' },
  big:    { cli: 800, fuente: 'dirección', antes: 750, antesFuente: 'MKT_TIERS' },
};
window.gtmObjetivo = function (ids, p) {
  const ov = p && p.objByTier ? p.objByTier[ids[0]] : null;
  if (ov != null) {
    const base = window.GTM_OBJ_2029[ids[0]] || {};
    return { cli: ov, fuente: base.fuente || 'dirección', antes: base.antes, antesFuente: base.antesFuente };
  }
  // Un bloque toma el objetivo de dirección del tier que le da nombre; si no
  // hay, cae al targetClients del plan de mercado de los tiers que absorbe.
  const dir = window.GTM_OBJ_2029[ids[0]];
  if (dir) return { cli: dir.cli, fuente: dir.fuente, antes: dir.antes, antesFuente: dir.antesFuente };
  const cli = ids.reduce((a, id) => {
    const t = window.MKT_TIERS.find(x => x.id === id);
    return a + (t ? t.targetClients || 0 : 0);
  }, 0);
  return { cli, fuente: 'plan de mercado' };
};

window.GTM_TICKET = {
  midmkt: { eur: 2000000, fuente: 'dirección' },
  corp:   { eur: 2000000, fuente: 'dirección · igual que Mid Market' },
  big:    { eur: 350000,  fuente: 'dirección' },
  mid:    { eur: 94570,   fuente: 'HubSpot · 106 ganados' },
  small:  { eur: 83633,   fuente: 'HubSpot · 76 ganados' },
  micro:  { eur: 40000,   fuente: 'estimado · sin muestra' },
};

window.gtmTicket = function (tierId, p) {
  const ov = p && p.ticketByTier ? p.ticketByTier[tierId] : null;
  if (ov != null) return ov;
  return (window.GTM_TICKET[tierId] || {}).eur || 0;
};

// Loanbook a cierre de 2029: clientes acumulados de cada bloque por su ticket.
// Corre el plan de capacidad sobre el horizonte completo, así que el número no
// es un objetivo escrito a mano sino lo que la plantilla y los canales dan.
window.gtmLoanbook = function (p, months, base) {
  const ms = months || window.GTM_MONTHS;
  const modo = base || 'objetivo';
  const util = p.utilizacion == null ? 0.60 : p.utilizacion;
  const cp = window.gtmCapacityPlan(p, ms);
  const N = ms.length;
  const rows = cp.blocks.map(b => {
    const r = b.rows[N - 1];
    // El ticket de un bloque fusionado se pondera por los clientes de partida
    // de cada tier que absorbe, que es lo único que sabemos de su mezcla.
    const ids = [b.tier.id].concat(b.merged || []);
    const pesos = ids.map(id => ((window.HS_START || {})[id] || {}).clientes || 0);
    const sum = pesos.reduce((a, x) => a + x, 0);
    const ticket = sum
      ? ids.reduce((a, id, i) => a + window.gtmTicket(id, p) * pesos[i], 0) / sum
      : window.gtmTicket(b.tier.id, p);
    // Objetivo de clientes del bloque: la suma de los targetClients de los
    // tiers que absorbe, que es la cifra de penetración del plan de mercado.
    const obj = window.gtmObjetivo(ids, p);
    const objetivo = obj.cli;
    const entrega = r.cumAllCli;
    const cli = modo === 'objetivo' ? objetivo : entrega;
    return { id: b.tier.id, label: b.label, color: b.tier.color, rango: b.rango,
      focus: b.tier.focus, ids, ticket, objetivo, objFuente: obj.fuente,
      objAntes: obj.antes, objAntesFuente: obj.antesFuente, entrega,
      cumple: objetivo ? entrega / objetivo : null,
      ticketFuente: (window.GTM_TICKET[b.tier.id] || {}).fuente,
      cli, base: cp.blocks.length ? (ids.reduce((a, id) => a + (((window.HS_START || {})[id] || {}).clientes || 0), 0)) : 0,
      lineas: cli * ticket,
      loanbook: cli * ticket * util,
      loanbookObj: objetivo * ticket * util,
      loanbookCap: entrega * ticket * util,
      serie: b.rows.map(x => ({ id:x.id, label:x.label, y:x.y, m:x.m, eur: x.cumAllCli * ticket * util })) };
  }).sort((a, b) => b.loanbook - a.loanbook);
  const total = rows.reduce((a, r) => a + r.loanbook, 0);
  const lineasTot = rows.reduce((a, r) => a + r.lineas, 0);
  const cliTot = rows.reduce((a, r) => a + r.cli, 0);
  rows.forEach(r => { r.peso = total ? r.loanbook / total : 0; r.pesoCli = cliTot ? r.cli / cliTot : 0; });
  const foco = rows.filter(r => r.focus);
  return { rows, total, cliTot, months: ms, foco, modo, util, lineasTot,
    objTotal: rows.reduce((a, r) => a + r.loanbookObj, 0),
    capTotal: rows.reduce((a, r) => a + r.loanbookCap, 0),
    objCli: rows.reduce((a, r) => a + r.objetivo, 0),
    capCli: rows.reduce((a, r) => a + r.entrega, 0),
    focoTotal: foco.reduce((a, r) => a + r.loanbook, 0),
    focoLineas: foco.reduce((a, r) => a + r.lineas, 0),
    focoCli: foco.reduce((a, r) => a + r.cli, 0),
    // Motor y población, para que el bloque pueda declararlos en pantalla.
    motor: 'gtmCapacityPlan · cinco tiers y cuatro canales',
    canales: 'outbound, partners, contactos y embedded',
    ticketMedio: cliTot ? lineasTot / cliTot : null,
    saldoPorCliente: cliTot ? total / cliTot : null,
    serie: ms.map((mo, i) => ({ ...mo, eur: rows.reduce((a, r) => a + r.serie[i].eur, 0) })) };
};

// ============= EVOLUCIÓN DE CLIENTES Y TICKET =============
// Clientes acumulados y ticket medio ponderado trimestre a trimestre hasta
// 2029. El ticket medio se mueve solo: no es un supuesto, es el resultado de
// que la mezcla de tiers cambie con el tiempo.
window.gtmEvolucion = function (p, months, base) {
  const ms = months || window.GTM_MONTHS;
  const lb = window.gtmLoanbook(p, ms, base || 'capacidad');
  const cp = window.gtmCapacityPlan(p, ms);
  const N = ms.length;

  // Serie mensual: clientes y libro de cada bloque, con su ticket.
  const serie = ms.map((mo, i) => {
    const porTier = cp.blocks.map(b => {
      const row = lb.rows.find(r => r.id === b.tier.id) || {};
      const cli = b.rows[i].cumAllCli;
      return { id:b.tier.id, label:b.label, color:b.tier.color, focus:b.tier.focus,
        cli, ticket: row.ticket || 0, eur: cli * (row.ticket || 0),
        nuevos: b.rows[i].allCli };
    });
    const cli = porTier.reduce((a, x) => a + x.cli, 0);
    const eur = porTier.reduce((a, x) => a + x.eur, 0);
    return { ...mo, i, porTier, cli, eur, nuevos: porTier.reduce((a, x) => a + x.nuevos, 0),
      ticket: cli ? eur / cli : null,
      focoCli: porTier.filter(x => x.focus).reduce((a, x) => a + x.cli, 0),
      focoEur: porTier.filter(x => x.focus).reduce((a, x) => a + x.eur, 0) };
  });

  // Agrupado por trimestre y por año, con el cierre de cada periodo.
  const grupo = (clave) => {
    const out = [];
    serie.forEach(r => {
      const k = clave(r);
      let a = out.find(x => x.key === k);
      if (!a) out.push(a = { key:k, label:k, rows:[] });
      a.rows.push(r);
    });
    return out.map(a => {
      const last = a.rows[a.rows.length - 1];
      const first = a.rows[0];
      const prevCli = first.i > 0 ? serie[first.i - 1].cli : (serie[0].cli - serie[0].nuevos);
      const prevEur = first.i > 0 ? serie[first.i - 1].eur : 0;
      return { ...a, cli: last.cli, eur: last.eur, ticket: last.ticket,
        focoCli: last.focoCli, focoEur: last.focoEur,
        nuevos: a.rows.reduce((x, r) => x + r.nuevos, 0),
        altaEur: last.eur - prevEur,
        // Ticket de la cohorte del periodo: euros nuevos entre clientes nuevos.
        ticketCohorte: (last.cli - prevCli) > 0 ? (last.eur - prevEur) / (last.cli - prevCli) : null,
        porTier: last.porTier };
    });
  };

  const quarters = grupo(r => 'Q' + Math.ceil(r.m / 3) + ' ' + r.y);
  const years = grupo(r => String(r.y));
  const fin = serie[N - 1];
  return { serie, quarters, years, months: ms, rows: lb.rows,
    fin, cliFin: fin.cli, eurFin: fin.eur, ticketFin: fin.ticket,
    ticketIni: serie[0].ticket,
    base: base || 'capacidad' };
};

// ============= PLAN TRIMESTRAL HASTA 2029 =============
// El mismo plan de capacidad que la pestaña 2027, agregado a trimestres y
// extendido a todo el horizonte. Los flujos se suman; los stocks y los
// acumulados toman el valor del último mes del trimestre, que es su cierre.
window.GTM_Q_FLUJOS = ['leads','cual','deals','cli','pDeals','pCli','fuDone','fuDeals','fuCli','eDeals','eCli','allDeals','allCli','dealsLost','sdrCapped','churned','again','fresh'];
window.GTM_Q_CIERRE = ['cumPros','cumCual','cumDeal','cumCli','cumPDeal','cumPCli','cumFuDeal','cumFuCli','cumEDeal','cumECli','cumAllDeals','cumAllCli','penPros','penCual','penCli','penAllCli','untouched','contactPool','pass','ramp','leadsCap','dealsCap','sdrDealCap'];

window.gtmQuarterly = function (p, months) {
  const ms = months || window.GTM_MONTHS;
  const cp = window.gtmCapacityPlan(p, ms);
  // Siempre capacidad: las filas son la trayectoria que entregan los canales.
  // El objetivo de penetración se adjunta como referencia de cierre, no como
  // serie, porque MKT_TIERS da un objetivo final y no un reparto temporal.
  const lb = window.gtmLoanbook(p, ms, 'capacidad');
  const lbObj = window.gtmLoanbook(p, ms, 'objetivo');

  // Índices de los meses de cada trimestre, en orden.
  const qs = [];
  ms.forEach((mo, i) => {
    const k = 'Q' + Math.ceil(mo.m / 3) + ' ' + String(mo.y).slice(2);
    let q = qs.find(x => x.id === k);
    if (!q) qs.push(q = { id:k, label:k, y:mo.y, q:Math.ceil(mo.m / 3), idx:[] });
    q.idx.push(i);
  });
  // Un trimestre que no tiene sus tres meses se marca: el plan arranca en sep.
  qs.forEach(q => { q.parcial = q.idx.length < 3; q.meses = q.idx.length; });

  const agg = (rows) => qs.map(q => {
    const out = { ...q };
    window.GTM_Q_FLUJOS.forEach(k => { out[k] = q.idx.reduce((a, i) => a + (rows[i][k] || 0), 0); });
    const last = rows[q.idx[q.idx.length - 1]];
    window.GTM_Q_CIERRE.forEach(k => { out[k] = last[k]; });
    // Las medias por persona se recalculan sobre el trimestre, no se suman.
    out.aeLoad = q.idx.reduce((a, i) => a + (rows[i].aeLoad || 0), 0);
    return out;
  });

  const blocks = cp.blocks.map(b => {
    const row = lb.rows.find(r => r.id === b.tier.id) || {};
    const rows = agg(b.rows);
    const util = p.utilizacion == null ? 0.60 : p.utilizacion;
    rows.forEach(r => {
      r.lineas = r.cumAllCli * (row.ticket || 0);
      r.eur = r.lineas * util;
      // Cuota de mercado: clientes sobre el universo del tramo.
      r.share = b.st.universo ? r.cumAllCli / b.st.universo : null;
    });
    return { ...b, rows, ticket: row.ticket || 0, objetivo: row.objetivo || 0 };
  });

  const totalRows = qs.map((q, k) => ({ ...q,
    leads: blocks.reduce((a, b) => a + b.rows[k].leads, 0),
    allDeals: blocks.reduce((a, b) => a + b.rows[k].allDeals, 0),
    allCli: blocks.reduce((a, b) => a + b.rows[k].allCli, 0),
    cli: blocks.reduce((a, b) => a + b.rows[k].cli, 0),
    pCli: blocks.reduce((a, b) => a + b.rows[k].pCli, 0),
    fuCli: blocks.reduce((a, b) => a + b.rows[k].fuCli, 0),
    eCli: blocks.reduce((a, b) => a + b.rows[k].eCli, 0),
    cumAllCli: blocks.reduce((a, b) => a + b.rows[k].cumAllCli, 0),
    cumAllDeals: blocks.reduce((a, b) => a + b.rows[k].cumAllDeals, 0),
    eur: blocks.reduce((a, b) => a + b.rows[k].eur, 0),
    lineas: blocks.reduce((a, b) => a + b.rows[k].lineas, 0),
    universo: blocks.reduce((a, b) => a + b.st.universo, 0),
    sdr: blocks.reduce((a, b) => a + b.cap.sdr, 0),
    ae: blocks.reduce((a, b) => a + b.cap.ae, 0),
  }));
  totalRows.forEach(r => {
    r.ticket = r.cumAllCli ? r.lineas / r.cumAllCli : null;
    r.share = r.universo ? r.cumAllCli / r.universo : null;
  });

  return { quarters: qs, blocks, totalRows, cp, lb,
    base: 'capacidad',
    // Referencia de cierre del objetivo de penetración, para poder citarla sin
    // fingir que la tabla la recorre.
    obj: { total: lbObj.total, lineas: lbObj.lineasTot, cli: lbObj.cliTot,
      focoTotal: lbObj.focoTotal, focoLineas: lbObj.focoLineas,
      focoCli: lbObj.foco.reduce((a, r) => a + r.cli, 0),
      rows: lbObj.rows },
    util: p.utilizacion == null ? 0.60 : p.utilizacion,
    fin: totalRows[totalRows.length - 1] };
};

// ============= UNICORN · MASTER PLAN =============
// Unicorn es el plan maestro de largo plazo y solo juega con cuatro dimensiones:
// clientes, línea media, utilización y cuota de mercado. Deals, conversiones,
// precios y encaje son tácticos y viven en las pestañas de canal y funnel: aquí
// meterlos obliga a modelar la causalidad entre ellos y el plan deja de ser
// legible. Así que el modelo es descendente: se fija el objetivo de 2029 y se
// reparte hacia atrás con la forma del BP, anclado en la base real de hoy.
window.MASTER_TIERS = ['corp', 'midmkt', 'big', 'mid', 'small'];
// Unicorn no fusiona: cada segmento lleva su objetivo y su línea.
window.MASTER_NO_MERGE = true;
// Factor de ambición para los segmentos que dirección no ha cifrado a mano:
// se parte del BP y se multiplica, declarándolo en pantalla. Mid Market y SME
// Big llevan cifra propia (400 y 800) y no usan el factor.
window.GTM_AMB_FACTOR = 1.5;

// Forma del recorrido base→objetivo. Los vértices son los cierres de año del
// BP; entre ellos se interpola mes a mes para que no haya escalones en enero.
// El cero de las dos curvas se ancla en el último mes medido: antes de ahí hay
// cartera real, no plan, y el recorrido empieza donde acaba la medición.
window.MASTER_T0 = function () {
  const k = window.PF_META ? window.PF_META.realHasta : '2026-07';
  const [y, m] = k.split('-').map(Number);
  return y + (m - 12) / 12;
};
window.masterShape = function (y, m) {
  const sh = window.GTM_BP_SHAPE;
  const t = y + (m - 12) / 12;   // posición continua, con dic como entero
  const t0 = window.MASTER_T0();
  if (t <= t0) return 0;

  // Curva acumulada del BP interpolada en t, extendida hacia atrás desde el
  // primer vértice para que el arranque tenga pendiente.
  const cumAt = (x) => {
    if (x >= sh[sh.length - 1].year) return sh[sh.length - 1].cum;
    if (x <= sh[0].year) {
      // Antes del primer cierre de año: se prolonga la pendiente del primer
      // tramo, de modo que el arranque crece en vez de quedarse plano.
      const a = sh[0], b = sh[1];
      const pend = (b.cum - a.cum) / (b.year - a.year);
      return Math.max(0, a.cum + (x - a.year) * pend);
    }
    for (let i = 0; i < sh.length - 1; i++) {
      if (x <= sh[i + 1].year) {
        const a = sh[i], b = sh[i + 1];
        return a.cum + (b.cum - a.cum) * (x - a.year) / (b.year - a.year);
      }
    }
    return 1;
  };

  // Reescalado: el cero es el arranque del plan y el uno el cierre de 2029.
  const c0 = cumAt(t0), c1 = sh[sh.length - 1].cum;
  const c = cumAt(t);
  return c1 > c0 ? Math.min(1, Math.max(0, (c - c0) / (c1 - c0))) : 0;
};

// Forma con crecimiento fuerte al final. Los vértices son los mismos años del
// BP pero el acumulado se retrasa: 2% en 2026, 8% en 2027, 40% en 2028 y 100%
// en 2029, de modo que dos tercios del recorrido caen en los dos últimos años.
window.GTM_LATE_SHAPE = [
  { year:2026, cum:0.02 }, { year:2027, cum:0.08 },
  { year:2028, cum:0.40 }, { year:2029, cum:1.00 },
];
window.masterShapeLate = function (y, m) {
  const sh = window.GTM_LATE_SHAPE;
  const t = y + (m - 12) / 12;
  const t0 = window.MASTER_T0();
  if (t <= t0) return 0;
  const cumAt = (x) => {
    if (x >= sh[sh.length - 1].year) return sh[sh.length - 1].cum;
    if (x <= sh[0].year) {
      const a = sh[0], b = sh[1];
      return Math.max(0, a.cum + (x - a.year) * (b.cum - a.cum) / (b.year - a.year));
    }
    for (let i = 0; i < sh.length - 1; i++) {
      if (x <= sh[i + 1].year) {
        const a = sh[i], b = sh[i + 1];
        return a.cum + (b.cum - a.cum) * (x - a.year) / (b.year - a.year);
      }
    }
    return 1;
  };
  const c0 = cumAt(t0), c1 = sh[sh.length - 1].cum, c = cumAt(t);
  return c1 > c0 ? Math.min(1, Math.max(0, (c - c0) / (c1 - c0))) : 0;
};

window.gtmMaster = function (p, months) {
  const ms = months || (window.pfMonths ? window.pfMonths('2026-01', '2029-12') : window.GTM_MONTHS);
  const util = p.utilizacion == null ? 0.60 : p.utilizacion;
  const state = window.gtmTierState();

  const fact = window.mktFacturacionMedia ? window.mktFacturacionMedia() : {};
  const tiers = window.MASTER_TIERS.map(id => {
    const tier = window.MKT_TIERS.find(t => t.id === id);
    const merged = window.MASTER_NO_MERGE ? [] : ((window.GTM_MERGE || {})[id] || []);
    const ids = [id].concat(merged);
    const universo = ids.reduce((a, k) => {
      const s = state.find(x => x.tier.id === k);
      return a + (s ? s.universo : 0);
    }, 0);
    // Base de partida: la cartera real medida, no el recuento de deals ganados
    // de HubSpot. Es la misma cifra que Portfolio y BP Serie A.
    const r0 = window.PF_REAL ? (window.PF_REAL[id] || {}) : {};
    const base = ((r0.clientes || {})[window.PF_META ? window.PF_META.realHasta : ''] || 0);
    // Objetivo: la cifra de dirección si la hay; si no, el BP escalado por el
    // factor de ambición. No se usa targetClients de MKT_TIERS, que son
    // objetivos de penetración de otro ejercicio (5.000 en Small) y no tesis.
    const bpCli = ((window.PF_BP[id] || {}).clientes || {})['2029-12'];
    const shareObj = p && p.shareByTier ? p.shareByTier[id] : null;
    const dir = p && p.objByTier ? p.objByTier[id] : null;
    const obj = shareObj != null && universo
      ? { cli: Math.round(universo * shareObj), fuente: 'cuota ' + (shareObj * 100).toFixed(1).replace('.', ',') + '%', share: shareObj }
      : dir != null
        ? { cli: dir, fuente: 'dirección' }
        : { cli: bpCli ? Math.round(bpCli * window.GTM_AMB_FACTOR / 5) * 5 : 0,
            fuente: 'BP ×' + String(window.GTM_AMB_FACTOR).replace('.', ',') };
    // Los segmentos de arranque tardío usan la curva retrasada.
    const late = !!(p && p.lateByTier && p.lateByTier[id]);
    // Línea media: la de dirección si la hay; si no, la del BP a dic-29, que es
    // dato observado del plan y no un supuesto nuevo.
    const dirT = p && p.ticketByTier ? p.ticketByTier[id] : null;
    const bpLin = ((window.PF_BP[id] || {}).linea || {})['2029-12'];
    const ticket = dirT != null ? dirT : (bpLin ? bpLin * 1e3 : 0);
    // Punto de partida de la línea: la real de la cartera si existe, y si no la
    // del BP en ese mes, que es lo observado.
    const k0 = window.PF_META ? window.PF_META.realHasta : '2026-07';
    const realLin = ((r0.ticketLinea || {})[k0]);
    const bpLin0 = ((window.PF_BP[id] || {}).linea || {})[k0];
    const ticket0 = realLin || (bpLin0 ? bpLin0 * 1e3 : ticket);

    const rows = ms.map(mo => {
      const f = late ? window.masterShapeLate(mo.y, mo.m) : window.masterShape(mo.y, mo.m);
      // El recorrido arranca en el último mes medido: antes de ahí no hay plan
      // que afirmar, solo cartera real. Emitir el valor base pintaba 52 clientes
      // donde el real decía 59 y parecía que la cartera caía.
      const antes = window.PF_META && mo.id < window.PF_META.realHasta;
      const cli = antes ? null : base + (obj.cli - base) * f;
      // Línea media con recorrido: de la del BP a la objetivo, con la misma
      // curva que los clientes. Sin esto el plan asumiría la línea final desde
      // el primer trimestre, que es lo que infla el loanbook de arranque.
      const lin = antes ? null : (p && p.ticketRampa && ticket0 ? ticket0 + (ticket - ticket0) * f : ticket);
      const lineas = antes ? null : cli * lin;
      const r = window.PF_REAL ? (window.PF_REAL[id] || {}) : {};
      const medido = window.PF_META && mo.id <= window.PF_META.realHasta;
      return { ...mo, f, cli, lineas, eur: antes ? null : lineas * util,
        linea: lin, util: antes ? null : util,
        share: antes || !universo ? null : cli / universo,
        sobreObj: antes || !obj.cli ? null : cli / obj.cli,
        real: medido && (r.clientes || {})[mo.id] != null
          ? { cli: r.clientes[mo.id], out: (r.outstanding || {})[mo.id] } : null };
    });
    return { id, label: merged.length ? (window.GTM_MERGE_LABEL[id] || tier.label) : tier.label,
      color: tier.color, ids, universo, base, ticket, util,
      objetivo: obj.cli, objFuente: obj.fuente, objAntes: obj.antes, objAntesFuente: obj.antesFuente,
      rango: (() => {
        const b = window.MKT_BOUNDS[id] || [];
        const eur = (v) => v === 0 ? '0' : v >= 1e6 ? (v / 1e6) + 'M€' : (v / 1e3) + 'k€';
        const tops = merged.map(k => (window.MKT_BOUNDS[k] || [])[1]);
        const abierto = (v) => v == null || !isFinite(v);
        if (!merged.length) return abierto(b[1]) ? eur(b[0]) + ' en adelante' : eur(b[0]) + ' – ' + eur(b[1]);
        if (abierto(b[1]) || tops.some(abierto)) return eur(b[0]) + ' en adelante';
        return eur(b[0]) + ' – ' + eur(Math.max(b[1], ...tops));
      })(),
      rows, fin: rows[rows.length - 1], objetivo: obj.cli, objFuente: obj.fuente,
      objShare: obj.share, late, ticket, ticket0,
      factMedia: fact[id] || null,
      // Rango del tramo, de los mismos límites que definen el universo.
      bounds: window.MKT_BOUNDS[id] || null,
      // Solo el tier abierto por arriba tiene subsegmento sobre el techo.
      sobreTecho: (window.MKT_BOUNDS[id] || [])[1] == null && window.mktSobreTecho
        ? window.mktSobreTecho() : null,
      // Qué parte de la facturación media del tier representa la línea. Es el
      // contraste que dice si el límite es plausible para ese tamaño.
      ratioFact: fact[id] ? ticket / fact[id] : null,
      ratioFact0: fact[id] ? ticket0 / fact[id] : null,
      bpCli: ((window.PF_BP[id] || {}).clientes || {})['2029-12'],
      bpEur: ((window.PF_BP[id] || {}).loanbook || {})['2029-12'] != null ? window.PF_BP[id].loanbook['2029-12'] * 1e6 : null,
      foco: !!(tier && tier.focus) };
  });

  // Agregado: la línea media del conjunto es ponderada, no una media simple.
  const totalRows = ms.map((mo, i) => {
    const antes = window.PF_META && mo.id < window.PF_META.realHasta;
    const cli = antes ? null : tiers.reduce((a, t) => a + t.rows[i].cli, 0);
    const lineas = antes ? null : tiers.reduce((a, t) => a + t.rows[i].lineas, 0);
    const uni = tiers.reduce((a, t) => a + t.universo, 0);
    const sub = tiers.map(t => t.rows[i]);
    const rc = sub.filter(x => x.real);
    return { ...mo, cli, lineas, eur: antes ? null : lineas * util,
      ticket: cli ? lineas / cli : null, linea: cli ? lineas / cli : null,
      util: antes ? null : util,
      share: antes || !uni ? null : cli / uni,
      real: rc.length ? { cli: rc.reduce((a, x) => a + x.real.cli, 0), out: rc.reduce((a, x) => a + (x.real.out || 0), 0) } : null };
  });

  // Trimestres: el cierre de cada uno, porque todo son stocks.
  const qs = [];
  ms.forEach((mo, i) => {
    const k = 'Q' + Math.ceil(mo.m / 3) + ' ' + String(mo.y).slice(2);
    let q = qs.find(x => x.id === k);
    if (!q) qs.push(q = { id:k, label:k, y:mo.y, q:Math.ceil(mo.m / 3), idx:[] });
    q.idx.push(i);
  });
  const cierre = (rows) => qs.map(q => ({ ...q, ...rows[q.idx[q.idx.length - 1]] }));
  tiers.forEach(t => { t.q = cierre(t.rows); });

  const objCli = tiers.reduce((a, t) => a + t.objetivo, 0);
  const baseCli = tiers.reduce((a, t) => a + t.base, 0);
  const uni = tiers.reduce((a, t) => a + t.universo, 0);
  return { months: ms, quarters: qs, tiers, totalRows, total: cierre(totalRows),
    util, objCli, baseCli, universo: uni, fact,
    realHasta: window.PF_META ? window.PF_META.realHasta : null,
    fin: totalRows[totalRows.length - 1],
    // Años, para la lectura de consejo.
    years: [2026, 2027, 2028, 2029].map(y => {
      const r = totalRows.filter(x => x.y === y && x.cli != null).pop();
      const prev = totalRows.filter(x => x.y === y - 1 && x.cli != null).pop();
      return { y, ...r, nuevos: r ? r.cli - (prev ? prev.cli : baseCli) : null };
    }) };
};

// ============= MASTER PLAN SOBRE EL BP REAL =============
// El BP de Report_líneas_vs_outstanding trae la serie mensual por segmento de
// clientes, línea media, líneas, utilización y loanbook. No hay nada que
// interpolar ni repartir: se lee literal. Y arranca de la cartera real, que
// está medida hasta jul-26.
window.gtmMasterBp = function (p, opts) {
  const o = opts || {};
  const ms = window.pfMonths('2026-01', '2029-12');
  const segs = window.PF_SEGS.filter(s => o.scope === 'foco' ? s.foco : true);
  const state = window.gtmTierState ? window.gtmTierState() : [];
  const uniDe = (id) => {
    const map = { corp:'corp', midmkt:'midmkt', big:'big', mid:'mid', small:'small' };
    const s = state.find(x => x.tier.id === map[id]);
    return s ? s.universo : null;
  };

  const tiers = segs.map(s => {
    const b = window.PF_BP[s.id] || {};
    const r = window.PF_REAL[s.id] || {};
    const rows = ms.map(mo => {
      const k = mo.id;
      const cli = (b.clientes || {})[k];
      const medido = k <= window.PF_META.realHasta;
      const real = medido && (r.clientes || {})[k] != null
        ? { cli: r.clientes[k], out: (r.outstanding || {})[k], lineas: (r.lineas || {})[k] } : null;
      const uni = uniDe(s.id);
      return { ...mo, cli,
        linea: (b.linea || {})[k] != null ? b.linea[k] * 1e3 : null,
        lineas: (b.lineas || {})[k] != null ? b.lineas[k] * 1e6 : null,
        util: (b.util || {})[k],
        eur: (b.loanbook || {})[k] != null ? b.loanbook[k] * 1e6 : null,
        share: uni && cli != null ? cli / uni : null,
        real };
    });
    const fin = rows[rows.length - 1];
    return { id: s.id, label: s.label, color: s.color, foco: s.foco,
      universo: uniDe(s.id), rows, fin,
      objetivo: fin.cli, objFuente: 'BP' };
  });

  const bt = window.PF_BP.total || {};
  const totalRows = ms.map(mo => {
    const k = mo.id;
    const sub = tiers.map(t => t.rows.find(x => x.id === k));
    const cli = sub.reduce((a, x) => a + (x.cli || 0), 0);
    const lineas = sub.reduce((a, x) => a + (x.lineas || 0), 0);
    const eur = sub.reduce((a, x) => a + (x.eur || 0), 0);
    const uni = tiers.reduce((a, t) => a + (t.universo || 0), 0);
    const rc = sub.reduce((a, x) => a + (x.real ? x.real.cli : 0), 0);
    const ro = sub.reduce((a, x) => a + (x.real ? (x.real.out || 0) : 0), 0);
    const hayReal = sub.some(x => x.real);
    return { ...mo, cli, lineas, eur,
      linea: cli ? lineas / cli : null,
      util: lineas ? eur / lineas : null,
      share: uni ? cli / uni : null,
      real: hayReal ? { cli: rc, out: ro } : null };
  });

  const qs = [];
  ms.forEach((mo, i) => {
    const k = 'Q' + Math.ceil(mo.m / 3) + ' ' + String(mo.y).slice(2);
    let q = qs.find(x => x.id === k);
    if (!q) qs.push(q = { id:k, label:k, y:mo.y, q:Math.ceil(mo.m / 3), idx:[] });
    q.idx.push(i);
  });
  const cierre = (rows) => qs.map(q => ({ ...q, ...rows[q.idx[q.idx.length - 1]] }));
  tiers.forEach(t => { t.q = cierre(t.rows); });

  return { months: ms, quarters: qs, tiers, totalRows, total: cierre(totalRows),
    fin: totalRows[totalRows.length - 1],
    objCli: tiers.reduce((a, t) => a + (t.objetivo || 0), 0),
    universo: tiers.reduce((a, t) => a + (t.universo || 0), 0),
    realHasta: window.PF_META.realHasta,
    years: [2026, 2027, 2028, 2029].map(y => {
      const r = totalRows.filter(x => x.y === y).pop();
      const prev = totalRows.filter(x => x.y === y - 1).pop();
      return { y, ...r, nuevos: r.cli - (prev ? prev.cli : 0) };
    }) };
};

// ============= VISIÓN 2031 · SME MID Y SMALL =============
// Los dos segmentos de cola larga no acaban en 2029: su tesis es de penetración
// y el objetivo de largo plazo es el 3% de cuota. Se modela como extensión del
// master plan, no dentro de él, porque el horizonte del BP y del plan del
// equipo es dic-2029 y mezclar horizontes haría incomparables las cifras.
window.GTM_VISION = {
  hasta: '2031-12',
  shareObjetivo: 0.03,
  // De mayor a menor, como en Unicorn.
  tiers: ['corp', 'midmkt', 'big', 'mid', 'small', 'micro'],
  // La cola larga va al 3% de cuota y su fecha está por planificar; los tres de
  // foco alcanzan su SOM dentro del horizonte del plan, en 2029.
  porCuota: ['mid', 'small', 'micro'],
  foco: ['corp', 'midmkt', 'big'],
  anioFoco: 2029,
  // Línea media objetivo de los segmentos que no están en el plan de 2029.
  lineaFija: { micro: 10000 },
  // La línea media se mantiene en la objetivo de 2029: extrapolar su pendiente
  // dos años más daba 14,6M€ en Corporate, que no es un objetivo sino un
  // artefacto de prolongar una recta.
  lineaCrece: false,
};

window.gtmVision2031 = function (p) {
  const V = window.GTM_VISION;
  const mp = window.gtmMaster(p);
  const ms = window.pfMonths('2030-01', V.hasta);
  const fact = window.mktFacturacionMedia ? window.mktFacturacionMedia() : {};
  const util = p.utilizacion == null ? 0.60 : p.utilizacion;

  const st = window.gtmTierState ? window.gtmTierState() : [];
  const tiers = V.tiers.map(id => {
    const t = mp.tiers.find(x => x.id === id);
    const meta = (window.MKT_TIERS || []).find(x => x.id === id) || {};
    const sEst = st.find(x => x.tier.id === id);
    const universo = t ? t.universo : (sEst ? sEst.universo : 0);
    const r0 = window.PF_REAL ? (window.PF_REAL[id] || {}) : {};
    const k0 = window.PF_META ? window.PF_META.realHasta : '2026-07';
    // Los segmentos que no están en el plan de 2029 arrancan de su cartera real
    // y de la línea fija que se les asigna.
    const linFija = (V.lineaFija || {})[id];
    const cli29 = t ? t.fin.cli : ((r0.clientes || {})[k0] || 0);
    // Objetivo 2031: cuota en la cola larga; en los de arriba, prolongar la
    // pendiente de clientes del plan dos años más.
    const porCuota = (V.porCuota || V.tiers).indexOf(id) >= 0;
    // En los tiers de foco el SOM es el objetivo de Unicorn a 2029: no se
    // prolonga nada, porque ahí el plan ya llega al mercado que se quiere.
    const cli31 = porCuota ? Math.round(universo * V.shareObjetivo) : cli29;
    const lin29 = t ? t.ticket : (linFija || (r0.ticketLinea || {})[k0] || 0);
    // La línea de 2031 prolonga la pendiente 2026-2029 dos años más.
    const anios = 3.5;
    const t0 = t ? t.ticket0 : ((r0.ticketLinea || {})[k0] || lin29);
    const lin31 = linFija != null ? linFija
      : (V.lineaCrece && t0 ? lin29 + (lin29 - t0) * (2 / anios) : lin29);
    const rows = ms.map((mo, i) => {
      const f = (i + 1) / ms.length;
      const cli = cli29 + (cli31 - cli29) * f;
      const lin = lin29 + (lin31 - lin29) * f;
      return { ...mo, cli, linea: lin, lineas: cli * lin, eur: cli * lin * util,
        share: universo ? cli / universo : null };
    });
    return { id, label: meta.label || id, color: meta.color || '#767D8C', universo,
      bounds: (window.MKT_BOUNDS || {})[id] || null,
      enPlan29: !!t, lineaFija: linFija != null,
      factMedia: fact[id] || null,
      porCuota, anio: porCuota ? null : V.anioFoco,
      share29: universo ? cli29 / universo : null,
      share31: universo ? cli31 / universo : null,
      cli29, cli31, lin29, lin31,
      eur29: cli29 * lin29 * util, eur31: cli31 * lin31 * util,
      lineas29: cli29 * lin29,
      lineas31: cli31 * lin31,
      ratio31: fact[id] ? lin31 / fact[id] : null,
      nuevos: cli31 - cli29,
      rows, q: (() => {
        const qs = [];
        ms.forEach((mo, i) => {
          const k = 'Q' + Math.ceil(mo.m / 3) + ' ' + String(mo.y).slice(2);
          let q = qs.find(x => x.id === k);
          if (!q) qs.push(q = { id:k, label:k, y:mo.y, q:Math.ceil(mo.m / 3), idx:[] });
          q.idx.push(i);
        });
        return qs.map(q => ({ ...q, ...rows[q.idx[q.idx.length - 1]] }));
      })() };
  }).filter(Boolean);

  return { hasta: V.hasta, shareObjetivo: V.shareObjetivo, tiers, meses: ms.length,
    cli29: tiers.reduce((a, t) => a + t.cli29, 0),
    cli31: tiers.reduce((a, t) => a + t.cli31, 0),
    eur29: tiers.reduce((a, t) => a + t.eur29, 0),
    eur31: tiers.reduce((a, t) => a + t.eur31, 0),
    // El plan de 2029 completo, para poner la extensión en contexto.
    planEur29: mp.fin.eur, planCli29: mp.objCli };
};

// ============= PRICING · TAE POR SEGMENTO =============
// Tres escenarios de TAE por segmento. El ingreso es TAE × loanbook dispuesto,
// no × línea concedida: lo que devenga es el saldo, no el límite.
window.GTM_TAE_ESC = [
  { id:'bajo',  label:'Conservador', desc:'Precio de entrada, presión competitiva o cliente bancarizado.' },
  { id:'medio', label:'Central',     desc:'El que se usa para planificar. Es el que alimenta la facturación del plan.' },
  { id:'alto',  label:'Ambicioso',   desc:'Precio sostenible solo con encaje alto y alternativa cara.' },
];
window.GTM_TAE = {
  corp:   { bajo:0.12, medio:0.14, alto:0.18 },
  midmkt: { bajo:0.14, medio:0.18, alto:0.22 },
  big:    { bajo:0.16, medio:0.22, alto:0.28 },
  mid:    { bajo:0.18, medio:0.25, alto:0.32 },
  small:  { bajo:0.20, medio:0.28, alto:0.36 },
  micro:  { bajo:0.20, medio:0.30, alto:0.40 },
};
window.GTM_TAE_DEFECTO = 'medio';

window.gtmTae = function (tierId, esc) {
  const t = window.GTM_TAE[tierId];
  if (!t) return null;
  return t[esc || window.GTM_TAE_DEFECTO];
};

// Facturación de un plan por segmento y escenario. Recibe la lista de tiers con
// su loanbook, así que sirve igual para Unicorn, el BP y el SOM.
window.gtmFacturacion = function (tiers, esc) {
  const e = esc || window.GTM_TAE_DEFECTO;
  const rows = tiers.map(t => {
    const tae = window.gtmTae(t.id, e);
    const lb = t.eur != null ? t.eur : (t.fin ? t.fin.eur : 0);
    return { id: t.id, label: t.label, color: t.color, loanbook: lb, tae,
      rev: tae != null ? lb * tae : null,
      // Por cliente, que es la cifra que se compara con el coste de captación.
      cli: t.cli != null ? t.cli : (t.objetivo != null ? t.objetivo : (t.fin ? t.fin.cli : null)) };
  });
  rows.forEach(r => { r.revPorCli = r.cli ? r.rev / r.cli : null; });
  const lb = rows.reduce((a, r) => a + (r.loanbook || 0), 0);
  const rev = rows.reduce((a, r) => a + (r.rev || 0), 0);
  return { esc, rows, loanbook: lb, rev,
    taeMedia: lb ? rev / lb : null,
    cli: rows.reduce((a, r) => a + (r.cli || 0), 0) };
};

// Los tres escenarios de golpe, para la tabla de comparación.
window.gtmFacturacionEsc = function (tiers) {
  const out = {};
  window.GTM_TAE_ESC.forEach(e => { out[e.id] = window.gtmFacturacion(tiers, e.id); });
  return out;
};

// ============= EQUIPO · SALES, RISK Y OPS =============
// Personas por rol y segmento. La cifra es por rol: 3 en Mid Market son 3 Sales,
// 3 Risk y 3 Ops, nueve personas en total.
window.GTM_ROLES = [
  { id:'sales', label:'Sales', desc:'Venta y relación con el cliente.' },
  { id:'risk',  label:'Risk',  desc:'Análisis, comité y seguimiento de riesgo.' },
  { id:'ops',   label:'Ops',   desc:'Alta, verificación de deudor y operativa diaria.' },
];
window.GTM_EQUIPO = { corp:1, midmkt:3, big:4, mid:8, small:10, micro:10 };

window.gtmEquipo = function (tiers) {
  const rows = tiers.map(t => {
    const porRol = window.GTM_EQUIPO[t.id] || 0;
    const total = porRol * window.GTM_ROLES.length;
    const cli = t.cli != null ? t.cli : null;
    const lb = t.loanbook != null ? t.loanbook : (t.eur != null ? t.eur : null);
    return { id: t.id, label: t.label, color: t.color, porRol, total, cli, loanbook: lb,
      // Clientes por persona y por rol: la segunda es la carga real de cada uno.
      cliPorPersona: total ? cli / total : null,
      cliPorRol: porRol ? cli / porRol : null,
      lbPorPersona: total ? lb / total : null,
      revPorPersona: t.rev != null && total ? t.rev / total : null };
  });
  const total = rows.reduce((a, r) => a + r.total, 0);
  const cli = rows.reduce((a, r) => a + (r.cli || 0), 0);
  const lb = rows.reduce((a, r) => a + (r.loanbook || 0), 0);
  const rev = rows.reduce((a, r) => a + (tiers.find(t => t.id === r.id).rev || 0), 0);
  return { rows, total, porRol: total / window.GTM_ROLES.length, cli, loanbook: lb, rev,
    cliPorPersona: total ? cli / total : null,
    lbPorPersona: total ? lb / total : null,
    revPorPersona: total ? rev / total : null };
};

// ============= RENTABILIDAD =============
// Coste anual por persona y rol, todo incluido (salario, seguridad social,
// equipo y puesto). Es un supuesto declarado, no un dato: cámbialo aquí y la
// rentabilidad de las dos pestañas se recalcula.
// Coste anual por rol y tier, todo incluido. El perfil que cierra una operación
// de 10M€ con un CFO de una empresa de 400M€ no es el que da de alta una línea
// de 10k€: el coste baja con el tamaño del cliente.
window.GTM_COSTE_ROL = {
  corp:   { sales: 110000, risk: 95000, ops: 70000 },
  midmkt: { sales:  90000, risk: 80000, ops: 60000 },
  big:    { sales:  70000, risk: 65000, ops: 48000 },
  mid:    { sales:  55000, risk: 52000, ops: 40000 },
  small:  { sales:  45000, risk: 44000, ops: 35000 },
  micro:  { sales:  40000, risk: 40000, ops: 32000 },
};
// Tesis de coste por tier, para poder defender cada cifra en pantalla.
window.GTM_COSTE_TESIS = {
  corp:   'Sales sénior con red propia en dirección financiera de grandes cuentas, analista de riesgo con criterio para operaciones de ocho cifras y Ops con experiencia en estructuras complejas.',
  midmkt: 'Sales con recorrido en banca de empresas, risk capaz de sostener un comité sin supervisión y Ops con varias operativas a la vez.',
  big:    'Perfil de mercado medio: se contrata con dos o tres años de experiencia y se forma dentro.',
  mid:    'Volumen con guion: el criterio está en el modelo y en el playbook, no en la persona.',
  small:  'Operación estandarizada, formación corta y herramienta que hace el trabajo de análisis.',
  micro:  'Autoservicio asistido: la persona resuelve excepciones, no tramita cada caso.',
};
window.gtmCosteRol = function (tierId, rolId) {
  const t = window.GTM_COSTE_ROL[tierId];
  if (!t) return 0;
  return t[rolId] || 0;
};
window.gtmCostePersona = function (tierId) {
  const t = window.GTM_COSTE_ROL[tierId];
  if (!t) return 0;
  const v = Object.values(t);
  return v.reduce((a, x) => a + x, 0) / v.length;
};

// Coste de capital sobre el loanbook dispuesto. Igual en los seis segmentos:
// el fondeo no distingue por tamaño de cliente. Las TAE del modelo están
// expresadas sobre euríbor, así que este 4% es el diferencial sobre la misma
// base y no hay que ajustar por nivel de tipos.
window.GTM_COSTE_CAPITAL = 0.04;
window.GTM_BASE_TIPOS = 'Todos los precios son diferenciales sobre euríbor, así que TAE y coste de capital comparten base y el margen no depende del nivel de tipos.';

// Coste de mora por segmento, en porcentaje del loanbook. Sube al bajar de
// tamaño, que es lo que la cartera y el sector muestran.
window.GTM_DEFAULT = { corp:0.02, midmkt:0.02, big:0.02, mid:0.03, small:0.04, micro:0.05 };

// Cuenta de resultados por segmento: facturación menos coste de equipo y de
// mora. Recibe las filas de gtmFacturacion, así que sirve para Unicorn y SOM.
window.gtmRentabilidad = function (rows) {
  const eq = window.gtmEquipo(rows);
  const out = rows.map(r => {
    const e = eq.rows.find(x => x.id === r.id) || {};
    // Coste de equipo: la plantilla de cada rol por su coste anual.
    const costeEq = (window.GTM_ROLES || []).reduce((a, rol) =>
      a + (e.porRol || 0) * window.gtmCosteRol(r.id, rol.id), 0);
    const tasaDef = window.GTM_DEFAULT[r.id];
    const costeDef = tasaDef != null ? r.loanbook * tasaDef : null;
    const tasaCap = window.GTM_COSTE_CAPITAL;
    const costeCap = tasaCap != null ? r.loanbook * tasaCap : null;
    const margen = (r.rev || 0) - costeEq - (costeDef || 0) - (costeCap || 0);
    return { id: r.id, label: r.label, color: r.color,
      loanbook: r.loanbook, cli: r.cli, tae: r.tae, rev: r.rev,
      personas: e.total || 0, porRol: e.porRol || 0,
      costePersona: window.gtmCostePersona(r.id),
      costeRol: (window.GTM_ROLES || []).reduce((o, rol) => { o[rol.id] = window.gtmCosteRol(r.id, rol.id); return o; }, {}),
      tesis: (window.GTM_COSTE_TESIS || {})[r.id],
      costeEq, costeEqPct: r.loanbook ? costeEq / r.loanbook : null,
      tasaDef, costeDef, tasaCap, costeCap,
      margen, margenPct: r.loanbook ? margen / r.loanbook : null,
      margenSobreRev: r.rev ? margen / r.rev : null };
  });
  const lb = out.reduce((a, r) => a + (r.loanbook || 0), 0);
  const rev = out.reduce((a, r) => a + (r.rev || 0), 0);
  const cEq = out.reduce((a, r) => a + r.costeEq, 0);
  const cDef = out.reduce((a, r) => a + (r.costeDef || 0), 0);
  const cCap = out.reduce((a, r) => a + (r.costeCap || 0), 0);
  const mg = rev - cEq - cDef - cCap;
  return { rows: out, loanbook: lb, rev, costeEq: cEq, costeDef: cDef, costeCap: cCap, margen: mg,
    costeCapPct: lb ? cCap / lb : null,
    costePersonaMedio: eq.total ? cEq / eq.total : null,
    taeMedia: lb ? rev / lb : null,
    costeEqPct: lb ? cEq / lb : null,
    costeDefPct: lb ? cDef / lb : null,
    margenPct: lb ? mg / lb : null,
    margenSobreRev: rev ? mg / rev : null,
    personas: eq.total };
};
