// Scoring model v2 — SABI 2ª descarga. Verificado contra el excel:
// Score Global = Σ pilares; Score pilar = Σ M de sus variables.
// M = M_min + pct × (M_max − M_min); pct = clamp((x − t0)/(t100 − t0), 0, 1)

window.SCORE_MAX = 1600; // techo visual para barras

const V = (o) => ({ transform: 'identidad', ...o });

window.PILLARS = [
  {
    id: 'need', key: 'nec', catKey: 'nec_cat', title: 'Necesidad',
    subtitle: 'Tensión de circulante y crecimiento',
    range: [-280, 970],
    intro: 'Mide cuánta caja tiene atrapada en el ciclo y si el crecimiento la sigue tensando. Es el pilar de mayor peso del modelo.',
    vars: [
      V({ id:'nof_fact', label:'NOF / Facturación', vk:'v_nof_fact', ck:'k_nof_fact', fmt:'ratio',
        formula:'(Clientes + Existencias − Proveedores − Tesorería) / Ventas',
        transform:'linear_inc', t0:-0.1, t100:1, mMin:-100, mMax:200,
        read:'Qué parte de un año de ventas tiene inmovilizada en circulante.' }),
      V({ id:'crec', label:'Crecimiento ventas', vk:'v_crec', ck:'k_crec', fmt:'pctx',
        formula:'(Ventas − Ventas Año-1) / Ventas Año-1',
        transform:'linear_inc', t0:-0.1, t100:1, mMin:-20, mMax:200,
        read:'Crecer consume caja: más ventas exigen más circulante.' }),
      V({ id:'intens', label:'Intensidad de circulante', vk:'v_intens', ck:'k_intens', fmt:'ratio',
        formula:'(Clientes pdte. cobro + Existencias − Tesorería) / Total activo',
        t0:0.1, t100:0.7, mMin:-100, mMax:300,
        read:'Cuánto del balance es circulante. Alto = negocio intensivo en caja.' }),
    ],
  },
  {
    id: 'alt', key: 'alt', catKey: 'alt_cat', title: 'Alternativas',
    subtitle: 'Hasta dónde le llega la banca tradicional',
    range: [-290, 700],
    intro: 'Replica los filtros con los que la banca rechaza. Cuanto peor puntúa en banca, mejor encaja Kintai.',
    vars: [
      V({ id:'deuda_ebitda', label:'Deuda / EBITDA', vk:'v_deuda_ebitda', ck:'k_deuda_ebitda', fmt:'x',
        formula:'(Deuda L/P + Deuda C/P) / EBITDA', t0:3, t100:7, mMin:-40, mMax:200,
        read:'Por encima de 7x la banca ya no entra.' }),
      V({ id:'solv', label:'Ratio de solvencia', vk:'v_solv', ck:'k_solv', fmt:'pct',
        formula:'Patrimonio neto / Total activo', t0:0.35, t100:0.1, mMin:-50, mMax:100,
        read:'Poco patrimonio propio = perfil frágil para el banco.' }),
      V({ id:'edad', label:'Antigüedad', vk:'v_edad', ck:'k_edad', fmt:'years',
        formula:'Años desde constitución', transform:'log_10', t0:0.7, t100:0.3, mMin:-100, mMax:100,
        read:'Sin histórico largo, el scoring bancario penaliza.' }),
    ],
  },
  {
    id: 'fit', key: 'enc', catKey: 'enc_cat', title: 'Encaje',
    subtitle: 'Su forma de cobrar encaja con el anticipo',
    range: [-100, 300],
    intro: 'El producto financia facturas. Si cobra a plazo largo, hay factura que anticipar.',
    vars: [
      V({ id:'pmc', label:'Periodo medio de cobro', vk:'v_pmc', ck:'k_pmc', fmt:'days',
        formula:'PMC (días), directo de SABI', t0:0, t100:180, mMin:-100, mMax:300,
        read:'Cada día de cobro por encima de 60 es factura anticipable.' }),
    ],
  },
  {
    id: 'budget', key: 'bud', catKey: 'bud_cat', title: 'Budget',
    subtitle: 'Le compensa pagar por el circulante',
    range: [-100, 100],
    intro: 'Si el circulante le rinde más de lo que cuesta financiarlo, el precio deja de ser objeción.',
    vars: [
      V({ id:'rend', label:'Rendimiento circulante mensual', vk:'v_rend', ck:'k_rend', fmt:'pct',
        formula:'EBITDA / ((Clientes pdte. + Existencias − Proveedores) × 12)',
        t0:0.005, t100:0.03, mMin:-100, mMax:100,
        read:'Lo que gana al mes por cada euro de circulante. Por encima del pricing, la venta se cae sola.' }),
    ],
  },
];

