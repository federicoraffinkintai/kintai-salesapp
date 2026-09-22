// ============= TIME TO MONEY POR TRIMESTRE =============
// Días desde que se crea el deal hasta que el cliente dispone, abiertos por
// fase. El export de HubSpot no trae marcas de entrada y salida de cada etapa,
// así que la serie por trimestre y fase es de EJEMPLO: conserva la mediana
// total medida (OPT_T2M) y la reparte con la forma que describe ventas.
window.T2M_DEMO = true;
window.T2M_META = {
  fuente: 'El total de cada corte se ancla a la mediana medida en HubSpot (OPT_T2M); lo modelado es solo el reparto entre fases y la evolución por trimestre.',
};
window.T2M_Q = ['2025-Q1','2025-Q2','2025-Q3','2025-Q4','2026-Q1','2026-Q2','2026-Q3'];
window.T2M_FASES = [
  { id: 'data', label: 'Data gathering', color: '#4054A8', desc: 'Del alta del deal a tener la documentación completa.' },
  { id: 'risk', label: 'Risk analysis', color: '#8E6E2A', desc: 'Verificación de deudor, pre CRA y comité.' },
  { id: 'nego', label: 'Negociación', color: '#C8553D', desc: 'Propuesta, límite y precio hasta el sí.' },
  { id: 'act', label: 'Activación', color: '#2E7D5B', desc: 'De la firma a la primera disposición.' },
];
// Días por fase en el trimestre más antiguo de la serie, por segmento.
window.T2M_BASE = {
  midmkt: { data: 38, risk: 34, nego: 26, act: 17 },
  big:    { data: 27, risk: 24, nego: 17, act: 12 },
  mid:    { data: 19, risk: 15, nego: 11, act: 8 },
  small:  { data: 13, risk: 9,  nego: 7,  act: 6 },
  corp:   { data: 46, risk: 41, nego: 32, act: 21 },
};
// Multiplicadores: el canal y la operativa mueven sobre todo data y risk.
window.T2M_CANAL = {
  Partners: { data: 0.78, risk: 0.95, nego: 0.9, act: 1 },
  Outbound: { data: 1.18, risk: 1.05, nego: 1.1, act: 1 },
  Inbound:  { data: 1.0, risk: 1.0, nego: 0.95, act: 1 },
  Referral: { data: 0.85, risk: 1.0, nego: 0.95, act: 1 },
  Contacts: { data: 1.25, risk: 1.1, nego: 1.15, act: 1.05 },
};
window.T2M_OPER = {
  gc:     { data: 0.95, risk: 0.8, nego: 0.9, act: 0.9 },
  wallet: { data: 1.0, risk: 0.95, nego: 1.0, act: 1.0 },
  ciego:  { data: 1.1, risk: 1.35, nego: 1.15, act: 1.05 },
  futuro: { data: 1.2, risk: 1.5, nego: 1.25, act: 1.1 },
  special:{ data: 1.3, risk: 1.6, nego: 1.3, act: 1.15 },
};
// Mejora trimestral acumulada: el proceso se va acortando.
window.T2M_TREND = [1, 0.97, 0.93, 0.9, 0.85, 0.82, 0.78];
// Volumen de operaciones firmadas por trimestre, para ponderar el total.
window.T2M_N = { midmkt: [3,4,5,6,7,9,8], big: [6,7,9,11,13,15,14], mid: [18,21,24,27,30,33,29], small: [22,24,26,28,29,31,27], corp: [1,1,2,2,2,3,2] };

