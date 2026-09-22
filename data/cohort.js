// ============= COHORTES DEL EMBUDO BROKER =============
// Cohorte = trimestre de CREACIÓN del deal. El export de HubSpot que hay en el
// proyecto solo trae la etapa actual, no la fecha de creación por deal, así que
// esta serie es de EJEMPLO: reproduce el volumen y la forma que se esperan para
// poder cerrar el diseño, y se sustituye en cuanto llegue el export bueno.
window.COH_DEMO = true;
window.COH_META = {
  fuente: 'Serie de ejemplo · pendiente del export de HubSpot con fecha de creación por deal.',
};
window.COH_Q = ['2024-Q4','2025-Q1','2025-Q2','2025-Q3','2025-Q4','2026-Q1','2026-Q2','2026-Q3'];

// Volumen de deals creados por trimestre y segmento en el canal broker.
window.COH_CREADOS = {
  midmkt: [7, 4, 6, 9, 12, 14, 19, 16],
  big:    [14, 9, 12, 16, 21, 24, 31, 27],
  mid:    [47, 31, 38, 44, 52, 58, 66, 54],
  small:  [29, 24, 27, 31, 34, 36, 41, 33],
};
// Conversión a ganado de cada segmento y días de ciclo medio.
window.COH_BASE = {
  midmkt: { wr: 0.16, ciclo: 118, linea: 1500000 },
  big:    { wr: 0.21, ciclo: 86,  linea: 400000 },
  mid:    { wr: 0.27, ciclo: 61,  linea: 120000 },
  small:  { wr: 0.31, ciclo: 42,  linea: 45000 },
};
// Curva de maduración: qué parte de los ganados de una cohorte ya ha cerrado a
// los N meses de crearse el deal. Por segmento, acumulada.
window.COH_CURVA = {
  midmkt: [0, 0.04, 0.14, 0.32, 0.52, 0.70, 0.83, 0.91, 0.96, 1],
  big:    [0, 0.09, 0.26, 0.48, 0.68, 0.83, 0.92, 0.97, 1, 1],
  mid:    [0.02, 0.18, 0.44, 0.67, 0.83, 0.92, 0.97, 1, 1, 1],
  small:  [0.05, 0.31, 0.60, 0.80, 0.92, 0.98, 1, 1, 1, 1],
};

// Trimestres transcurridos entre una cohorte y el corte de hoy: cuanto más
// joven la cohorte, más deals siguen abiertos y menos conversión enseña.
window.cohEdad = function (q, hoyQ) {
  const n = (x) => { const [y, t] = x.split('-Q'); return +y * 4 + (+t - 1); };
  return n(hoyQ || '2026-Q3') - n(q);
};

window.cohorts = function (opts) {  const o = opts || {};
  const segsSel = o.segs && o.segs.length ? o.segs : window.BRK_SEGS.map(s => s.id);
  const qsSel = o.qs && o.qs.length ? o.qs : window.COH_Q;
  const hoyQ = '2026-Q3';

  const filas = qsSel.map(q => {
    const i = window.COH_Q.indexOf(q);
    const edad = window.cohEdad(q, hoyQ);
    const porSeg = segsSel.map(id => {
      const base = window.COH_BASE[id], cre = (window.COH_CREADOS[id] || [])[i] || 0;
      // Parte de la cohorte que ya ha madurado, según su edad en meses.
      const mes = Math.max(0, Math.min(9, edad * 3));
      const mad = (window.COH_CURVA[id] || [])[mes] != null ? window.COH_CURVA[id][mes] : 1;
      const ganados = Math.round(cre * base.wr * mad);
      // Lo que no se gana se pierde a un ritmo algo más rápido que el de ganar.
      const perdidos = Math.round(cre * (1 - base.wr) * Math.min(1, mad * 1.15));
      const abiertos = Math.max(0, cre - ganados - perdidos);
      return { id, label: (window.BRK_SEGS.find(s => s.id === id) || {}).label,
        color: (window.BRK_SEGS.find(s => s.id === id) || {}).color,
        creados: cre, ganados, perdidos, abiertos,
        wr: cre ? ganados / cre : null, wrMaduro: base.wr,
        ciclo: base.ciclo, eur: ganados * base.linea, eurPipe: abiertos * base.linea,
        maduro: mad };
    });
    const sum = (k) => porSeg.reduce((a, s) => a + s[k], 0);
    const cre = sum('creados'), gan = sum('ganados');
    return { q, edad, porSeg, creados: cre, ganados: gan, perdidos: sum('perdidos'),
      abiertos: sum('abiertos'), wr: cre ? gan / cre : null,
      ciclo: gan ? porSeg.reduce((a, s) => a + s.ciclo * s.ganados, 0) / gan : null,
      eur: sum('eur'), eurPipe: sum('eurPipe'),
      maduro: cre ? porSeg.reduce((a, s) => a + s.maduro * s.creados, 0) / cre : null };
  });

  // Curva de maduración media de la selección, ponderada por creados.
  const curva = [];
  for (let m = 0; m < 10; m++) {
    let num = 0, den = 0;
    filas.forEach(f => f.porSeg.forEach(s => {
      num += (window.COH_CURVA[s.id][m] || 0) * s.creados; den += s.creados;
    }));
    curva.push({ mes: m, v: den ? num / den : 0 });
  }
  const porSegTot = segsSel.map(id => {
    const ls = filas.map(f => f.porSeg.find(s => s.id === id)).filter(Boolean);
    const sum = (k) => ls.reduce((a, s) => a + s[k], 0);
    const cre = sum('creados'), gan = sum('ganados');
    return { id, label: (window.BRK_SEGS.find(s => s.id === id) || {}).label,
      color: (window.BRK_SEGS.find(s => s.id === id) || {}).color,
      creados: cre, ganados: gan, perdidos: sum('perdidos'), abiertos: sum('abiertos'),
      wr: cre ? gan / cre : null, ciclo: window.COH_BASE[id].ciclo,
      eur: sum('eur'), eurPipe: sum('eurPipe'),
      curva: window.COH_CURVA[id] };
  });
  const tot = (k) => filas.reduce((a, f) => a + f[k], 0);
  const creT = tot('creados'), ganT = tot('ganados');
  return { filas, curva, porSeg: porSegTot, qs: qsSel, segs: segsSel, demo: window.COH_DEMO,
    meta: window.COH_META,
    creados: creT, ganados: ganT, perdidos: tot('perdidos'), abiertos: tot('abiertos'),
    wr: creT ? ganT / creT : null, eur: tot('eur'), eurPipe: tot('eurPipe'),
    ciclo: ganT ? filas.reduce((a, f) => a + (f.ciclo || 0) * f.ganados, 0) / ganT : null };
};