// Recompute the audit chain: raw → transform → percentile → M
window.auditVar = function (v, c) {
  const raw = c[v.vk];
  if (raw == null || isNaN(raw)) {
    return { raw:null, tx:null, pct:null, m:0, missing:true, range:v.mMax - v.mMin };
  }
  let tx = raw;
  if (v.transform === 'log_10') tx = raw > 0 ? Math.log10(raw) : null;
  if (tx == null || !isFinite(tx)) return { raw, tx:null, pct:null, m:0, missing:true, range:v.mMax - v.mMin };
  let pct = (tx - v.t0) / (v.t100 - v.t0);
  pct = Math.max(0, Math.min(1, pct));
  return { raw, tx, pct: pct * 100, m: v.mMin + pct * (v.mMax - v.mMin), missing:false, range:v.mMax - v.mMin };
};


// ============= INGREDIENTES: de qué partidas sale cada ratio =============
// Cada parte se muestra en € para que el SDR pueda decirlas en voz alta.
// Guardas de plausibilidad: una frase que se lee en voz alta no puede
// contener guiones ni cifras imposibles. Si falta el dato, se omite la cláusula.
// Una cifra es pronunciable si sobrevive al formato con el que se va a decir.
// EUR_FLOOR: por debajo de 1.000€ la frase diría "0€" y suena a error.
window.SAY_EUR_FLOOR = 1000;
window.sayable = function (v, max) {
  return v != null && isFinite(v) && v !== 0 && (max == null || Math.abs(v) <= max);
};
// Devuelve la cláusula formateada o null si no se puede pronunciar.
window.sayEur = function (v, f) {
  if (v == null || !isFinite(v) || Math.abs(v) < window.SAY_EUR_FLOOR) return null;
  return f.eur(v);
};
// Un porcentaje solo es pronunciable si no se imprime como cero.
window.sayPct = function (v, f) {
  if (v == null || !isFinite(v)) return null;
  const txt = f.pct(v);
  return /^-?0(,0+)?%$/.test(txt) ? null : txt;
};
window.sayDays = function (v) {
  if (v == null || !isFinite(v)) return null;
  const d = Math.round(v);
  return (d >= 1 && d <= 1825) ? d : null;
};

