// ============= OBJETIVOS Q4 2026 POR AE =============
// El equipo de ventas directo de Q4: cuatro AE en Pymes con 2M€ cada uno y dos
// en Mid Market con 30M€ cada uno. Los objetivos los fija dirección; lo
// conseguido saldrá del export de HubSpot cuando el trimestre arranque.
window.AEQ4_META = {
  q: 'Q4 2026', ini: '2026-10-01', fin: '2026-12-31',
  hoy: '2026-09-19',
  nota: 'Objetivos del trimestre con la mezcla que los sostiene: en Pymes, 6 clientes Big de 300k€ y 2 Mid de 100k€ por AE con unos 80 deals repartidos a partes iguales entre partners y outbound; en Mid Market, ticket de 1M€ por cliente.',
};

window.AEQ4_UNIDADES = [
  { id:'pymes',  label:'Pymes',      color:'#2E7D5B', desc:'Cuatro AE con el mismo objetivo de volumen: 2M€ cada uno.' },
  { id:'midmkt', label:'Mid Market', color:'#8E6E2A', desc:'Dos AE con ticket de 1M€ por cliente y objetivo de 30M€ cada uno.' },
];

// eur = volumen total comprometido (nuevo + recurrente).
// mezcla = de dónde salen esos euros; canal = de dónde salen los deals.
const PYME_OBJ = { eur:2e6, nuevo:2e6, recurrente:0, clientes:8, deals:80, ticket:null };
const PYME_MEZCLA = [
  { id:'big', label:'6 clientes Big', n:6, ticket:3e5, eur:1.8e6, color:'#2E7D5B' },
  { id:'mid', label:'2 clientes Mid', n:2, ticket:1e5, eur:2e5, color:'#4054A8' },
];
const PYME_CANAL = [
  { id:'Partners', label:'Partners', deals:40, color:'#C8A24C' },
  { id:'Outbound', label:'Outbound', deals:40, color:'#2E7D5B' },
];
const PYME_NOTA = '2M€ con 6 clientes Big de 300k€ y 2 Mid de 100k€, sobre unos 80 deals trabajados: 40 de partners y 40 de outbound.';
const pyme = (key, nombre, ow) => ({ key, nombre, unidad:'pymes', ow: ow || null, obj:{ ...PYME_OBJ },
  mezcla: PYME_MEZCLA, canal: PYME_CANAL, nota: PYME_NOTA });

window.AEQ4 = [
  pyme('adrian', 'Adrián'), pyme('lina', 'Lina'), pyme('silvia', 'Silvia', 'Silvia Sopena Soler'), pyme('arnau', 'Arnau'),
  { key:'paula',  nombre:'Paula',  unidad:'midmkt', hs:'Paula Buscail Moya', ow:'Paula Buscail Moya',
    obj:{ eur:28e6, nuevo:8e6, recurrente:20e6, clientes:6, deals:60, ticket:1e6 },
    canales:['Contactos'],
    mezcla:[
      { id:'cartera',  label:'Cartera',     n:null, ticket:null, eur:20e6, color:'#767D8C' },
      { id:'contactos',label:'Contactos',   n:null, ticket:null, eur:2e6,  color:'#2E93A8' },
      { id:'midmkt',   label:'6 clientes Mid Market', n:6, ticket:1e6, eur:6e6, color:'#8E6E2A' },
    ],
    nota:'28M€ en tres bloques: 20M€ de cartera que se renueva, 2M€ del canal de contactos y 6M€ de nuevo Mid Market — 6 clientes con ticket de 1M€ sobre 60 deals.' },
  { key:'alex',   nombre:'Alex',   unidad:'midmkt', ow:'Àlex Mitjavila',
    obj:{ eur:30e6, nuevo:30e6, recurrente:0, clientes:30, deals:null, ticket:1e6 },
    mezcla:[{ id:'midmkt', label:'30 clientes Mid Market', n:30, ticket:1e6, eur:30e6, color:'#8E6E2A' }],
    nota:'30M€ con 30 clientes de 1M€ de línea. Todo nuevo negocio: no arrastra cartera.' },
];

// Conseguido del trimestre. Q4 no ha arrancado, así que está a cero y se
// rellena con el export cuando haya cierres. Estructura lista para el import.
window.AEQ4_REAL = {};