// Conversión por partner sobre la misma selección de trimestres y segmentos.
// Los creados salen del detalle de AEs (BRK_AE) y, donde no hay AE, del
// histórico de máximos del partner; la conversión aplica la del segmento con
// el sesgo de tipo de partner que observa ventas.
window.COH_TIPO_MULT = { 'Best': 1.25, 'Good': 1.05, 'Referral/Small': 0.85, 'Nuevo': 0.8, 'Embedded': 0.6 };
window.COH_Q_AE = { '2026-Q1': 'q1', '2026-Q2': 'q2', '2026-Q3': 'q3' };

window.cohortsPartner = function (opts) {
  const o = opts || {};
  const segsSel = o.segs && o.segs.length ? o.segs : window.BRK_SEGS.map(s => s.id);
  const qsSel = o.qs && o.qs.length ? o.qs : window.COH_Q;
  const A = window.BRK_AE || {};
  const cap = window.brkCapacidad ? window.brkCapacidad() : null;
  const foco = segsSel.filter(id => id === 'midmkt' || id === 'big');
  const filas = [];
  (window.BROKERS || []).forEach(b => {
    const aes = A[b.nombre];
    if (!aes) return;
    // Deals creados del partner en los trimestres elegidos.
    let cre = 0, creFoco = 0;
    qsSel.forEach(q => {
      const k = window.COH_Q_AE[q];
      if (k) { cre += aes.reduce((a, x) => a + (x[k] || 0), 0); }
      else if (q.slice(0, 4) === '2025') { cre += aes.reduce((a, x) => a + (x.t25 || 0), 0) / 4; }
    });
    // Reparto por segmento: mm/bp son deals de 2026 en los tiers de foco.
    const mm = aes.reduce((a, x) => a + x.mm, 0), bp = aes.reduce((a, x) => a + x.bp, 0);
    const d26 = aes.reduce((a, x) => a + x.q1 + x.q2 + x.q3, 0) || 1;
    const pFoco = (segsSel.indexOf('midmkt') >= 0 ? mm : 0) + (segsSel.indexOf('big') >= 0 ? bp : 0);
    const pResto = (segsSel.indexOf('mid') >= 0 ? 0.55 : 0) + (segsSel.indexOf('small') >= 0 ? 0.45 : 0);
    const parte = Math.min(1, pFoco / d26 + Math.max(0, 1 - (mm + bp) / d26) * pResto);
    creFoco = cre * parte;
    if (creFoco < 0.5) return;
    // La conversión es la MEDIDA del partner en HubSpot (vida completa), no una
    // tasa derivada: con menos de 10 deals no se publica porcentaje.
    const hs = window.brkHubspot ? window.brkHubspot(b.nombre) : null;
    const fiable = hs && hs.deals >= 10;
    const wr = fiable ? hs.won / hs.deals : null;
    const ganados = wr == null ? null : Math.round(creFoco * wr);
    const ciclo = Math.round(segsSel.reduce((a, id) => a + window.COH_BASE[id].ciclo, 0) / segsSel.length
      * (b.tipo === 'Best' ? 0.9 : b.tipo === 'Referral/Small' ? 1.15 : 1));
    const linea = segsSel.reduce((a, id) => a + window.COH_BASE[id].linea, 0) / segsSel.length;
    filas.push({ nombre: b.nombre, tipo: b.tipo, aes: aes.length,
      creados: Math.round(creFoco), ganados, wr, hsDeals: hs ? hs.deals : 0, hsWon: hs ? hs.won : 0, fiable,
      ciclo, eur: ganados == null ? null : ganados * linea,
      objq: cap ? (cap.partners.find(p => p.nombre === b.nombre) || {}).objq : null });
  });
  // Orden por volumen ganado: con 2-4 deals el porcentaje es ruido.
  filas.sort((a, b) => (b.ganados || 0) - (a.ganados || 0) || b.creados - a.creados);
  const cre = filas.reduce((a, f) => a + f.creados, 0);
  const gan = filas.reduce((a, f) => a + (f.ganados || 0), 0);
  const hsD = filas.reduce((a, f) => a + f.hsDeals, 0), hsW = filas.reduce((a, f) => a + f.hsWon, 0);
  return { filas, creados: cre, ganados: gan, wr: hsD ? hsW / hsD : null,
    sinDato: filas.filter(f => !f.fiable).length,
    eur: filas.reduce((a, f) => a + (f.eur || 0), 0),
    ciclo: gan ? filas.reduce((a, f) => a + f.ciclo * (f.ganados || 0), 0) / gan : null };
};