window.VAR_PARTS = {
  nof_fact: {
    unit:'eur',
    parts:[
      {op:'',  label:'Deudores',    k:'deudores_est', est:c=>c.clientes==null},
      {op:'+', label:'Existencias', k:'existencias'},
      {op:'−', label:'Proveedores', k:'prov_est', est:c=>c.proveedores==null},
      {op:'−', label:'Tesorería',   k:'tesoreria'},
    ],
    resultLabel:'NOF', resultKey:'nof_est',
    over:{label:'Ventas', k:'ventas'},
    say:(c,f)=>{
      const E = v => window.sayEur(v, f), bits = [];
      const deu = E(c.deudores_est), exi = E(c.existencias), pro = E(c.prov_est);
      if (deu) bits.push(`${deu} pendientes de cobro`);
      if (exi) bits.push(`${exi} en almacén`);
      let frase = bits.length ? `Veo ${bits.join(' y ')}` : 'Mirando vuestro circulante';
      if (pro) frase += `, con solo ${pro} que os financian los proveedores`;
      const nof = E(c.nof_est), r = c.v_nof_fact;
      if (!nof || r == null) return frase + '.';
      const dias = window.sayDays(r * 365);
      const magnitud = r > 1.5 ? `${f.ratio(r)} veces vuestra facturación anual` : (dias ? `unos ${dias} días de facturación` : null);
      return magnitud
        ? `${frase}. Eso son ${nof} de necesidades operativas: ${magnitud} inmovilizada.`
        : `${frase}. Eso son ${nof} de necesidades operativas.`;
    },
  },
  crec: {
    unit:'eur',
    parts:[{op:'',label:'Ventas último año',k:'ventas'},{op:'vs',label:'Ventas año anterior',k:'ventas_1'}],
    say:(c,f)=>{
      const v0 = window.sayEur(c.ventas_1, f), v1 = window.sayEur(c.ventas, f);
      if (!v0 || !v1 || c.v_crec == null)
        return v1 ? `Facturáis ${v1}. Pregunta cómo ha ido frente al año pasado: el crecimiento hay que financiarlo antes de cobrarlo.`
                  : 'Pregunta por la evolución de ventas: el crecimiento hay que financiarlo antes de cobrarlo.';
      const pc = Math.round(c.v_crec*100);
      if (pc === 0) return `Facturáis ${v1}, plano frente al año pasado. Aquí el ángulo no es el crecimiento sino el plazo de cobro.`;
      if (pc < 0)   return `Habéis pasado de ${v0} a ${v1}, un ${Math.abs(pc)}% menos. Cuando la facturación baja, el circulante aprieta igual.`;
      return `Habéis pasado de ${v0} a ${v1}, un ${pc}% más en un año. Ese crecimiento hay que financiarlo antes de cobrarlo.`;
    },
  },
  crec1: {
    unit:'eur',
    parts:[{op:'',label:'Ventas año-1',k:'ventas_1'},{op:'vs',label:'Ventas año-2',k:'ventas_2'}],
    say:(c,f)=>{
      const a = window.sayEur(c.ventas_2, f), b = window.sayEur(c.ventas_1, f);
      return (a && b) ? `El año anterior ya veníais de ${a} a ${b}. No es un pico suelto, es tendencia.`
                      : 'No hay histórico de dos años en SABI. Pregunta por la evolución de los últimos ejercicios.';
    },
  },
  intens: {
    unit:'eur',
    parts:[
      {op:'',  label:'Clientes pdte. cobro', k:'clientes_der'},
      {op:'+', label:'Existencias', k:'existencias'},
      {op:'−', label:'Tesorería',   k:'tesoreria'},
    ],
    over:{label:'Total activo', k:'activo_total'},
    say:(c,f)=>{
      const E = v => window.sayEur(v, f), det = [];
      const cli = E(c.clientes_der), exi = E(c.existencias), act = E(c.activo_total);
      if (cli) det.push(`${cli} en facturas por cobrar`);
      if (exi) det.push(`${exi} en stock`);
      const p = window.sayPct(c.v_intens, f);
      if (!act || !p)
        return det.length ? `Tenéis ${det.join(' y ')}. Es caja parada.` : 'Buena parte del balance está en circulante.';
      return `De ${act} de activo total, ${p} está en circulante${det.length ? ': ' + det.join(' y ') : ''}. Vuestro balance es caja parada.`;
    },
  },
  nfec: {
    unit:'ratio',
    parts:[
      {op:'',  label:'Crecimiento',       calc:c=>c.v_crec, fmt:'pctx'},
      {op:'×', label:'NOF / Facturación', calc:c=>c.v_nof_fact, fmt:'ratio'},
      {op:'−', label:'Margen EBITDA',     calc:c=>c.ventas?c.ebitda/c.ventas:null, fmt:'pct'},
    ],
    say:(c,f)=>{
      const p = window.sayable(c.ventas) ? window.sayPct(c.ebitda/c.ventas, f) : null;
      return p ? `Con un margen del ${p}, lo que genera el negocio no cubre lo que el crecimiento consume en circulante. Ese hueco se financia fuera sí o sí.`
               : 'El crecimiento consume más circulante del que el margen genera. Ese hueco se financia fuera sí o sí.';
    },
  },
  ebitda: {
    unit:'eur',
    parts:[{op:'',label:'EBITDA último año',k:'ebitda'},{op:'vs',label:'EBITDA año anterior',k:'ebitda_1'}],
    say:(c,f)=>{
      const eb = window.sayEur(c.ebitda, f);
      if (!eb) return 'El EBITDA está prácticamente a cero. Para el banco eso es un no automático; nosotros no puntuamos así.';
      return (c.ebitda < 0)
        ? `Con EBITDA en ${eb}, el scoring del banco os descarta antes de mirar nada más. Nosotros no puntuamos así.`
        : `Generáis ${eb} de EBITDA. El problema no es la rentabilidad, es el momento en que entra la caja.`;
    },
  },
  deuda_ebitda: {
    unit:'eur',
    parts:[{op:'',label:'Deuda L/P',k:'deuda_lp'},{op:'+',label:'Deuda C/P',k:'deuda_cp'}],
    over:{label:'EBITDA', k:'ebitda'},
    say:(c,f)=>{
      const deuda = window.sayEur((c.deuda_lp||0)+(c.deuda_cp||0), f);
      if (!deuda) return 'Hoy no tenéis deuda financiera en balance, así que el banco no es vuestro problema. El ángulo aquí es el circulante y el plazo de cobro, no la falta de alternativas.';
      const eb = window.sayEur(c.ebitda, f);
      if (!eb || c.ebitda < 0) return `${deuda} de deuda y un EBITDA que no da soporte. Para el banco ese ratio ni se calcula.`;
      return `${deuda} de deuda frente a ${eb} de EBITDA. A partir de 7x la banca deja de dar línea nueva.`;
    },
  },
  solv: {
    unit:'eur',
    parts:[{op:'',label:'Patrimonio neto',k:'patrimonio'}],
    over:{label:'Total activo', k:'activo_total'},
    say:(c,f)=>{
      const pn = window.sayEur(c.patrimonio, f), act = window.sayEur(c.activo_total, f);
      const p = window.sayPct(c.v_solv, f);
      if (!pn || !act || !p) return 'Pregunta por la estructura de fondos propios: es lo primero que mira el banco.';
      if (c.v_solv < 0) return `El patrimonio neto está en negativo: ${pn} sobre ${act} de activo. Eso es causa de disolución, no un balance ajustado. Antes de hablar de producto hay que entender si hay ampliación o refinanciación en marcha.`;
      return `${pn} de patrimonio sobre ${act} de activo: un ${p}.${c.v_solv < 0.3 ? ' Por debajo del 30% el banco lo lee como perfil frágil.' : ''}`;
    },
  },
  fact: {
    unit:'eur',
    parts:[{op:'',label:'Ventas',k:'ventas'}],
    say:(c,f)=>{
      const v = window.sayEur(c.ventas, f);
      return v ? `Con ${v} de facturación estáis en el tramo donde la banca ofrece menos producto y más caro.`
               : 'Por vuestro tamaño estáis en el tramo donde la banca ofrece menos producto y más caro.';
    },
  },
  edad: {
    unit:'years',
    parts:[{op:'',label:'Constituida en', k:'const_year', fmt:'raw'}],
    say:(c,f)=> window.sayable(c.v_edad)
      ? `${Math.round(c.v_edad)} años de actividad. El scoring bancario premia el histórico largo y penaliza lo que no lo tiene.`
      : 'Sin fecha de constitución fiable en SABI. Pregunta desde cuándo operan.',
  },
  pmc: {
    unit:'days',
    parts:[
      {op:'',   label:'PMC · cobro', k:'pmc', fmt:'days'},
      {op:'vs', label:'PMP · pago',  k:'pmp', fmt:'days'},
    ],
    say:(c,f)=>{
      if (!c.pmc_ok) return 'El periodo de cobro que publica SABI no es fiable para esta empresa. Pregúntalo directamente antes de usar ninguna cifra.';
      const pmc = Math.round(c.pmc);
      if (!c.pmp_ok) return `Cobráis a ${pmc} días. Ese plazo lo estáis financiando vosotros, y es exactamente el que anticipamos.`;
      const gap = pmc - Math.round(c.pmp);
      if (gap <= 0) return `Cobráis a ${pmc} días y pagáis a ${Math.round(c.pmp)}: de momento el proveedor os financia el ciclo. Si eso cambia, es cuando entramos nosotros.`;
      return `Cobráis a ${pmc} días y pagáis a ${Math.round(c.pmp)}. Esos ${gap} días de diferencia los estáis financiando vosotros, y son exactamente los que anticipamos.`;
    },
  },
  solvfwd: {
    unit:'ratio',
    parts:[
      {op:'',  label:'Margen EBITDA', calc:c=>c.ventas?c.ebitda/c.ventas:null, fmt:'pct'},
      {op:'+', label:'Crecimiento',   calc:c=>c.v_crec, fmt:'pctx'},
      {op:'+', label:'Solvencia',     calc:c=>c.v_solv, fmt:'pct'},
    ],
    say:()=>'Filtro de riesgo interno. No se menciona al cliente.',
    internal:true,
  },
  rend: {
    unit:'eur',
    parts:[{op:'',label:'EBITDA',k:'ebitda'}],
    over:{label:'Circulante × 12', calc:c=>(((c.clientes_der||0)+(c.existencias||0)-(c.proveedores||0))*12)},
    say:(c,f)=>{
      const p = c.v_rend > 0 ? window.sayPct(c.v_rend, f) : null;
      return p ? `Cada euro que tenéis metido en circulante os rinde ${p} al mes. Si eso está por encima de lo que cuesta financiarlo, la decisión se justifica sola.`
               : 'Hoy el circulante no os está rindiendo prácticamente nada. Pregunta qué harían con la caja si la tuvieran libre.';
    },
  },
};