window.aeQ4Dias = function () {
  const d = (s) => new Date(s + 'T00:00:00Z');
  const ini = d(window.AEQ4_META.ini), fin = d(window.AEQ4_META.fin), hoy = d(window.AEQ4_META.hoy);
  const DIA = 86400000;
  const dias = Math.round((fin - ini) / DIA) + 1;
  const transcurridos = Math.max(0, Math.min(dias, Math.round((hoy - ini) / DIA)));
  return { dias, transcurridos, restantes: dias - transcurridos,
    arrancaEn: hoy < ini ? Math.round((ini - hoy) / DIA) : 0,
    semanas: dias / 7, semanasRest: (dias - transcurridos) / 7 };
};

// Referencia medida: qué hizo este AE en el histórico de HubSpot, para saber si
// el objetivo es continuista o un salto. Solo existe para quien está en el export.
window.aeQ4Ref = function (hs) {
  const a = hs && window.AE_DATA ? window.AE_DATA[hs] : null;
  if (!a) return null;
  const qs = {};
  Object.keys(a.meses).forEach(id => {
    const y = +id.slice(0, 4), m = +id.slice(5, 7), q = y + '-Q' + Math.ceil(m / 3);
    qs[q] = qs[q] || { id:q, eur:0, w:0, d:0 };
    qs[q].eur += a.meses[id].eur; qs[q].w += a.meses[id].w; qs[q].d += a.meses[id].d;
  });
  const list = Object.values(qs).sort((x, y) => x.id < y.id ? 1 : -1);
  const cerrados = list.filter(q => q.id !== '2026-Q3');
  const mejor = cerrados.slice().sort((x, y) => y.eur - x.eur)[0] || null;
  return { ult: cerrados[0] || null, mejor,
    q4: qs['2025-Q4'] || null,
    medio: cerrados.length ? cerrados.reduce((x, q) => x + q.eur, 0) / cerrados.length : null };
};

// Pipeline vivo del AE: sus deals abiertos en HubSpot, con la misma
// probabilidad por fase que usa el canal broker. Solo existe para quien es
// propietario en el export; los AE recién incorporados no tienen pipeline.
window.aeQ4Pipe = function (ow) {
  const S = window.HS_STATE;
  if (!S || !ow) return null;
  const deals = [];
  Object.keys(S).forEach(k => {
    const d = S[k];
    if (!d.o || !d.st || d.ow !== ow) return;
    if (window.PIPE_PROB[d.st] == null) return;
    const f = window.PIPE_FASES.find(x => x.etapas.indexOf(d.st) >= 0);
    deals.push({ empresa:k, st:d.st, fase: f ? f.id : null, e:+d.e || 0, d:d.d || null,
      seg: window.pipeSeg(d.e), p: f ? window.PIPE_PROB_FASE[f.id] : 0 });
  });
  if (!deals.length) return null;
  const fases = window.PIPE_FASES.map(f => {
    const l = deals.filter(x => x.fase === f.id);
    return { id:f.id, label:f.label, p:window.PIPE_PROB_FASE[f.id], n:l.length,
      eur:l.reduce((a,x)=>a+x.e,0), pond:l.reduce((a,x)=>a+x.e*x.p,0) };
  });
  const lbl = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const ids = window.PIPE_Q4.slice();
  deals.forEach(x => { const m = x.d ? x.d.slice(0,7) : null;
    if (m && m > window.PIPE_Q4[2] && ids.indexOf(m) < 0) ids.push(m); });
  ids.sort();
  const fila = (id, label, l, extra) => ({ id, label, n:l.length,
    eur:l.reduce((a,x)=>a+x.e,0), pond:l.reduce((a,x)=>a+x.e*x.p,0), cli:l.reduce((a,x)=>a+x.p,0),
    sinImporte: l.filter(x => !x.e).length, ...extra });
  // Convención declarada: un deal abierto con fecha ya pasada sigue vivo — lo
  // que ha caducado es la fecha, no la operación —, así que arrastra a Q4.
  // Los que no tienen fecha quedan fuera del forecast y se declaran aparte.
  const venc = deals.filter(x => x.d && x.d < window.PIPE_Q4[0] + '-01');
  const sinF = deals.filter(x => !x.d);
  const meses = [fila('venc', 'Vencido → arrastra', venc, { venc:true, q4:true })]
    .concat(ids.map(id => fila(id, lbl[+id.slice(5) - 1] + ' ' + id.slice(2,4),
      deals.filter(x => x.d && x.d.slice(0,7) === id), { q4: window.PIPE_Q4.indexOf(id) >= 0 })))
    .concat([fila('sinf', 'Sin fecha · fuera', sinF, { fuera:true })])
    .filter(m => m.n || (!m.venc && !m.fuera));
  const enQ4 = deals.filter(x => x.d && (window.PIPE_Q4.indexOf(x.d.slice(0,7)) >= 0 || x.d < window.PIPE_Q4[0] + '-01'));
  const q4 = { n:enQ4.length, eur:enQ4.reduce((a,x)=>a+x.e,0), pond:enQ4.reduce((a,x)=>a+x.e*x.p,0),
    cli:enQ4.reduce((a,x)=>a+x.p,0),
    conFecha: enQ4.filter(x => x.d >= window.PIPE_Q4[0] + '-01').length };
  // Atasco medido contra HOY, no contra el arranque de Q4: un deal con fecha
  // del 30-sep todavía no ha incumplido nada. El corte duro son 30 días.
  const hoy = window.AEQ4_META.hoy;
  const d30 = new Date(new Date(hoy + 'T00:00:00Z') - 30 * 86400000).toISOString().slice(0, 10);
  const atasco = { hoy, corte: d30,
    n: deals.filter(x => x.d && x.d < hoy).length,
    n30: deals.filter(x => x.d && x.d < d30).length };
  return { deals, fases, meses, atasco,
    n: deals.length, eur: deals.reduce((a,x)=>a+x.e,0), pond: deals.reduce((a,x)=>a+x.e*x.p,0),
    sinFecha: sinF.length, sinImporte: deals.filter(x => !x.e).length,
    venc: { n:venc.length, eur:venc.reduce((a,x)=>a+x.e,0), pond:venc.reduce((a,x)=>a+x.e*x.p,0) },
    q4 };
};

