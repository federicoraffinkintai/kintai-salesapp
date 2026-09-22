// ============= SCORECARD DE SKILLS · v2 SIMPLIFICADO =============
// Cuatro competencias, no dieciséis. Cada una con las conductas observables
// que la definen y un peso distinto según el perfil.
window.SK_META = {
  version: 'v2 · sep 2026',
  nota: 'Cuatro competencias que explican el resultado de un AE. Se puntúan de 0 a 4 con la conducta observada del trimestre, y el peso cambia según el perfil.',
  store: 'kintai.skills.v2',
};

window.SK_ESCALA = [
  { n:0, label:'Sin evidencia', desc:'No se ha observado la conducta este trimestre.', color:'#E8EAEE', fg:'#4A5160', borde:'#C9CDD6' },
  { n:1, label:'En aprendizaje', desc:'Necesita acompañamiento en cada caso.', color:'#B23A3A', fg:'#fff' },
  { n:2, label:'Aplica con apoyo', desc:'Resuelve lo estándar; pide ayuda en lo difícil.', color:'#B8731F', fg:'#fff' },
  { n:3, label:'Autónomo', desc:'Resuelve solo y con resultado consistente.', color:'#2E7D5B', fg:'#fff' },
  { n:4, label:'Referente', desc:'Marca el estándar del equipo y forma a otros.', color:'#1F5C42', fg:'#fff' },
];

// Las cuatro competencias. `esp` es el nivel que pide el rol; `conductas` son
// las evidencias concretas con las que se puntúa.
window.SK_COMPS = [
  { id:'disc', label:'Descubrimiento', corto:'Descubrimiento', color:'#4054A8',
    peso:{ pymes:25, midmkt:30 }, esp:{ pymes:3, midmkt:3 },
    resumen:'Sacar la información que el cliente no cuenta sola y devolvérsela hasta que diga «exacto».',
    conductas:[
      'Pregunta hasta entender el negocio, no solo la necesidad declarada.',
      'Tactical empathy: nombra la situación del cliente antes de proponer nada.',
      'Cierra la reunión con un resumen que el cliente confirma con un «exacto».',
      'Sale de la reunión sabiendo quién decide, quién veta y qué presiona la caja.',
    ] },
  { id:'nego', label:'Negociación', corto:'Negociación', color:'#2E7D5B',
    peso:{ pymes:30, midmkt:25 }, esp:{ pymes:3, midmkt:3 },
    resumen:'Leer la percepción de valor subjetiva del cliente y ajustar el precio a ella.',
    conductas:[
      'Identifica qué valora de verdad este cliente: velocidad, límite, discreción o precio.',
      'Ajusta precio y estructura a esa percepción en vez de aplicar tarifa plana.',
      'Trata la objeción real y la convierte en siguiente paso, no en descuento.',
      'Defiende la TAE con valor y sabe cuándo ceder y a cambio de qué.',
    ] },
  { id:'fin', label:'Sastre financiero', corto:'Sastre financiero', color:'#6E3B8E',
    peso:{ pymes:20, midmkt:30 }, esp:{ pymes:2, midmkt:3 },
    resumen:'Diagnóstico financiero y montaje de la operación a medida: estados, producto y scores de Kintai.',
    conductas:[
      'Lee estados financieros, CIRBE y pool bancario y detecta el hueco de caja real.',
      'Conoce el producto modular y combina los módulos que encajan con ese hueco.',
      'Anticipa el score y el criterio de riesgos de Kintai antes de presentar el caso.',
      'Monta límite, plazo y colateral de forma que el comité pueda aprobarlo a la primera.',
    ] },
  { id:'exec', label:'Ejecutor estratégico', corto:'Ejecutor', color:'#C8A24C',
    peso:{ pymes:25, midmkt:15 }, esp:{ pymes:3, midmkt:3 },
    resumen:'Método: preparación, seguimiento y capacidad de mover a otros departamentos.',
    conductas:[
      'Prepara cada reunión: quién, qué caso, qué pedido concreto.',
      'Higiene de CRM: etapa, importe y fecha al día, forecast legible sin preguntarle.',
      'Manda el email de resumen del discovery el mismo día.',
      'Es responsive: contesta y desatasca sin que haya que perseguirle.',
      'Trabaja con plan de ejecución por cuenta y consigue que riesgos, ops y producto empujen su pipeline.',
    ] },
];