window.partValue = function (p, c) {
  return p.calc ? p.calc(c) : c[p.k];
};

window.CAT_META = {
  A: { label:'A', tone:'good', desc:'Top del universo' },
  B: { label:'B', tone:'warn', desc:'Por encima de la media' },
  C: { label:'C', tone:'flat', desc:'Media baja' },
  D: { label:'D', tone:'bad',  desc:'Cola del universo' },
};

// Clasificación única, derivada de MKT_BOUNDS: la misma rejilla que usan
// Mercado, Unicorn, BP Serie A, Portfolio y 2027. Antes esta función tenía su
// propia escala T0-T4 en la que "Micro" era menos de 3M€, mientras en el modelo
// de mercado es menos de 200k: quince veces sobre la misma palabra.
window.classifyTier = function (ventas) {
  if (!ventas) return { id:'—', label:'Sin datos' };
  const B = window.MKT_BOUNDS || {};
  const eur = (v) => v >= 1e6 ? (v / 1e6 % 1 ? (v / 1e6).toFixed(1).replace('.', ',') : v / 1e6) + 'M€' : Math.round(v / 1e3) + 'k€';
  const id = Object.keys(B).find(k => {
    const [lo, hi] = B[k];
    return ventas >= lo && (hi == null || ventas < hi);
  });
  if (!id) return { id:'—', label:'Sin datos' };
  const t = (window.MKT_TIERS || []).find(x => x.id === id);
  const [lo, hi] = B[id];
  const rango = hi == null ? eur(lo) + '+' : (lo === 0 ? '<' + eur(hi) : eur(lo) + '-' + eur(hi));
  return { id, label: (t ? t.label : id) + ' · ' + rango, rango, corto: t ? t.label : id };
};