// Misma vista que el pipeline del canal broker (fase × segmento + forecast
// mensual), pero sobre los deals de un solo AE. Recibe pipe.deals de aeQ4Pipe.
window.aePipeView = function (deals) {
  if (!deals || !deals.length) return null;
  const segs = window.BRK_SEGS.map(s => ({ ...s })).concat([{ id:'sinimp', label:'Sin importe', color:'#A8ADBA' }]);
  const sum = (l, f) => l.reduce((a, x) => a + f(x), 0);
  const etapas = window.PIPE_FASES.map(f => {
    const ds = deals.filter(x => x.fase === f.id);
    return { st:f.id, label:f.label, desc:f.desc, p:window.PIPE_PROB_FASE[f.id], n:ds.length,
      eur: sum(ds, x => x.e), pond: sum(ds, x => x.e * x.p),
      porSeg: segs.map(s => { const l = ds.filter(x => x.seg === s.id);
        return { id:s.id, n:l.length, eur: sum(l, x => x.e) }; }) };
  });
  const mesesId = window.PIPE_Q4.slice();
  deals.forEach(x => { const m = x.d ? x.d.slice(0, 7) : null;
    if (m && m > window.PIPE_Q4[2] && mesesId.indexOf(m) < 0) mesesId.push(m); });
  mesesId.sort();
  const lbl = { '01':'ene','02':'feb','03':'mar','04':'abr','05':'may','06':'jun','07':'jul','08':'ago','09':'sep','10':'oct','11':'nov','12':'dic' };
  const vencidos = deals.filter(x => x.d && x.d < window.PIPE_Q4[0] + '-01');
  const meses = mesesId.map(id => {
    const ds = deals.filter(x => x.d && x.d.slice(0, 7) === id);
    return { id, label: lbl[id.slice(5)] + ' ' + id.slice(2, 4), q4: window.PIPE_Q4.indexOf(id) >= 0,
      n: ds.length, eur: sum(ds, x => x.e), pond: sum(ds, x => x.e * x.p), cli: sum(ds, x => x.p),
      porSeg: segs.map(s => { const l = ds.filter(x => x.seg === s.id);
        return { id:s.id, n:l.length, pond: sum(l, x => x.e * x.p), cli: sum(l, x => x.p) }; }) };
  });
  const q4d = deals.filter(x => x.d && window.PIPE_Q4.indexOf(x.d.slice(0, 7)) >= 0);
  const totalSeg = segs.map(s => {
    const l = deals.filter(x => x.seg === s.id);
    return { ...s, n:l.length, eur: sum(l, x => x.e), pond: sum(l, x => x.e * x.p) };
  });
  return { meta: window.PIPE_META, segs, etapas, meses, totalSeg,
    n: deals.length, eur: sum(deals, x => x.e), pond: sum(deals, x => x.e * x.p),
    sinFecha: deals.filter(x => !x.d).length, sinImporte: deals.filter(x => !x.e).length,
    vencidos: { n: vencidos.length, eur: sum(vencidos, x => x.e), pond: sum(vencidos, x => x.e * x.p) },
    q4: { n: q4d.length, eur: sum(q4d, x => x.e), pond: sum(q4d, x => x.e * x.p), cli: sum(q4d, x => x.p) } };
};

