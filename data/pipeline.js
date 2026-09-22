// ============= PIPELINE VIVO =============
// Deals abiertos hoy en HubSpot (HS_STATE con o>0): etapa actual, importe de
// línea esperado y fecha esperada de cierre. El export NO trae segmento ni
// broker por deal, así que el segmento se deriva del importe de línea con los
// mismos cortes que usa el plan, y el pipeline es de TODO el canal, no solo
// broker. Es criterio declarado, no dato.
window.PIPE_META = {
  fuente: 'HubSpot · export de deals abiertos 12-sep-2026',
  aviso: 'El export no trae ni segmento ni broker por deal: el segmento se deriva del importe de línea y el pipeline agrega todos los canales.',
};

// Corte de segmento por importe de línea esperado.
window.PIPE_CORTES = [
  { id: 'midmkt', min: 1000000 },
  { id: 'big', min: 250000 },
  { id: 'mid', min: 60000 },
  { id: 'small', min: 0 },
];

// Probabilidad de cierre por fase, fijada por dirección. Manda sobre la curva
// fina por etapa: todo deal hereda la de su fase.
window.PIPE_PROB_FASE = { data: 0.10, risk: 0.20, nego: 0.25, act: 0.80 };

// Etapas que siguen vivas en el embudo (la curva fina solo decide qué entra).
window.PIPE_PROB = {
  'ENRICHMENT': 0.02, 'PREP CARTERA': 0.03, 'A REVISAR': 0.05,
  'PRIMARY INFORMATION (SALES)': 0.08, 'NEW DEAL (SALES)': 0.12,
  'DISCOVERY (SALES)': 0.20, 'PRODUCT/COLLATERAL FIT (TEAM)': 0.28,
  'MORE INFO (SALES)': 0.32, 'DATA GATHERING ACTIVACION': 0.40,
  'SALES VERIFICATION': 0.48, 'DEBTOR VERIFICATION (OPS)': 0.55,
  'PRE CRA (RISK)': 0.60, 'RISK ANALYSIS (RISK)': 0.70,
  'NEGOCIATION (SALES)': 0.80,
};

// Fases del embudo vivo, simplificado a cuatro. Todo lo anterior a la
// documentación entra en Data gathering: es donde vive el trabajo.
window.PIPE_FASES = [
  { id:'data', label:'Data gathering', desc:'De la cualificación a la documentación completa.',
    etapas:['ENRICHMENT','PREP CARTERA','A REVISAR','PRIMARY INFORMATION (SALES)','NEW DEAL (SALES)','DISCOVERY (SALES)','PRODUCT/COLLATERAL FIT (TEAM)','MORE INFO (SALES)','DATA GATHERING ACTIVACION'] },
  { id:'risk', label:'Risk analysis', desc:'Verificación de deudor, pre CRA y comité de riesgos.',
    etapas:['SALES VERIFICATION','DEBTOR VERIFICATION (OPS)','PRE CRA (RISK)','RISK ANALYSIS (RISK)'] },
  { id:'nego', label:'Negociación', desc:'Propuesta con límite y precio sobre la mesa.',
    etapas:['NEGOCIATION (SALES)'] },
  { id:'act', label:'Activación', desc:'Firma y alta de la línea.', etapas:[] },
];

// Orden de etapas del embudo vivo, de arriba abajo.
window.PIPE_ORD = ['ENRICHMENT','PREP CARTERA','A REVISAR','PRIMARY INFORMATION (SALES)','NEW DEAL (SALES)','DISCOVERY (SALES)','PRODUCT/COLLATERAL FIT (TEAM)','MORE INFO (SALES)','DATA GATHERING ACTIVACION','SALES VERIFICATION','DEBTOR VERIFICATION (OPS)','PRE CRA (RISK)','RISK ANALYSIS (RISK)','NEGOCIATION (SALES)'];

// Sin importe no hay segmento: inventarlo metería 300 deals en Small Pymes.
window.pipeSeg = function (e) {
  const v = +e || 0;
  if (!v) return 'sinimp';
  const c = window.PIPE_CORTES.find(x => v >= x.min);
  return c ? c.id : 'small';
};
window.PIPE_Q4 = ['2026-10','2026-11','2026-12'];