window.classifyPriority = function (g) {
  if (g >= 1000) return { label:'Prioridad máxima', tone:'good', cta:'Llamar hoy' };
  if (g >= 850)  return { label:'Alta',  tone:'good', cta:'Llamar esta semana' };
  if (g >= 700)  return { label:'Media', tone:'warn', cta:'Investigar y llamar' };
  return { label:'Baja', tone:'flat', cta:'Email primero' };
};

window.fmt = {
  eur(v){ if(v==null||isNaN(v)) return '—'; const a=Math.abs(v);
    if(a>=1e6) return (v/1e6).toFixed(a>=1e7?0:1).replace('.',',')+'M€';
    if(a>=1e3) return Math.round(v/1e3).toLocaleString('es-ES')+'k€';
    return Math.round(v).toLocaleString('es-ES')+'€'; },
  keur(v){ if(v==null||isNaN(v)) return '—'; return Math.round(v).toLocaleString('es-ES')+'k€'; },
  k(v){ return window.fmt.eur(v); },
  ratio(v){ if(v==null||isNaN(v)) return '—'; return v.toFixed(2).replace('.',','); },
  pct(v){ if(v==null||isNaN(v)) return '—'; return (v*100).toFixed(1).replace('.',',')+'%'; },
  pctx(v){ if(v==null||isNaN(v)) return '—'; return (v*100).toFixed(0)+'%'; },
  pct1(v){ return window.fmt.pct(v); },
  pct0(v){ return window.fmt.pctx(v); },
  days(v){ if(v==null||isNaN(v)) return '—'; return Math.round(v)+' d'; },
  years(v){ if(v==null||isNaN(v)) return '—'; return Math.round(v)+' años'; },
  x(v){ if(v==null||isNaN(v)) return '—'; return v.toFixed(1).replace('.',',')+'x'; },
  score(v){ if(v==null||isNaN(v)) return '—'; return Math.round(v).toLocaleString('es-ES'); },
  cnae(v){ return v==null?'—':String(v); },
  delta(curr, prev){ if(curr==null||prev==null||prev===0) return null; return (curr-prev)/Math.abs(prev); },
};