window.SK_SEED = {
  adrian: { disc:2, nego:2, fin:1, exec:2 },
  lina:   { disc:2, nego:2, fin:2, exec:3 },
  silvia: { disc:3, nego:3, fin:2, exec:2 },
  arnau:  { disc:1, nego:2, fin:1, exec:2 },
  paula:  { disc:4, nego:4, fin:3, exec:2 },
  alex:   { disc:3, nego:3, fin:3, exec:3 },
};

window.SK_BANDAS = [
  { min:80, label:'Referente',     color:'#1F5C42', desc:'Marca el estándar: puede formar al resto.' },
  { min:62, label:'Sólido',        color:'#2E7D5B', desc:'Autónomo en su rol; ajustes finos.' },
  { min:45, label:'En desarrollo', color:'#B8731F', desc:'Resuelve lo estándar con apoyo puntual.' },
  { min:0,  label:'En rampa',      color:'#B23A3A', desc:'Necesita acompañamiento sistemático.' },
];
window.skBanda = function (p) { return window.SK_BANDAS.find(b => p >= b.min) || window.SK_BANDAS[3]; };

window.skLoad = function () {
  try {
    const raw = localStorage.getItem(window.SK_META.store);
    const out = JSON.parse(JSON.stringify(window.SK_SEED));
    if (!raw) return out;
    const s = JSON.parse(raw);
    Object.keys(out).forEach(k => { if (s[k]) out[k] = { ...out[k], ...s[k] }; });
    return out;
  } catch (e) { return JSON.parse(JSON.stringify(window.SK_SEED)); }
};
window.skSave = function (s) { try { localStorage.setItem(window.SK_META.store, JSON.stringify(s)); } catch (e) {} };
window.skReset = function () {
  try { localStorage.removeItem(window.SK_META.store); } catch (e) {}
  return JSON.parse(JSON.stringify(window.SK_SEED));
};

// Puntuación 0-100: nivel entre 4, por el peso de la competencia en su perfil.
window.skScore = function (scores) {
  const S = scores || window.skLoad();
  const list = (window.AEQ4 || []).map(a => {
    const perfil = a.unidad;
    const v = S[a.key] || {};
    const comps = window.SK_COMPS.map(c => {
      const n = v[c.id] == null ? 0 : v[c.id], esp = c.esp[perfil], peso = c.peso[perfil];
      return { ...c, n, esp, peso, gap: Math.max(0, esp - n),
        pct: n / 4, espPct: esp / 4, aporta: peso * (n / 4) };
    });
    const punt = comps.reduce((x, c) => x + c.aporta, 0);
    const objetivo = comps.reduce((x, c) => x + c.peso * c.espPct, 0);
    return { key:a.key, nombre:a.nombre, perfil, unidadLabel:a.unidadLabel, comps, punt, objetivo,
      banda: window.skBanda(punt), listo: punt >= objetivo,
      brechas: comps.filter(c => c.gap > 0).sort((x, y) => (y.gap * y.peso) - (x.gap * x.peso)),
      sinEvidencia: comps.filter(c => c.n === 0).length,
      referentes: comps.filter(c => c.n === 4).length };
  });
  const tot = {
    media: list.length ? list.reduce((x, a) => x + a.punt, 0) / list.length : 0,
    objetivo: list.length ? list.reduce((x, a) => x + a.objetivo, 0) / list.length : 0,
    brechas: list.reduce((x, a) => x + a.brechas.length, 0),
    sinEvidencia: list.reduce((x, a) => x + a.sinEvidencia, 0),
    referentes: list.reduce((x, a) => x + a.referentes, 0),
  };
  const porComp = window.SK_COMPS.map(c => {
    const vs = list.map(a => a.comps.find(x => x.id === c.id));
    return { ...c, med: vs.reduce((x, v) => x + v.n, 0) / (vs.length || 1),
      conGap: vs.filter(v => v.gap > 0).length, gapTot: vs.reduce((x, v) => x + v.gap, 0) };
  }).sort((x, y) => y.gapTot - x.gapTot || x.med - y.med);
  return { list, tot, porComp };
};
