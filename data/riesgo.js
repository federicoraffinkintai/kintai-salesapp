// ============= RIESGO DEL EMISOR × APROBACIÓN =============
// Tres scores de emisor —impago, cese y fraude— en A/B/C/D, y cómo se cruzan
// con la aprobación según el peso del importe pedido sobre la facturación.
// Los scores no están en el fichero de riesgos todavía: aquí se derivan de lo
// que sí hay (resultado, tamaño, peso del pedido, antigüedad del dato) con una
// semilla estable por NIF, para poder cerrar el diseño. Declarado como modelo.
window.RSK_DEMO = true;
window.RSK_META = {
  fuente: 'Modelo de ejemplo sobre CONTROL RIESGOS · los scores de emisor no vienen en el fichero.',
};
window.RSK_SCORES = [
  { id: 'impago', label: 'Impago', desc: 'Probabilidad de que el deudor no pague la factura cedida.' },
  { id: 'cese', label: 'Cese', desc: 'Probabilidad de que el emisor cese actividad dentro del horizonte de la línea.' },
  { id: 'fraude', label: 'Fraude', desc: 'Señales de factura no comercial, circularidad o vinculación.' },
];
window.RSK_GRADES = [
  { id: 'A', label: 'A', color: '#2E7D5B' },
  { id: 'B', label: 'B', color: '#8E6E2A' },
  { id: 'C', label: 'C', color: '#C8853D' },
  { id: 'D', label: 'D', color: '#C8553D' },
];
// Tramos de peso del pedido sobre la facturación anual. El techo operativo es
// el 10%: por encima no se concede, así que la escala termina ahí.
window.RSK_TOPE = 0.10;
window.RSK_TRAMOS = [
  { id: 'p1', label: 'hasta 1%', min: 0, max: 0.01 },
  { id: 'p25', label: '1 a 2,5%', min: 0.01, max: 0.025 },
  { id: 'p5', label: '2,5 a 5%', min: 0.025, max: 0.05 },
  { id: 'p75', label: '5 a 7,5%', min: 0.05, max: 0.075 },
  { id: 'p10', label: '7,5 a 10%', min: 0.075, max: 1e9 },
];
// Peso mediano que pide cada operativa: la gestión de cobro soporta más línea
// sobre ventas que la ciega, que es la que menos.
window.RSK_PESO_MED = { gc: 0.09, wallet: 0.05, ciego: 0.025, futuro: 0.03, special: 0.04 };

window.rskHash = function (s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };

// Score derivado: el peso del pedido y el tamaño empujan, el resto es ruido
// estable por empresa para que cada score tenga vida propia.
window.rskScore = function (c, tipo) {
  const v = +c.v || 0, req = +c.req || 0;
  const peso = v ? req / v : 0.3;
  const r = window.rskHash((c.nif || c.e || '') + tipo);
  let x = r * 0.62;
  if (tipo === 'impago') x += Math.min(0.3, peso * 1.1) + (c.tier === 'small' ? 0.1 : c.tier === 'midmkt' ? -0.06 : 0);
  if (tipo === 'cese') x += Math.min(0.26, peso * 0.7) + (v && v < 1000000 ? 0.12 : v > 20000000 ? -0.08 : 0);
  if (tipo === 'fraude') x += Math.min(0.2, peso * 0.5) + (c.ud && +c.ud <= 2023 ? 0.1 : 0);
  return x < 0.3 ? 'A' : x < 0.55 ? 'B' : x < 0.78 ? 'C' : 'D';
};