window.pipeline = function () {
  const S = window.HS_STATE;
  if (!S) return null;
  const hoy = window.BRK_TODAY || '2026-09-18';
  const deals = [];
  Object.keys(S).forEach(k => {
    const d = S[k];
    if (!d.o || !d.st) return;
    if (window.PIPE_PROB[d.st] == null) return;
    const f = window.PIPE_FASES.find(x => x.etapas.indexOf(d.st) >= 0);
    deals.push({ empresa: k, st: d.st, fase: f ? f.id : null, e: +d.e || 0, d: d.d || null, ow: d.ow || null,
      seg: window.pipeSeg(d.e), p: f ? window.PIPE_PROB_FASE[f.id] : 0 });
  });
  const segs = window.BRK_SEGS.map(s => ({ ...s })).concat([{ id:'sinimp', label:'Sin importe', color:'#A8ADBA' }]);
  const idx = (id) => segs.findIndex(s => s.id === id);

  // Por fase × segmento
  const etapas = window.PIPE_FASES.map(f => {
    const ds = deals.filter(x => f.etapas.indexOf(x.st) >= 0);
    const porSeg = segs.map(s => {
      const l = ds.filter(x => x.seg === s.id);
      return { id: s.id, n: l.length, eur: l.reduce((a, x) => a + x.e, 0) };
    });
    const eur = ds.reduce((a, x) => a + x.e, 0), pond = ds.reduce((a, x) => a + x.e * x.p, 0);
    return { st: f.id, label: f.label, desc: f.desc, p: window.PIPE_PROB_FASE[f.id],
      n: ds.length, eur, pond, porSeg };
  });

  // Forecast mensual: por fecha esperada de cierre, de este mes en adelante.
  // Los tres meses de Q4 siempre, más cualquier mes posterior que tenga deals.
  const mesesId = window.PIPE_Q4.slice();
  deals.forEach(x => { const m = x.d ? x.d.slice(0, 7) : null;
    if (m && m > window.PIPE_Q4[2] && mesesId.indexOf(m) < 0) mesesId.push(m); });
  mesesId.sort();
  const lbl = { '01':'ene','02':'feb','03':'mar','04':'abr','05':'may','06':'jun','07':'jul','08':'ago','09':'sep','10':'oct','11':'nov','12':'dic' };
  // Vencido = fecha anterior al arranque de Q4: es el que ningún mes del grid
  // recoge. Los de dentro de Q4 sí tienen mes, aunque su día ya haya pasado.
  const vencidos = deals.filter(x => x.d && x.d < window.PIPE_Q4[0] + '-01');
  const meses = mesesId.map(id => {
    const ds = deals.filter(x => x.d && x.d.slice(0, 7) === id);
    return { id, label: lbl[id.slice(5)] + ' ' + id.slice(2, 4), q4: window.PIPE_Q4.indexOf(id) >= 0,
      n: ds.length, eur: ds.reduce((a, x) => a + x.e, 0), pond: ds.reduce((a, x) => a + x.e * x.p, 0),
      cli: ds.reduce((a, x) => a + x.p, 0),
      porSeg: segs.map(s => { const l = ds.filter(x => x.seg === s.id);
        return { id: s.id, n: l.length, pond: l.reduce((a, x) => a + x.e * x.p, 0), cli: l.reduce((a, x) => a + x.p, 0) }; }) };
  });

  const q4d = deals.filter(x => x.d && window.PIPE_Q4.indexOf(x.d.slice(0, 7)) >= 0);
  const totalSeg = segs.map(s => {
    const l = deals.filter(x => x.seg === s.id);
    const q = l.filter(x => x.d && window.PIPE_Q4.indexOf(x.d.slice(0, 7)) >= 0);
    return { ...s, n: l.length, eur: l.reduce((a, x) => a + x.e, 0), pond: l.reduce((a, x) => a + x.e * x.p, 0),
      q4n: q.length, q4pond: q.reduce((a, x) => a + x.e * x.p, 0), q4cli: q.reduce((a, x) => a + x.p, 0) };
  });

  return { meta: window.PIPE_META, hoy, deals, segs, etapas, meses, totalSeg,
    n: deals.length,
    eur: deals.reduce((a, x) => a + x.e, 0),
    pond: deals.reduce((a, x) => a + x.e * x.p, 0),
    sinFecha: deals.filter(x => !x.d).length,
    sinImporte: deals.filter(x => !x.e).length,
    vencidos: { n: vencidos.length, eur: vencidos.reduce((a, x) => a + x.e, 0), pond: vencidos.reduce((a, x) => a + x.e * x.p, 0) },
    q4: { n: q4d.length, eur: q4d.reduce((a, x) => a + x.e, 0),
      pond: q4d.reduce((a, x) => a + x.e * x.p, 0), cli: q4d.reduce((a, x) => a + x.p, 0) } };
};