window.t2mSerie = function (opts) {
  const o = opts || {};
  const segs = o.segs && o.segs.length ? o.segs : ['midmkt', 'big', 'mid', 'small'];
  const canal = o.canal || null;   // null = todos los canales
  const oper = o.oper || null;     // null = todas las operativas
  const mc = canal ? window.T2M_CANAL[canal] : null;
  const mo = oper ? window.T2M_OPER[oper] : null;
  const mult = (f) => (mc ? mc[f] : 1) * (mo ? mo[f] : 1);

  const qs = window.T2M_Q.map((q, i) => {
    const tr = window.T2M_TREND[i];
    let peso = 0;
    const acc = { data: 0, risk: 0, nego: 0, act: 0 };
    segs.forEach(s => {
      const b = window.T2M_BASE[s]; if (!b) return;
      const n = (window.T2M_N[s] || [])[i] || 0;
      peso += n;
      window.T2M_FASES.forEach(f => { acc[f.id] += b[f.id] * tr * mult(f.id) * n; });
    });
    const fases = window.T2M_FASES.map(f => ({ ...f, dias: peso ? acc[f.id] / peso : 0 }));
    const total = fases.reduce((a, f) => a + f.dias, 0);
    return { q, n: peso, fases, total };
  });

  // Anclaje al dato medido: la mediana del corte manda sobre el modelo. El
  // modelo solo decide cómo se reparte ese total entre fases y trimestres.
  const T = window.OPT_T2M || {};
  let ref, refKey;
  if (canal && T['canal:' + canal]) { refKey = 'canal:' + canal; ref = T[refKey]; }
  else if (segs.length >= 4 && T.total) { refKey = 'total'; ref = T.total; }
  else {
    // Mediana ponderada por volumen de los segmentos elegidos que estén medidos.
    const ms = segs.map(id => T['seg:' + id]).filter(Boolean);
    if (ms.length) {
      const nn = ms.reduce((a, x) => a + x.n, 0);
      ref = { n: nn, med: ms.reduce((a, x) => a + x.med * x.n, 0) / nn };
      refKey = segs.length === 1 ? 'seg:' + segs[0] : 'seg:' + segs.join('+');
    } else { refKey = 'total'; ref = T.total; }
  }
  const ultBruto = qs[qs.length - 1].total;
  // El producto sí mueve el total: el anclaje se calcula sin su multiplicador y
  // el efecto de la operativa se aplica encima, porque el dato medido no
  // distingue operativa.
  const kOper = mo ? (function () {
    const b = window.T2M_BASE, i = window.T2M_Q.length - 1, tr = window.T2M_TREND[i];
    let con = 0, sin = 0;
    segs.forEach(s2 => { const bb = b[s2]; if (!bb) return; const n = (window.T2M_N[s2] || [])[i] || 0;
      window.T2M_FASES.forEach(f => { const base = bb[f.id] * tr * (mc ? mc[f.id] : 1) * n;
        sin += base; con += base * mo[f.id]; }); });
    return sin ? con / sin : 1;
  })() : 1;
  const k = ref && ref.med && ultBruto ? (ref.med / ultBruto) * kOper : kOper;
  qs.forEach(q => { q.fases.forEach(f => { f.dias *= k; }); q.total *= k; });

  const prim = qs[0], ult = qs[qs.length - 1];
  const porSeg = segs.map(s => {
    const b = window.T2M_BASE[s];
    const tr = window.T2M_TREND[window.T2M_TREND.length - 1];
    const fases = window.T2M_FASES.map(f => ({ ...f, dias: b[f.id] * tr * mult(f.id) * k }));
    return { id: s, label: (window.OPT_SEGS.find(x => x.id === s) || {}).label || s,
      color: (window.OPT_SEGS.find(x => x.id === s) || {}).color,
      fases, total: fases.reduce((a, f) => a + f.dias, 0),
      n: (window.T2M_N[s] || [])[window.T2M_Q.length - 1] || 0 };
  });
  const cuello = ult.fases.slice().sort((a, b) => b.dias - a.dias)[0];
  return { qs, porSeg, ult, prim, cuello, ref, refKey, oper, kOper,
    refN: ref ? ref.n : null, refMed: ref ? ref.med : null,
    delta: prim.total ? ult.total / prim.total - 1 : null,
    max: Math.max(...qs.map(x => x.total), 1),
    demo: window.T2M_DEMO, meta: window.T2M_META };
};