// El impago se reparte por cuantiles con la cartera cargada hacia el riesgo
// alto (3% A, 20% B, 42% C, 35% D) y el índice incorpora el desenlace, para
// que el grado peor sea de verdad el que menos aprueba.
// Mezcla por score: impago es el peor (moda C-D), cese mejora (moda C con
// mucha B) y fraude es el más limpio, con la moda en B.
window.RSK_MIX = {
  impago: [{ g: 'D', f: 0.354 }, { g: 'C', f: 0.417 }, { g: 'B', f: 0.198 }, { g: 'A', f: 0.031 }],
  cese:   [{ g: 'D', f: 0.14 },  { g: 'C', f: 0.33 },  { g: 'B', f: 0.39 },  { g: 'A', f: 0.14 }],
  fraude: [{ g: 'D', f: 0.07 },  { g: 'C', f: 0.24 },  { g: 'B', f: 0.46 },  { g: 'A', f: 0.23 }],
};
window.rskIdx = function (c, tipo, oper) {
  const v = +c.v || 0, req = +c.req || 0;
  const peso = v ? req / v : 0.3;
  let x = window.rskHash((c.nif || c.e || '') + tipo) * 0.5 + Math.min(0.3, peso * (tipo === 'impago' ? 1.1 : tipo === 'cese' ? 0.7 : 0.5));
  // El desenlace que entra en el índice es el mismo que luego se publica: si
  // se mira una operativa, el sublímite abierto en ella; si no, el global.
  // Solo inclina el orden: si pesara más, el grado codificaría la aprobación
  // en vez de explicarla y la matriz saldría en 100% / 0%.
  const ok = oper ? !!(c.s && c.s[oper] > 0) : c.res === 'APPROVED';
  x += ok ? -0.05 : 0.05;
  if (tipo === 'impago') x += c.tier === 'small' ? 0.08 : c.tier === 'midmkt' ? -0.05 : 0;
  if (tipo === 'cese') x += v && v < 1000000 ? 0.09 : v > 20000000 ? -0.07 : 0;
  if (tipo === 'fraude') x += c.ud && +c.ud <= 2023 ? 0.07 : 0;
  return x;
};

window.rskTramo = function (p) {
  if (p == null) return null;
  return window.RSK_TRAMOS.find(t => p >= t.min && p < t.max) || window.RSK_TRAMOS[window.RSK_TRAMOS.length - 1];
};

// Peso del pedido sobre ventas, recortado al tope del 10% y reescalado para
// que la mediana de cada operativa sea la que fija riesgos.
window.rskBase = function (tier, oper) {
  // La distribución de scores se calcula sobre TODAS las empresas cruzadas con
  // pedido y ventas; la aprobación, solo sobre las que riesgos llegó a evaluar
  // (marcadas con _ev), que es el universo de la tabla de conversión.
  const ls = (window.CONTACTS || []).filter(c => window.optCruzada(c) && c.req && c.v && (!tier || c.tier === tier));
  const raw = ls.map(c => +c.req / +c.v);
  const ord = raw.slice().sort((a, b) => a - b);
  const medRaw = ord.length ? (ord.length % 2 ? ord[(ord.length - 1) / 2] : (ord[ord.length / 2 - 1] + ord[ord.length / 2]) / 2) : 0;
  const obj = oper ? window.RSK_PESO_MED[oper] : null;
  // Curva acotada en vez de recorte: p = TOPE·(1−e^(−λ·raw)), con λ fijada para
  // que la mediana caiga exactamente en la que pide riesgos. Es monótona, nunca
  // pasa del techo y conserva el orden de las empresas, así que cada operativa
  // mantiene su mediana sin apelmazar la cola contra el 10%.
  const lam = obj && medRaw ? -Math.log(1 - Math.min(0.999, obj / window.RSK_TOPE)) / medRaw : null;
  // Grados por cuantil sobre la población filtrada, con la mezcla de cada score.
  const grados = {};
  window.RSK_SCORES.forEach(s => {
    const idx = ls.map((c, i) => ({ i, x: window.rskIdx(c, s.id, oper) })).sort((a, b) => b.x - a.x);
    const g = new Array(ls.length);
    const mix = window.RSK_MIX[s.id];
    let cur = 0;
    mix.forEach((m, j) => {
      const hasta = j === mix.length - 1 ? idx.length
        : Math.round(idx.length * mix.slice(0, j + 1).reduce((a, x) => a + x.f, 0));
      for (; cur < hasta; cur++) g[idx[cur].i] = m.g;
    });
    grados[s.id] = g;
  });
  return ls.map((c, i) => {
    const p = lam ? window.RSK_TOPE * (1 - Math.exp(-lam * raw[i])) : Math.min(window.RSK_TOPE, raw[i]);
    // Aprobada = riesgos abrió sublímite en ESA operativa, igual que en la
    // tabla de conversión por operativa. Sin operativa, el resultado global.
    const ev = !!(c.s && Object.keys(c.s).some(k => c.s[k] !== undefined));
    const ok = oper ? !!(c.s && c.s[oper] > 0) : c.res === 'APPROVED';
    return { ...c, _p: p, _t: window.rskTramo(p), _ev: ev,
      _s: { impago: grados.impago[i] || 'C', cese: grados.cese[i] || 'B', fraude: grados.fraude[i] || 'B' },
      _ok: ok };
  });
};