window.aeQ4 = function () {
  const t = window.aeQ4Dias();
  const list = window.AEQ4.map(a => {
    const real = window.AEQ4_REAL[a.key] || { eur:0, clientes:0, deals:0 };
    const ref = window.aeQ4Ref(a.hs);
    const u = window.AEQ4_UNIDADES.find(x => x.id === a.unidad);
    const pipe = window.aeQ4Pipe(a.ow);
    return { ...a, real, ref, pipe, color: u.color, unidadLabel: u.label,
      cob: pipe && a.obj.eur ? pipe.q4.pond / a.obj.eur : null,
      cobBruta: pipe && a.obj.eur ? pipe.q4.eur / a.obj.eur : null,
      ach: a.obj.eur ? real.eur / a.obj.eur : null,
      achCli: a.obj.clientes ? real.clientes / a.obj.clientes : null,
      achDeals: a.obj.deals ? real.deals / a.obj.deals : null,
      eurSem: a.obj.eur / t.semanas,
      nuevoSem: (a.obj.nuevo || 0) / t.semanas,
      dealsSem: a.obj.deals ? a.obj.deals / t.semanas : null,
      // Salto que pide el objetivo sobre el último trimestre cerrado medido.
      salto: ref && ref.ult && ref.ult.eur ? a.obj.eur / ref.ult.eur - 1 : null,
      saltoNuevo: ref && ref.ult && ref.ult.eur ? (a.obj.nuevo || a.obj.eur) / ref.ult.eur - 1 : null };
  });
  const unidades = window.AEQ4_UNIDADES.map(u => {
    const m = list.filter(a => a.unidad === u.id);
    const obj = m.reduce((x, a) => x + a.obj.eur, 0);
    const nuevo = m.reduce((x, a) => x + (a.obj.nuevo || 0), 0);
    const rec = m.reduce((x, a) => x + (a.obj.recurrente || 0), 0);
    const cli = m.reduce((x, a) => x + (a.obj.clientes || 0), 0);
    const deals = m.reduce((x, a) => x + (a.obj.deals || 0), 0);
    const real = m.reduce((x, a) => x + a.real.eur, 0);
    return { ...u, miembros:m, obj, nuevo, rec, cli, deals, real,
      pipePond: m.reduce((x, a) => x + (a.pipe ? a.pipe.q4.pond : 0), 0),
      pipeN: m.reduce((x, a) => x + (a.pipe ? a.pipe.q4.n : 0), 0),
      ach: obj ? real / obj : null, eurSem: obj / t.semanas };
  });
  const obj = list.reduce((x, a) => x + a.obj.eur, 0);
  return { t, list, unidades,
    tot: { obj,
      nuevo: list.reduce((x, a) => x + (a.obj.nuevo || 0), 0),
      rec: list.reduce((x, a) => x + (a.obj.recurrente || 0), 0),
      cli: list.reduce((x, a) => x + (a.obj.clientes || 0), 0),
      deals: list.reduce((x, a) => x + (a.obj.deals || 0), 0),
      real: list.reduce((x, a) => x + a.real.eur, 0),
      pipePond: list.reduce((x, a) => x + (a.pipe ? a.pipe.q4.pond : 0), 0),
      pipeEur: list.reduce((x, a) => x + (a.pipe ? a.pipe.q4.eur : 0), 0),
      pipeN: list.reduce((x, a) => x + (a.pipe ? a.pipe.q4.n : 0), 0),
      conPipe: list.filter(a => a.pipe).length,
      ach: obj ? list.reduce((x, a) => x + a.real.eur, 0) / obj : null,
      eurSem: obj / t.semanas } };
};