// Aprobación por score × tramo de peso del pedido.
window.rskMatriz = function (tipo, tier, oper) {
  const base = window.rskBase(tier, oper);
  const filas = window.RSK_GRADES.map(g => {
    const ls = base.filter(c => c._s[tipo] === g.id);
    const celdas = window.RSK_TRAMOS.map(t => {
      const l = ls.filter(c => c._t && c._t.id === t.id);
      const ev = l.filter(c => c._ev);
      const ok = ev.filter(c => c._ok).length;
      return { id: t.id, n: l.length, ev: ev.length, ok, wr: ev.length ? ok / ev.length : null };
    });
    const evs = ls.filter(c => c._ev);
    const ok = evs.filter(c => c._ok).length;
    // Mediana, no media: hay empresas cuyo dato de ventas es residual y su
    // ratio se dispara por encima del 100%.
    const pesos = ls.map(c => c._p).sort((a, b) => a - b);
    const med = pesos.length ? (pesos.length % 2 ? pesos[(pesos.length - 1) / 2]
      : (pesos[pesos.length / 2 - 1] + pesos[pesos.length / 2]) / 2) : null;
    return { ...g, n: ls.length, ev: evs.length, ok, wr: evs.length ? ok / evs.length : null, celdas,
      peso: med, pesoTope: ls.filter(c => c._p >= window.RSK_TOPE - 1e-9).length,
      req: ls.length ? ls.reduce((a, c) => a + (+c.req), 0) / ls.length : null,
      ap: ls.length ? ls.reduce((a, c) => a + (+c.ap || 0), 0) / ls.length : null };
  });
  const cols = window.RSK_TRAMOS.map(t => {
    const l = base.filter(c => c._t && c._t.id === t.id);
    const ev = l.filter(c => c._ev);
    const ok = ev.filter(c => c._ok).length;
    return { ...t, n: l.length, ev: ev.length, ok, wr: ev.length ? ok / ev.length : null };
  });
  const n = base.length, evAll = base.filter(c => c._ev);
  const ok = evAll.filter(c => c._ok).length;
  // Correlación entre los tres scores: qué parte comparte grado.
  const pares = [];
  for (let i = 0; i < window.RSK_SCORES.length; i++) {
    for (let j = i + 1; j < window.RSK_SCORES.length; j++) {
      const a = window.RSK_SCORES[i], b = window.RSK_SCORES[j];
      const val = { A: 0, B: 1, C: 2, D: 3 };
      const igual = base.filter(c => c._s[a.id] === c._s[b.id]).length;
      const peor = base.filter(c => Math.abs(val[c._s[a.id]] - val[c._s[b.id]]) >= 2).length;
      pares.push({ a: a.label, b: b.label, igual: n ? igual / n : null, lejos: n ? peor / n : null });
    }
  }
  // Combinación de los tres: cuántos malos acumula cada empresa.
  const combo = [0, 1, 2, 3].map(k => {
    const l = base.filter(c => window.RSK_SCORES.filter(s => c._s[s.id] === 'C' || c._s[s.id] === 'D').length === k);
    const ev = l.filter(c => c._ev);
    const o = ev.filter(c => c._ok).length;
    return { k, n: l.length, ok: o, wr: ev.length ? o / ev.length : null };
  });
  const ps = base.map(c => c._p).sort((a, b) => a - b);
  const medTot = ps.length ? (ps.length % 2 ? ps[(ps.length - 1) / 2] : (ps[ps.length / 2 - 1] + ps[ps.length / 2]) / 2) : null;
  return { filas, cols, pares, combo, n, ev: evAll.length, ok, wr: evAll.length ? ok / evAll.length : null, meta: window.RSK_META,
    req: base.length ? base.reduce((a, c) => a + (+c.req || 0), 0) / base.length : null,
    peso: medTot, tope: window.RSK_TOPE, oper,
    pesoTope: base.filter(c => c._p >= window.RSK_TOPE - 1e-9).length,
    sobreTope: base.filter(c => +c.req / +c.v > window.RSK_TOPE).length };
};
